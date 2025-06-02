
import { conn } from "../sql/conexionSQL.mjs";

export const esAdmin = async (emailUsuario) => {
  try {

    const email = emailUsuario;

    const result = await conn.execute({
      sql: "SELECT role FROM Usuarios WHERE email = ?",
      args: [email],
    });

    if (result.rows.length === 0) {
      return false;
    }

    const usuario = result.rows[0];

    if (usuario.role === "admin") {
      return true;
    } else {
      return false;
    }

  } catch (error) {
    console.error("Error en verificación de admin:", error);
    return false
  }
};
