import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import './OfficialTournaments.css';

const torneos = [
  {
    id: 1,
    nombre: 'Gran Premio de Sevilla',
    ubicacion: 'Karting Sevilla Pro',
    comunidad: 'Andalucía',
    fecha: '15 mayo 2025',
    nivelMinimo: 'Intermedio',
    inscritos: 7,
    maximo: 12
  },
  {
    id: 2,
    nombre: 'Open Valencia Night',
    ubicacion: 'SpeedTrack Valencia',
    comunidad: 'Comunidad Valenciana',
    fecha: '22 abril 2025',
    nivelMinimo: 'Avanzado',
    inscritos: 11,
    maximo: 12
  },
  {
    id: 3,
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

const OfficialTournaments = () => {
  const navigate = useNavigate();
  const [nivelSeleccionado, setNivelSeleccionado] = useState('');
  const [comunidadSeleccionada, setComunidadSeleccionada] = useState('');

  const torneosFiltrados = torneos.filter(t => {
    const coincideNivel = nivelSeleccionado ? t.nivelMinimo === nivelSeleccionado : true;
    const coincideComunidad = comunidadSeleccionada ? t.comunidad === comunidadSeleccionada : true;
    return coincideNivel && coincideComunidad;
  });

  const handleMasInfo = (torneoId) => {
    navigate(`/torneo/${torneoId}`);
  };

  return (
    <div className='officialTournaments'>
      <Header />
      <div className='officialTournaments__container'>
        <h1>Torneos Oficiales</h1>
        <p>Filtrá por nivel y comunidad para encontrar tu próximo reto.</p>

        <div className='filters'>
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

        <div className='cards-torneos'>
          {torneosFiltrados.map((torneo) => (
            <div key={torneo.id} className='card-torneo'>
              <h3>{torneo.nombre}</h3>
              <p><strong>📍 Ubicación:</strong> {torneo.ubicacion}</p>
              <p><strong>🗓 Fecha:</strong> {torneo.fecha}</p>
              <p><strong>🎯 Nivel mínimo:</strong> {torneo.nivelMinimo}</p>
              <p><strong>👥 Inscritos:</strong> {torneo.inscritos}/{torneo.maximo}</p>
              <div className='card-torneo__buttons'>
                <button 
                  className='btn-apuntarse'
                  disabled={torneo.inscritos >= torneo.maximo}
                >
                  {torneo.inscritos < torneo.maximo ? '¡Apuntarme!' : 'Completo'}
                </button>
                <button 
                  className='btn-mas-info'
                  onClick={() => handleMasInfo(torneo.id)}
                >
                  Más información
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OfficialTournaments;
