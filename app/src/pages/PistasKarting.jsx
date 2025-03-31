import Header from '../components/Header';
import './PistasKarting.css';

const PistasKarting = () => {   

    return (
        <div className='pistasKarting'>
            <Header />
            <div className='pistasKarting__container'>
                <h1>Pistas de Karting</h1>
                <p>En esta sección podrás encontrar las pistas de karting de GridRush.</p>
                <p>Pronto estarán disponibles.</p>
            </div>
        </div>
    )
}

export default PistasKarting;