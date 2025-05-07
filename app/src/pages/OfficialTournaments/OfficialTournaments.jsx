import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header/Header';
import './OfficialTournaments.css';

const OfficialTournaments = () => {
  const navigate = useNavigate();
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nivelSeleccionado, setNivelSeleccionado] = useState('');
  const [comunidadSeleccionada, setComunidadSeleccionada] = useState('');

  useEffect(() => {
    const fetchTorneos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('/api/torneos');
        setTorneos(response.data);
      } catch (err) {
        setError('Error al cargar los torneos. Por favor, inténtalo de nuevo más tarde.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTorneos();
  }, []);

  // Niveles predefinidos según tu sistema
  const niveles = ['Principiante', 'Intermedio', 'Avanzado'];

  // Obtenemos las comunidades únicas de los torneos cargados
  const comunidades = torneos.length > 0
    ? [...new Set(torneos.map(t => t.comunidad))]
    : [];

  const torneosFiltrados = torneos.filter(t => {
    const coincideNivel = nivelSeleccionado ? t.nivelMinimo === nivelSeleccionado : true;
    const coincideComunidad = comunidadSeleccionada ? t.comunidad === comunidadSeleccionada : true;
    return coincideNivel && coincideComunidad;
  });

  const handleMasInfo = (torneoId) => {
    navigate(`/torneo/${torneoId}`);
  };

  // Función para mostrar fechas en formato adecuado
  const formatDateRange = (fechaInicio, fechaFin) => {
    // Si no tenemos la fecha de inicio o fin en formato Date, usamos la fecha ya formateada
    if (!fechaInicio || !fechaFin) {
      return torneos.fecha || 'Fecha no disponible';
    }
    
    // Si tenemos las fechas completas, formateamos el rango
    return `${fechaInicio} al ${fechaFin}`;
  };

  return (
    <div className='officialTournaments'>
      <Header />
      <div className='officialTournaments__container'>
        <h1>Torneos Oficiales</h1>
        <p>Filtra por nivel y comunidad para encontrar tu próximo reto.</p>

        {loading ? (
          <div className="loading">Cargando torneos oficiales...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : torneos.length === 0 ? (
          <div className="no-data">No se encontraron torneos oficiales disponibles.</div>
        ) : (
          <>
            <div className='filters'>
              <label>
                Nivel mínimo:
                <select value={nivelSeleccionado} onChange={(e) => setNivelSeleccionado(e.target.value)}>
                  <option value=''>Todos</option>
                  {niveles.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>

              <label>
                Comunidad:
                <select value={comunidadSeleccionada} onChange={(e) => setComunidadSeleccionada(e.target.value)}>
                  <option value=''>Todas</option>
                  {comunidades.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
            </div>

            <div className='cards-torneos'>
              {torneosFiltrados.map((torneo) => (
                <div key={torneo.id} className='card-torneo'>
                  <h3>{torneo.nombre}</h3>
                  <p><strong>📍 Ubicación:</strong> {torneo.ubicacion}</p>
                  <p><strong>🌍 Comunidad:</strong> {torneo.comunidad}</p>
                  <p><strong>🗓 Fecha:</strong> {torneo.fecha}</p>
                  <p><strong>🎯 Nivel mínimo:</strong> {torneo.nivelMinimo}</p>
                  <p><strong>👥 Inscritos:</strong> {torneo.inscritos}/{torneo.maximo}</p>
                  <div className='card-torneo__buttons'>
                    <button 
                      className='btn-apuntarse'
                      disabled={torneo.inscritos >= torneo.maximo}
                    >
                      {torneo.inscritos < torneo.maximo ? '¡Apuntarme!' : 'Completo'}
                    </button>
                    <button 
                      className='btn-mas-info'
                      onClick={() => handleMasInfo(torneo.id)}
                    >
                      Más información
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OfficialTournaments;