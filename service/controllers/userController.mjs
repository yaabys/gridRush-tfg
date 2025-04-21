import bcrypt from 'bcrypt';
import { conn } from "../sql/conexionSQL.mjs";

export const comprobarUser = async (user) => {
    try {
        const result = await conn.execute({
            sql: "SELECT * FROM Usuarios WHERE username = ?",
            args: [user]
        });

        const rows = result.rows
        console.log("Resultado comprobación username:", result.rows);

        if (rows.length > 0) {
            return { success: false, error: "Ya hay un usuario con ese nombre" };
        } else {
            return { success: true };
        }
    } catch (error) {
       console.log("Error en comprobarUser:", error);
       return { success: false, error: "Error comprobando usuario" };
    }
}

export const comprobarEmail = async (email) => {
    try {
        const result = await conn.execute({
            sql: "SELECT * FROM Usuarios WHERE email = ?",
            args: [email]
        });

        const rows = result.rows;
        if (rows.length > 0) {
            return { success: false, error: "Ya hay un usuario con ese correo" };
        } else {
            return { success: true };
        }
    } catch (error) {
        return { success: false, error: "Error comprobando email" };
    }
}

export const hashearPassword = async (password) => {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error("Error al hashear la contraseña:", error);
        return null;
    }
}

