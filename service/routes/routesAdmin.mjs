import express from "express";
import { conn } from "../sql/conexionSQL.mjs";
import { esAdmin } from "../controllers/adminAuth.mjs";

const router = express.Router();

// Configuración de constantes
const ELO_CHANGES = [100, 75, 50, 25, 10, 5, 0, 0, -25, -50];
const POINTS_SYSTEM = {
  RACE: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
  TOURNAMENT: [50, 36, 30, 24, 20, 16, 12, 8, 4, 2]
};

// Utilidades de base de datos
const dbUtils = {
  async execute(query, params = []) {
    return await conn.execute(
      typeof query === 'string' ? { sql: query, args: params } : query
    );
  },

  async getCurrentSeason() {
    const result = await this.execute(`
      SELECT id FROM Temporadas 
      WHERE date('now') BETWEEN fecha_inicio AND fecha_fin
      LIMIT 1
    `);
    return result.rows?.[0]?.id || null;
  },

  async updateUserStats(userId, statsUpdate) {
    const setParts = Object.keys(statsUpdate).map(key => `${key} = ${key} + ?`);
    const values = Object.values(statsUpdate);
    
    await this.execute(
      `UPDATE Usuarios SET ${setParts.join(', ')} WHERE id = ?`,
      [...values, userId]
    );
  }
};

// Middleware de verificación de admin
const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.session?.usuario?.username) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const userResult = await dbUtils.execute(
      "SELECT email, rol FROM Usuarios WHERE username = ?",
      [req.session.usuario.username]
    );

    if (!userResult.rows?.length) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = userResult.rows[0];
    
    // Verificación directa del rol o usando la función esAdmin
    const isAdmin = user.rol === 'admin' || await esAdmin(user.email);
    
    if (!isAdmin) {
      return res.status(403).json({ 
        error: "Acceso denegado - Se requieren permisos de administrador" 
      });
    }

    next();
  } catch (error) {
    console.error("Error en verificación de admin:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Servicios de negocio
const adminService = {
  calculateNewElos(results) {
    return results.map((pilot, index) => ({
      id: pilot.id,
      newElo: pilot.elo + (ELO_CHANGES[index] || 0)
    }));
  },

  async processSeasonPoints(seasonId, pilotId, position, pointsSystem) {
    if (!seasonId || position > 10) return;

    const points = pointsSystem[position - 1];
    
    try {
      const existingResult = await dbUtils.execute(
        "SELECT id FROM TemporadaUsuarios WHERE id_temporada = ? AND id_piloto = ?",
        [seasonId, pilotId]
      );

      if (existingResult.rows?.length) {
        await dbUtils.execute(
          "UPDATE TemporadaUsuarios SET puntos = puntos + ? WHERE id_temporada = ? AND id_piloto = ?",
          [points, seasonId, pilotId]
        );
      } else {
        await dbUtils.execute(
          "INSERT INTO TemporadaUsuarios (id_temporada, id_piloto, puntos) VALUES (?, ?, ?)",
          [seasonId, pilotId, points]
        );
      }
    } catch (error) {
      console.error(`Error procesando puntos de temporada para piloto ${pilotId}:`, error);
      // No lanzamos el error para permitir que continúe el procesamiento
    }
  },

  async confirmRaceResults(raceId, results) {
    const newElos = this.calculateNewElos(results);
    const seasonId = await dbUtils.getCurrentSeason();
    const errors = [];

    console.log(`Confirmando resultados de carrera ${raceId} para ${results.length} pilotos`);

    for (const [index, pilot] of results.entries()) {
      try {
        const newElo = newElos.find(e => e.id === pilot.id);

        // 1. Insertar resultado de carrera
        await dbUtils.execute(
          "INSERT INTO ResultadosCarreras (id_carrera, id_piloto, posicion, tiempoTotal) VALUES (?, ?, ?, ?)",
          [raceId, pilot.id, pilot.position, "00:00:00"]
        );

        // 2. Actualizar ELO
        await dbUtils.execute(
          "UPDATE Usuarios SET elo = ? WHERE id = ?",
          [newElo.newElo, pilot.id]
        );

        // 3. Actualizar estadísticas de carreras
        const statsUpdate = { 
          carrerasParticipadas: 1,
        };
        if (pilot.position === 1) {
          statsUpdate.carrerasVictorias = 1;
        }
        
        await dbUtils.updateUserStats(pilot.id, statsUpdate);

        // 4. Procesar puntos de temporada
        await this.processSeasonPoints(seasonId, pilot.id, pilot.position, POINTS_SYSTEM.RACE);

        console.log(`✓ Procesado piloto ${pilot.name} (ID: ${pilot.id}) - Posición: ${pilot.position}`);
      } catch (error) {
        console.error(`Error procesando piloto ${pilot.name} (ID: ${pilot.id}):`, error);
        errors.push(`Error con piloto ${pilot.name}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.error("Errores durante el procesamiento:", errors);
      return { 
        success: false, 
        message: "Se completó parcialmente con errores", 
        errors 
      };
    }

    return { 
      success: true, 
      message: "Resultados de carrera confirmados correctamente" 
    };
  },

  async confirmTournamentResults(tournamentId, results) {
    const newElos = this.calculateNewElos(results);
    const seasonId = await dbUtils.getCurrentSeason();
    const errors = [];

    console.log(`Confirmando resultados de torneo ${tournamentId} para ${results.length} pilotos`);

    for (const pilot of results) {
      try {
        const newElo = newElos.find(e => e.id === pilot.id);
        const tournamentPoints = POINTS_SYSTEM.TOURNAMENT[pilot.position - 1] || 0;

        // 1. Insertar resultado de torneo
        await dbUtils.execute(
          "INSERT INTO ResultadosTorneo (id_torneo, id_piloto, puntosTorneo) VALUES (?, ?, ?)",
          [tournamentId, pilot.id, tournamentPoints]
        );

        // 2. Actualizar ELO
        await dbUtils.execute(
          "UPDATE Usuarios SET elo = ? WHERE id = ?",
          [newElo.newElo, pilot.id]
        );

        // 3. Actualizar estadísticas de torneos
        const statsUpdate = { 
          torneosParticipados: 1
        };
        if (pilot.position === 1) {
          statsUpdate.torneosVictorias = 1;
        }
        
        await dbUtils.updateUserStats(pilot.id, statsUpdate);

        // 4. Procesar puntos de temporada
        await this.processSeasonPoints(seasonId, pilot.id, pilot.position, POINTS_SYSTEM.TOURNAMENT);

        console.log(`✓ Procesado piloto ${pilot.name} (ID: ${pilot.id}) - Posición: ${pilot.position}`);
      } catch (error) {
        console.error(`Error procesando piloto ${pilot.name} (ID: ${pilot.id}):`, error);
        errors.push(`Error con piloto ${pilot.name}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.error("Errores durante el procesamiento:", errors);
      return { 
        success: false, 
        message: "Se completó parcialmente con errores", 
        errors 
      };
    }

    return { 
      success: true, 
      message: "Resultados del torneo confirmados correctamente" 
    };
  }
};

// Aplicar middleware a todas las rutas
router.use(verifyAdmin);

// Controladores
const adminController = {
  async getPendingRaces(req, res) {
    try {
      const result = await dbUtils.execute(`
        SELECT 
          c.id,
          c.fecha,
          c.hora,
          k.nombre as karting,
          strftime('%d/%m/%Y', c.fecha) as fechaFormateada
        FROM Carreras c
        LEFT JOIN Kartings k ON c.id_karting = k.id
        WHERE c.fecha < date('now')
        ORDER BY c.fecha DESC
      `);

      const races = result.rows.map(race => ({
        id: race.id,
        name: `Carrera en ${race.karting || 'Karting desconocido'} - ${race.fechaFormateada}`,
        date: race.fecha,
        status: "Pendiente",
        type: "race"
      }));

      res.json(races);
    } catch (error) {
      console.error("Error al obtener carreras:", error);
      res.status(500).json({ error: "Error del servidor: " + error.message });
    }
  },

  async getPendingTournaments(req, res) {
    try {
      const result = await dbUtils.execute(`
        SELECT 
          t.id,
          t.nombreTorneo,
          t.fecha_inicio,
          t.fecha_fin,
          strftime('%d/%m/%Y', t.fecha_inicio) as fechaFormateada
        FROM Torneos t
        WHERE t.fecha_fin < date('now')
          AND t.id NOT IN (SELECT id_torneo FROM ResultadosTorneo)
        ORDER BY t.fecha_inicio DESC
      `);

      const tournaments = result.rows.map(tournament => ({
        id: tournament.id,
        name: tournament.nombreTorneo,
        date: tournament.fecha_inicio,
        status: "Pendiente",
        type: "tournament"
      }));

      res.json(tournaments);
    } catch (error) {
      console.error("Error al obtener torneos:", error);
      res.status(500).json({ error: "Error del servidor: " + error.message });
    }
  },

  async getRaceParticipants(req, res) {
    try {
      const { id } = req.params;
      
      const result = await dbUtils.execute(
        `SELECT 
          u.id,
          u.username as name,
          u.elo,
          ic.fecha_inscripcion
        FROM InscripcionesCarrera ic
        JOIN Usuarios u ON ic.id_piloto = u.id
        WHERE ic.id_carrera = ?
        ORDER BY ic.fecha_inscripcion ASC`,
        [id]
      );

      const participants = result.rows.map((p, index) => ({
        id: p.id.toString(),
        name: p.name,
        position: index + 1,
        elo: p.elo || 0
      }));

      res.json(participants);
    } catch (error) {
      console.error("Error al obtener participantes:", error);
      res.status(500).json({ error: "Error del servidor: " + error.message });
    }
  },

  async getTournamentParticipants(req, res) {
    try {
      const { id } = req.params;
      
      const result = await dbUtils.execute(
        `SELECT 
          u.id,
          u.username as name,
          u.elo,
          it.fecha_inscripcion
        FROM InscripcionesTorneo it
        JOIN Usuarios u ON it.id_piloto = u.id
        WHERE it.id_torneo = ?
        ORDER BY it.fecha_inscripcion ASC`,
        [id]
      );

      const participants = result.rows.map((p, index) => ({
        id: p.id.toString(),
        name: p.name,
        position: index + 1,
        elo: p.elo || 0
      }));

      res.json(participants);
    } catch (error) {
      console.error("Error al obtener participantes del torneo:", error);
      res.status(500).json({ error: "Error del servidor: " + error.message });
    }
  },

  async confirmRace(req, res) {
    try {
      const { carreraId, resultados } = req.body;
      
      if (!carreraId || !resultados?.length) {
        return res.status(400).json({ error: "Datos inválidos" });
      }

      // Verificar que la carrera existe y no tiene resultados ya
      const existingResults = await dbUtils.execute(
        "SELECT COUNT(*) as count FROM ResultadosCarreras WHERE id_carrera = ?",
        [carreraId]
      );

      if (existingResults.rows[0].count > 0) {
        return res.status(400).json({ 
          error: "Esta carrera ya tiene resultados confirmados" 
        });
      }

      const result = await adminService.confirmRaceResults(carreraId, resultados);
      res.json(result);
    } catch (error) {
      console.error("Error al confirmar carrera:", error);
      res.status(500).json({ error: "Error del servidor: " + error.message });
    }
  },

  async confirmTournament(req, res) {
    try {
      const { torneoId, resultados } = req.body;
      
      if (!torneoId || !resultados?.length) {
        return res.status(400).json({ error: "Datos inválidos" });
      }

      // Verificar que el torneo existe y no tiene resultados ya
      const existingResults = await dbUtils.execute(
        "SELECT COUNT(*) as count FROM ResultadosTorneo WHERE id_torneo = ?",
        [torneoId]
      );

      if (existingResults.rows[0].count > 0) {
        return res.status(400).json({ 
          error: "Este torneo ya tiene resultados confirmados" 
        });
      }

      const result = await adminService.confirmTournamentResults(torneoId, resultados);
      res.json(result);
    } catch (error) {
      console.error("Error al confirmar torneo:", error);
      res.status(500).json({ error: "Error del servidor: " + error.message });
    }
  }
};

// GET /carreras-pendientes
router.get("/carreras-pendientes", async (req, res) => {
  try {
    const result = await dbUtils.execute(`
      SELECT 
        c.id,
        c.fecha,
        c.hora,
        k.nombre as karting,
        strftime('%d/%m/%Y', c.fecha) as fechaFormateada
      FROM Carreras c
      LEFT JOIN Kartings k ON c.id_karting = k.id
      WHERE c.fecha < date('now')
        AND c.id NOT IN (SELECT id_carrera FROM ResultadosCarreras)
      ORDER BY c.fecha DESC
    `);

    const races = result.rows.map(race => ({
      id: race.id,
      name: `Carrera en ${race.karting || 'Karting desconocido'} - ${race.fechaFormateada}`,
      date: race.fecha,
      status: "Pendiente",
      type: "race"
    }));

    res.json(races);
  } catch (error) {
    console.error("Error al obtener carreras:", error);
    res.status(500).json({ error: "Error del servidor: " + error.message });
  }
});

// GET /torneos-pendientes
router.get("/torneos-pendientes", async (req, res) => {
  try {
    const result = await dbUtils.execute(`
      SELECT 
        t.id,
        t.nombreTorneo,
        t.fecha_inicio,
        t.fecha_fin,
        strftime('%d/%m/%Y', t.fecha_inicio) as fechaFormateada
      FROM Torneos t
      WHERE t.fecha_fin < date('now')
        AND t.id NOT IN (SELECT id_torneo FROM ResultadosTorneo)
      ORDER BY t.fecha_inicio DESC
    `);

    const tournaments = result.rows.map(tournament => ({
      id: tournament.id,
      name: tournament.nombreTorneo,
      date: tournament.fecha_inicio,
      status: "Pendiente",
      type: "tournament"
    }));

    res.json(tournaments);
  } catch (error) {
    console.error("Error al obtener torneos:", error);
    res.status(500).json({ error: "Error del servidor: " + error.message });
  }
});

// GET /carrera/:id/participantes
router.get("/carrera/:id/participantes", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dbUtils.execute(
      `SELECT 
        u.id,
        u.username as name,
        u.elo,
        ic.fecha_inscripcion
      FROM InscripcionesCarrera ic
      JOIN Usuarios u ON ic.id_piloto = u.id
      WHERE ic.id_carrera = ?
      ORDER BY ic.fecha_inscripcion ASC`,
      [id]
    );

    const participants = result.rows.map((p, index) => ({
      id: p.id.toString(),
      name: p.name,
      position: index + 1,
      elo: p.elo || 0
    }));

    res.json(participants);
  } catch (error) {
    console.error("Error al obtener participantes:", error);
    res.status(500).json({ error: "Error del servidor: " + error.message });
  }
});

// GET /torneo/:id/participantes
router.get("/torneo/:id/participantes", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dbUtils.execute(
      `SELECT 
        u.id,
        u.username as name,
        u.elo,
        it.fecha_inscripcion
      FROM InscripcionesTorneo it
      JOIN Usuarios u ON it.id_piloto = u.id
      WHERE it.id_torneo = ?
      ORDER BY it.fecha_inscripcion ASC`,
      [id]
    );

    const participants = result.rows.map((p, index) => ({
      id: p.id.toString(),
      name: p.name,
      position: index + 1,
      elo: p.elo || 0
    }));

    res.json(participants);
  } catch (error) {
    console.error("Error al obtener participantes del torneo:", error);
    res.status(500).json({ error: "Error del servidor: " + error.message });
  }
});

// POST /confirmar-carrera
router.post("/confirmar-carrera", async (req, res) => {
  try {
    const { carreraId, resultados } = req.body;
    if (!carreraId || !resultados?.length) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    // Verificar que la carrera existe y no tiene resultados ya
    const existingResults = await dbUtils.execute(
      "SELECT COUNT(*) as count FROM ResultadosCarreras WHERE id_carrera = ?",
      [carreraId]
    );

    if (existingResults.rows[0].count > 0) {
      return res.status(400).json({ 
        error: "Esta carrera ya tiene resultados confirmados" 
      });
    }

    const result = await adminService.confirmRaceResults(carreraId, resultados);
    res.json(result);
  } catch (error) {
    console.error("Error al confirmar carrera:", error);
    res.status(500).json({ error: "Error del servidor: " + error.message });
  }
});

// POST /confirmar-torneo
router.post("/confirmar-torneo", async (req, res) => {
  try {
    const { torneoId, resultados } = req.body;
    if (!torneoId || !resultados?.length) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    // Verificar que el torneo existe y no tiene resultados ya
    const existingResults = await dbUtils.execute(
      "SELECT COUNT(*) as count FROM ResultadosTorneo WHERE id_torneo = ?",
      [torneoId]
    );

    if (existingResults.rows[0].count > 0) {
      return res.status(400).json({ 
        error: "Este torneo ya tiene resultados confirmados" 
      });
    }

    const result = await adminService.confirmTournamentResults(torneoId, resultados);
    res.json(result);
  } catch (error) {
    console.error("Error al confirmar torneo:", error);
    res.status(500).json({ error: "Error del servidor: " + error.message });
  }
});

export default router;