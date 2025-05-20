import express from "express";
import { actualizarPerfil } from "../controllers/userController.mjs";
import { conn } from "../sql/conexionSQL.mjs";

const router = express.Router();


router.delete("/cancelar-inscripcion", async (req, res) => {
    const { idCarrera, username } = req.body;
  
    if (!idCarrera || !username) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }
  
    try {
      // Obtener ID del usuario
      const userResult = await conn.execute({
        sql: "SELECT id FROM Usuarios WHERE username = ?",
        args: [username]
      });
  
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
  
      const idUsuario = userResult.rows[0].id;
  
      // Verificar si está inscrito
      const inscripcionResult = await conn.execute({
        sql: "SELECT id FROM InscripcionesCarrera WHERE id_carrera = ? AND id_piloto = ?",
        args: [idCarrera, idUsuario]
      });
  
      if (inscripcionResult.rows.length === 0) {
        return res.status(400).json({ error: "No estás inscrito en esta carrera" });
      }
  
      // Eliminar la inscripción
      await conn.execute({
        sql: "DELETE FROM InscripcionesCarrera WHERE id_carrera = ? AND id_piloto = ?",
        args: [idCarrera, idUsuario]
      });
  
      return res.status(200).json({
        success: true,
        message: "Inscripción cancelada correctamente"
      });
    } catch (error) {
      console.error("Error al cancelar inscripción:", error);
      return res.status(500).json({ error: "Error del servidor" });
    }
  });

router.delete("/cancelar-inscripcion-torneo", async (req, res) => {
  const { idTorneo, username } = req.body;

  if (!idTorneo || !username) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    // Obtener ID del usuario
    const userResult = await conn.execute({
      sql: "SELECT id FROM Usuarios WHERE username = ?",
      args: [username]
    });

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const idUsuario = userResult.rows[0].id;

    // Verificar si está inscrito
    const inscripcionResult = await conn.execute({
      sql: "SELECT id FROM InscripcionesTorneo WHERE id_torneo = ? AND id_piloto = ?",
      args: [idTorneo, idUsuario]
    });

    if (inscripcionResult.rows.length === 0) {
      return res.status(400).json({ error: "No estás inscrito en este torneo" });
    }

    // Eliminar la inscripción
    await conn.execute({
      sql: "DELETE FROM InscripcionesTorneo WHERE id_torneo = ? AND id_piloto = ?",
      args: [idTorneo, idUsuario]
    });

    return res.status(200).json({
      success: true,
      message: "Inscripción cancelada correctamente"
    });
  } catch (error) {
    console.error("Error al cancelar inscripción al torneo:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
});

export default router;
 