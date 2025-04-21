import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SemaforoAnimacion from '../../components/SemaforoAnimacion';
import './Register.css';
import axios from 'axios';

const provincias = [
  'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz', 'Barcelona',
  'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ciudad Real', 'Córdoba', 'Cuenca',
  'Gerona', 'Granada', 'Guadalajara', 'Guipúzcoa', 'Huelva', 'Huesca', 'Islas Baleares', 'Jaén',
  'La Coruña', 'La Rioja', 'Las Palmas', 'León', 'Lérida', 'Lugo', 'Madrid', 'Málaga', 'Murcia',
  'Navarra', 'Orense', 'Palencia', 'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife', 'Segovia',
  'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Vizcaya',
  'Zamora', 'Zaragoza'
];


const Register = () => {

  const navigate = useNavigate();

   // comprobamos si hay sesión activa
   useEffect(() => {
    const comprobarSesion = async () => {
      try {
        const res = await axios.get('/api/sesion');
        if (res.data.logueado) {
          navigate('/principal'); // redirige si ya está logueado
        }
      } catch (err) {
        console.log("Error al comprobar sesión:", err);
      }
    };

    comprobarSesion();
  }, [navigate]);

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    username: '',
    nacimiento: '',
    email: '',
    provincia: '',
    password: '',
  });

  const [showSemaforo, setShowSemaforo] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); // evita el refresh de la página
  
    try {
      const response = await axios.post('/api/register', form);
      switch (response.status) {
        case 400:
          setErrorMsg('Faltan campos requeridos.');
          break;
        case 409:
          setErrorMsg('El correo o el nombre de usuario ya están registrados.');
          break;
        case 500:
          setErrorMsg('Error en el servidor. Intenta nuevamente.');
          break;
        case false: //si tiene sesion activa
          navigate('/principal');
          break;
        default:
          setErrorMsg('Algo salió mal. Intenta de nuevo.');
          break;
      }      

      if (response.status === 201) {
        setShowSemaforo(true);
        setTimeout(() => {
          navigate('/principal');
        }, 4000);
      }
    } catch (error) {
      if (error.response) {
        setErrorMsg(error.response.data.error || "Error desconocido pongase en contacto con el administrador");
      } else {
        setErrorMsg("no se pudo conectar con el servidor verifica tu conexión con el servidor");
      }
    }
  };
  

  if (showSemaforo) {
    return <SemaforoAnimacion />;
  }

  return (
    <div className='register-container'>
      <div className='register-box'>
        <h1 className='title'>GRID<span>RUSH</span></h1>
        <p className='subtitle'>¡Únete a la parrilla de salida!</p>

        <form onSubmit={handleSubmit} className='register-form'>
          <input type='text' name='nombre' placeholder='Nombre' value={form.nombre} onChange={handleChange} required />
          <input type='text' name='apellido' placeholder='Apellidos' value={form.apellido} onChange={handleChange} required />
          <input type='text' name='username' placeholder='Nombre de usuario' value={form.username} onChange={handleChange} required />
          <input type='date' name='nacimiento' value={form.nacimiento} onChange={handleChange} required />
          <input type='email' name='email' placeholder='Correo electrónico' value={form.email} onChange={handleChange} required />
          <select name='provincia' value={form.provincia} onChange={handleChange} required>
            <option value=''>Selecciona tu provincia</option>
            {provincias.map((provincia) => (
              <option key={provincia} value={provincia}>{provincia}</option>
            ))}
          </select>
          <input type='password' name='password' placeholder='Contraseña' value={form.password} onChange={handleChange} required />
          <button type='submit'>¡A rodar!</button>
          {/*por si falla el registro*/}
          {errorMsg && <p className="error-message">{errorMsg}</p>}
        </form>
      </div>
    </div>
  );
};

export default Register;