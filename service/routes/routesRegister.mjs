import express from "express";
import { registrarFirebase,comprobarLogin } from "../firebase/conexionFirebase.mjs"
import { comprobarUser,hashearPassword,comprobarEmail,comprobarSesion } from "../controllers/userController.mjs"
import { conn } from "../sql/conexionSQL.mjs"
import session from "express-session"

const router = express.Router();

router.use(session({
	secret: "clave_secreta",
	resave: false, // no guardar la cookie de nuevo si no hay cambio
	saveUninitialized: true, // guardarla sin inicializar
	cookie: {maxAge: 1000 * 60 * 60 * 2} // 2 horas
}))

router.get("/sesion", (req, res) => {
  if (req.session.usuario) {
    return res.json({ logueado: true, username: req.session.usuario.username });
  } else {
    return res.json({ logueado: false });
  }
});

router.post("/register", async (req, res) => {
    
    if(comprobarSesion(req)){
        return false;
    }
  
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
      //crear sesion usuario
      req.session.usuario = {
        username: username
      };
      
      return res.status(201).json({ success: true, message: 'Usuario registrado correctamente' });
  
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }

  });

// Inicio de Sesion
router.post("/login", async (req, res) => {
  if(comprobarSesion(req)){
    return res.status(200).json({ success: true, message: 'Usuario ya logueado' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Faltan campos requeridos' });
  }

  try {
    // Buscar usuario por nombre de usuario o correo electrónico
    const sql = `SELECT * FROM Usuarios WHERE username = ? OR email = ?`;
    const [rows] = await conn.execute(sql, [username, username]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Usuario no encontrado' });
    }

    const user = rows[0];
    
    // Verificar contraseña
    const loginResult = await comprobarLogin(username, password);
    if (!loginResult) {
      return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
    }

    // Crear sesión
    req.session.usuario = {
      username: user.username
    };

    return res.status(200).json({ success: true, message: 'Inicio de sesión exitoso' });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});
  
export default router;