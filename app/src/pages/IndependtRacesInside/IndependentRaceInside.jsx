import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/Header/Header';
import './IndependentRaceInside.css';
import { useParams, useNavigate } from 'react-router-dom';

const IndependentRaceInside = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [carrera, setCarrera] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarreraDetails = async () => {
      try {
        const response = await axios.get(`/api/carrera-libre/${id}`);
        setCarrera(response.data.carrera);
        setParticipantes(response.data.participantes);
      } catch (err) {
        console.error('Error al cargar detalles de la carrera:', err);
        setError('Error al cargar los detalles de la carrera');
      } finally {
        setLoading(false);
      }
    };

    fetchCarreraDetails();
  }, [id]);

  if (loading) return <div className="loading">Cargando detalles de la carrera...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!carrera) return <div className="no-data">No se encontró la carrera</div>;

  return (
    <div className='independentRaceInside'>
      <Header />
      <div className='main-container'>
        <button className="back-button" onClick={() => navigate('/carrerasLibres')}>
          ← Volver a Carreras
        </button>
        
        <div className='carrera-details'>
          <h1>{carrera.nombre}</h1>
          <div className='info-grid'>
            <div className='info-item'>
              <h3>🏁 Karting</h3>
              <p>{carrera.karting}</p>
            </div>
            <div className='info-item'>
              <h3>📍 Comunidad</h3>
              <p>{carrera.comunidad}</p>
            </div>
            <div className='info-item'>
              <h3>🗓 Fecha</h3>
              <p>{carrera.fecha}</p>
            </div>
            <div className='info-item'>
              <h3>⏰ Horario</h3>
              <p>{carrera.horario}</p>
            </div>
            <div className='info-item'>
              <h3>🎯 Nivel</h3>
              <p>{carrera.nivel}</p>
            </div>
            <div className='info-item'>
              <h3>👥 Plazas</h3>
              <p>{carrera.plazasOcupadas}/{carrera.plazasTotales}</p>
            </div>
          </div>
        </div>

        <div className='participantes-section'>
          <h2>Participantes Inscritos</h2>
          {participantes.length === 0 ? (
            <p className="no-data">No hay participantes inscritos todavía</p>
          ) : (
            <div className='participantes-table'>
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
                      <td>{new Date(participante.fechaInscripcion).toLocaleDateString()}</td>
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
