import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import axios from 'axios';
import './HomeAdmin.css'; 

// --- Subcomponente para cada Piloto (DnD) ---
function SortableRacerItem({ id, racer }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform), 
    transition, 
    opacity: isDragging ? 0.5 : 1,
    border: isDragging ? '2px dashed var(--color-primary)' : '1px solid #444',
    zIndex: isDragging ? 999 : 'auto', 
    position: 'relative',
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="racer-item">
      <span className="drag-handle">☰</span>
      <span className="racer-position">{racer.position}º</span>
      <span className="racer-name">{racer.name}</span>
      <span className="racer-elo">ELO: {racer.elo || 0}</span>
      <button className="view-photo-btn" title="Ver foto">📸</button>
    </div>
  );
}

// --- Componente para la Vista de Reordenación ---
function ReorderView({ item, onGoBack, onConfirm }) {
  const [racers, setRacers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const endpoint = item.type === 'race' 
          ? `/api/admin/carrera/${item.id}/participantes`
          : `/api/admin/torneo/${item.id}/participantes`;
          
        const response = await axios.get(endpoint, { withCredentials: true });
        setRacers(response.data);
      } catch (error) {
        console.error('Error al obtener participantes:', error);
        setError('Error al cargar los participantes');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [item]);

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
      const endpoint = item.type === 'race' 
        ? '/api/admin/confirmar-carrera'
        : '/api/admin/confirmar-torneo';
        
      const payload = item.type === 'race'
        ? { carreraId: item.id, resultados: racers }
        : { torneoId: item.id, resultados: racers };

      await axios.post(endpoint, payload, { withCredentials: true });
      onConfirm(racers);
    } catch (error) {
      console.error('Error al confirmar resultados:', error);
      alert('Error al confirmar resultados');
    }
  };

  if (loading) {
    return (
      <div className="admin-race-view">
        <button className="back-button" onClick={onGoBack}>← Volver</button>
        <h2>Cargando participantes...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-race-view">
        <button className="back-button" onClick={onGoBack}>← Volver</button>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-race-view">
      <button className="back-button" onClick={onGoBack}>← Volver</button>
      <h2>Validar Resultados - {item.name}</h2>
      <p>Arrastra y suelta los pilotos para establecer el orden final.</p>
      <p className="points-info">
        <strong>Sistema de puntos:</strong> 1º=25pts, 2º=18pts, 3º=15pts, 4º=12pts, 5º=10pts, 6º=8pts, 7º=6pts, 8º=4pts, 9º=2pts, 10º=1pt
        {item.type === 'tournament' && ' (Torneos otorgan el doble de puntos)'}
      </p>
      
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={racers.map(r => r.id)} strategy={verticalListSortingStrategy}>
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
      <button className="back-button" onClick={onGoBack}>← Volver</button>
      <h2>{title} Pendientes de Validación</h2>
      {items.length === 0 ? (
        <p className="no-items-message">¡No hay {title.toLowerCase()} pendientes!</p>
      ) : (
        <ul className="item-list">
          {items.map(item => (
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
  const [view, setView] = useState('selection');
  const [selectedItem, setSelectedItem] = useState(null);
  const [history, setHistory] = useState(['selection']);
  const [races, setRaces] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigateTo = (newView) => {
    setHistory([...history, newView]);
    setView(newView);
  }

  const handleGoBack = () => {
    const newHistory = [...history];
    newHistory.pop();
    const prevView = newHistory[newHistory.length - 1];
    setHistory(newHistory);
    setView(prevView);
    setSelectedItem(null);
  };

  const fetchRaces = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/carreras-pendientes', { 
        withCredentials: true 
      });
      setRaces(response.data);
    } catch (error) {
      console.error('Error al obtener carreras:', error);
      setRaces([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/torneos-pendientes', { 
        withCredentials: true 
      });
      setTournaments(response.data);
    } catch (error) {
      console.error('Error al obtener torneos:', error);
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowRaces = async () => {
    await fetchRaces();
    navigateTo('raceList');
  };

  const handleShowTournaments = async () => {
    await fetchTournaments();
    navigateTo('tournamentList');
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    navigateTo('reorder');
  };

  const handleConfirmResults = (finalOrder) => {
    alert(`Resultados para ${selectedItem.name} confirmados correctamente!`);
    console.log('Orden final:', finalOrder);
    
    // Refrescar la lista correspondiente
    if (selectedItem.type === 'race') {
      fetchRaces();
    } else {
      fetchTournaments();
    }
    
    handleGoBack();
  };

  const renderView = () => {
    if (loading) {
      return (
        <div className="selection-view">
          <h2>Cargando...</h2>
        </div>
      );
    }

    switch (view) {
      case 'raceList':
        return (
          <ListView 
            title="Carreras" 
            items={races} 
            onSelectItem={handleSelectItem} 
            onGoBack={handleGoBack} 
          />
        );
      case 'tournamentList':
        return (
          <ListView 
            title="Torneos" 
            items={tournaments} 
            onSelectItem={handleSelectItem} 
            onGoBack={handleGoBack} 
          />
        );
      case 'reorder':
        return (
          <ReorderView 
            item={selectedItem} 
            onGoBack={handleGoBack} 
            onConfirm={handleConfirmResults} 
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