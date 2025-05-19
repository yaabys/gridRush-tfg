import session from "express-session";

export const setSession = (req, username, onSuccess, onError) => {
    if (!username) {
      return onError({ status: 400, error: "El username es obligatorio para establecer la sesión" });
    }
  
    req.session.usuario = { username };
  
    req.session.save((err) => {
      if (err) {
        console.error("Error al guardar la sesión:", err);
        return onError({ status: 500, error: "Error del servidor al guardar la sesión" });
      }
      console.log("Sesión establecida:", req.session.usuario);
      onSuccess();
    });
};
  
  