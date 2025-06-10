import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header/Header";
import "./CarreraTorneoInside.css";

function ImagenUploader({ idCarrera, idPiloto }) {
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImagen(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!imagen) return;
    const formData = new FormData();
    formData.append("file", imagen);
    formData.append("id_carrera", idCarrera);
    formData.append("id_piloto", idPiloto);
    try {
      const response = await axios.post("/api/uploadFotoCarrera", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setMensaje("Imagen subida correctamente");
      setImagen(null);
      setPreview(null);
    } catch (err) {
      setMensaje("Error al subir la imagen");
    }
  };

  return (
    <div className="uploader-container">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="file-input"
      />
      <label htmlFor="file-input" className="uploader-label">
        {preview ? (
          <img src={preview} alt="Preview" className="uploader-preview" />
        ) : (
          <span>Arrastra una imagen aquí o haz clic para seleccionar</span>
        )}
      </label>
      <button className="uploader-btn" onClick={handleUpload}>
        Subir Imagen
      </button>
      {mensaje && <div className="uploader-message">{mensaje}</div>}
    </div>
  );
}

const CarreraTorneoInside = () => {
  const { idTorneo, idCarrera } = useParams();
  const navigate = useNavigate();
  const [carrera, setCarrera] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [idPiloto, setIdPiloto] = useState(null);

  useEffect(() => {
    const fetchCarreraDetails = async () => {
      try {
        const response = await axios.get(`/api/carrera-torneo/${idTorneo}/${idCarrera}`, {
          withCredentials: true,
        });
        setCarrera(response.data.carrera);
        setParticipantes(response.data.participantes);
      } catch (err) {
        setError("Error al cargar los detalles de la carrera");
      } finally {
        setLoading(false);
      }
    };
    fetchCarreraDetails();
  }, [idTorneo, idCarrera]);

  useEffect(() => {
    const fetchIdPiloto = async () => {
      try {
        const res = await axios.post("/api/get-id-piloto", {}, { withCredentials: true });
        setIdPiloto(res.data.id_piloto);
      } catch (err) {}
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
          onClick={() => navigate(`/torneo/${idTorneo}`)}
        >
          ← Volver a Torneo
        </button>

        <div className="carrera-details">
          <h2>{carrera.nombre}</h2>
          <p>
            <strong>Fecha:</strong> {carrera.fecha}
          </p>
          <p>
            <strong>Hora:</strong> {carrera.hora}
          </p>
          <p>
            <strong>Circuito:</strong> {carrera.circuito}
          </p>
        </div>

        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          {idPiloto && (
            <ImagenUploader idCarrera={carrera.id} idPiloto={idPiloto} />
          )}
        </div>

        <div className="participantes-section">
          <h3>Participantes</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Piloto</th>
                <th>ELO</th>
              </tr>
            </thead>
            <tbody>
              {participantes.map((p, idx) => (
                <tr key={p.id}>
                  <td>{idx + 1}</td>
                  <td>{p.nombre}</td>
                  <td>{p.elo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CarreraTorneoInside;