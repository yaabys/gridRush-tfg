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
          <h2>Welcome back, pilot!</h2>
          <p>Here are your stats and featured events for the week.</p>
        </section>

        <section className='stats-summary'>
          <div className='stat-box'>
            <h3>Best Time</h3>
            <p>1:21.4</p>
          </div>
          <div className='stat-box'>
            <h3>Ranking</h3>
            <p>7th out of 142</p>
          </div>
          <div className='stat-box'>
            <h3>Circuits Visited</h3>
            <p>5</p>
          </div>
          <div className='stat-box'>
            <h3>Total Races</h3>
            <p>24</p>
          </div>
        </section>

        <section className='weekly-goal'>
          <h3>🏆 Weekly Goal</h3>
          <p>Complete 10 laps this week to unlock the <strong>Iron Driver</strong> challenge!</p>
          <div className='progress-bar'>
            <div className='progress-completed' style={{ width: '70%' }}></div>
          </div>
          <p>7 / 10 laps</p>
        </section>

        <section className='upcoming-tournaments'>
          <h3>🏆 Upcoming Tournaments</h3>
          <ul>
            <li>📍 Karting Madrid – April 6 – Spring Cup Tournament</li>
            <li>📍 Karting Jerez – April 13 – Night Tournament</li>
            <li>📍 Karting Valencia – April 20 – Pro Race</li>
          </ul>
        </section>

        <section className='suggestions'>
          <h3>📅 Suggestions for You</h3>
          <p>🔥 There's an open race at <strong>Karting Málaga</strong> this weekend. Sign up now!</p>
        </section>
      </div>
    </>
  );
};

export default Index;