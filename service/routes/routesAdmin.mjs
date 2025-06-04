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
      "SELECT email, role FROM Usuarios WHERE username = ?",
      [req.session.usuario.username]
    );

    if (!userResult.rows?.length) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = userResult.rows[0];
    
    // Verificación directa del rol o usando la función esAdmin
    const isAdmin = user.role === 'admin' || await esAdmin(user.email);
    
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
  },

  async confirmRaceResults(raceId, results) {
    const newElos = this.calculateNewElos(results);
    const seasonId = await dbUtils.getCurrentSeason();

    await dbUtils.execute("BEGIN TRANSACTION");

    try {
      for (const [index, pilot] of results.entries()) {
        const newElo = newElos.find(e => e.id === pilot.id);

        // Insertar resultado
        await dbUtils.execute(
          "INSERT INTO ResultadosCarreras (id_carrera, id_piloto, posicion, tiempoTotal) VALUES (?, ?, ?, ?)",
          [raceId, pilot.id, pilot.position, "00:00:00"]
        );

        // Actualizar ELO
        await dbUtils.execute(
          "UPDATE Usuarios SET elo = ? WHERE id = ?",
          [newElo.newElo, pilot.id]
        );

        // Actualizar estadísticas
        const statsUpdate = { 
          carrerasParticipadas: 1, 
          carrerasCompletadas: 1 
        };
        if (pilot.position === 1) {
          statsUpdate.carrerasVictorias = 1;
        }
        
        await dbUtils.updateUserStats(pilot.id, statsUpdate);

        // Procesar puntos de temporada
        await this.processSeasonPoints(seasonId, pilot.id, pilot.position, POINTS_SYSTEM.RACE);
      }

      await dbUtils.execute("COMMIT");
      return { success: true, message: "Resultados de carrera confirmados correctamente" };
    } catch (error) {
      await dbUtils.execute("ROLLBACK");
      throw error;
    }
  },

  async confirmTournamentResults(tournamentId, results) {
    const newElos = this.calculateNewElos(results);
    const seasonId = await dbUtils.getCurrentSeason();

    await dbUtils.execute("BEGIN TRANSACTION");

    try {
      for (const pilot of results) {
        const newElo = newElos.find(e => e.id === pilot.id);
        const tournamentPoints = POINTS_SYSTEM.TOURNAMENT[pilot.position - 1] || 0;

        // Insertar resultado
        await dbUtils.execute(
          "INSERT INTO ResultadosTorneo (id_torneo, id_piloto, puntosTorneo) VALUES (?, ?, ?)",
          [tournamentId, pilot.id, tournamentPoints]
        );

        // Actualizar ELO
        await dbUtils.execute(
          "UPDATE Usuarios SET elo = ? WHERE id = ?",
          [newElo.newElo, pilot.id]
        );

        // Actualizar estadísticas
        const statsUpdate = { 
          torneosParticipados: 1, 
          torneosCompletados: 1 
        };
        if (pilot.position === 1) {
          statsUpdate.torneosVictorias = 1;
        }
        
        await dbUtils.updateUserStats(pilot.id, statsUpdate);

        // Procesar puntos de temporada
        await this.processSeasonPoints(seasonId, pilot.id, pilot.position, POINTS_SYSTEM.TOURNAMENT);
      }

      await dbUtils.execute("COMMIT");
      return { success: true, message: "Resultados del torneo confirmados correctamente" };
    } catch (error) {
      await dbUtils.execute("ROLLBACK");
      throw error;
    }
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
          strftime('%d/%m/%Y', t.fecha_inicio) as fechaFormateada
        FROM Torneos t
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

      const result = await adminService.confirmTournamentResults(torneoId, resultados);
      res.json(result);
    } catch (error) {
      console.error("Error al confirmar torneo:", error);
      res.status(500).json({ error: "Error del servidor: " + error.message });
    }
  }
};

// Definir rutas
router.get("/carreras-pendientes", adminController.getPendingRaces);
router.get("/torneos-pendientes", adminController.getPendingTournaments);
router.get("/carrera/:id/participantes", adminController.getRaceParticipants);
router.get("/torneo/:id/participantes", adminController.getTournamentParticipants);
router.post("/confirmar-carrera", adminController.confirmRace);
router.post("/confirmar-torneo", adminController.confirmTournament);

export default router;