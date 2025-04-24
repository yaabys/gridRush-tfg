import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SemaforoAnimacion from '../../components/SemaforoAnimacion/SemaforoAnimacion';
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
  const location = useLocation();

  useEffect(() => {
    const comprobarSesion = async () => {
      try {
        const res = await axios.get('/api/comprobarSesion');
        if (res.data.logueado) {
          navigate('/principal');
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
  const [formType, setFormType] = useState('register');
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const type = searchParams.get('formType');
    if (type === 'login') {
      setFormType('login');
    }
  }, [location]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormTypeChange = (type) => {
    setFormType(type);
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      if (formType === 'register') {
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
          case false:
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
      } else {
        const loginData = {
          username: form.username,
          password: form.password
        };
        
        const response = await axios.post('/api/login', loginData);
        
        if (response.status === 200) {
          setShowSemaforo(true);
          setTimeout(() => {
            navigate('/principal');
          }, 4000);
        } else {
          setErrorMsg('Credenciales incorrectas o error en el servidor.');
        }
      }
    } catch (error) {
      if (error.response) {
        setErrorMsg(error.response.data.error || "Error desconocido pongase en contacto con el administrador");
      } else {
        setErrorMsg("no se pudo conectar con el servidor verifica tu conexión con el servidor");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showSemaforo) {
    return <SemaforoAnimacion />;
  }

  return (
    <div className='register-container'>
      <div className='register-content'>
        <div className='register-header'>
          <h1 className='title'>GRID<span>RUSH</span></h1>
          <p className='subtitle'>¡Únete a la parrilla de salida!</p>
        </div>

        <div className='register-box'>
          <div className="form-type-buttons">
            <button 
              className={`form-type-button ${formType === 'register' ? 'active' : ''}`}
              onClick={() => handleFormTypeChange('register')}
            >
              <span className="button-icon">🏎️</span>
              Registrarse
            </button>
            <button 
              className={`form-type-button ${formType === 'login' ? 'active' : ''}`}
              onClick={() => handleFormTypeChange('login')}
            >
              <span className="button-icon">🔑</span>
              Iniciar Sesión
            </button>
          </div>

          <form onSubmit={handleSubmit} className='register-form'>
            {formType === 'register' ? (
              <>
                <div className="form-group">
                  <input 
                    type='text' 
                    name='nombre' 
                    placeholder='Nombre' 
                    value={form.nombre} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <input 
                    type='text' 
                    name='apellido' 
                    placeholder='Apellidos' 
                    value={form.apellido} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <input 
                    type='text' 
                    name='username' 
                    placeholder='Nombre de usuario' 
                    value={form.username} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <input 
                    type='date' 
                    name='nacimiento' 
                    value={form.nacimiento} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <input 
                    type='email' 
                    name='email' 
                    placeholder='Correo electrónico' 
                    value={form.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <select 
                    name='provincia' 
                    value={form.provincia} 
                    onChange={handleChange} 
                    required
                  >
                    <option value=''>Selecciona tu provincia</option>
                    {provincias.map((provincia) => (
                      <option key={provincia} value={provincia}>{provincia}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <input 
                    type='password' 
                    name='password' 
                    placeholder='Contraseña' 
                    value={form.password} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </>
            ) : ( //login
              <>
                <div className="form-group">
                  <input 
                    type='text' 
                    name='username' 
                    placeholder='Nombre de usuario o correo' 
                    value={form.username} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <input 
                    type='password' 
                    name='password' 
                    placeholder='Contraseña' 
                    value={form.password} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </>
            )}
            
            <button 
              type='submit' 
              className={`submit-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  <span className="button-icon">
                    {formType === 'register' ? '🏁' : '🚀'}
                  </span>
                  {formType === 'register' ? '¡A rodar!' : 'Iniciar Sesión'}
                </>
              )}
            </button>

            {errorMsg && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {errorMsg}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;