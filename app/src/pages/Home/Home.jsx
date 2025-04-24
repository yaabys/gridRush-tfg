import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const comprobarSesion = async () => {
      try {
        const res = await axios.get('/api/comprobarSesion');
        setIsLoggedIn(res.data.logueado);
      } catch (err) {
        console.error("Error al comprobar sesión:", err);
        setIsLoggedIn(false);
      }
    };

    comprobarSesion();
  }, []);

  const handleExplorarClick = (e) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate('/principal');
    } else {
      navigate('/registro?formType=login');
    }
  };

  return (
    <div className='home-container'>
      <section className='hero'>
        <div className='hero-content'>
          <div className='hero-text'>
            <h1><span>GRID</span>RUSH</h1>
            <p className='hero-tagline'>La app definitiva para pilotos de karting</p>
            <p className='hero-sub'>
              Registra tus tiempos, compite con amigos, y escala posiciones como en una verdadera escudería.
            </p>
            <div className='hero-buttons'>
              <Link to='/registro' className='hero-button primary'>
                <span className='button-icon'>🏎️</span>
                ÚNETE A LA PARRILLA
              </Link>
              <a href="#" onClick={handleExplorarClick} className='hero-button secondary'>
                <span className='button-icon'>🔍</span>
                EXPLORAR APP
              </a>
            </div>
          </div>
          <div className='hero-image'>
            <div className='image-container'>
              <img src="/img/img.png" alt="Karting racing" />
            </div>
          </div>
        </div>
      </section>

      <section className='features'>
        <div className='features-header'>
          <h2>¿Por qué unirte a <span>GRIDRUSH</span>?</h2>
          <p className='features-subtitle'>Descubre todas las características que te harán dominar el asfalto</p>
        </div>
        <div className='features-grid'>
          <div className='feature-card'>
            <div className='feature-icon'>⏱️</div>
            <h3>Registra tus tiempos</h3>
            <p>Lleva el control de cada vuelta y mejora tus marcas personales en tiempo real.</p>
            <div className='feature-decoration'></div>
          </div>
          <div className='feature-card'>
            <div className='feature-icon'>🏆</div>
            <h3>Compite con amigos</h3>
            <p>Crea retos, entra en rankings y demuestra quién domina el asfalto.</p>
            <div className='feature-decoration'></div>
          </div>
          <div className='feature-card'>
            <div className='feature-icon'>🤝</div>
            <h3>Comunidad racing</h3>
            <p>Conecta con otros pilotos, comparte experiencias y crea tu escudería.</p>
            <div className='feature-decoration'></div>
          </div>
        </div>
      </section>

      <section className='stats'>
        <div className='stats-container'>
          <div className='stat-item'>
            <span className='stat-number'>1000+</span>
            <span className='stat-label'>Pilotos activos</span>
          </div>
          <div className='stat-item'>
            <span className='stat-number'>50+</span>
            <span className='stat-label'>Circuitos</span>
          </div>
          <div className='stat-item'>
            <span className='stat-number'>10000+</span>
            <span className='stat-label'>Vueltas registradas</span>
          </div>
        </div>
      </section>

      <section className='cta'>
        <div className='cta-content'>
          <h2>¿Listo para pisar el acelerador?</h2>
          <p>Únete a la comunidad más apasionada del karting y comienza tu carrera hacia la gloria.</p>
          <Link to='/registro' className='cta-button'>
            <span className='button-icon'>🚀</span>
            REGÍSTRATE AHORA
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
