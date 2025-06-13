import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header/Header";
import "./OfficialTournamentInside.css";

const OfficialTournamentInside = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [torneo, setTorneo] = useState(null);
  const [clasificacion, setClasificacion] = useState([]);
  const [proximasCarreras, setProximasCarreras] = useState([]);
  const [premios, setPremios] = useState([]);

  useEffect(() => {
    const comprobarSesion = async () => {
      try {
        const res = await axios.get("/api/comprobarSesion", {
          withCredentials: true,
        });
        if (!res.data.logueado) {
          navigate("/registro");
        }
      } catch (err) {
        console.log("Error al comprobar sesión:", err);
      }
    };
    comprobarSesion();
  }, [navigate]);

  useEffect(() => {
    const fetchTorneoData = async () => {
      try {
        const response = await axios.get(`/api/torneo/${id}`, {
          withCredentials: true,
        });
        setTorneo(response.data.torneo);
        setClasificacion(response.data.clasificacion);
        setProximasCarreras(response.data.proximasCarreras);
        setPremios(response.data.premios);
      } catch (err) {
        console.error("Error al cargar datos del torneo:", err);
        navigate("/torneosOficiales");
      }
    };

    fetchTorneoData();
  }, [id, navigate]);

  if (!torneo) {
    return null;
  }

  return (
    <div className="tournament-inside">
      <Header />
      <div className="tournament-inside__container">
        <button
          className="back-button"
          onClick={() => navigate("/torneosOficiales")}
        >
          ← Volver a Torneos
        </button>

        <div className="tournament-header">
          <h1>{torneo.nombre}</h1>
          <div className="tournament-info">
            <p>
              <strong>📍 Ubicación:</strong> {torneo.ubicacion}
            </p>
            <p>
              <strong>🗓 Fechas:</strong> {torneo.fechaInicio} -{" "}
              {torneo.fechaFin}
            </p>
            <p>
              <strong>🎯 Nivel mínimo:</strong> {torneo.nivelMinimo}
            </p>
            <p>
              <strong>👥 Inscritos:</strong> {torneo.inscritos}/{torneo.maximo}
            </p>
          </div>
        </div>

        <div className="tournament-sections">
          <section className="clasificacion-section">
            <h2>Clasificación General</h2>
            {clasificacion.length === 0 ? (
              <p className="no-data">No hay clasificación disponible todavía</p>
            ) : (
              <div className="clasificacion-table">
                <table>
                  <thead>
                    <tr>
                      <th>Pos</th>
                      <th>Piloto</th>
                      <th>Puntos</th>
                      <th>Vueltas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clasificacion.map((piloto, index) => (
                      <tr key={piloto.id_piloto}>
                        <td>{index + 1}º</td>
                        <td>{piloto.piloto}</td>
                        <td>{piloto.puntos}</td>
                        <td>{piloto.vueltas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="proximas-carreras">
            <h2>Próximas Carreras</h2>
            {proximasCarreras.length === 0 ? (
              <p className="no-data">No hay próximas carreras programadas</p>
            ) : (
              <div className="carreras-grid">
                {proximasCarreras.map((carrera) => (
                  <div
                    key={carrera.id}
                    className="carrera-card clickable"
                    onClick={() => {
                      navigate(`/carrera-torneo/${id}/${carrera.id}`);
                    }}
                    title="Ver detalles de la carrera"
                    style={{ cursor: "pointer" }}
                  >
                    <h3>{carrera.circuito}</h3>
                    <p>
                      <strong>🗓 Fecha:</strong> {carrera.fecha}
                    </p>
                    <p>
                      <strong>⏰ Hora:</strong> {String(carrera.hora).replace(".", ":")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="premios-section">
            <h2>Premios</h2>
            {premios.length === 0 ? (
              <p className="no-data">
                No hay premios definidos para este torneo
              </p>
            ) : (
              <div className="premios-grid">
                {premios.map((premio) => (
                  <div key={premio.posicion} className="premio-card">
                    <h3>{premio.posicion}º Lugar</h3>
                    <p className="premio-nombre">{premio.premio}</p>
                    {premio.descripcion && (
                      <p className="premio-descripcion">{premio.descripcion}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default OfficialTournamentInside;
