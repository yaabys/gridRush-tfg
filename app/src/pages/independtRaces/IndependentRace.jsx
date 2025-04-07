import { useState } from 'react';
import Header from '../../components/Header';
import './IndependentRace.css';

const carrerasLibres = [
  {
    nombre: 'Sprint Nocturno',
    karting: 'Karting Sevilla Pro',
    comunidad: 'Andalucía',
    fecha: '18 abril 2025',
    horario: '21:00 - 22:30',
    nivel: 'Intermedio',
    plazasOcupadas: 5,
    plazasTotales: 10
  },
  {
    nombre: 'Grand Prix Valencia',
    karting: 'SpeedTrack Valencia',
    comunidad: 'Comunidad Valenciana',
    fecha: '20 abril 2025',
    horario: '17:00 - 19:00',
    nivel: 'Avanzado',
    plazasOcupadas: 14,
    plazasTotales: 15
  },
  {
    nombre: 'Mini GP Madrid',
    karting: 'Karting Madrid Indoor',
    comunidad: 'Madrid',
    fecha: '25 abril 2025',
    horario: '18:30 - 20:00',
    nivel: 'Principiante',
    plazasOcupadas: 8,
    plazasTotales: 12
  },
  {
    nombre: 'Endurance Barcelona',
    karting: 'Barcelona Karts',
    comunidad: 'Cataluña',
    fecha: '30 abril 2025',
    horario: '16:00 - 18:30',
    nivel: 'Intermedio',
    plazasOcupadas: 10,
    plazasTotales: 10
  }
];

const niveles = ['Principiante', 'Intermedio', 'Avanzado'];
const comunidades = [...new Set(carrerasLibres.map(c => c.comunidad))];

const IndependentRace = () => {
  const [nivelSeleccionado, setNivelSeleccionado] = useState('');
  const [comunidadSeleccionada, setComunidadSeleccionada] = useState('');

  const carrerasFiltradas = carrerasLibres.filter(c => {
    const coincideNivel = nivelSeleccionado ? c.nivel === nivelSeleccionado : true;
    const coincideComunidad = comunidadSeleccionada ? c.comunidad === comunidadSeleccionada : true;
    return coincideNivel && coincideComunidad;
  });

  return (
    <div className='independentRace'>
      <Header />
      <div className='independentRace__container'>
        <h1>Carreras Libres</h1>
        <p>Encuentra tu próxima carrera libre en los mejores kartings.</p>

        <div className='filters'>
          <label>
            Nivel:
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

        <div className='cards-carreras'>
          {carrerasFiltradas.map((carrera, index) => (
            <div key={index} className='card-carrera'>
              <h3>{carrera.nombre}</h3>
              <p><strong>🏁 Karting:</strong> {carrera.karting}</p>
              <p><strong>📍 Comunidad:</strong> {carrera.comunidad}</p>
              <p><strong>🗓 Fecha:</strong> {carrera.fecha}</p>
              <p><strong>⏰ Horario:</strong> {carrera.horario}</p>
              <p><strong>🎯 Nivel:</strong> {carrera.nivel}</p>
              <p><strong>👥 Plazas:</strong> {carrera.plazasOcupadas > 0 ? carrera.plazasOcupadas : carrera.plazasTotales}/{carrera.plazasTotales}</p>
              <button disabled={carrera.plazasOcupadas >= carrera.plazasTotales}>
                {carrera.plazasOcupadas >= carrera.plazasTotales ? 'Completo' : 'Reservar Plaza'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IndependentRace;