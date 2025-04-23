import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Seasons.css';

const Seasons = () => {
  const [temporadaActual, setTemporadaActual] = useState(null);
  const [recompensas, setRecompensas] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener temporada actual
        const temporadaResponse = await axios.get('/api/temporada-actual');
        const temporada = temporadaResponse.data;
        setTemporadaActual(temporada);

        // Obtener recompensas de la temporada
        const recompensasResponse = await axios.get(`/api/recompensas/${temporada.id}`);
        setRecompensas(recompensasResponse.data);

        // Obtener ranking de la temporada
        const rankingResponse = await axios.get(`/api/ranking/${temporada.id}`);
        setRanking(rankingResponse.data);

      } catch (err) {
        setError('Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  if (loading) {
    return <div className="loading">Cargando temporada actual...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!temporadaActual) {
    return <div className="no-data">No hay temporada activa en este momento.</div>;
  }

  return (
    <div className="seasons-container">
      <div className="current-season">
        <h2>Temporada Actual</h2>
        <div className="season-info">
          <h3>{temporadaActual.nombre}</h3>
          <p>Fecha de inicio: {formatDate(temporadaActual.fecha_inicio)}</p>
          <p>Fecha de fin: {formatDate(temporadaActual.fecha_fin)}</p>
        </div>
      </div>

      <div className="rewards-section">
        <h2>Recompensas</h2>
        <div className="rewards-grid">
          {recompensas.map((recompensa) => (
            <div key={recompensa.id} className="reward-card">
              <img src={recompensa.imagen} alt={recompensa.nombre_recompensa} />
              <h3>{recompensa.nombre_recompensa}</h3>
              <p className="reward-description">{recompensa.descripcion}</p>
              <p className="reward-position">
                Posiciones {recompensa.posicion_min} - {recompensa.posicion_max}
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
                  <td>{piloto.nombre} {piloto.apellidos}</td>
                  <td>{piloto.puntos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Seasons;
