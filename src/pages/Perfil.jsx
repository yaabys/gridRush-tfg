import { useState } from 'react';
import Header from '../components/Header';
import './Perfil.css';

const Perfil = () => {
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  const user = {
    nombre: 'Álvaro',
    apellido: 'Langa',
    username: 'alvarorush',
    email: 'alvaro@example.com',
    provincia: 'Madrid',
    nacimiento: '2004-12-09',
    vueltaRapida: '1:33.333',
    victorias: 12,
    torneosGanados: 4,
    nivel: 4,
    puntosActuales: 230,
    puntosParaSubir: 300,
  };


  const handleEditarUsername = () => alert('Función para cambiar nombre de usuario');
  const handleEditarEmail = () => alert('Función para cambiar email');
  const handleEditarAvatar = () => alert('Función para cambiar foto de perfil');

  return (
    <>
      <Header />
      <div className='perfil-container'>
        <h2>👤 Mi perfil</h2>

        <div className='perfil-avatar'>
          <img
            src={`https://ui-avatars.com/api/?name=${user.nombre}+${user.apellido}&background=222&color=fff`}
            alt='Foto de perfil'
          />
        </div>

        <div className='perfil-datos'>
          <p><strong>Nombre:</strong> {user.nombre} {user.apellido}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Provincia:</strong> {user.provincia}</p>
          <p><strong>Nacimiento:</strong> {user.nacimiento}</p>
          <p><strong>Usuario:</strong> {user.username}</p>

          <button className='editar-btn' onClick={() => setMostrarOpciones(!mostrarOpciones)}>
            ✏️ Editar perfil
          </button>

          {mostrarOpciones && (
            <div className='editar-opciones'>
              <button onClick={handleEditarUsername}>🆔 Cambiar nombre de usuario</button>
              <button onClick={handleEditarEmail}>📧 Cambiar email</button>
              <button onClick={handleEditarAvatar}>📷 Cambiar foto de perfil</button>
            </div>
          )}
        </div>

        <div className='estadistica-card nivel-card'>
          <h3>📶 Nivel actual</h3>
          <p>Nivel {user.nivel}</p>
          <div className='barra-nivel'>
            <div
              className='barra-nivel__relleno'
              style={{
                width: `${(user.puntosActuales / user.puntosParaSubir) * 100}%`
              }}
            ></div>
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {user.puntosActuales} / {user.puntosParaSubir} pts
          </p>
        </div>


        <div className='perfil-estadisticas'>
          <div className='estadistica-card'>
            <h3>🏁 Vuelta más rápida</h3>
            <p>{user.vueltaRapida}</p>
          </div>
          <div className='estadistica-card'>
            <h3>🏆 Torneos ganados</h3>
            <p>{user.torneosGanados}</p>
          </div>
          <div className='estadistica-card'>
            <h3>🎖️ Victorias en carreras</h3>
            <p>{user.victorias}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Perfil;
