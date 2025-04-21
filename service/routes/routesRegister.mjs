import express from "express";
import { registrarFirebase,comprobarLogin } from "../firebase/conexionFirebase.mjs"
import { comprobarUser,hashearPassword,comprobarEmail } from "../controllers/userController.mjs"
import { conn } from "../sql/conexionSQL.mjs"

const router = express.Router();

router.post("/register", async (req, res) => {
    const { nombre, apellido, username, nacimiento, email, provincia, password } = req.body;
  
    if (!nombre || !apellido || !username || !nacimiento || !password || !email || !provincia) {
      return res.status(400).json({ success: false, error: 'Faltan campos requeridos' });
    }

    try {
      const userCheck = await comprobarUser(username);
      if (!userCheck.success) {
        return res.status(409).json({ success: false,  error: 'Nombre de usuario ya registrado' });
      }
  
      const emailCheck = await comprobarEmail(email);
      if (!emailCheck.success) {
        return res.status(409).json({ success: false, error: 'Correo ya registrado' });
      }
  
      const hashPassword = await hashearPassword(password);
  
      // registrar en firebase
      const firebaseResult = await registrarFirebase(email, hashPassword,username);
      if (!firebaseResult) {
        return res.status(500).json({ success: false, error: 'Error al registrar en Firebase' });
      }
  
      const sql = `INSERT INTO Usuarios (username, nombre, apellidos, email, password, provincia, fechaNacimiento)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
      await conn.execute(sql, [username, nombre, apellido, email, hashPassword, provincia, nacimiento]);
      res.status(201).json({ success: true, message: 'Usuario registrado correctamente' });
  
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  });
  
export default router;