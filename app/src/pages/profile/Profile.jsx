import { useState,useEffect } from 'react';
import Header from '../../components/Header';
import './Profile.css';
import axios from 'axios';

const Perfil = () => {
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const obtenerPerfil = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/perfil");
        setUsuario(response.data);
      } catch (err) {
        setError("No se pudo cargar el perfil. ¿Estás logueado?");
      }
    };

    obtenerPerfil();
  }, []);

  const handleEditarUsername = () => alert('Función para cambiar nombre de usuario');
  const handleEditarEmail = () => alert('Función para cambiar email');
  const handleEditarAvatar = () => alert('Función para cambiar foto de perfil');

  if (error) {
    return (
      <div className='profile-container'>
        <p className='error-message'>{error}</p>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className='profile-container'>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className='profile-container'>
        <h2>👤 Mi perfil</h2>

        <div className='profile-avatar'>
          <img
            src={`https://ui-avatars.com/api/?name=${user.nombre}+${user.apellido}&background=222&color=fff`}
            alt='Foto de perfil'
          />
        </div>

        <div className='profile-data'>
          <p><strong>Nombre:</strong> {user.nombre} {user.apellido}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Provincia:</strong> {user.provincia}</p>
          <p><strong>Nacimiento:</strong> {user.nacimiento}</p>
          <p><strong>Usuario:</strong> {user.username}</p>

          <button className='edit-btn' onClick={() => setMostrarOpciones(!mostrarOpciones)}>
            ✏️ Editar perfil
          </button>

          {mostrarOpciones && (
            <div className='edit-opciones'>
              <button onClick={handleEditarUsername}>🆔 Cambiar nombre de usuario</button>
              <button onClick={handleEditarEmail}>📧 Cambiar email</button>
              <button onClick={handleEditarAvatar}>📷 Cambiar foto de perfil</button>
            </div>
          )}
        </div>

        <div className='profile-stats'>
          <div className='stats-card'>
            <h3>🏁 Vuelta más rápida</h3>
            <p>{user.vueltaRapida}</p>
          </div>
          <div className='stats-card'>
            <h3>🏆 Torneos ganados</h3>
            <p>{user.torneosGanados}</p>
          </div>
          <div className='stats-card'>
            <h3>🎖️ Victorias en carreras</h3>
            <p>{user.victorias}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Perfil;