import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import './Index.css';

const Index = () => {
  // Simulación de datos del usuario
  const [userData, setUserData] = useState({
    nombre: 'Carlos',
    mejorTiempo: '1:21.4',
    ranking: 7,
    totalPilotos: 142,
    circuitosVisitados: 5,
    carrerasTotales: 24,
    objetivoSemanal: {
      completado: 7,
      total: 10,
      nombre: 'Conductor de Hierro'
    },
    proximosTorneos: [
      { id: 1, nombre: 'Torneo Copa de Primavera', karting: 'Karting Madrid', fecha: '6 de abril' },
      { id: 2, nombre: 'Torneo Nocturno', karting: 'Karting Jerez', fecha: '13 de abril' },
      { id: 3, nombre: 'Carrera Pro', karting: 'Karting Valencia', fecha: '20 de abril' }
    ],
    sugerencias: [
      { id: 1, tipo: 'carrera', karting: 'Karting Málaga', fecha: 'Este fin de semana', destacado: true },
      { id: 2, tipo: 'reto', nombre: 'Maestro del Asfalto', descripcion: 'Completa 5 vueltas en menos de 1:30' }
    ]
  });

  // Simulación de carga de datos
  useEffect(() => {
    // Aquí irían las llamadas a la API para obtener los datos reales
    // Por ahora usamos los datos de ejemplo definidos arriba
  }, []);

  return (
    <>
      <Header />
      <div className='main-container'>
        <div className='dashboard-header'>
          <div className='welcome-section'>
            <h1>¡Bienvenido de nuevo, <span className='highlight'>{userData.nombre}</span>!</h1>
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
              <div className='stat-card'>
                <div className='stat-icon'>⏱️</div>
                <div className='stat-content'>
                  <h3>Mejor Tiempo</h3>
                  <p className='stat-value'>{userData.mejorTiempo}</p>
                </div>
              </div>
              <div className='stat-card'>
                <div className='stat-icon'>🏅</div>
                <div className='stat-content'>
                  <h3>Ranking Global</h3>
                  <p className='stat-value'>{userData.ranking}º de {userData.totalPilotos}</p>
                </div>
              </div>
              <div className='stat-card'>
                <div className='stat-icon'>🏢</div>
                <div className='stat-content'>
                  <h3>Circuitos Visitados</h3>
                  <p className='stat-value'>{userData.circuitosVisitados}</p>
                </div>
              </div>
              <div className='stat-card'>
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
                    className='progress-fill' 
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

          <section className='tournaments-section'>
            <h2>Próximos Torneos</h2>
            <div className='tournaments-grid'>
              {userData.proximosTorneos.map(torneo => (
                <div key={torneo.id} className='tournament-card'>
                  <div className='tournament-header'>
                    <h3>{torneo.nombre}</h3>
                    <span className='tournament-date'>{torneo.fecha}</span>
                  </div>
                  <p className='tournament-location'>📍 {torneo.karting}</p>
                  <Link to={`/torneo/${torneo.id}`} className='tournament-link'>
                    Ver detalles
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section className='suggestions-section'>
            <h2>Recomendados para ti</h2>
            <div className='suggestions-grid'>
              {userData.sugerencias.map(sugerencia => (
                <div key={sugerencia.id} className={`suggestion-card ${sugerencia.destacado ? 'highlighted' : ''}`}>
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
        </div>
      </div>
    </>
  );
};

export default Index;
