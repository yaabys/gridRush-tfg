import { Link } from 'react-router-dom';
import './Header.css';
import DarkModeToggle from './buttonDarkMode.jsx'; // Asegúrate de que la ruta sea correcta

const Header = () => {
  return (
    <header className='header'>
      <div className='header-left'>
        <Link to='/principal' className='app-name'>
          GRID<span>RUSH</span>
        </Link>
      </div>
      <nav className='nav-links'>
        <Link to='/pistasKarting'>Pistas Karting</Link>
        <Link to='/torneosOficiales'>Torneos Oficiales</Link>
        <Link to='/carrerasLibres'>Carreras Libres</Link>
        <Link to='/temporadas'>Temporadas</Link>
      </nav>
      
      <div className='header-right'>
        <div>
      <DarkModeToggle />
      </div>
        <Link to='/perfil' className='perfil-link'>👤 Perfil</Link>
      </div>
    </header>
  );
};

export default Header;
