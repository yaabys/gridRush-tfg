import express from "express";
import { actualizarPerfil } from "../controllers/userController.mjs";
import { conn } from "../sql/conexionSQL.mjs";
import { actualizarFirebase } from "../firebase/conexionFirebase.mjs";

const router = express.Router();

// Ruta para actualizar el perfil del usuario (nombre de usuario y email)
router.put("/cambiarperfil", async (req, res) => {
  const { usernameActual, username, email } = req.body;

  if (!usernameActual || !username || !email) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    // Primero verificamos si los cambios son posibles en Firebase
    const emailLower = email.toLowerCase();
    const usernameLower = username.toLowerCase();
    const usernameActualLower = usernameActual.toLowerCase();

    // Verificar si el nuevo username ya existe (si es diferente al actual)
    if (usernameLower !== usernameActualLower) {
      const result = await conn.execute({
        sql: "SELECT id FROM Usuarios WHERE username = ? AND username != ?",
        args: [username, usernameActual]
      });
      if (result.rows.length > 0) {
        return res.status(400).json({ error: "El nombre de usuario ya está registrado" });
      }
    }

    // Verificar si el nuevo email ya existe (si es diferente al actual)
    if (emailLower !== usernameActualLower) {
      const result = await conn.execute({
        sql: "SELECT id FROM Usuarios WHERE email = ? AND username != ?",
        args: [email, usernameActual]
      });
      if (result.rows.length > 0) {
        return res.status(400).json({ error: "El correo electrónico ya está registrado" });
      }
    }

    // Si llegamos aquí, los cambios son válidos en ambas bases de datos
    // Primero actualizamos en Firebase
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
      // Si no encontramos el usuario en SQL, revertimos Firebase
      await actualizarFirebase(username, usernameActual, email);
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    const id = result.rows[0].id;
    const resultado = await actualizarPerfil(id, username, email);
    
    if (!resultado.success) {
      // Si falla la actualización en SQL, revertimos Firebase
      await actualizarFirebase(username, usernameActual, email);
      return res.status(400).json({ error: resultado.error });
    }

    res.json({ success: true, mensaje: "Perfil actualizado correctamente" });
  } catch (error) {
    console.error("Error en actualización:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

export default router;
