import React, { useState, useEffect } from "react"; // Importa useEffect
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
    </div>
  );
}

function ReorderView({ item, onGoBack, onConfirm }) {
  const [racers, setRacers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const fetchParticipants = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Intentando obtener participantes para:", item);
      const endpoint = item.type === "race" 
        ? `/carrera/${item.id}/participantes`
        : `/torneo/${item.id}/participantes`;
      
      console.log("Llamando al endpoint:", endpoint);
      const response = await axios.get(endpoint, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log("Respuesta del servidor:", response.data);
      if (response.data && Array.isArray(response.data)) {
        setRacers(response.data);
      } else {
        throw new Error("Formato de respuesta inválido");
      }
    } catch (error) {
      console.error("Error detallado:", error);
      setError(error.response?.data?.error || "Error al cargar participantes. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
    setLoading(true);
    setSuccessMessage(null);
    setError(null);
    try {
      console.log("Confirmando resultados para:", item);
      const endpoint = item.type === "race"
        ? "/confirmar-carrera"
        : "/confirmar-torneo";

      const payload = item.type === "race"
        ? { carreraId: item.id, resultados: racers }
        : { torneoId: item.id, resultados: racers };

      console.log("Enviando payload:", payload);
      const response = await axios.post(endpoint, payload, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log("Respuesta de confirmación:", response.data);
      setSuccessMessage(response.data.message);
      onConfirm();
    } catch (error) {
      console.error("Error detallado al confirmar:", error);
      setError(error.response?.data?.error || "Error al confirmar resultados. Por favor, revisa la consola para más detalles.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-race-view">
        <button className="back-button" onClick={onGoBack}>← Volver</button>
        <p className="loading-message">Cargando participantes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-race-view">
        <button className="back-button" onClick={onGoBack}>← Volver</button>
        <p className="error-message">{error}</p>
        <button className="confirm-button" onClick={() => fetchParticipants()}>Reintentar Carga</button> {/* Botón de reintentar */}
      </div>
    );
  }

  return (
    <div className="admin-race-view">
      <button className="back-button" onClick={onGoBack}>← Volver</button>
      <h2>Validar Resultados - {item.name}</h2>
      <p>Arrastra y suelta los pilotos para establecer el orden final.</p>
      <p className="points-info">
        <strong>Sistema de puntos:</strong> 1º=25pts, 2º=18pts, 3º=15pts,
        4º=12pts, 5º=10pts, 6º=8pts, 7º=6pts, 8º=4pts, 9º=2pts, 10º=1pt
        {item.type === "tournament" && " (Torneos otorgan el doble de puntos)"}
      </p>

      {successMessage && <div className="success-message">{successMessage}</div>} {/* Mostrar mensaje de éxito */}

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
              <p className="no-items-message">No hay participantes para validar</p>
            ) : (
              racers.map((racer) => (
                <SortableRacerItem key={racer.id} id={racer.id} racer={racer} />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      {racers.length > 0 && (
        <button className="confirm-button" onClick={handleConfirm} disabled={loading}> {/* Deshabilitar durante la carga */}
          {loading ? "Confirmando..." : "Confirmar Resultados"}
        </button>
      )}
    </div>
  );
}

function ListView({ title, items, onSelectItem, onGoBack }) {
  return (
    <div className="list-view">
      <button className="back-button" onClick={onGoBack}>← Volver</button>
      <h2>{title} Pendientes de Validación</h2>
      {items.length === 0 ? (
        <p className="no-items-message">¡No hay {title.toLowerCase()} pendientes!</p>
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

function HomeAdmin() {
  const [view, setView] = useState("selection");
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [globalSuccessMessage, setGlobalSuccessMessage] = useState(null); // Para el mensaje global de éxito

  const fetchItems = async (type) => {
    setLoading(true);
    setError(null);
    setGlobalSuccessMessage(null);
    try {
      console.log("Intentando obtener items de tipo:", type);
      const endpoint = type === "race" 
        ? "/carreras-pendientes"
        : "/torneos-pendientes";
      
      console.log("Llamando al endpoint:", endpoint);
      const response = await axios.get(endpoint, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log("Respuesta del servidor:", response.data);
      if (response.data && Array.isArray(response.data)) {
        setItems(response.data);
        setView(type === "race" ? "raceList" : "tournamentList");
      } else {
        throw new Error("Formato de respuesta inválido");
      }
    } catch (error) {
      console.error("Error detallado:", error);
      setError(error.response?.data?.error || "Error al cargar los datos. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    setView("selection");
    setSelectedItem(null);
    setItems([]);
    setGlobalSuccessMessage(null); // Limpiar mensaje de éxito al volver
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setView("reorder");
  };

  const handleConfirmResults = () => {
    setGlobalSuccessMessage("Resultados confirmados correctamente. ¡Excelente trabajo!");
    handleGoBack(); // Volver a la selección después de confirmar
  };

  const renderView = () => {
    if (loading) {
      return (
        <div className="selection-view">
          <p className="loading-message">Cargando...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="selection-view">
          <p className="error-message">{error}</p>
          <button className="confirm-button" onClick={() => setError(null)}>Volver a intentar</button>
        </div>
      );
    }

    switch (view) {
      case "raceList":
        return (
          <ListView
            title="Carreras"
            items={items}
            onSelectItem={handleSelectItem}
            onGoBack={handleGoBack}
          />
        );
      case "tournamentList":
        return (
          <ListView
            title="Torneos"
            items={items}
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
          />
        );
      default:
        return (
          <div className="selection-view">
            <h2>¿Qué deseas gestionar?</h2>
            {globalSuccessMessage && <div className="success-message">{globalSuccessMessage}</div>} {/* Mostrar mensaje global de éxito */}
            <div className="selection-buttons">
              <button onClick={() => fetchItems("race")}>
                <span className="btn-icon">🏁</span>
                Gestionar Carreras
              </button>
              <button onClick={() => fetchItems("tournament")}>
                <span className="btn-icon">🏆</span>
                Gestionar Torneos
              </button>
            </div>
          </div>
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