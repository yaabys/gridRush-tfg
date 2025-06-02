import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/Header/Header";
import "./Seasons.css";
import { useNavigate } from "react-router-dom";

const Seasons = () => {
  const navigate = useNavigate();
  const [temporadaActual, setTemporadaActual] = useState(null);
  const [recompensas, setRecompensas] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const temporadaResponse = await axios.get("/api/temporada-actual", {
          withCredentials: true,
        });
        const temporada = temporadaResponse.data;
        setTemporadaActual(temporada);

        const recompensasResponse = await axios.get(
          `/api/recompensas/${temporada.id}`,
          {
            withCredentials: true,
          },
        );
        setRecompensas(recompensasResponse.data);

        const rankingResponse = await axios.get(
          `/api/ranking/${temporada.id}`,
          {
            withCredentials: true,
          },
        );
        setRanking(rankingResponse.data);
      } catch (err) {
        setError(
          "Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.",
        );
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  return (
    <>
      <Header />
      <div className="main-container">
        {loading ? (
          <div className="loading">Cargando temporada actual...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : !temporadaActual ? (
          <div className="no-data">
            No hay temporada activa en este momento.
          </div>
        ) : (
          <div className="seasons-container">
            <div className="current-season">
              <h2>Temporada Actual</h2>
              <div className="season-info">
                <h3>{temporadaActual.nombre}</h3>
                <p>
                  Fecha de inicio: {formatDate(temporadaActual.fecha_inicio)}
                </p>
                <p>Fecha de fin: {formatDate(temporadaActual.fecha_fin)}</p>
              </div>
            </div>

            <div className="rewards-section">
              <h2>Recompensas</h2>
              <div className="rewards-grid">
                {recompensas.map((recompensa) => (
                  <div key={recompensa.id} className="reward-card">
                    <img
                      src={recompensa.imagen}
                      alt={recompensa.nombre_recompensa}
                    />
                    <h3>{recompensa.nombre_recompensa}</h3>
                    <p className="reward-description">
                      {recompensa.descripcion}
                    </p>
                    <p className="reward-position">
                      Posiciones {recompensa.posicion_min} -{" "}
                      {recompensa.posicion_max}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="ranking-section">
              <h2>Ranking de Pilotos</h2>
              <div className="ranking-table">
                <table>
                  <thead>
                    <tr>
                      <th>Posición</th>
                      <th>Piloto</th>
                      <th>Puntos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((piloto, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{piloto.username}</td>
                        <td>{piloto.puntos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Seasons;
