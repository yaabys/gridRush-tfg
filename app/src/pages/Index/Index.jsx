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

  // --- ¡NUEVO! Estados para las noticias ---
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);
  // -----------------------------------------

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
        }); //
        if (!res.data.logueado) {
          navigate('/registro'); //
        }
      } catch (err) {
        console.log("Error al comprobar sesión:", err);
        setError("Error al comprobar la sesión"); //
      }
    };
    comprobarSesion();
  }, [navigate]);

  useEffect(() => {
    const obtenerPerfil = async () => {
      try {
        setLoading(true); //
        const response = await axios.get("/api/perfil",{
          withCredentials: true,
        }); //
        
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
        }); //
        
        setLoading(false); //
        
        setTimeout(() => {
          setAnimateStats(true); //
        }, 500);
      } catch (err) {
        console.error("Error al obtener perfil:", err);
        setError("No se pudo cargar el perfil. ¿Estás logueado?"); //
        setLoading(false); //
      }
    };

    obtenerPerfil();
  }, []);

  // --- ¡NUEVO! useEffect para obtener las noticias ---
  useEffect(() => {
    const obtenerNoticias = async () => {
      setNewsLoading(true);
      try {
        // Hacemos la llamada a nuestro backend (usando el proxy)
        const response = await axios.get('/api/motorsport-news');
        setNews(response.data);
        setNewsError(null);
      } catch (err) {
        console.error("Error al obtener noticias:", err);
        setNewsError("No se pudieron cargar las noticias del Paddock.");
        setNews([]);
      } finally {
        setNewsLoading(false);
      }
    };

    obtenerNoticias();
  }, []); // Se ejecuta solo una vez
  // -----------------------------------------------

  const getTournamentEmoji = (nombreTorneo) => {
    if (nombreTorneo.toLowerCase().includes('campeonato')) return '🏆'; //
    if (nombreTorneo.toLowerCase().includes('copa')) return '🏁'; //
    if (nombreTorneo.toLowerCase().includes('gran premio')) return '🏎️'; //
    return '🏆'; //
  };

  // --- ¡NUEVO! Componente para la tarjeta de noticia ---
  const NewsCard = ({ article }) => (
    <a href={article.url} target="_blank" rel="noopener noreferrer" className="news-card">
      {article.urlToImage ? (
         <img src={article.urlToImage} alt={article.title} className="news-image" />
      ) : (
         <div className="news-image-placeholder">📰</div>
      )}
      <div className="news-content">
          <h4 className="news-title">{article.title}</h4>
          <p className="news-source">{article.source.name} - {new Date(article.publishedAt).toLocaleDateString()}</p>
      </div>
    </a>
  );
  // ----------------------------------------------------

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
        ); //
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
        ); //
  }

  return (
    <>
      <Header />
      <div className='main-container'>
        <div className='dashboard-header'>
          {/* ... Tu código del header ... */}
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
                {/* ... Tu código de estadísticas ... */}
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
                {/* ... Tu código de desafíos ... */}
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

            {/* --- ¡NUEVA SECCIÓN DE NOTICIAS! --- */}
            <section className='news-section'>
                <h2>Desde el Paddock</h2>
                <div className='news-grid'>
                {newsLoading && <p className='news-loading'>Buscando noticias a toda velocidad...</p>}
                {newsError && <p className='news-error'>{newsError}</p>}
                {!newsLoading && !newsError && news.length === 0 && <p>Parece que hoy hay silencio en los motores...</p>}
                {!newsLoading && !newsError && news.slice(0, 4).map((article, index) => ( // Mostramos solo 4
                    <NewsCard key={article.url || index} article={article} /> // Usamos article.url como key si es posible
                ))}
                </div>
                {!newsLoading && news.length > 4 && (
                    <Link to="/noticias" className="see-more-link">Ver todas las noticias →</Link>
                )}
            </section>
            {/* --- FIN SECCIÓN --- */}

            {userData.proximosTorneos.length > 0 && (
                <section className='tournaments-section'>
                    {/* ... Tu código de torneos ... */}
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
                    {/* ... Tu código de sugerencias ... */}
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