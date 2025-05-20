import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import './Index.css';
import axios from 'axios';

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animateStats, setAnimateStats] = useState(false);

  // Inicializa userData con valores por defecto
  const [userData, setUserData] = useState({
    nombre: '',
    mejorTiempo: '0:00.0',
    ranking: 0,
    totalPilotos: 0,
    circuitosVisitados: 0,
    carrerasTotales: 0,
    objetivoSemanal: {
      completado: 0,
      total: 10,
      nombre: 'Cargando...'
    },
    proximosTorneos: [],
    sugerencias: []
  });

  useEffect(() => {
    const comprobarSesion = async () => {
      try {
        const res = await axios.get('/api/comprobarSesion',{
          withCredentials: true,
        });
        if (!res.data.logueado) {
          navigate('/registro');
        }
      } catch (err) {
        console.log("Error al comprobar sesión:", err);
        setError("Error al comprobar la sesión");
      }
    };
    comprobarSesion();
  }, [navigate]);

  useEffect(() => {
    const obtenerPerfil = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/perfil",{
          withCredentials: true,
        });
        
        // Actualiza userData con la respuesta
        setUserData({
          nombre: response.data.nombre || 'Usuario',
          username: response.data.username || 'Username',
          mejorTiempo: response.data.mejorTiempo || '0:00.0',
          ranking: response.data.ranking || 0,
          totalPilotos: response.data.totalPilotos || 0,
          circuitosVisitados: response.data.circuitosVisitados || 0,
          carrerasTotales: response.data.carrerasTotales || 0,
          objetivoSemanal: response.data.objetivoSemanal || {
            completado: 0,
            total: 10,
            nombre: 'Objetivo Semanal'
          },
          proximosTorneos: response.data.proximosTorneos || [],
          sugerencias: response.data.sugerencias || []
        });
        
        setLoading(false);
        
        // Retrasar la animación de las estadísticas para efecto visual
        setTimeout(() => {
          setAnimateStats(true);
        }, 500);
      } catch (err) {
        console.error("Error al obtener perfil:", err);
        setError("No se pudo cargar el perfil. ¿Estás logueado?");
        setLoading(false);
      }
    };

    obtenerPerfil();
  }, []);

  // Función para mostrar iconos según el tipo de torneo
  const getTournamentEmoji = (nombreTorneo) => {
    if (nombreTorneo.toLowerCase().includes('campeonato')) return '🏆';
    if (nombreTorneo.toLowerCase().includes('copa')) return '🏁';
    if (nombreTorneo.toLowerCase().includes('gran premio')) return '🏎️';
    return '🏆';
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className='main-container'>
          <div className='loading-message'>
            <div className="loading-icon">🏎️</div>
            <p>Cargando tu panel de control...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className='main-container'>
          <div className='error-message'>
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button onClick={() => navigate('/registro')}>Ir a Registro</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className='main-container'>
        <div className='dashboard-header'>
          <div className='welcome-section'>
            <h1>¡Bienvenido de nuevo, <span className='highlight'>{userData.username}</span>!</h1>
            <p className='subtitle'>Tu panel de control personalizado para dominar el asfalto</p>
          </div>
          <div className='quick-actions'>
            <Link to='/carrerasLibres' className='action-button'>
              <span className='icon'>🏁</span>
              <span>Nueva Carrera</span>
            </Link>
            <Link to='/torneosOficiales' className='action-button'>
              <span className='icon'>🏆</span>
              <span>Explorar Torneos</span>
            </Link>
          </div>
        </div>

        <div className='dashboard-grid'>
          <section className='stats-section'>
            <h2>Estadísticas</h2>
            <div className='stats-grid'>
              <div className={`stat-card ${animateStats ? 'animate' : ''}`}>
                <div className='stat-icon'>⏱️</div>
                <div className='stat-content'>
                  <h3>Mejor Tiempo</h3>
                  <p className='stat-value'>{userData.mejorTiempo}</p>
                </div>
              </div>
              <div className={`stat-card ${animateStats ? 'animate' : ''}`} style={{ animationDelay: '0.1s' }}>
                <div className='stat-icon'>🏅</div>
                <div className='stat-content'>
                  <h3>Ranking Global</h3>
                  <p className='stat-value'>{userData.ranking}º <span className="stat-subtitle">de {userData.totalPilotos}</span></p>
                </div>
              </div>
              <div className={`stat-card ${animateStats ? 'animate' : ''}`} style={{ animationDelay: '0.2s' }}>
                <div className='stat-icon'>🏢</div>
                <div className='stat-content'>
                  <h3>Circuitos Visitados</h3>
                  <p className='stat-value'>{userData.circuitosVisitados}</p>
                </div>
              </div>
              <div className={`stat-card ${animateStats ? 'animate' : ''}`} style={{ animationDelay: '0.3s' }}>
                <div className='stat-icon'>🚗</div>
                <div className='stat-content'>
                  <h3>Carreras Totales</h3>
                  <p className='stat-value'>{userData.carrerasTotales}</p>
                </div>
              </div>
            </div>
          </section>

          <section className='challenge-section'>
            <div className='challenge-header'>
              <h2>Desafío Semanal</h2>
              <span className='challenge-badge'>🏆</span>
            </div>
            <div className='challenge-content'>
              <h3>{userData.objetivoSemanal.nombre}</h3>
              <p>¡Completa {userData.objetivoSemanal.total} vueltas esta semana para desbloquear este reto!</p>
              <div className='progress-container'>
                <div className='progress-bar'>
                  <div 
                    className={`progress-fill ${animateStats ? 'animate' : ''}`}
                    style={{ width: `${(userData.objetivoSemanal.completado / userData.objetivoSemanal.total) * 100}%` }}
                  ></div>
                </div>
                <div className='progress-text'>
                  <span>{userData.objetivoSemanal.completado} / {userData.objetivoSemanal.total} vueltas</span>
                  <span className='progress-percentage'>
                    {Math.round((userData.objetivoSemanal.completado / userData.objetivoSemanal.total) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </section>

          {userData.proximosTorneos.length > 0 && (
            <section className='tournaments-section'>
              <h2>Próximos Torneos</h2>
              <div className='tournaments-grid'>
                {userData.proximosTorneos.map((torneo, index) => (
                  <div key={torneo.id} className='tournament-card' style={{ animationDelay: `${0.1 * index}s` }}>
                    <div className='tournament-header'>
                      <h3>{getTournamentEmoji(torneo.nombre)} {torneo.nombre}</h3>
                      <span className='tournament-date'>{torneo.fecha}</span>
                    </div>
                    <p className='tournament-location'>{torneo.karting}</p>
                    <Link to={`/torneo/${torneo.id}`} className='tournament-link'>
                      Ver detalles
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {userData.sugerencias.length > 0 && (
            <section className='suggestions-section'>
              <h2>Recomendados para ti</h2>
              <div className='suggestions-grid'>
                {userData.sugerencias.map((sugerencia, index) => (
                  <div 
                    key={sugerencia.id} 
                    className={`suggestion-card ${sugerencia.destacado ? 'highlighted' : ''}`}
                    style={{ animationDelay: `${0.15 * index}s` }}
                  >
                    {sugerencia.tipo === 'carrera' ? (
                      <>
                        <div className='suggestion-icon'>🔥</div>
                        <div className='suggestion-content'>
                          <h3>Carrera Abierta</h3>
                          <p><strong>{sugerencia.karting}</strong> - {sugerencia.fecha}</p>
                          <Link to='/carrerasLibres' className='suggestion-link'>Apúntate ahora</Link>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className='suggestion-icon'>🎯</div>
                        <div className='suggestion-content'>
                          <h3>Nuevo Reto</h3>
                          <p><strong>{sugerencia.nombre}</strong> - {sugerencia.descripcion}</p>
                          <Link to='/perfil' className='suggestion-link'>Ver retos</Link>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default Index;