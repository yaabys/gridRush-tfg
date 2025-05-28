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

  const [userData, setUserData] = useState({})  

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
          username: response.data.username || 'Username',
          carrerasTotales: response.data.carrerasTotales || 0,
          torneosVictorias: response.data.torneosVictorias,
          carrerasVictorias: response.data.carrerasVictorias,
          carrerasParticipadas: response.data.carrerasParticipadas,
          torneosParticipados: response.data.torneosParticipados
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
      <div className='main-container index-main-container'>
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
                    <div className='stat-icon'>🏆</div>
                    <div className='stat-content'>
                    <h3>Carreras Participadas</h3>
                    <p className='stat-value'>{userData.carrerasParticipadas}</p>
                    </div>
                </div>
                <div className={`stat-card ${animateStats ? 'animate' : ''}`} style={{ animationDelay: '0.1s' }}>
                    <div className='stat-icon'>🏁</div>
                    <div className='stat-content'>
                    <h3>Victorias en Carreras</h3>
                    <p className='stat-value'>{userData.carrerasVictorias}</p>
                    </div>
                </div>
                <div className={`stat-card ${animateStats ? 'animate' : ''}`} style={{ animationDelay: '0.2s' }}>
                    <div className='stat-icon'>🥇</div>
                    <div className='stat-content'>
                    <h3>Torneos Participados</h3>
                    <p className='stat-value'>{userData.torneosParticipados}</p>
                    </div>
                </div>
                <div className={`stat-card ${animateStats ? 'animate' : ''}`} style={{ animationDelay: '0.3s' }}>
                    <div className='stat-icon'>🏅</div>
                    <div className='stat-content'>
                    <h3>Victorias en Torneos</h3>
                    <p className='stat-value'>{userData.torneosVictorias}</p>
                    </div>
                </div>
                </div>
            </section>

            <section className='news-section'>
                <h2>Desde el Paddock</h2>
                <div className='news-grid'>
                {newsLoading && <p className='news-loading'>Buscando noticias a toda velocidad...</p>}
                {newsError && <p className='news-error'>{newsError}</p>}
                {!newsLoading && !newsError && news.length === 0 && <p>Parece que hoy hay silencio en los motores...</p>}
                {!newsLoading && !newsError && news.slice(0, 4).map((article, index) => (
                    <NewsCard key={article.url || index} article={article} />
                ))}
                </div>
                {!newsLoading && news.length > 4 && (
                    <Link to="/noticias" className="see-more-link">Ver todas las noticias →</Link>
                )}
            </section>
        </div>
      </div>
    </>
  );
};

export default Index;