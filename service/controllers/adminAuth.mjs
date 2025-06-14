import { conn } from "../sql/conexionSQL.mjs"

export const esAdmin = async (emailUsuario) => {
  if (!emailUsuario) {
    return false;
  }

  try {
    const result = await conn.execute({
      sql: "SELECT rol FROM Usuarios WHERE email = ?",
      args: [emailUsuario],
    });

    if (!result.rows || result.rows.length === 0) {
      return false;
    }

    const usuario = result.rows[0];
    const esAdmin = usuario.rol === "admin";

    return esAdmin;
  } catch (error) {
    console.error("Error en verificación de admin:", error);
    return false;
  }
};
