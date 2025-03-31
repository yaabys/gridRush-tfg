import Header from '../components/Header';
import './Perfil.css';
//import fotoDefault from '../assets/default-avatar.png'; // poné una imagen en esa ruta

const Perfil = () => {
  const user = {
    nombre: 'Álvaro',
    apellido: 'López',
    username: 'alvarorush',
    email: 'alvaro@example.com',
    provincia: 'Madrid',
    nacimiento: '2000-04-15',
    //avatar: fotoDefault
  };

  const handleLogout = () => {
    alert('Sesión cerrada');
  };

  const handleCambiarUsername = () => {
    alert('Cambio de nombre de usuario');
  };

  const handleCambiarPassword = () => {
    alert('Cambio de contraseña');
  };

  const handleCambiarAvatar = () => {
    alert('Cambiar foto de perfil (por implementar)');
  };

  return (
    <>
      <Header />
      <div className='perfil-container'>
        <h2>👤 Mi perfil</h2>

        <div className='perfil-avatar'>
          <img src={user.avatar} alt='Foto de perfil' />
          <button onClick={handleCambiarAvatar}>📷 Cambiar foto</button>
        </div>

        <div className='perfil-datos'>
          <p><strong>Nombre:</strong> {user.nombre} {user.apellido}</p>
          <p><strong>Usuario:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Provincia:</strong> {user.provincia}</p>
          <p><strong>Nacimiento:</strong> {user.nacimiento}</p>
        </div>

        <div className='perfil-acciones'>
          <button onClick={handleCambiarUsername}>✏️ Cambiar nombre de usuario</button>
          <button onClick={handleCambiarPassword}>🔐 Cambiar contraseña</button>
          <button className='logout' onClick={handleLogout}>🚪 Cerrar sesión</button>
        </div>
      </div>
    </>
  );
};

export default Perfil;
