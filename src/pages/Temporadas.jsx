import { useState } from 'react';
import Header from '../components/Header';
import './Temporadas.css';

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
const ranking = Array.from({ length: 500 }, (_, i) => ({
  nombre: `Piloto ${i + 1}`,
  puntos: 10500 - i * 10
}));

const Temporadas = () => {
  const [mostrarRecompensas, setMostrarRecompensas] = useState(false);

  return (
    <>
      <Header />
      <div className='temporadas'>
        <div className='temporadas__container'>
          <h1 className='temporada-titulo'>{temporadaActual.nombre}</h1>
          <p className='temporada-fechas'>
            🗓 Del <strong>{temporadaActual.inicio}</strong> al <strong>{temporadaActual.fin}</strong>
          </p>
          <p className='temporada-recompensa'>🎁 {temporadaActual.recompensaPrincipal}</p>

          <button
            className='btn-recompensas'
            onClick={() => setMostrarRecompensas(prev => !prev)}
          >
            {mostrarRecompensas ? 'Ocultar recompensas' : 'Ver recompensas'}
          </button>

          {mostrarRecompensas && (
            <ul className='recompensas-extra'>
              {temporadaActual.recompensasExtra.map((r, i) => (
                <li key={i}>🎉 {r}</li>
              ))}
            </ul>
          )}

          <h2 className='ranking-titulo'>🏁 Ranking actual</h2>
          <div className='ranking-scroll'>
            <ul className='ranking-lista'>
              {ranking.map((piloto, i) => (
                <li key={i}>
                  <span className='ranking-posicion'>#{i + 1}</span>
                  <span className='ranking-nombre'>{piloto.nombre}</span>
                  <span className='ranking-puntos'>{piloto.puntos} pts</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Temporadas;
