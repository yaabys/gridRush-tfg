import './SemaforoAnimacion.css';

const SemaforoAnimacion = () => {
  return (
    <div className='semaforo'>
      <div className='luces'>
        <div className='luz rojo1' />
        <div className='luz rojo2' />
        <div className='luz rojo3' />
        <div className='luz rojo4' />
        <div className='luz rojo5' />
      </div>
    </div>
  );
};

export default SemaforoAnimacion;
