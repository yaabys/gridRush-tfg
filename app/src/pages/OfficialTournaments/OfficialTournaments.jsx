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
  const [inscripciones, setInscripciones] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('');
  const [nivelSeleccionado, setNivelSeleccionado] = useState('');
  const [comunidadSeleccionada, setComunidadSeleccionada] = useState('');
  const [modalAction, setModalAction] = useState(null);

  useEffect(() => {
    const comprobarSesion = async () => {
      try {
        const res = await axios.get('/api/comprobarSesion');
        if (!res.data.logueado) {
          navigate('/registro');
        }
      } catch (err) {
        console.log("Error al comprobar sesión:", err);
      }
    };
    comprobarSesion();
  }, [navigate]);

  useEffect(() => {
    const fetchTorneos = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get('/api/torneos');
        setTorneos(response.data);
        
        // Verificar inscripciones para cada torneo
        const username = localStorage.getItem('username');
        if (username) {
          const inscripcionesPromises = response.data.map(torneo =>
            axios.post('/api/check-inscripcion-torneo', {
              username,
              idTorneo: torneo.id
            })
          );
          
          const inscripcionesResults = await Promise.all(inscripcionesPromises);
          const inscripcionesMap = {};
          response.data.forEach((torneo, index) => {
            inscripcionesMap[torneo.id] = inscripcionesResults[index].data.inscrito;
          });
          setInscripciones(inscripcionesMap);
        }
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

  const handleInscripcion = async (idTorneo) => {
    try {
      const response = await axios.get('/api/comprobarSesion');
      if (!response.data.logueado) {
        setModalMessage('Debes iniciar sesión para inscribirte');
        setModalType('error');
        setShowModal(true);
        navigate('/registro');
        return;
      }

      const username = response.data.username;
      const inscripcionResponse = await axios.put('/api/reservar-torneo', {
        idTorneo,
        username
      });

      if (inscripcionResponse.data.success) {
        setInscripciones(prev => ({
          ...prev,
          [idTorneo]: true
        }));
        setModalMessage('¡Inscripción realizada con éxito!');
        setModalType('success');
      } else {
        setModalMessage(inscripcionResponse.data.message);
        setModalType('info');
      }
    } catch (err) {
      console.error('Error al inscribirse:', err);
      setModalMessage(err.response?.data?.error || 'Error al realizar la inscripción');
      setModalType('error');
    }
    setShowModal(true);
  };

  const handleDesapuntarse = async (idTorneo) => {
    try {
      const response = await axios.get('/api/comprobarSesion');
      if (!response.data.logueado) {
        setModalMessage('Debes iniciar sesión para desapuntarte');
        setModalType('error');
        setShowModal(true);
        navigate('/registro');
        return;
      }

      const username = response.data.username;
      const desapuntarseResponse = await axios.delete('/api/cancelar-inscripcion-torneo', {
        data: {
          idTorneo,
          username
        }
      });

      if (desapuntarseResponse.data.success) {
        setInscripciones(prev => ({
          ...prev,
          [idTorneo]: false
        }));
        setModalMessage('Te has desapuntado correctamente del torneo');
        setModalType('success');
      } else {
        setModalMessage(desapuntarseResponse.data.message);
        setModalType('info');
      }
    } catch (err) {
      console.error('Error al desapuntarse:', err);
      setModalMessage(err.response?.data?.error || 'Error al desapuntarse del torneo');
      setModalType('error');
    }
    setShowModal(true);
  };

  const confirmarDesapuntarse = (idTorneo) => {
    setModalMessage('¿Estás seguro de que quieres desapuntarte de este torneo?');
    setModalType('warning');
    setShowModal(true);
    setModalAction(() => () => handleDesapuntarse(idTorneo));
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
    setModalType('');
    setModalAction(null);
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
      <div className='main-container'>
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
              {torneosFiltrados.map((torneo, index) => (
                <div
                  key={torneo.id}
                  className='card-torneo'
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <h3>{torneo.nombre}</h3>
                  <p><strong>📍 Ubicación:</strong> {torneo.ubicacion}</p>
                  <p><strong>🌍 Comunidad:</strong> {torneo.comunidad}</p>
                  <p><strong>🗓 Fecha:</strong> {torneo.fecha}</p>
                  <p><strong>🎯 Nivel mínimo:</strong> {torneo.nivelMinimo}</p>
                  <p><strong>👥 Inscritos:</strong> {torneo.inscritos}/{torneo.maximo}</p>
                  <div className='card-torneo__buttons'>
                    <button
                      className={`btn-apuntarse ${inscripciones[torneo.id] ? 'inscrito' : ''}`}
                      disabled={torneo.inscritos >= torneo.maximo && !inscripciones[torneo.id]}
                      onClick={() => inscripciones[torneo.id] ? confirmarDesapuntarse(torneo.id) : handleInscripcion(torneo.id)}
                    >
                      {inscripciones[torneo.id] 
                        ? 'Desapuntarse' 
                        : torneo.inscritos >= torneo.maximo 
                          ? 'Completo' 
                          : '¡Apuntarme!'}
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

      {showModal && (
        <div className="modal-overlay">
          <div className={`modal ${modalType}`}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>
                  {modalType === 'success' ? '¡Operación Exitosa!' : 
                   modalType === 'error' ? 'Error' : 
                   modalType === 'warning' ? 'Confirmar Acción' :
                   'Información'}
                </h3>
                <button className="close-button" onClick={closeModal}>×</button>
              </div>
              <div className="modal-body">
                <p>{modalMessage}</p>
                {modalType === 'error' && modalMessage.includes('nivel') && (
                  <div className="error-details">
                    <p>Requisitos del torneo:</p>
                    <ul>
                      <li>Nivel mínimo: {modalMessage.includes('nivelMin') ? modalMessage.split('nivelMin: ')[1].split(',')[0] : 'No especificado'}</li>
                      <li>Tu nivel actual: {modalMessage.includes('Tu nivel') ? modalMessage.split('Tu nivel: ')[1].split(' ')[0] : 'No disponible'}</li>
                    </ul>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                {modalType === 'warning' ? (
                  <>
                    <button 
                      className="modal-button cancel" 
                      onClick={closeModal}
                    >
                      Cancelar
                    </button>
                    <button 
                      className="modal-button confirm" 
                      onClick={() => {
                        modalAction();
                        closeModal();
                      }}
                    >
                      Confirmar
                    </button>
                  </>
                ) : (
                  <button 
                    className={`modal-button ${modalType}`} 
                    onClick={closeModal}
                  >
                    {modalType === 'success' ? '¡Entendido!' : 'Cerrar'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficialTournaments;