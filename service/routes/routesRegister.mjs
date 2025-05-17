import express from "express";
import { registrarFirebase,comprobarLogin } from "../firebase/conexionFirebase.mjs"
import { comprobarUser,hashearPassword,comprobarEmail,comprobarSesion } from "../controllers/userController.mjs"
import { conn } from "../sql/conexionSQL.mjs"
import session from "express-session"
import { enviarCorreoRegistro } from "../controllers/emailService.mjs";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.use(session({
	secret: "clave_secreta",
	resave: false, // no guardar la cookie de nuevo si no hay cambio
	saveUninitialized: true, // guardarla sin inicializar
	cookie: {maxAge: 1000 * 60 * 60 * 2} // 2 horas
}))

router.get("/comprobarSesion", (req, res) => {
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

    await enviarCorreoRegistro(email, username);

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

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Faltan campos requeridos' });
    }

    try {
      const user = await comprobarLogin(username, password);

      if (!user) {
        return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
      }

      req.session.usuario = { username: user.username };

      return res.status(200).json({ success: true, message: 'Inicio de sesión exitoso' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});
  
export default router;