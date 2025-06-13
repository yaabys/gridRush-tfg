import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const useAuth = () => {
  const navigate = useNavigate();
  
  const checkSession = async () => {
    try {
      const { data } = await axios.get("/api/comprobarSesion", { withCredentials: true });
      if (!data.logueado) {
        navigate("/registro");
        return false;
      }
      return true;
    } catch (err) {
      console.error("Error de sesión:", err);
      navigate("/registro");
      return false;
    }
  };

  return { checkSession };
};

export default useAuth; 