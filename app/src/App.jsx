import { useState } from 'react'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './pages/home/Home'
import Register from './pages/register/Register'
import Index from './pages/index/Index'
import IndependentRace from './pages/independtRaces/IndependentRace'
import Seasons from './pages/seasons/Seasons'
import OfficialTournaments from './pages/officialTournaments/OfficialTournaments'
import Tracks from './pages/kartingTracks/Tracks'
import Profile from './pages/profile/Profile'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/registro' element={<Register />} />
          <Route path='/principal' element={<Index />} />
          <Route path='/carrerasLibres' element={<IndependentRace />} />
          <Route path='/temporadas' element={<Seasons />} />
          <Route path='/torneosOficiales' element={<OfficialTournaments />} />
          <Route path='/pistasKarting' element={<Tracks />} />
          <Route path='/perfil' element={<Profile />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
