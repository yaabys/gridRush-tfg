import { useState } from 'react';
import Header from '../../components/Header';
import './Seasons.css';

const temporadaActual = {
  nombre: 'Temporada Nitro X',
  inicio: '1 de abril 2025',
  fin: '30 de junio 2025',
  recompensaPrincipal: 'Los 1000 mejores ganan un mono exclusivo de GRIDRUSH',
  recompensasExtra: [
    'Top 10: Entrada gratuita a un torneo nacional',
    'Top 100: Merch GRIDRUSH edición limitada',
    'Top 500: Bonus de puntos en la próxima temporada',
  ]
};

// Simulamos 30 pilotos (podés generar más)
const ranking = Array.from({ length: 30 }, (_, i) => ({
  nombre: `Piloto ${i + 1}`,
  puntos: 1500 - i * 10
}));

const Seasons = () => {
  const [mostrarRecompensas, setMostrarRecompensas] = useState(false);

  return (
    <>
      <Header />
      <div className='seasons'>
        <div className='seasons__container'>
          <h1 className='season-title'>{temporadaActual.nombre}</h1>
          <p className='season-dates'>
            🗓 Del <strong>{temporadaActual.inicio}</strong> al <strong>{temporadaActual.fin}</strong>
          </p>
          <p className='season-reward'>🎁 {temporadaActual.recompensaPrincipal}</p>

          <button
            className='btn-rewards'
            onClick={() => setMostrarRecompensas(prev => !prev)}
          >
            {mostrarRecompensas ? 'Ocultar recompensas' : 'Ver recompensas'}
          </button>

          {mostrarRecompensas && (
            <ul className='rewards-extra'>
              {temporadaActual.recompensasExtra.map((r, i) => (
                <li key={i}>🎉 {r}</li>
              ))}
            </ul>
          )}

          <h2 className='ranking-title'>🏁 Ranking actual</h2>
          <div className='ranking-scroll'>
            <ul className='ranking-list'>
              {ranking.map((piloto, i) => (
                <li key={i}>
                  <span className='ranking-position'>#{i + 1}</span>
                  <span className='ranking-name'>{piloto.nombre}</span>
                  <span className='ranking-points'>{piloto.puntos} pts</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Seasons;
