import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home/Home";
import HomeAdmin from "./pages/Home/HomeAdmin";
import Register from "./pages/Register/Register";
import Index from "./pages/Index/Index";
import IndependentRace from "./pages/IndependtRaces/IndependentRace";
import IndependentRaceInside from "./pages/IndependtRacesInside/IndependentRaceInside";
import Seasons from "./pages/Seasons/Seasons";
import OfficialTournaments from "./pages/OfficialTournaments/OfficialTournaments";
import OfficialTournamentInside from "./pages/OfficialTournamentInside/OfficialTournamentInside";
import Tracks from "./pages/KartingTracks/Tracks";
import Profile from "./pages/Profile/Profile";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<HomeAdmin />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/principal" element={<Index />} />
          <Route path="/carrerasLibres" element={<IndependentRace />} />
          <Route
            path="/carrera-libre/:id"
            element={<IndependentRaceInside />}
          />
          <Route path="/temporadas" element={<Seasons />} />
          <Route path="/torneosOficiales" element={<OfficialTournaments />} />
          <Route path="/torneo/:id" element={<OfficialTournamentInside />} />
          <Route path="/pistasKarting" element={<Tracks />} />
          <Route path="/perfil" element={<Profile />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
