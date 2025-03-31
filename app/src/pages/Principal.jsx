import Header from '../components/Header';
import './Principal.css';

const Principal = () => {
  return (
    <>
      <Header />
      <div className='principal-container'>
        <section className='bienvenida'>
          <h2>¡Bienvenido de nuevo, piloto!</h2>
          <p>Estas son tus stats y eventos destacados de la semana.</p>
        </section>

        <section className='stats-resumen'>
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
            <h3>Total Carreras</h3>
            <p>24</p>
          </div>
        </section>

        <section className='objetivo-semanal'>
          <h3>🏆 Objetivo semanal</h3>
          <p>¡Completa 10 vueltas esta semana para desbloquear el reto <strong>Iron Driver</strong>!</p>
          <div className='progreso-barra'>
            <div className='progreso-completado' style={{ width: '70%' }}></div>
          </div>
          <p>7 / 10 vueltas</p>
        </section>

        <section className='proximos-torneos'>
          <h3>🏆 Próximos Torneos</h3>
          <ul>
            <li>📍 Karting Madrid – 6 abril – Torneo Spring Cup</li>
            <li>📍 Karting Jerez – 13 abril – Torneo Nocturno</li>
            <li>📍 Karting Valencia – 20 abril – Carrera Pro</li>
          </ul>
        </section>

        <section className='sugerencias'>
          <h3>📅 Sugerencias para ti</h3>
          <p>🔥 Hay una carrera libre en <strong>Karting Málaga</strong> este finde. ¡Inscríbete ya!</p>
        </section>
      </div>
    </>
  );
};

export default Principal;
