import express from "express";
import { conn } from "../sql/conexionSQL.mjs";
import multer from "multer";

export const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();
/*https://medium.com/@diego.coder/subida-de-archivos-con-node-js-express-y-multer-55e99219d754 codigo de aqui*/
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se ha subido ninguna imagen" });
  }

  const username = req.session.usuario?.username;
  if (!username) {
    return res.status(401).json({ message: "No hay usuario en sesión" });
  }

  try {
    const imagenBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    await conn.execute(
      "UPDATE usuarios SET fotoPerfil = ?, avatar_tipo = ? WHERE username = ?",
      [imagenBuffer, mimeType, username],
    );

    res.json({ message: "Imagen actualizada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al guardar imagen" });
  }
});

router.get("/avatar", async (req, res) => {
  const username = req.session.usuario?.username;
  if (!username) {
    return res.status(401).json({ message: "No hay usuario en sesión" });
  }

  try {
    const result = await conn.execute(
      "SELECT fotoPerfil, avatar_tipo FROM usuarios WHERE username = ?",
      [username],
    );

    const rows = result.rows || result[0];

    if (!rows.length || !rows[0].fotoPerfil) {
      return res.status(404).json({ message: "Imagen no encontrada" });
    }

    const buffer = Buffer.from(rows[0].fotoPerfil); 
    res.set("Content-Type", rows[0].avatar_tipo);
    res.end(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener la imagen" });
  }
});

router.get("/avatar/:id", async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ message: "Falta id de usuario" });
  }

  try {
    const result = await conn.execute(
      "SELECT fotoPerfil, avatar_tipo FROM usuarios WHERE id = ?",
      [id]
    );
    const rows = result.rows || result[0];
    if (!rows.length || !rows[0].fotoPerfil) {
      return res.status(404).json({ message: "Imagen no encontrada" });
    }
    const buffer = Buffer.from(rows[0].fotoPerfil);
    res.set("Content-Type", rows[0].avatar_tipo);
    res.end(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener la imagen" });
  }
});

router.post("/uploadFotoCarrera", upload.single("file"), async (req, res) => {
  const { id_carrera, id_piloto } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No se recibió archivo" });
  }

  try {
    const check = await conn.execute(
      "SELECT id FROM VerificacionesCarreraFoto WHERE id_carrera = ? AND id_piloto = ?",
      [id_carrera, id_piloto]
    );
    const rows = check.rows || check[0];

    if (rows.length > 0) {
      await conn.execute(
        "UPDATE VerificacionesCarreraFoto SET fotoVerificacion = ?, tipoFotoVerificacion = ? WHERE id_carrera = ? AND id_piloto = ?",
        [file.buffer, file.mimetype, id_carrera, id_piloto]
      );
    } else {
      await conn.execute(
        "INSERT INTO VerificacionesCarreraFoto (id_carrera, id_piloto, fotoVerificacion, tipoFotoVerificacion) VALUES (?, ?, ?, ?)",
        [id_carrera, id_piloto, file.buffer, file.mimetype]
      );
    }

    res.json({ message: "Foto de verificación subida correctamente" });
  } catch (err) {
    console.error("Error al guardar foto de verificación:", err);
    res.status(500).json({ message: "Error al guardar la foto de verificación" });
  }
});

export default router;
