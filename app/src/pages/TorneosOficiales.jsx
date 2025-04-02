import { useState } from 'react';
import Header from '../components/Header';
import './TorneosOficiales.css';

const torneos = [
  {
    nombre: 'Gran Premio de Sevilla',
    ubicacion: 'Karting Sevilla Pro',
    comunidad: 'Andalucía',
    fecha: '15 mayo 2025',
    nivelMinimo: 'Intermedio',
    inscritos: 7,
    maximo: 12
  },
  {
    nombre: 'Open Valencia Night',
    ubicacion: 'SpeedTrack Valencia',
    comunidad: 'Comunidad Valenciana',
    fecha: '22 abril 2025',
    nivelMinimo: 'Avanzado',
    inscritos: 11,
    maximo: 12
  },
  {
    nombre: 'Clásico de Madrid Indoor',
    ubicacion: 'Karting Madrid Indoor',
    comunidad: 'Madrid',
    fecha: '28 abril 2025',
    nivelMinimo: 'Principiante',
    inscritos: 3,
    maximo: 12
  }
];

const niveles = ['Principiante', 'Intermedio', 'Avanzado'];
const comunidades = [...new Set(torneos.map(t => t.comunidad))];

const TorneosOficiales = () => {
  const [nivelSeleccionado, setNivelSeleccionado] = useState('');
  const [comunidadSeleccionada, setComunidadSeleccionada] = useState('');

  const torneosFiltrados = torneos.filter(t => {
    const coincideNivel = nivelSeleccionado ? t.nivelMinimo === nivelSeleccionado : true;
    const coincideComunidad = comunidadSeleccionada ? t.comunidad === comunidadSeleccionada : true;
    return coincideNivel && coincideComunidad;
  });

  return (
    <div className='torneosOficiales'>
      <Header />
      <div className='torneosOficiales__container'>
        <h1>Torneos Oficiales</h1>
        <p>Filtrá por nivel y comunidad para encontrar tu próximo reto.</p>

        <div className='filtros'>
          <label>
            Nivel mínimo:
            <select value={nivelSeleccionado} onChange={(e) => setNivelSeleccionado(e.target.value)}>
              <option value=''>Todos</option>
              {niveles.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>

          <label>
            Comunidad:
            <select value={comunidadSeleccionada} onChange={(e) => setComunidadSeleccionada(e.target.value)}>
              <option value=''>Todas</option>
              {comunidades.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <div className='tarjetas-torneos'>
          {torneosFiltrados.map((torneo, index) => (
            <div key={index} className='tarjeta-torneo'>
              <h3>{torneo.nombre}</h3>
              <p><strong>📍 Ubicación:</strong> {torneo.ubicacion}</p>
              <p><strong>🗓 Fecha:</strong> {torneo.fecha}</p>
              <p><strong>🎯 Nivel mínimo:</strong> {torneo.nivelMinimo}</p>
              <p><strong>👥 Inscritos:</strong> {torneo.inscritos}/{torneo.maximo}</p>
              <button disabled={torneo.inscritos >= torneo.maximo}>
                {torneo.inscritos < torneo.maximo ? '¡Apuntarme!' : 'Completo'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TorneosOficiales;
