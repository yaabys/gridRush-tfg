import session from "express-session";
import express from "express";

const app = express();

export const updateSession = async (req, nuevoUsername) => {
  if (!nuevoUsername) return false;

  return new Promise((resolve) => {
    req.session.regenerate((err) => {
      if (err) {
        console.error("Error al regenerar sesión:", err);
        return resolve(false);
      }

      req.session.usuario = { username: nuevoUsername };

      req.session.save((err) => {
        if (err) {
          console.error("Error al guardar sesión:", err);
          return resolve(false);
        }

        resolve(true);
      });
    });
  });
};
