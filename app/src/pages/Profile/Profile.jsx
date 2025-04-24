import { useState,useEffect } from 'react';
import Header from '../../components/Header/Header';
import './Profile.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Perfil = () => {

  const navigate = useNavigate();

  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState("");

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
    const obtenerPerfil = async () => {
      try {
        const response = await axios.get("/api/perfil");
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
            src={`https://ui-avatars.com/api/?name=${usuario.nombre}+${usuario.apellido}&background=222&color=fff`}
            alt='Foto de perfil'
          />
        </div>

        <div className='profile-data'>
          <p><strong>Nombre:</strong> {usuario.nombre} {usuario.apellido}</p>
          <p><strong>Email:</strong> {usuario.email}</p>
          <p><strong>Provincia:</strong> {usuario.provincia}</p>
          <p><strong>Nacimiento:</strong> {usuario.fechaNacimiento}</p>
          <p><strong>Usuario:</strong> {usuario.username}</p>

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
            <p>{usuario.vueltaRapida}</p>
          </div>
          <div className='stats-card'>
            <h3>🏆 Torneos ganados</h3>
            <p>{usuario.torneosGanados}</p>
          </div>
          <div className='stats-card'>
            <h3>🎖️ Victorias en carreras</h3>
            <p>{usuario.victorias}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Perfil;