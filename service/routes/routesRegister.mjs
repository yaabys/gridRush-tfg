import express from "express";
import { registrarFirebase,comprobarLogin } from "../firebase/conexionFirebase.mjs"
import { comprobarUser,hashearPassword,comprobarEmail } from "../controllers/userController.mjs"
import { conn } from "../sql/conexionSQL.mjs"

const router = express.Router();

router.post("/register", async (req, res) => {
    console.log(process.env.DATABASE_URL)
    console.log(process.env.DATABASE_AUTH_TOKEN)
    console.log("Se ha llegado desde el front");
    console.log("Registro de usuario:", req.body);
    const { nombre, apellido, username, nacimiento, email, provincia, password } = req.body;
  
    if (!nombre || !apellido || !username || !nacimiento || !password || !email || !provincia) {
        console.log("Faltan campos requeridos");
      return res.status(400).json({ success: false, error: 'Faltan campos requeridos' });
    }
  
    try {
      const userCheck = await comprobarUser(username);
      console.log("Resultado de comprobarUser:", userCheck);
    //   if (!userCheck.success) {
    //     console.log("El nombre de usuario ya existe");
    //     return res.status(409).json({ success: false,  error: 'Nombre de usuario ya registrado' });
    //   }
  
      const emailCheck = await comprobarEmail(email);
      if (!emailCheck.success) {
        console.log("El correo ya existe");
        return res.status(409).json({ success: false, error: 'Correo ya registrado' });
      }
  
      const hashPassword = await hashearPassword(password);
  
      // registrar en firebase
      const firebaseResult = await registrarFirebase(email, hashPassword,username);
      if (!firebaseResult) {
        console.log("Error al registrar en Firebase");
        return res.status(500).json({ success: false, error: 'Error al registrar en Firebase' });
      }
  
      const sql = `INSERT INTO Usuarios (username, nombre, apellidos, email, password, provincia, fechaNacimiento)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
      await conn.execute(sql, [username, nombre, apellido, email, hashPassword, provincia, nacimiento]);
      console.log("Usuario registrado en la base de datos");
      res.status(201).json({ success: true, message: 'Usuario registrado correctamente' });
  
    } catch (error) {
      console.log('Error en /register:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  });
  
export default router;