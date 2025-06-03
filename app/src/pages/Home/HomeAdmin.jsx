import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import axios from "axios";
import "./HomeAdmin.css";

// --- Subcomponente para cada Piloto (DnD) ---
function SortableRacerItem({ id, racer }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    border: isDragging ? "2px dashed var(--color-primary)" : "1px solid #444",
    zIndex: isDragging ? 999 : "auto",
    position: "relative",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="racer-item"
    >
      <span className="drag-handle">☰</span>
      <span className="racer-position">{racer.position}º</span>
      <span className="racer-name">{racer.name}</span>
      <span className="racer-elo">ELO: {racer.elo || 0}</span>
      <button className="view-photo-btn" title="Ver foto">
        📸
      </button>
    </div>
  );
}

// --- Componente para la Vista de Reordenación ---
function ReorderView({ item, onGoBack, onConfirm, mockParticipants }) {
  const [racers, setRacers] = useState(mockParticipants);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;

    setRacers((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const newArray = arrayMove(items, oldIndex, newIndex);
      return newArray.map((i, index) => ({ ...i, position: index + 1 }));
    });
  }

  const handleConfirm = async () => {
    try {
      const endpoint =
        item.type === "race"
          ? "/api/admin/confirmar-carrera"
          : "/api/admin/confirmar-torneo";

      const payload =
        item.type === "race"
          ? { carreraId: item.id, resultados: racers }
          : { torneoId: item.id, resultados: racers };

      await axios.post(endpoint, payload, { withCredentials: true });
      onConfirm(racers);
    } catch (error) {
      console.error("Error al confirmar resultados:", error);
      alert("Error al confirmar resultados");
    }
  };

  if (loading) {
    return (
      <div className="admin-race-view">
        <button className="back-button" onClick={onGoBack}>
          ← Volver
        </button>
        <h2>Cargando participantes...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-race-view">
        <button className="back-button" onClick={onGoBack}>
          ← Volver
        </button>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-race-view">
      <button className="back-button" onClick={onGoBack}>
        ← Volver
      </button>
      <h2>Validar Resultados - {item.name}</h2>
      <p>Arrastra y suelta los pilotos para establecer el orden final.</p>
      <p className="points-info">
        <strong>Sistema de puntos:</strong> 1º=25pts, 2º=18pts, 3º=15pts,
        4º=12pts, 5º=10pts, 6º=8pts, 7º=6pts, 8º=4pts, 9º=2pts, 10º=1pt
        {item.type === "tournament" && " (Torneos otorgan el doble de puntos)"}
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={racers.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="racer-list-container">
            {racers.length === 0 ? (
              <p>No hay participantes para validar</p>
            ) : (
              racers.map((racer) => (
                <SortableRacerItem key={racer.id} id={racer.id} racer={racer} />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      {racers.length > 0 && (
        <button className="confirm-button" onClick={handleConfirm}>
          Confirmar Resultados
        </button>
      )}
    </div>
  );
}

// --- Componente para la Vista de Lista ---
function ListView({ title, items, onSelectItem, onGoBack }) {
  return (
    <div className="list-view">
      <button className="back-button" onClick={onGoBack}>
        ← Volver
      </button>
      <h2>{title} Pendientes de Validación</h2>
      {items.length === 0 ? (
        <p className="no-items-message">
          ¡No hay {title.toLowerCase()} pendientes!
        </p>
      ) : (
        <ul className="item-list">
          {items.map((item) => (
            <li key={item.id} onClick={() => onSelectItem(item)}>
              <span>{item.name}</span>
              <span className="item-date">{item.date}</span>
              <span className="item-action">Validar →</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// --- Componente para la Vista de Selección Inicial ---
function SelectionView({ onShowRaces, onShowTournaments }) {
  return (
    <div className="selection-view">
      <h2>¿Qué deseas gestionar?</h2>
      <div className="selection-buttons">
        <button onClick={onShowRaces}>
          <span className="btn-icon">🏁</span>
          Gestionar Carreras
        </button>
        <button onClick={onShowTournaments}>
          <span className="btn-icon">🏆</span>
          Gestionar Torneos
        </button>
      </div>
    </div>
  );
}

// --- Componente Principal: HomeAdmin ---
function HomeAdmin() {
  const [view, setView] = useState("selection");
  const [selectedItem, setSelectedItem] = useState(null);
  const [history, setHistory] = useState(["selection"]);
  
  // Mock data para demostración
  const mockRaces = [
    {
      id: 1,
      name: "Carrera Nocturna de Madrid",
      date: "2024-03-20",
      type: "race"
    },
    {
      id: 2,
      name: "Gran Premio de Barcelona",
      date: "2024-03-25",
      type: "race"
    },
    {
      id: 3,
      name: "Carrera Urbana de Valencia",
      date: "2024-03-28",
      type: "race"
    }
  ];

  const mockTournaments = [
    {
      id: 1,
      name: "Campeonato de España 2024",
      date: "2024-04-01",
      type: "tournament"
    },
    {
      id: 2,
      name: "Copa Ibérica",
      date: "2024-04-15",
      type: "tournament"
    }
  ];

  const mockParticipants = [
    { id: 1, name: "Carlos Sainz", position: 1, elo: 1850 },
    { id: 2, name: "Fernando Alonso", position: 2, elo: 1820 },
    { id: 3, name: "Lando Norris", position: 3, elo: 1780 },
    { id: 4, name: "Max Verstappen", position: 4, elo: 1900 },
    { id: 5, name: "Lewis Hamilton", position: 5, elo: 1880 },
    { id: 6, name: "Charles Leclerc", position: 6, elo: 1840 },
    { id: 7, name: "George Russell", position: 7, elo: 1760 },
    { id: 8, name: "Oscar Piastri", position: 8, elo: 1720 }
  ];

  const [races, setRaces] = useState(mockRaces);
  const [tournaments, setTournaments] = useState(mockTournaments);
  const [loading, setLoading] = useState(false);

  const navigateTo = (newView) => {
    setHistory([...history, newView]);
    setView(newView);
  };

  const handleGoBack = () => {
    const newHistory = [...history];
    newHistory.pop();
    const prevView = newHistory[newHistory.length - 1];
    setHistory(newHistory);
    setView(prevView);
    setSelectedItem(null);
  };

  // Modificamos las funciones fetch para usar los datos mock
  const fetchRaces = async () => {
    setLoading(true);
    // Simulamos una llamada a la API
    setTimeout(() => {
      setRaces(mockRaces);
      setLoading(false);
    }, 500);
  };

  const fetchTournaments = async () => {
    setLoading(true);
    // Simulamos una llamada a la API
    setTimeout(() => {
      setTournaments(mockTournaments);
      setLoading(false);
    }, 500);
  };

  const handleShowRaces = async () => {
    await fetchRaces();
    navigateTo("raceList");
  };

  const handleShowTournaments = async () => {
    await fetchTournaments();
    navigateTo("tournamentList");
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    navigateTo("reorder");
  };

  const handleConfirmResults = (finalOrder) => {
    alert(`Resultados para ${selectedItem.name} confirmados correctamente!`);
    console.log("Orden final:", finalOrder);
    handleGoBack();
  };

  // Modificamos el ReorderView para usar los datos mock
  const renderView = () => {
    if (loading) {
      return (
        <div className="selection-view">
          <h2>Cargando...</h2>
        </div>
      );
    }

    switch (view) {
      case "raceList":
        return (
          <ListView
            title="Carreras"
            items={races}
            onSelectItem={handleSelectItem}
            onGoBack={handleGoBack}
          />
        );
      case "tournamentList":
        return (
          <ListView
            title="Torneos"
            items={tournaments}
            onSelectItem={handleSelectItem}
            onGoBack={handleGoBack}
          />
        );
      case "reorder":
        return (
          <ReorderView
            item={selectedItem}
            onGoBack={handleGoBack}
            onConfirm={handleConfirmResults}
            mockParticipants={mockParticipants}
          />
        );
      default:
        return (
          <SelectionView
            onShowRaces={handleShowRaces}
            onShowTournaments={handleShowTournaments}
          />
        );
    }
  };

  return (
    <div className="home-admin-container">
      <div className="admin-header">
        <h1>Panel de Administración - GridRush</h1>
        <p>Gestiona las carreras y valida los resultados.</p>
      </div>
      {renderView()}
    </div>
  );
}

export default HomeAdmin;
