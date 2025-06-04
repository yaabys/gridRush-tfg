import express from "express";
import { conn } from "../sql/conexionSQL.mjs";
import { esAdmin } from "../controllers/adminAuth.mjs";

const router = express.Router();

function calcularNuevosElos(resultados) {
  // ELO por posición: 1º=+100, 2º=+75, 3º=+50, 4º=+25, 5º=+10, 6º=+5, 7º=0, 8º=0, 9º=-25, 10º=-50
  const eloPorPosicion = [100, 75, 50, 25, 10, 5, 0, 0, -25, -50];

  return resultados.map((piloto, index) => {
    const cambioElo = eloPorPosicion[index] || 0;
    return {
      id: piloto.id,
      nuevoElo: piloto.elo + cambioElo,
    };
  });
}

router.use(esAdmin);

router.get("/carreras-pendientes", async (req, res) => {
  try {
    const [result] = await conn.execute(`
      SELECT 
        c.id,
        c.fecha,
        k.nombre as karting,
        strftime('%d/%m/%Y', c.fecha) as fechaFormateada
      FROM Carreras c
      LEFT JOIN Kartings k ON c.id_karting = k.id
      ORDER BY c.fecha DESC
    `);

    const carreras = result.map((carrera) => ({
      id: carrera.id,
      name: `Carrera en ${carrera.karting} - ${carrera.fechaFormateada}`,
      date: carrera.fecha,
      status: "Pendiente",
      type: "race",
    }));

    console.log("Carreras encontradas:", carreras);
    res.json(carreras);
  } catch (error) {
    console.error("Error al obtener carreras:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// Obtener torneos pendientes de validación
router.get("/torneos-pendientes", async (req, res) => {
  try {
    const [result] = await conn.execute(`
      SELECT 
        t.id,
        t.nombreTorneo,
        t.fecha_inicio,
        strftime('%d/%m/%Y', t.fecha_inicio) as fechaFormateada
      FROM Torneos t
      ORDER BY t.fecha_inicio DESC
    `);

    const torneos = result.map((torneo) => ({
      id: torneo.id,
      name: torneo.nombreTorneo,
      date: torneo.fecha_inicio,
      status: "Pendiente",
      type: "tournament",
    }));

    console.log("Torneos encontrados:", torneos);
    res.json(torneos);
  } catch (error) {
    console.error("Error al obtener torneos:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// Obtener participantes de una carrera
router.get("/carrera/:id/participantes", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await conn.execute(
      `
      SELECT 
        u.id,
        u.username as name,
        u.elo,
        ic.fecha_inscripcion
      FROM InscripcionesCarrera ic
      JOIN Usuarios u ON ic.id_piloto = u.id
      WHERE ic.id_carrera = ?
      ORDER BY ic.fecha_inscripcion ASC
    `,
      [id],
    );

    const participantes = result.map((p, index) => ({
      id: p.id.toString(),
      name: p.name,
      position: index + 1,
      elo: p.elo,
    }));

    console.log("Participantes de carrera encontrados:", participantes); // Debug
    res.json(participantes);
  } catch (error) {
    console.error("Error al obtener participantes:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// Obtener participantes de un torneo
router.get("/torneo/:id/participantes", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await conn.execute(
      `
      SELECT 
        u.id,
        u.username as name,
        u.elo,
        it.fecha_inscripcion
      FROM InscripcionesTorneo it
      JOIN Usuarios u ON it.id_piloto = u.id
      WHERE it.id_torneo = ?
      ORDER BY it.fecha_inscripcion ASC
    `,
      [id],
    );

    const participantes = result.map((p, index) => ({
      id: p.id.toString(),
      name: p.name,
      position: index + 1,
      elo: p.elo,
    }));

    console.log("Participantes de torneo encontrados:", participantes); // Debug
    res.json(participantes);
  } catch (error) {
    console.error("Error al obtener participantes del torneo:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// Confirmar resultados de carrera
router.post("/confirmar-carrera", async (req, res) => {
  try {
    const { carreraId, resultados } = req.body;

    // Sistema de puntos: 1º=25, 2º=18, 3º=15, 4º=12, 5º=10, 6º=8, 7º=6, 8º=4, 9º=2, 10º=1
    const puntosPorPosicion = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
      
    // Calcular nuevos ELOs
    const nuevosElos = calcularNuevosElos(resultados);

    // Obtener temporada actual
    const [temporadaResult] = await conn.execute(`
      SELECT id FROM Temporadas 
      WHERE date('now') BETWEEN fecha_inicio AND fecha_fin
      LIMIT 1
    `);

    let temporadaId = null;
    if (temporadaResult.length > 0) {
      temporadaId = temporadaResult[0].id;
    }

    // Iniciar transacción
    await conn.execute("BEGIN TRANSACTION");

    try {
      // Guardar resultados de la carrera
      for (let i = 0; i < resultados.length; i++) {
        const piloto = resultados[i];
        const nuevoElo = nuevosElos.find((p) => p.id === piloto.id);

        // Insertar resultado de carrera
        await conn.execute(
          `
          INSERT INTO ResultadosCarreras (id_carrera, id_piloto, posicion, tiempoTotal)
          VALUES (?, ?, ?, ?)
        `,
          [carreraId, piloto.id, piloto.position, "00:00:00"],
        );

        // Actualizar ELO y estadísticas del usuario
        await conn.execute(
          `
          UPDATE Usuarios 
          SET elo = ?,
              carrerasParticipadas = carrerasParticipadas + 1,
              carrerasCompletadas = carrerasCompletadas + 1
          WHERE id = ?
        `,
          [nuevoElo.nuevoElo, piloto.id],
        );

        // Si es el ganador, incrementar victorias
        if (piloto.position === 1) {
          await conn.execute(
            `
            UPDATE Usuarios 
            SET carrerasVictorias = carrerasVictorias + 1
            WHERE id = ?
          `,
            [piloto.id],
          );
        }

        // Asignar puntos de temporada (solo los primeros 10)
        if (temporadaId && piloto.position <= 10) {
          const puntos = puntosPorPosicion[piloto.position - 1];

          // Verificar si ya existe registro en TemporadaUsuarios
          const [existeResult] = await conn.execute(
            `
            SELECT id FROM TemporadaUsuarios 
            WHERE id_temporada = ? AND id_piloto = ?
          `,
            [temporadaId, piloto.id],
          );

          if (existeResult.length > 0) {
            // Actualizar puntos existentes
            await conn.execute(
              `
              UPDATE TemporadaUsuarios 
              SET puntos = puntos + ?
              WHERE id_temporada = ? AND id_piloto = ?
            `,
              [puntos, temporadaId, piloto.id],
            );
          } else {
            // Crear nuevo registro
            await conn.execute(
              `
              INSERT INTO TemporadaUsuarios (id_temporada, id_piloto, puntos)
              VALUES (?, ?, ?)
            `,
              [temporadaId, piloto.id, puntos],
            );
          }
        }
      }

      await conn.execute("COMMIT");
      res.json({
        success: true,
        message: "Resultados confirmados correctamente",
      });
    } catch (error) {
      await conn.execute("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error al confirmar carrera:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// Confirmar resultados de torneo
router.post("/confirmar-torneo", async (req, res) => {
  try {
    const { torneoId, resultados } = req.body;

    // Sistema de puntos para torneos (más puntos que carreras individuales)
    const puntosPorPosicion = [50, 36, 30, 24, 20, 16, 12, 8, 4, 2];

    // Calcular nuevos ELOs
    const nuevosElos = calcularNuevosElos(resultados);

    // Obtener temporada actual
    const [temporadaResult] = await conn.execute(`
      SELECT id FROM Temporadas 
      WHERE date('now') BETWEEN fecha_inicio AND fecha_fin
      LIMIT 1
    `);

    let temporadaId = null;
    if (temporadaResult.length > 0) {
      temporadaId = temporadaResult[0].id;
    }

    // Iniciar transacción
    await conn.execute("BEGIN TRANSACTION");

    try {
      // Guardar resultados del torneo
      for (let i = 0; i < resultados.length; i++) {
        const piloto = resultados[i];
        const nuevoElo = nuevosElos.find((p) => p.id === piloto.id);
        const puntosTorneo = puntosPorPosicion[piloto.position - 1] || 0;

        // Insertar resultado de torneo
        await conn.execute(
          `
          INSERT INTO ResultadosTorneo (id_torneo, id_piloto, puntosTorneo)
          VALUES (?, ?, ?)
        `,
          [torneoId, piloto.id, puntosTorneo],
        );

        // Actualizar ELO y estadísticas del usuario
        await conn.execute(
          `
          UPDATE Usuarios 
          SET elo = ?,
              torneosParticipados = torneosParticipados + 1,
              torneosCompletados = torneosCompletados + 1
          WHERE id = ?
        `,
          [nuevoElo.nuevoElo, piloto.id],
        );

        // Si es el ganador, incrementar victorias en torneos
        if (piloto.position === 1) {
          await conn.execute(
            `
            UPDATE Usuarios 
            SET torneosVictorias = torneosVictorias + 1
            WHERE id = ?
          `,
            [piloto.id],
          );
        }

        // Asignar puntos de temporada (solo los primeros 10)
        if (temporadaId && piloto.position <= 10) {
          const puntos = puntosPorPosicion[piloto.position - 1];

          // Verificar si ya existe registro en TemporadaUsuarios
          const [existeResult] = await conn.execute(
            `
            SELECT id FROM TemporadaUsuarios 
            WHERE id_temporada = ? AND id_piloto = ?
          `,
            [temporadaId, piloto.id],
          );

          if (existeResult.length > 0) {
            // Actualizar puntos existentes
            await conn.execute(
              `
              UPDATE TemporadaUsuarios 
              SET puntos = puntos + ?
              WHERE id_temporada = ? AND id_piloto = ?
            `,
              [puntos, temporadaId, piloto.id],
            );
          } else {
            // Crear nuevo registro
            await conn.execute(
              `
              INSERT INTO TemporadaUsuarios (id_temporada, id_piloto, puntos)
              VALUES (?, ?, ?)
            `,
              [temporadaId, piloto.id, puntos],
            );
          }
        }
      }

      await conn.execute("COMMIT");
      res.json({
        success: true,
        message: "Resultados del torneo confirmados correctamente",
      });
    } catch (error) {
      await conn.execute("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error al confirmar torneo:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

export default router;