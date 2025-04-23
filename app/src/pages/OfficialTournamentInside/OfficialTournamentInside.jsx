import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import './OfficialTournamentInside.css';

const OfficialTournamentInside = () => {
  const { id } = useParams();
  const [torneo, setTorneo] = useState(null);
  const [clasificacion, setClasificacion] = useState([]);
  const [proximasCarreras, setProximasCarreras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aquí irían las llamadas a la API para obtener los datos
    // Por ahora usamos datos de ejemplo
    setTorneo({
      nombre: 'Gran Premio de Sevilla',
      ubicacion: 'Karting Sevilla Pro',
      comunidad: 'Andalucía',
      fechaInicio: '15 mayo 2025',
      fechaFin: '15 junio 2025',
      nivelMinimo: 'Intermedio',
      inscritos: 7,
      maximo: 12,
      premios: [
        { posicion: 1, premio: '1000€ + Trofeo' },
        { posicion: 2, premio: '500€ + Trofeo' },
        { posicion: 3, premio: '250€ + Trofeo' }
      ]
    });

    setClasificacion([
      { posicion: 1, piloto: 'Carlos García', puntos: 75, vueltas: 3 },
      { posicion: 2, piloto: 'Ana Martínez', puntos: 68, vueltas: 3 },
      { posicion: 3, piloto: 'Juan Pérez', puntos: 62, vueltas: 3 },
      { posicion: 4, piloto: 'María López', puntos: 55, vueltas: 3 },
      { posicion: 5, piloto: 'Pedro Sánchez', puntos: 48, vueltas: 3 }
    ]);

    setProximasCarreras([
      { fecha: '22 mayo 2025', hora: '17:00', circuito: 'Circuito Principal' },
      { fecha: '29 mayo 2025', hora: '18:30', circuito: 'Circuito Sprint' },
      { fecha: '5 junio 2025', hora: '19:00', circuito: 'Circuito Nocturno' }
    ]);

    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="tournament-inside">
        <Header />
        <div className="loading">Cargando información del torneo...</div>
      </div>
    );
  }

  return (
    <div className="tournament-inside">
      <Header />
      <div className="tournament-inside__container">
        <div className="tournament-header">
          <h1>{torneo.nombre}</h1>
          <div className="tournament-info">
            <p><strong>📍 Ubicación:</strong> {torneo.ubicacion}</p>
            <p><strong>🗓 Fechas:</strong> {torneo.fechaInicio} - {torneo.fechaFin}</p>
            <p><strong>🎯 Nivel mínimo:</strong> {torneo.nivelMinimo}</p>
            <p><strong>👥 Inscritos:</strong> {torneo.inscritos}/{torneo.maximo}</p>
          </div>
        </div>

        <div className="tournament-sections">
          <section className="clasificacion-section">
            <h2>Clasificación General</h2>
            <div className="clasificacion-table">
              <table>
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Piloto</th>
                    <th>Puntos</th>
                    <th>Vueltas</th>
                  </tr>
                </thead>
                <tbody>
                  {clasificacion.map((piloto) => (
                    <tr key={piloto.posicion}>
                      <td>{piloto.posicion}º</td>
                      <td>{piloto.piloto}</td>
                      <td>{piloto.puntos}</td>
                      <td>{piloto.vueltas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="proximas-carreras">
            <h2>Próximas Carreras</h2>
            <div className="carreras-grid">
              {proximasCarreras.map((carrera, index) => (
                <div key={index} className="carrera-card">
                  <h3>{carrera.circuito}</h3>
                  <p><strong>🗓 Fecha:</strong> {carrera.fecha}</p>
                  <p><strong>⏰ Hora:</strong> {carrera.hora}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="premios-section">
            <h2>Premios</h2>
            <div className="premios-grid">
              {torneo.premios.map((premio) => (
                <div key={premio.posicion} className="premio-card">
                  <h3>{premio.posicion}º Lugar</h3>
                  <p>{premio.premio}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default OfficialTournamentInside; 