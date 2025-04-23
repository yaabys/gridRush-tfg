import express from "express";
import { registrarFirebase,comprobarLogin } from "../firebase/conexionFirebase.mjs"
import { comprobarUser,hashearPassword,comprobarEmail,comprobarSesion } from "../controllers/userController.mjs"
import { conn } from "../sql/conexionSQL.mjs"
import session from "express-session"

const router = express.Router();

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

// Ruta para obtener la temporada actual
router.get("/temporada-actual", async (req, res) => {
  try {
    // Obtener la temporada actual (la que tiene la fecha actual entre fecha_inicio y fecha_fin)
    const [temporadas] = await conn.execute(
      "SELECT * FROM Temporadas WHERE CURDATE() BETWEEN fecha_inicio AND fecha_fin ORDER BY fecha_inicio DESC LIMIT 1"
    );

    if (temporadas.length === 0) {
      // Si no hay temporada activa, obtener la próxima temporada
      const [proximasTemporadas] = await conn.execute(
        "SELECT * FROM Temporadas WHERE fecha_inicio > CURDATE() ORDER BY fecha_inicio ASC LIMIT 1"
      );

      if (proximasTemporadas.length === 0) {
        return res.status(404).json({ error: "No hay temporadas disponibles" });
      }

      return res.json(proximasTemporadas[0]);
    }

    return res.json(temporadas[0]);
  } catch (error) {
    console.error("Error al obtener temporada actual:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
});

// Ruta para obtener las recompensas de una temporada
router.get("/recompensas/:temporadaId", async (req, res) => {
  try {
    const { temporadaId } = req.params;

    // Obtener las recompensas asociadas a la temporada
    const [recompensas] = await conn.execute(
      `SELECT tr.id, tr.nombre_recompensa, tr.descripcion, tr.posicion_min, tr.posicion_max, r.nombre as nombre_base, r.imagen 
       FROM TemporadaRecompensas tr 
       JOIN Recompensas r ON tr.id_recompensa = r.id 
       WHERE tr.id_temporada = ? 
       ORDER BY tr.posicion_min ASC`,
      [temporadaId]
    );

    return res.json(recompensas);
  } catch (error) {
    console.error("Error al obtener recompensas:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
});

// Ruta para obtener el ranking de una temporada
router.get("/ranking/:temporadaId", async (req, res) => {
  try {
    const { temporadaId } = req.params;

    // Obtener el ranking de usuarios en la temporada
    const [ranking] = await conn.execute(
      `SELECT u.username, u.nombre, u.apellidos, tu.puntos 
       FROM TemporadaUsuarios tu 
       JOIN Usuarios u ON tu.id_piloto = u.id 
       WHERE tu.id_temporada = ? 
       ORDER BY tu.puntos DESC 
       LIMIT 100`,
      [temporadaId]
    );

    return res.json(ranking);
  } catch (error) {
    console.error("Error al obtener ranking:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
});

export default router;
  
  