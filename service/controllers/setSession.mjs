import session from "express-session";
import express from "express";

const app = express();

export const setSession = async (req, username) => {
  if (!username) {
    console.error("El username es obligatorio para establecer la sesión");
    return false;
  }

  return new Promise((resolve) => {
    req.session.regenerate((err) => {
      if (err) {
        console.error("Error al regenerar la sesión:", err);
        return resolve(false);
      }

      req.session.usuario = { username };

      req.session.save((err) => {
        if (err) {
          console.error("Error al guardar la sesión:", err);
          return resolve(false);
        }

        resolve(true);
      });
    });
  });
};
