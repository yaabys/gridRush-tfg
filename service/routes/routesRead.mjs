import express from "express";
import { registrarFirebase,comprobarLogin } from "../firebase/conexionFirebase.mjs"
import { comprobarUser,hashearPassword,comprobarEmail,comprobarSesion } from "../controllers/userController.mjs"
import { conn } from "../sql/conexionSQL.mjs"
import session from "express-session"

router.get("/perfil", async (req, res) => {
    if (!req.session.usuario || !req.session.usuario.username) {
      return res.status(401).json({ error: "No autenticado" });
    }
  
    const username = req.session.usuario.username;
  
    try {
      const [filas] = await conn.execute("SELECT * FROM Usuarios WHERE username = ?", [username]);
  
      if (filas.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
  
      // Opcional: elimina la contraseña antes de enviar los datos
      const usuario = filas[0];
      delete usuario.password;
  
      res.json(usuario);
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      res.status(500).json({ error: "Error del servidor" });
    }
  });
  