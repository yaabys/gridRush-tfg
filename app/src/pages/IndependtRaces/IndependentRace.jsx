import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/Header/Header';
import './IndependentRace.css';
import { useNavigate } from 'react-router-dom';

const IndependentRace = () => {
  const navigate = useNavigate();
  const [carrerasLibres, setCarrerasLibres] = useState([]);
  const [nivelSeleccionado, setNivelSeleccionado] = useState('');
  const [comunidadSeleccionada, setComunidadSeleccionada] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const comprobarSesion = async () => {
      try {
        const res = await axios.get('/api/comprobarSesion');
        if (!res.data.logueado) {
          navigate('/registro');
        }
      } catch (err) {
        console.log("Error al comprobar sesión:", err);
      }
    };
    comprobarSesion();
  }, [navigate]);

  useEffect(() => {
    const fetchCarreras = async () => {
      try {
        const response = await axios.get('/api/carreras-libres');
        setCarrerasLibres(response.data);
      } catch (err) {
        console.error('Error al cargar carreras libres:', err);
        setError('Error al cargar las carreras libres');
      } finally {
        setLoading(false);
      }
    };

    fetchCarreras();
  }, []);

  const comunidades = [...new Set(carrerasLibres.map(c => c.comunidad))];
  const niveles = [...new Set(carrerasLibres.map(c => c.nivel))];

  const carrerasFiltradas = carrerasLibres.filter(c => {
    const coincideNivel = nivelSeleccionado ? c.nivel === nivelSeleccionado : true;
    const coincideComunidad = comunidadSeleccionada ? c.comunidad === comunidadSeleccionada : true;
    return coincideNivel && coincideComunidad;
  });

  const handleReservar = async (carreraId) => {
    try {
      const username = localStorage.getItem("username"); // O usar contexto
      const response = await axios.put('/api/reservar-carreraLibre', { idCarrera: carreraId, username });
  
      if (response.data.success) {
        alert("Reserva realizada con éxito");
        // Opcional: recargar carreras
      } else if (response.data.inscrito) {
        alert("Ya estás inscrito en esta carrera");
      }
    } catch (err) {
      console.error('Error al reservar plaza:', err);
      alert("Ocurrió un error al reservar");
    }
  };  

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

        {loading ? (
          <p className="loading">Cargando carreras...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : carrerasFiltradas.length === 0 ? (
          <p className="no-data">No se encontraron carreras disponibles.</p>
        ) : (
          <div className='cards-carreras'>
            {carrerasFiltradas.map((carrera, index) => (
              <div key={index} className='card-carrera'>
                <h3>{carrera.nombre}</h3>
                <p><strong>🏁 Karting:</strong> {carrera.karting}</p>
                <p><strong>📍 Comunidad:</strong> {carrera.comunidad}</p>
                <p><strong>🗓 Fecha:</strong> {carrera.fecha}</p>
                <p><strong>⏰ Horario:</strong> {carrera.horario}</p>
                <p><strong>🎯 Nivel:</strong> {carrera.nivel}</p>
                <p><strong>👥 Plazas:</strong> {carrera.plazasOcupadas}/{carrera.plazasTotales}</p>
                <button 
                  disabled={carrera.plazasOcupadas >= carrera.plazasTotales} 
                  onClick={() => handleReservar(carrera.id)}
                >
                  {carrera.plazasOcupadas >= carrera.plazasTotales ? 'Completo' : 'Reservar Plaza'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IndependentRace;
