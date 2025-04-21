import bcrypt from 'bcrypt';
import { conn } from "../sql/conexionSQL.mjs";

export const comprobarUser = async (user) => {
    try {
        const result = await conn.execute({
            sql: "SELECT * FROM Usuarios WHERE username = ?",
            args: [user]
        });

        const rows = result.rows

        if (rows.length > 0) {
            return { success: false, error: "Ya hay un usuario con ese nombre" };
        } else {
            return { success: true };
        }
    } catch (error) {
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

//metodo comprobar sesion
export const comprobarSesion = (req) => {

    if(!comprobarUser(req.session.usuario)){ //comprobar si el usuario existe en la base de datos
        return false
    }

    const result = req.session.usuario
    
    if(result){
        return true
    }
    return false
}
