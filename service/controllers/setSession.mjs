import session from "express-session";
import express from "express";

const app = express();

export const setSession = async (req, username) => {
  if (!username) {
    console.error("El username es obligatorio para establecer la sesión");
    return false;
  }

  try {
    req.session.usuario = { username }; // Actualiza la sesión con el nuevo username
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log("Sesión actualizada:", req.session.usuario);
    return true;
  } catch (error) {
    console.error("Error al guardar la sesión:", error);
    return false;
  }
};