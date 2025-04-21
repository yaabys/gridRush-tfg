import Header from '../../components/Header';
import './Index.css';

const Index = () => {
    // agregar la lógica para verificar si el usuario está autenticado
    // y redirigir a la página de inicio de sesión si no lo está
  return (
    <>
      <Header />
      <div className='main-container'>
        <section className='welcome'>
          <h2>¡Bienvenido de nuevo, piloto!</h2>
          <p>Aquí tienes tus estadísticas y los eventos destacados de la semana.</p>
        </section>

        <section className='stats-summary'>
          <div className='stat-box'>
            <h3>Mejor Tiempo</h3>
            <p>1:21.4</p>
          </div>
          <div className='stat-box'>
            <h3>Ranking</h3>
            <p>7º de 142</p>
          </div>
          <div className='stat-box'>
            <h3>Circuitos Visitados</h3>
            <p>5</p>
          </div>
          <div className='stat-box'>
            <h3>Carreras Totales</h3>
            <p>24</p>
          </div>
        </section>

        <section className='weekly-goal'>
          <h3>🏆 Objetivo Semanal</h3>
          <p>¡Completa 10 vueltas esta semana para desbloquear el reto <strong>Conductor de Hierro</strong>!</p>
          <div className='progress-bar'>
            <div className='progress-completed' style={{ width: '70%' }}></div>
          </div>
          <p>7 / 10 vueltas</p>
        </section>

        <section className='upcoming-tournaments'>
          <h3>🏆 Próximos Torneos</h3>
          <ul>
            <li>📍 Karting Madrid – 6 de abril – Torneo Copa de Primavera</li>
            <li>📍 Karting Jerez – 13 de abril – Torneo Nocturno</li>
            <li>📍 Karting Valencia – 20 de abril – Carrera Pro</li>
          </ul>
        </section>

        <section className='suggestions'>
          <h3>📅 Sugerencias para Ti</h3>
          <p>🔥 Hay una carrera abierta en <strong>Karting Málaga</strong> este fin de semana. ¡Apúntate ya!</p>
        </section>
      </div>
    </>
  );
};

export default Index;
