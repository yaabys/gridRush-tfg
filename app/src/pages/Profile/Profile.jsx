import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import './Profile.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Perfil = () => {

  const navigate = useNavigate();

  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState("");
  const [editandoCampo, setEditandoCampo] = useState(null); 
  const [nuevoValor, setNuevoValor] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);

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

  useEffect(() => {
    const obtenerAvatar = async () => {
      try {
        const response = await axios.get('/api/avatar', {
          responseType: 'blob' // Muy importante para tratar la imagen como archivo
        });

        const imageUrl = URL.createObjectURL(response.data);
        setAvatarUrl(imageUrl);
        console.log("Imagen cargada:", imageUrl);
      } catch (error) {
        console.error("Error al cargar avatar:", error);
      }
    };

    obtenerAvatar();
  }, []);

  const handleEditarUsername = () => {
    setEditandoCampo('username');
    setNuevoValor(usuario.username);
    setMensaje("");
  };
  const handleEditarEmail = () => {
    setEditandoCampo('email');
    setNuevoValor(usuario.email);
    setMensaje("");
  };
  const handleEditarAvatar = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const imageUrl = URL.createObjectURL(file);
      setImagenSeleccionada({ file, url: imageUrl });
      setEditandoCampo('avatar');
    };

    input.click();
  };  

  const handleGuardarCambio = async () => {
    try {
      const payload = {
        usernameActual: usuario.username.toLowerCase(),
        username: editandoCampo === 'username' ? nuevoValor : usuario.username,
        email: editandoCampo === 'email' ? nuevoValor : usuario.email
      };
      console.log('Enviando payload:', payload);

      const res = await axios.put('/api/cambiarperfil', payload);
      

      if (res.data.usuario) {
        setUsuario(res.data.usuario);
      }

      setMensaje('¡Perfil actualizado correctamente!');
      setEditandoCampo(null);
      setMostrarOpciones(false);
    } catch (err) {
      console.error(err);
      setMensaje(err.response?.data?.error || 'Error al actualizar el perfil');
    }
  };

  const handleCancelar = () => {
    setEditandoCampo(null);
    setMensaje("");
  };

  const calcularNivelElo = (elo) => {
    const niveles = [
      { min: 0, max: 1000, nivel: 1 },
      { min: 1000, max: 2000, nivel: 2 },
      { min: 2000, max: 3000, nivel: 3 },
      { min: 3000, max: 4000, nivel: 4 },
      { min: 4000, max: 5000, nivel: 5 },
      { min: 5000, max: 6000, nivel: 6 },
      { min: 6000, max: 7000, nivel: 7 },
      { min: 7000, max: 8000, nivel: 8 },
      { min: 8000, max: 9000, nivel: 9 },
      { min: 9000, max: 10000, nivel: 10 }
    ];

    const nivelActual = niveles.find(n => elo >= n.min && elo < n.max);
    const progreso = ((elo - nivelActual.min) / (nivelActual.max - nivelActual.min)) * 100;
    
    return {
      nivel: nivelActual.nivel,
      progreso: Math.min(100, Math.max(0, progreso)),
      eloActual: elo,
      siguienteNivel: nivelActual.max
    };
  };

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

  const eloInfo = calcularNivelElo(usuario.elo || 0);

  return (
    <>
      <Header />
      <div className='profile-container'>
        <div className="profile-header">
          <h2>Perfil de Usuario</h2>
        </div>

        <div className="profile-content">
          <div className="profile-avatar">
            {imagenSeleccionada ? (
              <img src={imagenSeleccionada.url} alt="Previsualización del avatar" />
            ) : avatarUrl ? (
              <img src={avatarUrl} alt="Avatar cargado" />
            ) : (
              <p>Cargando imagen...</p>
            )}
            <button className="edit-btn" onClick={handleEditarAvatar}>
              Cambiar Avatar
            </button>
            {editandoCampo === 'avatar' && (
              <div className="avatar-save">
                <button
                  className="edit-btn"
                  onClick={async () => {
                    const formData = new FormData();
                    formData.append('file', imagenSeleccionada.file);

                    try {
                      await axios.post('/api/upload', formData, {
                        headers: {
                          'Content-Type': 'multipart/form-data',
                        },
                      });
                      setMensaje('Imagen actualizada correctamente');
                      setImagenSeleccionada(null);
                      setEditandoCampo(null);

                      // Recargar avatar
                      const response = await axios.get('/api/avatar', {
                        responseType: 'blob',
                      });
                      const imageUrl = URL.createObjectURL(response.data);
                      setAvatarUrl(imageUrl);
                    } catch (error) {
                      console.error(error);
                      setMensaje('Error al subir imagen');
                    }
                  }}
                >
                  Guardar Cambios
                </button>
                <button
                  className="edit-btn"
                  onClick={() => {
                    setImagenSeleccionada(null);
                    setEditandoCampo(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          <div className="profile-info">
            <div className="profile-data">
              <p>
                <strong>Usuario:</strong>
                {editandoCampo === 'username' ? (
                  <div className="edit-inline">
                    <input
                      type="text"
                      value={nuevoValor}
                      onChange={(e) => setNuevoValor(e.target.value)}
                      className="edit-input"
                    />
                    <button className="edit-btn" onClick={handleGuardarCambio}>
                      Guardar
                    </button>
                    <button className="edit-btn" onClick={handleCancelar}>
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <span>{usuario.username}</span>
                )}
                {editandoCampo !== 'username' && (
                  <button className="edit-btn" onClick={handleEditarUsername}>
                    Editar
                  </button>
                )}
              </p>
              <p>
                <strong>Email:</strong>
                {editandoCampo === 'email' ? (
                  <div className="edit-inline">
                    <input
                      type="email"
                      value={nuevoValor}
                      onChange={(e) => setNuevoValor(e.target.value)}
                      className="edit-input"
                    />
                    <button className="edit-btn" onClick={handleGuardarCambio}>
                      Guardar
                    </button>
                    <button className="edit-btn" onClick={handleCancelar}>
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <span>{usuario.email}</span>
                )}
                {editandoCampo !== 'email' && (
                  <button className="edit-btn" onClick={handleEditarEmail}>
                    Editar
                  </button>
                )}
              </p>
            </div>

            <div className="elo-container">
              <div className="elo-header">
                <h3>Nivel de Elo</h3>
                <span className="elo-level">Nivel {eloInfo.nivel}</span>
              </div>
              <div className="elo-progress">
                <div 
                  className="elo-progress-bar" 
                  style={{ width: `${eloInfo.progreso}%` }}
                />
              </div>
              <div className="elo-stats">
                <span>{eloInfo.eloActual} Elo</span>
                <span>{eloInfo.siguienteNivel} Elo para el siguiente nivel</span>
              </div>
            </div>

            <div className="profile-stats">
              <div className="stats-card">
                <h3>Partidas Jugadas</h3>
                <p>{usuario.partidasJugadas || 0}</p>
              </div>
              <div className="stats-card">
                <h3>Victorias</h3>
                <p>{usuario.victorias || 0}</p>
              </div>
              <div className="stats-card">
                <h3>Derrotas</h3>
                <p>{usuario.derrotas || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {mensaje && <p className="mensaje">{mensaje}</p>}
      </div>
    </>
  );
};

export default Perfil;
