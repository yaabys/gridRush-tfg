import express from "express";
import {
  registrarFirebase,
  comprobarLogin,
} from "../firebase/conexionFirebase.mjs";
import {
  comprobarUser,
  hashearPassword,
  comprobarEmail,
  comprobarSesion,
} from "../controllers/userController.mjs";
import { conn } from "../sql/conexionSQL.mjs";
import session from "express-session";

const router = express.Router();

router.get("/perfil", async (req, res) => {
  if (!req.session.usuario || !req.session.usuario.username) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const username = req.session.usuario.username;

  try {
    const result = await conn.execute({
      sql: "SELECT id, username, email ,nombre, carrerasVictorias, carrerasParticipadas, torneosVictorias, torneosParticipados FROM Usuarios WHERE username = ?",
      args: [username],
    });

    const filas = result.rows;

    if (filas.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // eliminar contraseña antes de enviar los datos por si hay algun tipo de ataque
    const usuario = filas[0];
    delete usuario.password;

    res.json(usuario);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// Ruta para obtener la temporada actual
router.get("/temporada-actual", async (req, res) => {
  try {
    const result = await conn.execute("SELECT * FROM Temporadas");

    const temporadas = result.rows;

    if (!Array.isArray(temporadas) || temporadas.length === 0) {
      const resultProximas = await conn.execute(
        "SELECT * FROM Temporadas WHERE fecha_inicio > DATE('now') ORDER BY fecha_inicio ASC LIMIT 1",
      );

      const proximasTemporadas = resultProximas.rows;

      if (
        !Array.isArray(proximasTemporadas) ||
        proximasTemporadas.length === 0
      ) {
        return res.status(404).json({ error: "No hay temporadas disponibles" });
      }

      return res.json(proximasTemporadas[0]);
    }

    return res.json(temporadas[0]);
  } catch (error) {
    return res.status(500).json({ error: "Error del servidor" });
  }
});

// Ruta para obtener las recompensas de una temporada
router.get("/recompensas/:temporadaId", async (req, res) => {
  try {
    const { temporadaId } = req.params;

    const result = await conn.execute(
      `SELECT tr.id, tr.nombre_recompensa, tr.descripcion, tr.posicion_min, tr.posicion_max, r.nombre as nombre_base, r.imagen 
       FROM TemporadaRecompensas tr 
       JOIN Recompensas r ON tr.id_recompensa = r.id 
       WHERE tr.id_temporada = ? 
       ORDER BY tr.posicion_min ASC`,
      [temporadaId],
    );

    let recompensas = result.rows;

    return res.json(recompensas);
  } catch (error) {
    console.error("Error al obtener recompensas:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
});

router.get("/ranking/:temporadaId", async (req, res) => {
  try {
    const { temporadaId } = req.params;

    const result = await conn.execute(
      `SELECT u.username, u.nombre, u.apellidos, tu.puntos 
       FROM TemporadaUsuarios tu 
       JOIN Usuarios u ON tu.id_piloto = u.id 
       WHERE tu.id_temporada = ? 
       ORDER BY tu.puntos DESC 
       LIMIT 100`,
      [temporadaId],
    );

    let ranking = result.rows;

    return res.json(ranking);
  } catch (error) {
    console.error("Error al obtener ranking:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
});

router.get("/kartings", async (req, res) => {
  try {
    if (!conn) {
      console.error("La conexión a la base de datos no está disponible");
      return res
        .status(500)
        .json({ error: "Error de conexión a la base de datos" });
    }

    const kartings = await conn.execute(
      `SELECT nombre, ciudad as ubicacion,ubicacionLink as link  FROM Kartings ORDER BY nombre`,
    );

    const kartingRows = kartings.rows;

    if (!Array.isArray(kartingRows) || kartingRows.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron circuitos de karting" });
    }
    res.json(kartingRows);
  } catch (error) {
    console.error("Error al obtener kartings:", error);
    res.status(500).json({
      error: "Error al obtener la información de los circuitos de karting",
      detalles: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
});

router.get("/torneos", async (req, res) => {
  try {
    if (!conn) {
      console.error("La conexión a la base de datos no está disponible");
      return res
        .status(500)
        .json({ error: "Error de conexión a la base de datos" });
    }

    const torneos = await conn.execute(`
          SELECT 
            t.id,
            t.nombreTorneo as nombre,
            k.nombre as ubicacion,
            k.ciudad as comunidad,
            strftime('%d/%m/%Y', t.fecha_inicio) as fecha,
            CASE 
              WHEN t.nivelMin = 1 THEN 'Principiante'
              WHEN t.nivelMin = 2 THEN 'Intermedio'
              WHEN t.nivelMin = 3 THEN 'Avanzado'
              ELSE 'Desconocido'
            END as nivelMinimo,
            (SELECT COUNT(*) FROM InscripcionesTorneo WHERE id_torneo = t.id) as plazasOcupadas,
            t.maxInscripciones as maximo
          FROM Torneos t
          JOIN TorneoKartings tk ON t.id = tk.id_torneo
          JOIN Kartings k ON tk.id_karting = k.id
          WHERE t.fecha_fin >= date('now')
          ORDER BY t.fecha_inicio ASC
        `);

    const torneosRows = torneos.rows;

    if (!Array.isArray(torneosRows) || torneosRows.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron torneos oficiales" });
    }

    res.json(torneosRows);
  } catch (error) {
    console.error("Error al obtener torneos:", error);
    res.status(500).json({
      error: "Error al obtener la información de los torneos oficiales",
      detalles: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
});

router.get("/carreras-libres", async (req, res) => {
  try {
    const result = await conn.execute(`
      SELECT 
        c.id,
        c.fecha,
        k.nombre AS karting,
        k.ciudad AS comunidad,
        strftime('%d/%m/%Y', c.fecha) AS fechaFormateada,
        strftime('%H:%M', c.hora) as hora,
        CASE 
          WHEN c.nivelMin BETWEEN 1 AND 3 THEN 'Principiante'
          WHEN c.nivelMin BETWEEN 4 AND 7 THEN 'Intermedio'
          WHEN c.nivelMin BETWEEN 8 AND 10 THEN 'Avanzado'
          ELSE 'Desconocido'
        END AS nivel,
        (SELECT COUNT(*) FROM InscripcionesCarrera WHERE id_carrera = c.id) AS plazasOcupadas,
        c.maxInscripciones AS plazasTotales
      FROM Carreras c
      JOIN Kartings k ON c.id_karting = k.id
      WHERE c.id_torneo IS NULL
        AND date(c.fecha) >= date('now')
      ORDER BY c.fecha ASC
    `);

    const carreras = result.rows;

    if (!carreras || carreras.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron carreras libres" });
    }

    res.json(carreras);
  } catch (error) {
    console.error("Error al obtener carreras libres:", error);
    res.status(500).json({ error: "Error al obtener las carreras libres" });
  }
});

router.get("/carrera-libre/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener detalles de la carrera
    const carreraResult = await conn.execute(
      `
      SELECT 
        c.id,
        c.fecha,
        k.nombre AS karting,
        k.ciudad AS comunidad,
        strftime('%d/%m/%Y', c.fecha) AS fecha,
        strftime('%H:%M', c.hora) as hora,
        CASE 
          WHEN c.nivelMin BETWEEN 1 AND 3 THEN 'Principiante'
          WHEN c.nivelMin BETWEEN 4 AND 7 THEN 'Intermedio'
          WHEN c.nivelMin BETWEEN 8 AND 10 THEN 'Avanzado'
          ELSE 'Desconocido'
        END AS nivel,
        (SELECT COUNT(*) FROM InscripcionesCarrera WHERE id_carrera = c.id) AS plazasOcupadas,
        c.maxInscripciones AS plazasTotales
      FROM Carreras c
      JOIN Kartings k ON c.id_karting = k.id
      WHERE c.id = ? AND c.id_torneo IS NULL
    `,
      [id],
    );

    if (!carreraResult.rows || carreraResult.rows.length === 0) {
      return res.status(404).json({ error: "Carrera no encontrada" });
    }

    // Obtener participantes de la carrera
    const participantesResult = await conn.execute(
      `
      SELECT 
        ic.id,
        u.username,
        ic.fecha_inscripcion as fechaInscripcion
      FROM InscripcionesCarrera ic
      JOIN Usuarios u ON ic.id_piloto = u.id
      WHERE ic.id_carrera = ?
      ORDER BY ic.fecha_inscripcion ASC
    `,
      [id],
    );

    res.json({
      carrera: carreraResult.rows[0],
      participantes: participantesResult.rows || [],
    });
  } catch (error) {
    console.error("Error al obtener detalles de la carrera:", error);
    res
      .status(500)
      .json({ error: "Error al obtener los detalles de la carrera" });
  }
});

router.get("/torneo/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener detalles del torneo
    const torneoResult = await conn.execute(
      `
      SELECT 
        t.id,
        t.nombreTorneo as nombre,
        k.nombre as ubicacion,
        k.ciudad as comunidad,
        strftime('%d/%m/%Y', t.fecha_inicio) as fechaInicio,
        strftime('%d/%m/%Y', t.fecha_fin) as fechaFin,
        CASE 
          WHEN t.nivelMin = 1 THEN 'Principiante'
          WHEN t.nivelMin = 2 THEN 'Intermedio'
          WHEN t.nivelMin = 3 THEN 'Avanzado'
          ELSE 'Desconocido'
        END as nivelMinimo,
        (SELECT COUNT(*) FROM InscripcionesTorneo WHERE id_torneo = t.id) as inscritos,
        t.maxInscripciones as maximo
      FROM Torneos t
      JOIN TorneoKartings tk ON t.id = tk.id_torneo
      JOIN Kartings k ON tk.id_karting = k.id
      WHERE t.id = ?
    `,
      [id],
    );

    if (!torneoResult.rows || torneoResult.rows.length === 0) {
      return res.status(404).json({ error: "Torneo no encontrado" });
    }

    // Obtener clasificación del torneo
    const clasificacionResult = await conn.execute(
      `
      SELECT 
        rt.id_piloto,
        u.username as piloto,
        rt.puntosTorneo as puntos,
        (SELECT COUNT(*) FROM ResultadosCarreras rc 
         WHERE rc.id_carrera IN (SELECT id FROM Carreras WHERE id_torneo = ?)
         AND rc.id_piloto = rt.id_piloto) as vueltas
      FROM ResultadosTorneo rt
      JOIN Usuarios u ON rt.id_piloto = u.id
      WHERE rt.id_torneo = ?
      ORDER BY rt.puntosTorneo DESC
    `,
      [id, id],
    );

    // Obtener próximas carreras del torneo
    const carrerasResult = await conn.execute(
      `
      SELECT 
        c.id,
        strftime('%d/%m/%Y', c.fecha) as fecha,
        strftime('%H:%M', c.hora) as hora,
        k.nombre as circuito
      FROM Carreras c
      JOIN Kartings k ON c.id_karting = k.id
      WHERE c.id_torneo = ? AND date(c.fecha) >= date('now')
      ORDER BY c.fecha ASC
    `,
      [id],
    );

    // Obtener premios del torneo (usando TemporadaRecompensas)
    const premiosResult = await conn.execute(`
      SELECT 
        tr.posicion_min as posicion,
        tr.nombre_recompensa as premio,
        tr.descripcion
      FROM TemporadaRecompensas tr
      JOIN Temporadas t ON tr.id_temporada = t.id
      WHERE t.fecha_inicio <= date('now') AND t.fecha_fin >= date('now')
      ORDER BY tr.posicion_min ASC
    `);

    res.json({
      torneo: torneoResult.rows[0],
      clasificacion: clasificacionResult.rows || [],
      proximasCarreras: carrerasResult.rows || [],
      premios: premiosResult.rows || [],
    });
  } catch (error) {
    console.error("Error al obtener detalles del torneo:", error);
    res.status(500).json({ error: "Error al obtener los detalles del torneo" });
  }
});

export default router;
