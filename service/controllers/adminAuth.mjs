import { conn } from "../sql/conexionSQL.mjs";

export const esAdmin = async (emailUsuario) => {
  if (!emailUsuario) {
    console.log("No se proporcionó email");
    return false;
  }

  try {
    
    // Usar el método execute estándar de libsql
    const result = await conn.execute({
      sql: "SELECT role FROM Usuarios WHERE email = ?",
      args: [emailUsuario]
    });
    
    // libsql devuelve result.rows
    if (!result.rows || result.rows.length === 0) {
      return false;
    }

    const usuario = result.rows[0];
    const esAdmin = usuario.role === "admin";

    return esAdmin;

  } catch (error) {
    console.error("Error en verificación de admin:", error);
    return false;
  }
};