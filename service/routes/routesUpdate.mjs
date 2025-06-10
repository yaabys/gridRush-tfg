import express from "express";
import { actualizarPerfil } from "../controllers/userController.mjs";
import { conn } from "../sql/conexionSQL.mjs";
import {
  actualizarUsernameFirebase,
  actualizarEmailFirebase,
} from "../firebase/conexionFirebase.mjs";
import session from "express-session";
import { updateSession } from "../controllers/updateSession.mjs";

const router = express.Router();

router.put("/cambiarperfil", async (req, res) => {
  const { usernameActual, username, email } = req.body;

  if (!usernameActual || (!username && !email)) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    // Verificar si el nuevo nombre de usuario ya está registrado
    if (username && username !== usernameActual) {
      const result = await conn.execute({
        sql: "SELECT id FROM Usuarios WHERE username = ? AND username != ?",
        args: [username, usernameActual],
      });
      if (result.rows.length > 0) {
        return res
          .status(400)
          .json({ error: "El nombre de usuario ya está registrado" });
      }
    }

    // Verificar si el nuevo correo ya está registrado
    if (email) {
      const result = await conn.execute({
        sql: "SELECT id FROM Usuarios WHERE email = ? AND username != ?",
        args: [email, usernameActual],
      });
      if (result.rows.length > 0) {
        return res
          .status(400)
          .json({ error: "El correo electrónico ya está registrado" });
      }
    }

    if (username && username !== usernameActual) {
      const resultadoFirebaseUsername = await actualizarUsernameFirebase(
        usernameActual,
        username,
      );
      if (!resultadoFirebaseUsername.success) {
        return res.status(400).json({ error: resultadoFirebaseUsername.error });
      }

      const sessionUpdated = await updateSession(req, username);
      if (!sessionUpdated) {
        console.error("Fallo al actualizar la sesión");
        return res
          .status(500)
          .json({ error: "No se pudo actualizar la sesión" });
      }
    }

    if (email) {
      const resultadoFirebaseEmail = await actualizarEmailFirebase(
        usernameActual,
        email,
      );
      if (!resultadoFirebaseEmail.success) {
        return res.status(400).json({ error: resultadoFirebaseEmail.error });
      }
    }

    res.json({
      success: true,
      mensaje: "Perfil actualizado correctamente",
    });
  } catch (error) {
    console.error("Error en actualización:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

router.put("/reservar-carreraLibre", async (req, res) => {
  const { idCarrera, username } = req.body;

  if (!idCarrera || !username) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    // Obtener ID del usuario por username
    const userResult = await conn.execute({
      sql: "SELECT id FROM Usuarios WHERE username = ?",
      args: [username],
    });

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const idUsuario = userResult.rows[0].id;

    // Verificar si ya está inscrito
    const inscripcionResult = await conn.execute({
      sql: "SELECT id FROM InscripcionesCarrera WHERE id_carrera = ? AND id_piloto = ?",
      args: [idCarrera, idUsuario],
    });

    if (inscripcionResult.rows.length > 0) {
      return res.status(200).json({
        success: false,
        message: "El usuario ya está inscrito en esta carrera",
        inscrito: true,
      });
    }

    // Hacer la inscripción
    await conn.execute({
      sql: "INSERT INTO InscripcionesCarrera (id_carrera, id_piloto) VALUES (?, ?)",
      args: [idCarrera, idUsuario],
    });

    return res.status(200).json({
      success: true,
      message: "Inscripción realizada correctamente",
      inscrito: false,
    });
  } catch (error) {
    console.error("Error al reservar carrera libre:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
});

router.post("/check-inscripcion", async (req, res) => {
  const { username, idCarrera } = req.body;

  if (!username || !idCarrera) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    // Obtener ID del usuario
    const userResult = await conn.execute({
      sql: "SELECT id FROM Usuarios WHERE username = ?",
      args: [username],
    });

    if (userResult.rows.length === 0) {
      return res.json({ inscrito: false });
    }

    const idUsuario = userResult.rows[0].id;

    // Verificar inscripción
    const inscripcionResult = await conn.execute({
      sql: "SELECT id FROM InscripcionesCarrera WHERE id_carrera = ? AND id_piloto = ?",
      args: [idCarrera, idUsuario],
    });

    return res.json({ inscrito: inscripcionResult.rows.length > 0 });
  } catch (error) {
    console.error("Error al verificar inscripción:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
});

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
  return 1; // Nivel por defecto si no se encuentra en ningún rango
};

router.put("/reservar-torneo", async (req, res) => {
  const { idTorneo, username } = req.body;

  if (!idTorneo || !username) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    // Obtener ID del usuario
    const userResult = await conn.execute({
      sql: "SELECT id, elo FROM Usuarios WHERE username = ?",
      args: [username],
    });

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const idUsuario = userResult.rows[0].id;
    const eloUsuario = userResult.rows[0].elo;
    const nivelUsuario = calcularNivel(eloUsuario);

    // Verificar si ya está inscrito
    const inscripcionResult = await conn.execute({
      sql: "SELECT id FROM InscripcionesTorneo WHERE id_torneo = ? AND id_piloto = ?",
      args: [idTorneo, idUsuario],
    });

    if (inscripcionResult.rows.length > 0) {
      return res.status(200).json({
        success: false,
        message: "Ya estás inscrito en este torneo",
      });
    }

    // Obtener información del torneo
    const torneoResult = await conn.execute({
      sql: "SELECT nivelMin, maxInscripciones FROM Torneos WHERE id = ?",
      args: [idTorneo],
    });

    if (torneoResult.rows.length === 0) {
      return res.status(404).json({ error: "Torneo no encontrado" });
    }

    const torneo = torneoResult.rows[0];

    // Verificar nivel mínimo
    if (nivelUsuario < torneo.nivelMin) {
      return res.status(400).json({
        error: `No cumples con el nivel mínimo requerido. Nivel mínimo: ${torneo.nivelMin}, Tu nivel: ${nivelUsuario} (Elo: ${eloUsuario})`,
      });
    }

    // Verificar plazas disponibles
    const inscritosResult = await conn.execute({
      sql: "SELECT COUNT(*) as inscritos FROM InscripcionesTorneo WHERE id_torneo = ?",
      args: [idTorneo],
    });

    if (inscritosResult.rows[0].inscritos >= torneo.maxInscripciones) {
      return res.status(400).json({
        error: "El torneo ya está completo",
      });
    }

    // Realizar la inscripción al torneo
    await conn.execute({
      sql: "INSERT INTO InscripcionesTorneo (id_torneo, id_piloto) VALUES (?, ?)",
      args: [idTorneo, idUsuario],
    });

    // Obtener todas las carreras asociadas al torneo
    const carrerasResult = await conn.execute({
      sql: "SELECT id FROM Carreras WHERE id_torneo = ?",
      args: [idTorneo],
    });

    let carrerasInscritas = 0;

    // Inscribir al usuario en todas las carreras del torneo
    for (const carrera of carrerasResult.rows) {
      // Verificar si ya está inscrito en esta carrera (por si acaso)
      const inscritoCarrera = await conn.execute({
        sql: "SELECT id FROM InscripcionesCarrera WHERE id_carrera = ? AND id_piloto = ?",
        args: [carrera.id, idUsuario],
      });

      if (inscritoCarrera.rows.length === 0) {
        await conn.execute({
          sql: "INSERT INTO InscripcionesCarrera (id_carrera, id_piloto) VALUES (?, ?)",
          args: [carrera.id, idUsuario],
        });
        carrerasInscritas++;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Inscripción realizada correctamente en el torneo y todas sus carreras",
      carrerasInscritas: carrerasInscritas
    });

  } catch (error) {
    console.error("Error al inscribirse en el torneo:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
});

router.post("/check-inscripcion-torneo", async (req, res) => {
  const { username, idTorneo } = req.body;

  if (!username || !idTorneo) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    // Obtener ID del usuario
    const userResult = await conn.execute({
      sql: "SELECT id FROM Usuarios WHERE username = ?",
      args: [username],
    });

    if (userResult.rows.length === 0) {
      return res.json({ inscrito: false });
    }

    const idUsuario = userResult.rows[0].id;

    // Verificar inscripción
    const inscripcionResult = await conn.execute({
      sql: "SELECT id FROM InscripcionesTorneo WHERE id_torneo = ? AND id_piloto = ?",
      args: [idTorneo, idUsuario],
    });

    return res.json({ inscrito: inscripcionResult.rows.length > 0 });
  } catch (error) {
    console.error("Error al verificar inscripción al torneo:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
});

export default router;