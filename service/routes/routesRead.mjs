import express from "express"
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
      const result = await conn.execute({
        sql: "SELECT * FROM Usuarios WHERE username = ?",
        args: [username]
      });

      const filas = result.rows;

      if (filas.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
  
      // eliminar contraseña antes de enviar los datos por si hay algun tipo de ataque
      const usuario = filas[0];
      //delete usuario.password;

      res.json(usuario);
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      res.status(500).json({ error: "Error del servidor" });
    }
});

// Ruta para obtener la temporada actual
router.get('/temporada-actual', async (req, res) => {
  try {
    const result = await conn.execute(
      "SELECT * FROM Temporadas"
    );
    console.log('▶️ Resultado:', JSON.stringify(result, null, 2));


    const temporadas = result.rows;

    if (!Array.isArray(temporadas) || temporadas.length === 0) {
      const resultProximas = await conn.execute(
        "SELECT * FROM Temporadas WHERE fecha_inicio > DATE('now') ORDER BY fecha_inicio ASC LIMIT 1"
      );

      const proximasTemporadas = resultProximas.rows;

      if (!Array.isArray(proximasTemporadas) || proximasTemporadas.length === 0) {
        return res.status(404).json({ error: 'No hay temporadas disponibles' });
      }

      return res.json(proximasTemporadas[0]);
    }

    return res.json(temporadas[0]);
  } catch (error) {
    console.error('💥 Error al obtener temporada actual:', error);
    return res.status(500).json({ error: 'Error del servidor' });
  }
});

// Ruta para obtener las recompensas de una temporada
/*router.get("/recompensas/:temporadaId", async (req, res) => {
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
});*/

// Ruta para obtener los kartings
router.get("/kartings", async (req, res) => {
  try {
    // Verificamos primero que la conexión está disponible
    if (!conn) {
      console.error("La conexión a la base de datos no está disponible");
      return res.status(500).json({ error: "Error de conexión a la base de datos" });
    }

    // Consulta los circuitos de karting en Madrid
    const kartings = await conn.execute(
       `SELECT nombre, ciudad as ubicacion, ubicacion as direccion,ubicacionLink as link  FROM Kartings ORDER BY nombre`
    );
    
    const kartingRows = kartings.rows

    console.log('▶️ Resultado:', JSON.stringify(kartingRows, null, 2));
    // Verificamos si se obtuvieron resultados
    if (!Array.isArray(kartingRows) || kartingRows.length === 0) {
      return res.status(404).json({ error: "No se encontraron circuitos de karting" });
    }
    // Devolvemos los circuitos de karting
    res.json(kartingRows);
    
  } catch (error) {
    console.error("Error al obtener kartings:", error);
    res.status(500).json({ 
      error: "Error al obtener la información de los circuitos de karting",
      detalles: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});
export default router;