import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './pages/Home'
import Registro from './pages/Registro'
import Principal from './pages/Principal'
import CarrerasLibres from './pages/CarrerasLibres'
import Temporadas from './pages/Temporadas'
import TorneosOficiales from './pages/TorneosOficiales'
import PistasKarting from './pages/PistasKarting'
import Perfil from './pages/Perfil'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/registro' element={<Registro />} />
          <Route path='/principal' element={<Principal />} />
          <Route path='/carrerasLibres' element={<CarrerasLibres />} />
          <Route path='/temporadas' element={<Temporadas />} />
          <Route path='/torneosOficiales' element={<TorneosOficiales />} />
          <Route path='/pistasKarting' element={<PistasKarting />} />
          <Route path='/perfil' element={<Perfil />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
