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

// Actualizar datos del usuario (nombre de usuario y email)
export const actualizarPerfil = async (id, nuevoUsername, nuevoEmail) => {
    try {

        const usernameCheck = await conn.execute({
            sql: "SELECT id FROM Usuarios WHERE username = ? AND id != ?",
            args: [nuevoUsername, id]
        });
        if (usernameCheck.rows.length > 0) {
            return { success: false, error: "El nombre de usuario ya está en uso." };
        }

        const emailCheck = await conn.execute({
            sql: "SELECT id FROM Usuarios WHERE email = ? AND id != ?",
            args: [nuevoEmail, id]
        });
        if (emailCheck.rows.length > 0) {
            return { success: false, error: "El correo electrónico ya está en uso." };
        }
      
        await conn.execute({
            sql: "UPDATE Usuarios SET username = ?, email = ? WHERE id = ?",
            args: [nuevoUsername, nuevoEmail, id]
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error actualizando el perfil." };
    }
}
