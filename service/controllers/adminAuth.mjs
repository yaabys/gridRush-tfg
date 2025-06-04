import { conn } from "../sql/conexionSQL.mjs";

export const esAdmin = async (emailUsuario) => {
  if (!emailUsuario) {
    console.log("No se proporcionó email");
    return false;
  }

  try {
    console.log("Verificando si es admin:", emailUsuario);
    
    // Usar el método execute estándar de libsql
    const result = await conn.execute({
      sql: "SELECT role FROM Usuarios WHERE email = ?",
      args: [emailUsuario]
    });

    console.log("Resultado de la consulta:", result);
    
    // libsql devuelve result.rows
    if (!result.rows || result.rows.length === 0) {
      console.log("Usuario no encontrado:", emailUsuario);
      return false;
    }

    const usuario = result.rows[0];
    const esAdmin = usuario.role === "admin";
    
    console.log(`Usuario ${emailUsuario} ${esAdmin ? 'es' : 'no es'} admin. Role: ${usuario.role}`);
    return esAdmin;

  } catch (error) {
    console.error("Error en verificación de admin:", error);
    return false;
  }
};