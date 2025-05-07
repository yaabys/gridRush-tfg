import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/Header/Header';
import './Tracks.css';

const Tracks = () => {
  const [pistas, setPistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const pistasResponse = await axios.get('/api/kartings');
        setPistas(pistasResponse.data);
      } catch (err) {
        setError('Error al cargar las pistas. Por favor, inténtalo de nuevo más tarde.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para formatear fechas (similar a la que tienes en Seasons)
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <>
      <Header />
      <div className="main-container">
        {loading ? (
          <div className="loading">Cargando pistas de karting...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : pistas.length === 0 ? (
          <div className="no-data">No se encontraron pistas de karting disponibles.</div>
        ) : (
          <div className="tracks-container">
            <div className="tracks-header">
              <h2>Pistas de Karting en Madrid</h2>
              <p>Descubre los mejores circuitos para poner a prueba tus habilidades</p>
            </div>

            <div className="tracks-grid">
              {pistas.map((pista) => (
                <div key={pista.id} className="track-card">
                  <h3>{pista.nombre}</h3>
                  <div className="track-details">
                    <p><span>📍 Ubicación:</span> {pista.ubicacion}</p>
                    <p><span>📌 Dirección:</span> <a href={pista.link} target="_blank">{pista.direccion}</a></p>
                    {/*<p><span>🗓️ Próximo torneo:</span> {pista.proximoTorneo}</p> */}
                    {/*Pruebaa*/ }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Tracks;