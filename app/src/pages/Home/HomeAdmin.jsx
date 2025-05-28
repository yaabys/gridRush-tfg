import React, { useState } from 'react';
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
import './HomeAdmin.css'; 

// --- DATOS DE EJEMPLO ---
const MOCK_RACES = [
  { id: 'r1', name: 'Gran Premio Fuenlabrada', date: '2025-05-25', status: 'Pendiente' },
  { id: 'r2', name: 'Copa Karting Sur', date: '2025-05-18', status: 'Pendiente' },
  { id: 'r3', name: 'Carrera Inaugural', date: '2025-05-10', status: 'Confirmada' },
];

const MOCK_TOURNAMENTS = [
  { id: 't1', name: 'Campeonato de Verano', date: '2025-05-20', status: 'Pendiente' },
  { id: 't2', name: 'Torneo Relámpago', date: '2025-05-01', status: 'Confirmada' },
];

const MOCK_RACERS_R1 = [ // Pilotos para la carrera r1
  { id: '1', name: 'Rayo McQueen', position: 1 }, { id: '2', name: 'Mate', position: 2 },
  { id: '3', name: 'Sally Carrera', position: 3 }, { id: '4', name: 'Doc Hudson', position: 4 },
];
const MOCK_RACERS_R2 = [ // Pilotos para la carrera r2
  { id: '5', name: 'Chick Hicks', position: 1 }, { id: '6', name: 'Luigi', position: 2 },
  { id: '7', name: 'Guido', position: 3 },
];
const MOCK_RACERS_T1 = [ // Pilotos para el torneo t1
  { id: '1', name: 'Rayo McQueen', position: 1 }, { id: '5', name: 'Chick Hicks', position: 2 },
  { id: '3', name: 'Sally Carrera', position: 3 },
];
// ------------------------

// --- Subcomponente para cada Piloto (DnD) ---
function SortableRacerItem({ id, racer }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1,
    border: isDragging ? '2px dashed var(--color-primary)' : '1px solid #444',
    zIndex: isDragging ? 999 : 'auto', position: 'relative',
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="racer-item">
      <span className="drag-handle">☰</span>
      <span className="racer-position">{racer.position}º</span>
      <span className="racer-name">{racer.name}</span>
      <button className="view-photo-btn" title="Ver foto">📸</button>
    </div>
  );
}

// --- Componente para la Vista de Reordenación ---
function ReorderView({ item, onGoBack, onConfirm }) {
  // En un caso real, buscarías los pilotos según item.id
  // Por ahora, usamos datos mock basados en el ID.
  const getMockRacers = (itemId) => {
      if (itemId === 'r1') return MOCK_RACERS_R1;
      if (itemId === 'r2') return MOCK_RACERS_R2;
      if (itemId === 't1') return MOCK_RACERS_T1;
      return [];
  }

  const [racers, setRacers] = useState(getMockRacers(item.id));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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

  return (
    <div className="admin-race-view">
        <button className="back-button" onClick={onGoBack}>← Volver</button>
        <h2>Validar Resultados - {item.name}</h2>
        <p>Arrastra y suelta los pilotos para establecer el orden final.</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={racers.map(r => r.id)} strategy={verticalListSortingStrategy}>
                <div className="racer-list-container">
                    {racers.map((racer) => (
                        <SortableRacerItem key={racer.id} id={racer.id} racer={racer} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
        <button className="confirm-button" onClick={() => onConfirm(racers)}>
            Confirmar Resultados
        </button>
    </div>
  );
}

// --- Componente para la Vista de Lista ---
function ListView({ title, items, onSelectItem, onGoBack }) {
  const pendingItems = items.filter(item => item.status === 'Pendiente');

  return (
    <div className="list-view">
        <button className="back-button" onClick={onGoBack}>← Volver</button>
        <h2>{title} Pendientes de Validación</h2>
        {pendingItems.length === 0 ? (
            <p className="no-items-message">¡No hay {title.toLowerCase()} pendientes!</p>
        ) : (
            <ul className="item-list">
            {pendingItems.map(item => (
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
  const [view, setView] = useState('selection'); // 'selection', 'raceList', 'tournamentList', 'reorder'
  const [selectedItem, setSelectedItem] = useState(null);
  const [history, setHistory] = useState(['selection']); // Para el botón 'Volver'

  const navigateTo = (newView) => {
      setHistory([...history, newView]);
      setView(newView);
  }

  const handleGoBack = () => {
      const newHistory = [...history];
      newHistory.pop(); // Quita la vista actual
      const prevView = newHistory[newHistory.length - 1]; // Obtiene la anterior
      setHistory(newHistory);
      setView(prevView);
      setSelectedItem(null); // Limpiamos la selección al volver
  };

  const handleShowRaces = () => navigateTo('raceList');
  const handleShowTournaments = () => navigateTo('tournamentList');

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    navigateTo('reorder');
  };

  const handleConfirmResults = (finalOrder) => {
    console.log(`Confirmando ${selectedItem.type}: ${selectedItem.name}`, finalOrder);
    alert(`Resultados para ${selectedItem.name} confirmados!`);
    // Aquí iría la llamada API para guardar
    handleGoBack(); // Volvemos a la lista después de confirmar
  };

  const renderView = () => {
    switch (view) {
      case 'raceList':
        return <ListView title="Carreras" items={MOCK_RACES.map(r => ({...r, type: 'race'}))} onSelectItem={handleSelectItem} onGoBack={handleGoBack} />;
      case 'tournamentList':
        return <ListView title="Torneos" items={MOCK_TOURNAMENTS.map(t => ({...t, type: 'tournament'}))} onSelectItem={handleSelectItem} onGoBack={handleGoBack} />;
      case 'reorder':
        return <ReorderView item={selectedItem} onGoBack={handleGoBack} onConfirm={handleConfirmResults} />;
      default:
        return <SelectionView onShowRaces={handleShowRaces} onShowTournaments={handleShowTournaments} />;
    }
  };

  return (
    <div className="home-admin-container">
      <div className="admin-header">
        <h1>Panel de Administración - GridRush</h1>
        <p>Gestiona las carreras y valida los resultados.</p>
      </div>
      {renderView()} {/* Renderiza la vista actual */}
    </div>
  );
}

export default HomeAdmin;