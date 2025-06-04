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
import { enviarCorreoRegistro } from "../controllers/emailService.mjs";
import { setSession } from "../controllers/setSession.mjs";
import { esAdmin } from "../controllers/adminAuth.mjs";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.use(
  session({
    secret: "clave_secreta",
    resave: false, // no guardar la cookie de nuevo si no hay cambio
    saveUninitialized: true, // guardarla sin inicializar
    cookie: { maxAge: 1000 * 60 * 60 * 2 }, // 2 horas
  }),
);

router.get("/comprobarSesion", (req, res) => {
  if (req.session.usuario) {
    return res.json({ logueado: true, username: req.session.usuario.username });
  } else {
    return res.json({ logueado: false });
  }
});

router.post("/register", async (req, res) => {
  if (comprobarSesion(req)) {
    return false;
  }

  const { nombre, apellido, username, nacimiento, email, provincia, password } =
    req.body;

  if (
    !nombre ||
    !apellido ||
    !username ||
    !nacimiento ||
    !password ||
    !email ||
    !provincia
  ) {
    return res
      .status(400)
      .json({ success: false, error: "Faltan campos requeridos" });
  }

  try {
    const userCheck = await comprobarUser(username);
    if (!userCheck.success) {
      return res
        .status(409)
        .json({ success: false, error: "Nombre de usuario ya registrado" });
    }

    const emailCheck = await comprobarEmail(email);
    if (!emailCheck.success) {
      return res
        .status(409)
        .json({ success: false, error: "Correo ya registrado" });
    }

    const hashPassword = await hashearPassword(password);

    // Registrar en Firebase
    const firebaseResult = await registrarFirebase(
      email,
      hashPassword,
      username,
    );
    if (!firebaseResult) {
      return res
        .status(500)
        .json({ success: false, error: "Error al registrar en Firebase" });
    }

    await enviarCorreoRegistro(email, username);

    const sql = `INSERT INTO Usuarios (username, nombre, apellidos, email, password, provincia, fechaNacimiento)
                  VALUES (?, ?, ?, ?, ?, ?, ?)`;

    await conn.execute(sql, [
      username,
      nombre,
      apellido,
      email,
      hashPassword,
      provincia,
      nacimiento,
    ]);

    if (await setSession(req, username)) {
      return res
        .status(201)
        .json({ success: true, message: "Inicio de sesión exitoso" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
});

// En routesRegister.mjs - Modifica la función de login

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(422)
      .json({ success: false, error: "Faltan campos requeridos" });
  }

  try {
    const user = await comprobarLogin(email, password);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Credenciales incorrectas" });
    }

    const sessionSet = await setSession(req, user.username);
    if (!sessionSet) {
      return res
        .status(500)
        .json({ success: false, error: "Error al establecer la sesión" });
    }

    // Luego verificar si es admin
    const isAdmin = await esAdmin(email);
    
    if (isAdmin) {
      // Si es admin, redirigir al panel de administración
      return res.status(200).json({ 
        success: true, 
        admin: true,
        message: "Login de administrador exitoso",
        redirect: "/admin"
      });
    }

    // Usuario normal
    return res
      .status(200)
      .json({ 
        success: true, 
        admin: false,
        message: "Inicio de sesión exitoso" 
      });

  } catch (error) {
    console.error("Error en login:", error);
    return res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
});

export default router;
