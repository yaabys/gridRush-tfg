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

    const buffer = Buffer.from(rows[0].fotoPerfil); // esto sirve para ArrayBuffer o TypedArray
    res.set("Content-Type", rows[0].avatar_tipo);
    res.end(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener la imagen" });
  }
});

router.post("/uploadFotoCarrera", upload.single("file"), async (req, res) => {
  console.log("Petición recibida en /uploadFotoCarrera");
  console.log("Body:", req.body); // <-- LOG
  console.log("File:", req.file); // <-- LOG

  const { id_carrera, id_piloto } = req.body;
  console.log("id_carrera recibido:", id_carrera); // <-- LOG
  console.log("id_piloto recibido:", id_piloto);   // <-- LOG

  // Obtener el id_resultado (id de la fila en ResultadosCarreras)
  try {
    const result = await conn.execute(
      "SELECT id FROM ResultadosCarreras WHERE id_carrera = ? AND id_piloto = ?",
      [id_carrera, id_piloto]
    );
    const rows = result.rows || result[0];
    if (rows.length > 0) {
      console.log("id_resultado encontrado:", rows[0].id); // <-- LOG
    } else {
      console.log("No se encontró resultado para esos ids");
    }
  } catch (err) {
    console.error("Error buscando id_resultado:", err); // <-- LOG
  }

  if (!req.file) {
    console.log("No se ha subido ninguna imagen");
    return res.status(400).json({ message: "No se ha subido ninguna imagen" });
  }
  if (!id_carrera || !id_piloto) {
    console.log("Faltan datos de carrera o piloto");
    return res.status(400).json({ message: "Faltan datos de carrera o piloto" });
  }

  try {
    const imagenBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    const result = await conn.execute(
      "UPDATE ResultadosCarreras SET fotoConfirmacion = ?, fotoConfirmacionTipo = ? WHERE id_carrera = ? AND id_piloto = ?",
      [imagenBuffer, mimeType, id_carrera, id_piloto]
    );

    if (!result.changes) {
      return res.status(404).json({ message: "No existe resultado para ese piloto en esa carrera" });
    }

    res.json({ message: "Imagen de carrera subida correctamente" });
  } catch (error) {
    console.error("Error al guardar imagen de carrera:", error);
    res.status(500).json({ message: "Error al guardar imagen de carrera" });
  }
});

export default router;
