import { useState } from 'react';
import Header from '../components/Header';
import './PistasKarting.css';

const todasLasPistas = [
  {
    nombre: 'Karting Sevilla Pro',
    comunidad: 'Andalucía',
    ubicacion: 'Sevilla',
    direccion: 'Ctra. de Utrera, km 3',
    proximoTorneo: '12 de mayo, 2025'
  },
  {
    nombre: 'SpeedTrack Valencia',
    comunidad: 'Comunidad Valenciana',
    ubicacion: 'Valencia',
    direccion: 'Av. del Motor 24',
    proximoTorneo: '20 de abril, 2025'
  },
  {
    nombre: 'Karting Madrid Indoor',
    comunidad: 'Madrid',
    ubicacion: 'Madrid',
    direccion: 'Calle Rápida 7',
    proximoTorneo: '30 de abril, 2025'
  }
];

const comunidades = [...new Set(todasLasPistas.map(p => p.comunidad))];

const PistasKarting = () => {
  const [comunidadSeleccionada, setComunidadSeleccionada] = useState('');
  
  const pistasFiltradas = comunidadSeleccionada
    ? todasLasPistas.filter(p => p.comunidad === comunidadSeleccionada)
    : todasLasPistas;

  return (
    <>
      <Header />
      <div className='pistasKarting'>
        <div className='pistasKarting__container'>
          <h1>Pistas de Karting</h1>

          <label htmlFor='comunidad'>Filtrar por comunidad:</label>
          <select
            id='comunidad'
            onChange={(e) => setComunidadSeleccionada(e.target.value)}
            value={comunidadSeleccionada}
          >
            <option value=''>Todas</option>
            {comunidades.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <div className='tarjetas'>
            {pistasFiltradas.map((pista, index) => (
              <div key={index} className='tarjeta-karting'>
                <h3>{pista.nombre}</h3>
                <p><strong>📍 Ubicación:</strong> {pista.ubicacion}</p>
                <p><strong>📌 Dirección:</strong> {pista.direccion}</p>
                <p><strong>🗓️ Próximo torneo:</strong> {pista.proximoTorneo}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PistasKarting;
