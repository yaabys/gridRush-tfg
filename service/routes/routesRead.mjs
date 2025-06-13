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

const calcularNivel = (elo) => {
  const niveles = [
    { min: 0, max: 1000, nivel: 1 },
    { min: 1000, max: 2000, nivel: 2 },
    { min: 2000, max: 3000, nivel: 3 },
    { min: 3000, max: 4000, nivel: 4 },
    { min: 4000, max: 5000, nivel: 5 },
    { min: 5000, max: 6000, nivel: 6 },
    { min: 6000, max: 7000, nivel: 7 },
    { min: 7000, max: 8000, nivel: 8 },
    { min: 8000, max: 9000, nivel: 9 },
    { min: 9000, max: 10000, nivel: 10 },
  ];

  for (const rango of niveles) {
    if (elo >= rango.min && elo < rango.max) {
      return rango.nivel;
    }
  }
  return 1;
};

router.get("/perfil", async (req, res) => {
  if (!req.session.usuario || !req.session.usuario.username) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const username = req.session.usuario.username;

  try {
    const result = await conn.execute({
      sql: "SELECT id, username, email, nombre, elo, carrerasVictorias, carrerasParticipadas, torneosVictorias, torneosParticipados FROM Usuarios WHERE username = ?",
      args: [username],
    });

    const filas = result.rows;

    if (filas.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const usuario = filas[0];
    delete usuario.password;

    res.json(usuario);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

router.get("/temporada-actual", async (req, res) => {
  try {
    const result = await conn.execute(
      "SELECT * FROM Temporadas WHERE fecha_inicio <= DATE('now') AND fecha_fin >= DATE('now') ORDER BY fecha_inicio DESC LIMIT 1"
    );

    const temporadas = result.rows;

    if (!Array.isArray(temporadas) || temporadas.length === 0) {
      const resultProximas = await conn.execute(
        "SELECT * FROM Temporadas WHERE fecha_inicio > DATE('now') ORDER BY fecha_inicio ASC LIMIT 1"
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

router.get("/recompensas/:temporadaId", async (req, res) => {
  try {
    const { temporadaId } = req.params;

    const result = await conn.execute(
      `SELECT tr.id, tr.nombre_recompensa, tr.descripcion, tr.posicion_min, tr.posicion_max, r.nombre as nombre_base, r.imagen 
       FROM TemporadaRecompensas tr 
       JOIN Recompensas r ON tr.id_recompensa = r.id 
       WHERE tr.id_temporada = ? 
       ORDER BY tr.posicion_min ASC`,
      [temporadaId]
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
      [temporadaId]
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
      `SELECT nombre, ciudad as ubicacion,ubicacionLink as link  FROM Kartings ORDER BY nombre`
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
        t.nivelMin as eloRequerido,
        CASE 
          WHEN t.nivelMin BETWEEN 0 AND 1000 THEN '1'
          WHEN t.nivelMin BETWEEN 1000 AND 2000 THEN '2'
          WHEN t.nivelMin BETWEEN 2000 AND 3000 THEN '3'
          WHEN t.nivelMin BETWEEN 3000 AND 4000 THEN '4'
          WHEN t.nivelMin BETWEEN 4000 AND 5000 THEN '5'
          WHEN t.nivelMin BETWEEN 5000 AND 6000 THEN '6'
          WHEN t.nivelMin BETWEEN 6000 AND 7000 THEN '7'
          WHEN t.nivelMin BETWEEN 7000 AND 8000 THEN '8'
          WHEN t.nivelMin BETWEEN 8000 AND 9000 THEN '9'
          WHEN t.nivelMin >= 9000 THEN '10'
          ELSE '?'
        END as nivelRequerido,
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
        c.nivelMin as eloRequerido,
        CASE 
          WHEN c.nivelMin BETWEEN 0 AND 1000 THEN '1'
          WHEN c.nivelMin BETWEEN 1000 AND 2000 THEN '2'
          WHEN c.nivelMin BETWEEN 2000 AND 3000 THEN '3'
          WHEN c.nivelMin BETWEEN 3000 AND 4000 THEN '4'
          WHEN c.nivelMin BETWEEN 4000 AND 5000 THEN '5'
          WHEN c.nivelMin BETWEEN 5000 AND 6000 THEN '6'
          WHEN c.nivelMin BETWEEN 6000 AND 7000 THEN '7'
          WHEN c.nivelMin BETWEEN 7000 AND 8000 THEN '8'
          WHEN c.nivelMin BETWEEN 8000 AND 9000 THEN '9'
          WHEN c.nivelMin >= 9000 THEN '10'
          ELSE '?'
        END AS nivelRequerido,
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

    const carreraResult = await conn.execute(
      `
      SELECT 
        c.id,
        c.fecha,
        k.nombre AS karting,
        k.ciudad AS comunidad,
        strftime('%d/%m/%Y', c.fecha) AS fecha,
        strftime('%H:%M', c.hora) as hora,
        c.nivelMin as nivelMinimo,
        (c.nivelMin - 1) * 1000 as eloRequerido,
        CASE 
          WHEN c.nivelMin BETWEEN 0 AND 1000 THEN '1'
          WHEN c.nivelMin BETWEEN 1000 AND 2000 THEN '2'
          WHEN c.nivelMin BETWEEN 2000 AND 3000 THEN '3'
          WHEN c.nivelMin BETWEEN 3000 AND 4000 THEN '4'
          WHEN c.nivelMin BETWEEN 4000 AND 5000 THEN '5'
          WHEN c.nivelMin BETWEEN 5000 AND 6000 THEN '6'
          WHEN c.nivelMin BETWEEN 6000 AND 7000 THEN '7'
          WHEN c.nivelMin BETWEEN 7000 AND 8000 THEN '8'
          WHEN c.nivelMin BETWEEN 8000 AND 9000 THEN '9'
          WHEN c.nivelMin >= 9000 THEN '10'
          ELSE '?'
        END AS nivelRequerido,
        (SELECT COUNT(*) FROM InscripcionesCarrera WHERE id_carrera = c.id) AS plazasOcupadas,
        c.maxInscripciones AS plazasTotales
      FROM Carreras c
      JOIN Kartings k ON c.id_karting = k.id
      WHERE c.id = ? AND c.id_torneo IS NULL
    `,
      [id]
    );

    if (!carreraResult.rows || carreraResult.rows.length === 0) {
      return res.status(404).json({ error: "Carrera no encontrada" });
    }

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
      [id]
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
    const username = req.session?.usuario?.username;

    const torneoResult = await conn.execute(
      `
      SELECT 
        t.id,
        t.nombreTorneo as nombre,
        k.nombre as ubicacion,
        k.ciudad as comunidad,
        strftime('%d/%m/%Y', t.fecha_inicio) as fechaInicio,
        strftime('%d/%m/%Y', t.fecha_fin) as fechaFin,
        t.nivelMin as nivelMinimo,
        (t.nivelMin - 1) * 1000 as eloRequerido,
        CASE 
          WHEN t.nivelMin BETWEEN 0 AND 1000 THEN '1'
          WHEN t.nivelMin BETWEEN 1000 AND 2000 THEN '2'
          WHEN t.nivelMin BETWEEN 2000 AND 3000 THEN '3'
          WHEN t.nivelMin BETWEEN 3000 AND 4000 THEN '4'
          WHEN t.nivelMin BETWEEN 4000 AND 5000 THEN '5'
          WHEN t.nivelMin BETWEEN 5000 AND 6000 THEN '6'
          WHEN t.nivelMin BETWEEN 6000 AND 7000 THEN '7'
          WHEN t.nivelMin BETWEEN 7000 AND 8000 THEN '8'
          WHEN t.nivelMin BETWEEN 8000 AND 9000 THEN '9'
          WHEN t.nivelMin >= 9000 THEN '10'
          ELSE '?'
        END as nivelRequerido,
        (SELECT COUNT(*) FROM InscripcionesTorneo WHERE id_torneo = t.id) as inscritos,
        t.maxInscripciones as maximo
      FROM Torneos t
      JOIN TorneoKartings tk ON t.id = tk.id_torneo
      JOIN Kartings k ON tk.id_karting = k.id
      WHERE t.id = ?
    `,
      [id]
    );

    if (!torneoResult.rows || torneoResult.rows.length === 0) {
      return res.status(404).json({ error: "Torneo no encontrado" });
    }

    let userElo = null;
    let userNivel = null;
    if (username) {
      const userResult = await conn.execute(
        "SELECT elo FROM Usuarios WHERE username = ?",
        [username]
      );
      if (userResult.rows && userResult.rows.length > 0) {
        userElo = userResult.rows[0].elo;
        userNivel = calcularNivel(userElo);
      }
    }

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
      [id, id]
    );

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
      [id]
    );

    const premiosResult = await conn.execute(`
      SELECT 
        posicion_min as posicion,
        nombre_recompensa as premio,
        descripcion
      FROM TorneoRecompensas
      WHERE id_torneo = ?
      ORDER BY posicion_min ASC
    `,
      [id]
    );

    res.json({
      torneo: {
        ...torneoResult.rows[0],
        userElo,
        userNivel,
      },
      clasificacion: clasificacionResult.rows || [],
      proximasCarreras: carrerasResult.rows || [],
      premios: premiosResult.rows || [],
    });
  } catch (error) {
    console.error("Error al obtener detalles del torneo:", error);
    res.status(500).json({ error: "Error al obtener los detalles del torneo" });
  }
});

router.post("/get-id-piloto", async (req, res) => {
  if (!req.session.usuario || !req.session.usuario.username) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const username = req.session.usuario.username;

  try {
    const result = await conn.execute(
      "SELECT id FROM Usuarios WHERE username = ?",
      [username]
    );
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json({ id_piloto: result.rows[0].id });
  } catch (error) {
    console.error("Error al obtener id_piloto:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

router.get(
  "/foto-resultado-carrera/:id_carrera/:id_piloto",
  async (req, res) => {
    const { id_carrera, id_piloto } = req.params;
    try {
      const result = await conn.execute(
        "SELECT fotoVerificacion, tipoFotoVerificacion FROM VerificacionesCarreraFoto WHERE id_carrera = ? AND id_piloto = ?",
        [id_carrera, id_piloto]
      );
      const rows = result.rows || result[0];
      if (!rows.length || !rows[0].fotoVerificacion) {
        return res.status(404).send();
      }
      const buffer = Buffer.from(rows[0].fotoVerificacion);
      res.set("Content-Type", rows[0].tipoFotoVerificacion || "image/jpeg");
      res.end(buffer);
    } catch (err) {
      res.status(500).send();
    }
  }
);

router.get("/carrera-torneo/:idTorneo/:idCarrera", async (req, res) => {
  const { idTorneo, idCarrera } = req.params;
  try {
    const carreraResult = await conn.execute(
      `SELECT 
        c.id,
        c.fecha,
        k.nombre AS karting,
        k.ciudad AS comunidad,
        strftime('%d/%m/%Y', c.fecha) AS fecha,
        strftime('%H:%M', c.hora) as hora,
        c.nivelMin as nivelMinimo,
        (c.nivelMin - 1) * 1000 as eloRequerido,
        CASE 
          WHEN c.nivelMin BETWEEN 0 AND 1000 THEN '1'
          WHEN c.nivelMin BETWEEN 1000 AND 2000 THEN '2'
          WHEN c.nivelMin BETWEEN 2000 AND 3000 THEN '3'
          WHEN c.nivelMin BETWEEN 3000 AND 4000 THEN '4'
          WHEN c.nivelMin BETWEEN 4000 AND 5000 THEN '5'
          WHEN c.nivelMin BETWEEN 5000 AND 6000 THEN '6'
          WHEN c.nivelMin BETWEEN 6000 AND 7000 THEN '7'
          WHEN c.nivelMin BETWEEN 7000 AND 8000 THEN '8'
          WHEN c.nivelMin BETWEEN 8000 AND 9000 THEN '9'
          WHEN c.nivelMin >= 9000 THEN '10'
          ELSE '?'
        END AS nivelRequerido,
        (SELECT COUNT(*) FROM InscripcionesCarrera WHERE id_carrera = c.id) AS plazasOcupadas,
        c.maxInscripciones AS plazasTotales
      FROM Carreras c
      JOIN Kartings k ON c.id_karting = k.id
      WHERE c.id = ? AND c.id_torneo = ?`,
      [idCarrera, idTorneo]
    );

    if (!carreraResult.rows || carreraResult.rows.length === 0) {
      return res.status(404).json({ error: "Carrera no encontrada" });
    }

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
      [idCarrera]
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

router.get("/inscrito-carrera/:id", async (req, res) => {
  if (!req.session.usuario || !req.session.usuario.username) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const username = req.session.usuario.username;
  const idCarrera = req.params.id;

  try {
    console.log(
      `[/inscrito-carrera] Comprobando inscripción para usuario: ${username} en carrera: ${idCarrera}`
    );


    const userResult = await conn.execute(
      "SELECT id FROM Usuarios WHERE username = ?",
      [username]
    );
    if (!userResult.rows || userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    const idPiloto = userResult.rows[0].id;


    const inscripcionResult = await conn.execute(
      "SELECT 1 FROM InscripcionesCarrera WHERE id_carrera = ? AND id_piloto = ? LIMIT 1",
      [idCarrera, idPiloto]
    );

    const inscrito =
      inscripcionResult.rows && inscripcionResult.rows.length > 0;
    res.json({ inscrito });
  } catch (error) {
    console.error("Error comprobando inscripción en carrera:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

export default router;
