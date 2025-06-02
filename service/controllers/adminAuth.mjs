// middleware/adminAuth.mjs
import { conn } from "../sql/conexionSQL.mjs";

export const verificarAdmin = async (req, res, next) => {
  try {
    // Verificar si hay sesión activa
    if (!req.session.usuario || !req.session.usuario.username) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const username = req.session.usuario.username;

    // Verificar si el usuario existe y obtener su rol (si tienes un campo role)
    const result = await conn.execute({
      sql: "SELECT id, username, role FROM Usuarios WHERE username = ?",
      args: [username],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const usuario = result.rows[0];

    // Verificar si el usuario es admin (puedes personalizar esta lógica)
    // Por ahora, cualquier usuario logueado puede ser admin
    // En el futuro puedes agregar un campo 'role' a la tabla Usuarios
    if (usuario.role && usuario.role !== "admin") {
      return res
        .status(403)
        .json({ error: "No tienes permisos de administrador" });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    console.error("Error en verificación de admin:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};
