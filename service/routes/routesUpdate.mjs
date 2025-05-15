import express from "express";
import { actualizarPerfil } from "../controllers/userController.mjs";
import { conn } from "../sql/conexionSQL.mjs";
import { actualizarFirebase } from "../firebase/conexionFirebase.mjs";

const router = express.Router();

router.put("/cambiarperfil", async (req, res) => {
  const { usernameActual, username, email } = req.body;

  if (!usernameActual || !username || !email) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {

    const emailLower = email.toLowerCase();
    const usernameLower = username.toLowerCase();
    const usernameActualLower = usernameActual.toLowerCase();

    if (usernameLower !== usernameActualLower) {
      const result = await conn.execute({
        sql: "SELECT id FROM Usuarios WHERE username = ? AND username != ?",
        args: [username, usernameActual]
      });
      if (result.rows.length > 0) {
        return res.status(400).json({ error: "El nombre de usuario ya está registrado" });
      }
    }

    if (emailLower !== usernameActualLower) {
      const result = await conn.execute({
        sql: "SELECT id FROM Usuarios WHERE email = ? AND username != ?",
        args: [email, usernameActual]
      });
      if (result.rows.length > 0) {
        return res.status(400).json({ error: "El correo electrónico ya está registrado" });
      }
    }

    const resultadoFirebase = await actualizarFirebase(usernameActual, username, email);
    if (!resultadoFirebase.success) {
      return res.status(400).json({ error: resultadoFirebase.error });
    }

    // Si Firebase se actualizó correctamente, actualizamos en la base de datos SQL
    const result = await conn.execute({
      sql: "SELECT id FROM Usuarios WHERE username = ?",
      args: [usernameActual]
    });
    
    if (!result.rows.length) {
      await actualizarFirebase(username, usernameActual, email);
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    const id = result.rows[0].id;
    const resultado = await actualizarPerfil(id, username, email);
    
    if (!resultado.success) {
      await actualizarFirebase(username, usernameActual, email);
      return res.status(400).json({ error: resultado.error });
    }

    // Devolvemos el usuario actualizado
    const usuarioActualizado = await conn.execute({
      sql: "SELECT * FROM Usuarios WHERE id = ?",
      args: [id]
    });

    res.json({ 
      success: true, 
      mensaje: "Perfil actualizado correctamente",
      usuario: usuarioActualizado.rows[0]
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
      args: [username]
    });

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const idUsuario = userResult.rows[0].id;

    // Verificar si ya está inscrito
    const inscripcionResult = await conn.execute({
      sql: "SELECT id FROM InscripcionesCarrera WHERE id_carrera = ? AND id_piloto = ?",
      args: [idCarrera, idUsuario]
    });

    if (inscripcionResult.rows.length > 0) {
      return res.status(200).json({
        success: false,
        message: "El usuario ya está inscrito en esta carrera",
        inscrito: true
      });
    }

    // Hacer la inscripción
    await conn.execute({
      sql: "INSERT INTO InscripcionesCarrera (id_carrera, id_piloto) VALUES (?, ?)",
      args: [idCarrera, idUsuario]
    });

    return res.status(200).json({
      success: true,
      message: "Inscripción realizada correctamente",
      inscrito: false
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
      args: [username]
    });

    if (userResult.rows.length === 0) {
      return res.json({ inscrito: false });
    }

    const idUsuario = userResult.rows[0].id;

    // Verificar inscripción
    const inscripcionResult = await conn.execute({
      sql: "SELECT id FROM InscripcionesCarrera WHERE id_carrera = ? AND id_piloto = ?",
      args: [idCarrera, idUsuario]
    });

    return res.json({ inscrito: inscripcionResult.rows.length > 0 });
  } catch (error) {
    console.error("Error al verificar inscripción:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
});

export default router;


