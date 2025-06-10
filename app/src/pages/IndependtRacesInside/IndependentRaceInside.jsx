import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Header from "../../components/Header/Header";
import "./IndependentRaceInside.css";
import { useParams, useNavigate } from "react-router-dom";

// Drag & Drop uploader para la foto de confirmación
function ImagenUploader({ idCarrera, idPiloto }) {
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const dropRef = useRef();

  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current.classList.add("drag-over");
  };

  const handleDragLeave = () => {
    dropRef.current.classList.remove("drag-over");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropRef.current.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImagen(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log("Archivo seleccionado:", file);
    if (file && file.type.startsWith("image/")) {
      setImagen(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!imagen) return;
    console.log("Preparando subida:", { idCarrera, idPiloto }); // <-- LOG
    const formData = new FormData();
    formData.append("file", imagen);
    formData.append("id_carrera", idCarrera);
    formData.append("id_piloto", idPiloto);
    console.log("Enviando FormData:", {
      file: imagen,
      id_carrera: idCarrera,
      id_piloto: idPiloto,
    }); // <-- LOG
    try {
      const response = await axios.post("/api/uploadFotoCarrera", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      console.log("Respuesta del backend:", response.data); // <-- LOG
      setMensaje("Imagen subida correctamente");
      setImagen(null);
      setPreview(null);
    } catch (err) {
      console.error("Error al subir la imagen:", err); // <-- LOG
      setMensaje("Error al subir la imagen");
    }
  };

  return (
    <div
      ref={dropRef}
      className="drag-drop-zone"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <p>Arrastra una imagen aquí o haz clic para seleccionar</p>
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        id="fileInput"
        onChange={handleFileChange}
      />
      <label htmlFor="fileInput" style={{ cursor: "pointer", color: "#e53935" }}>
        {preview ? (
          <img
            src={preview}
            alt="Previsualización"
            className="preview-img"
          />
        ) : (
          <span style={{ fontSize: "2rem" }}>📁</span>
        )}
      </label>
      {imagen && (
        <button
          className="edit-btn"
          style={{ marginTop: "1rem" }}
          onClick={handleUpload}
        >
          Subir Imagen
        </button>
      )}
      {mensaje && (
        <p style={{ marginTop: "1rem", color: "#e53935" }}>{mensaje}</p>
      )}
    </div>
  );
}

const IndependentRaceInside = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [carrera, setCarrera] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [idPiloto, setIdPiloto] = useState(null);

  useEffect(() => {
    const fetchCarreraDetails = async () => {
      try {
        const response = await axios.get(`/api/carrera-libre/${id}`, {
          withCredentials: true,
        });
        setCarrera(response.data.carrera);
        setParticipantes(response.data.participantes);
      } catch (err) {
        console.error("Error al cargar detalles de la carrera:", err);
        setError("Error al cargar los detalles de la carrera");
      } finally {
        setLoading(false);
      }
    };

    fetchCarreraDetails();
  }, [id]);

  // Obtener el id_piloto del usuario autenticado
  useEffect(() => {
    const fetchIdPiloto = async () => {
      try {
        const res = await axios.post("/api/get-id-piloto", {}, { withCredentials: true });
        setIdPiloto(res.data.id_piloto);
        console.log("ID piloto obtenido:", res.data.id_piloto);
      } catch (err) {
        console.error("Error al obtener id_piloto:", err);
      }
    };
    fetchIdPiloto();
  }, []);

  if (loading)
    return <div className="loading">Cargando detalles de la carrera...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!carrera) return <div className="no-data">No se encontró la carrera</div>;

  return (
    <div className="independentRaceInside">
      <Header />
      <div className="main-container">
        <button
          className="back-button"
          onClick={() => navigate("/carrerasLibres")}
        >
          ← Volver a Carreras
        </button>

        <div className="carrera-details">
          <h1>{carrera.nombre}</h1>
          <div className="info-grid">
            <div className="info-item">
              <h3>🏁 Karting</h3>
              <p>{carrera.karting}</p>
            </div>
            <div className="info-item">
              <h3>📍 Comunidad</h3>
              <p>{carrera.comunidad}</p>
            </div>
            <div className="info-item">
              <h3>🗓 Fecha</h3>
              <p>{carrera.fecha}</p>
            </div>
            <div className="info-item">
              <h3>⏰ Horario</h3>
              <p>{carrera.hora}</p>
            </div>
            <div className="info-item">
              <h3>🎯 Nivel</h3>
              <p>{carrera.nivel}</p>
            </div>
            <div className="info-item">
              <h3>👥 Plazas</h3>
              <p>
                {carrera.plazasOcupadas}/{carrera.plazasTotales}
              </p>
            </div>
          </div>
        </div>

        {/* Drag & Drop para subir foto de confirmación */}
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          {idPiloto && (
            <ImagenUploader idCarrera={carrera.id} idPiloto={idPiloto} />
          )}
        </div>

        <div className="participantes-section">
          <h2>Participantes Inscritos</h2>
          {participantes.length === 0 ? (
            <p className="no-data">No hay participantes inscritos todavía</p>
          ) : (
            <div className="participantes-table">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Usuario</th>
                    <th>Fecha de Inscripción</th>
                  </tr>
                </thead>
                <tbody>
                  {participantes.map((participante, index) => (
                    <tr key={participante.id}>
                      <td>{index + 1}</td>
                      <td>{participante.username}</td>
                      <td>
                        {new Date(
                          participante.fechaInscripcion,
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndependentRaceInside;
