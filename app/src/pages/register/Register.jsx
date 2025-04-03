import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SemaforoAnimacion from '../../components/SemaforoAnimacion';
import './Register.css';

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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSemaforo(true);

    setTimeout(() => {
      navigate('/principal'); 
    }, 4000);
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
          <input type='text' name='apellido' placeholder='Apellido' value={form.apellido} onChange={handleChange} required />
          <input type='text' name='username' placeholder='Nombre de usuario' value={form.username} onChange={handleChange} required />
          <input type='date' name='nacimiento' value={form.nacimiento} onChange={handleChange} required />
          <input type='email' name='email' placeholder='Correo electrónico' value={form.email} onChange={handleChange} required />
          <select name='provincia' value={form.provincia} onChange={handleChange} required>
            <option value=''>Selecciona tu provinciaa</option>
            {provincias.map((provincia) => (
              <option key={provincia} value={provincia}>{provincia}</option>
            ))}
          </select>
          <input type='password' name='password' placeholder='Contraseña' value={form.password} onChange={handleChange} required />
          <button type='submit'>¡A rodar!</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
