import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className='home-container'>
      <section className='hero'>
        <div className='hero-content'>
          <h1><span>GRID</span>RUSH</h1>
          <p className='hero-tagline'>La app definitiva para pilotos de karting.</p>
          <p className='hero-sub'>
            Registra tus tiempos, compite con amigos, y escala posiciones como en una verdadera escudería.
          </p>
          <Link to='/registro'>
            <button className='hero-button'>ÚNETE A LA PARRILLA</button>
          </Link>
        </div>
      </section>

      <section className='features'>
        <h2>¿Por qué unirte a GRIDRUSH?</h2>
        <div className='features-grid'>
          <div className='feature'>
            <span role='img' aria-label='cronómetro'>⏱️</span>
            <h3>Registra tus tiempos</h3>
            <p>Lleva el control de cada vuelta y mejora tus marcas personales en tiempo real.</p>
          </div>
          <div className='feature'>
            <span role='img' aria-label='ranking'>🏆</span>
            <h3>Compite con amigos</h3>
            <p>Crea retos, entra en rankings y demuestra quién domina el asfalto.</p>
          </div>
          <div className='feature'>
            <span role='img' aria-label='comunidad'>🤝</span>
            <h3>Comunidad racing</h3>
            <p>Conecta con otros pilotos, comparte experiencias y crea tu escudería.</p>
          </div>
        </div>
      </section>

      <section className='cta'>
        <h2>¿Listo para pisar el acelerador?</h2>
        <Link to='/registro'>
          <button className='hero-button'>Regístrate ahora</button>
        </Link>
      </section>
    </div>
  );
};

export default Home;
