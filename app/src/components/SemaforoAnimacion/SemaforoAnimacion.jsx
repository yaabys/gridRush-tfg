import { useEffect, useState } from 'react';
import './semaforoAnimacion.css';

const SemaforoAnimacion = () => {
  const [mostrarGo, setMostrarGo] = useState(false);
  const [mostrarLuces, setMostrarLuces] = useState(true);

  useEffect(() => {
    const timerLuces = setTimeout(() => {
      setMostrarLuces(false);   
      setMostrarGo(true);        
    }, 2500);

    const timerGo = setTimeout(() => {
      setMostrarGo(false);       
    }, 3500);

    return () => {
      clearTimeout(timerLuces);
      clearTimeout(timerGo);
    };
  }, []);

  return (
    <div className='semaforo'>
      {mostrarLuces && (
        <div className='luces'>
          <div className='luz rojo1' />
          <div className='luz rojo2' />
          <div className='luz rojo3' />
          <div className='luz rojo4' />
          <div className='luz rojo5' />
        </div>
      )}

      {mostrarGo && <div className='go-text'>GO!</div>}
    </div>
  );
};

export default SemaforoAnimacion;
