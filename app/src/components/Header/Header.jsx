import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./header.css";
import DarkModeToggle from "../ButtonDarkMode/ButtonDarkMode";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Efecto para detectar el scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  // Verificar si el link está activo
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="header-left">
        <Link to="/principal" className="app-name">
          <span className="app-name-grid">GRID</span>
          <span className="app-name-rush">RUSH</span>
        </Link>
      </div>

      <nav className="nav-links">
        <Link
          to="/pistasKarting"
          className={isActive("/pistasKarting") ? "active" : ""}
        >
          <span className="link-text">Pistas Karting</span>
          <span className="link-indicator"></span>
        </Link>
        <Link
          to="/torneosOficiales"
          className={isActive("/torneosOficiales") ? "active" : ""}
        >
          <span className="link-text">Torneos Oficiales</span>
          <span className="link-indicator"></span>
        </Link>
        <Link
          to="/carrerasLibres"
          className={isActive("/carrerasLibres") ? "active" : ""}
        >
          <span className="link-text">Carreras Libres</span>
          <span className="link-indicator"></span>
        </Link>
        <Link
          to="/temporadas"
          className={isActive("/temporadas") ? "active" : ""}
        >
          <span className="link-text">Temporadas</span>
          <span className="link-indicator"></span>
        </Link>
      </nav>

      <div className="header-right">
        <Link
          to="/perfil"
          className={`perfil-link ${isActive("/perfil") ? "active" : ""}`}
        >
          <div className="perfil-icon">👤</div>
          <span className="perfil-text">Perfil</span>
        </Link>
        <div className="dark-mode-container">
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
