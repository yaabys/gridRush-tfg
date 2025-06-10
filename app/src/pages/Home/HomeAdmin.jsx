import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

// Configuración
const API_ENDPOINTS = {
  races: "carreras-pendientes",
  tournaments: "torneos-pendientes",
  raceParticipants: (id) => `carrera/${id}/participantes`,
  tournamentParticipants: (id) => `torneo/${id}/participantes`,
  confirmRace: "confirmar-carrera",
  confirmTournament: "confirmar-torneo"
};

const ITEM_TYPES = {
  RACE: "race",
  TOURNAMENT: "tournament"
};

const VIEWS = {
  SELECTION: "selection",
  RACE_LIST: "raceList", 
  TOURNAMENT_LIST: "tournamentList",
  REORDER: "reorder"
};

// Hook para API
const useAPI = () => {
  const makeRequest = async (method, endpoint, data = null) => {
    const config = {
      method,
      url: `/api/${endpoint}`,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) config.data = data;
    return axios(config);
  };

  return {
    get: (endpoint) => makeRequest('GET', endpoint),
    post: (endpoint, data) => makeRequest('POST', endpoint, data)
  };
};

// Hook para autenticación
const useAuth = () => {
  const navigate = useNavigate();
  
  const checkSession = async () => {
    try {
      const { data } = await axios.get("/api/comprobarSesion", { withCredentials: true });
      if (!data.logueado) {
        navigate("/registro");
        return false;
      }
      return true;
    } catch (err) {
      console.error("Error de sesión:", err);
      navigate("/registro");
      return false;
    }
  };

  return { checkSession };
};

// Componente Piloto Arrastrable
function SortableRacerItem({ id, racer, carreraId, onImgClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const [avatarUrl, setAvatarUrl] = useState("/img/defaultIconProfile.webp");

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await axios.get(`/api/avatar/${racer.id}`, {
          responseType: "blob",
          withCredentials: true,
        });
        const imageUrl = URL.createObjectURL(response.data);
        setAvatarUrl(imageUrl);
      } catch (err) {
        setAvatarUrl("/img/defaultIconProfile.webp");
      }
    };
    fetchAvatar();
  }, [racer.id]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    border: isDragging ? "2px dashed var(--color-primary)" : "1px solid #444",
    zIndex: isDragging ? 999 : "auto",
    position: "relative",
  };

  const fotoUrl = `/api/foto-resultado-carrera/${carreraId}/${racer.id}`;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="racer-item">
      <span className="drag-handle">☰</span>
      <img
        src={avatarUrl}
        alt={`Avatar de ${racer.name}`}
        className="racer-resultado"
        style={{ cursor: "pointer" }}
        onError={e => { e.target.src = "/img/defaultIconProfile.webp"; }}
      />
      <span className="racer-position">{racer.position}º</span>
      <span className="racer-name">{racer.name}</span>
      <span className="racer-elo">ELO: {racer.elo || 0}</span>
      <button
        className="ver-foto-btn"
        onClick={() => {
          console.log("Ver foto de verificación:", { carreraId, idPiloto: racer.id, fotoUrl });
          onImgClick(fotoUrl);
        }}
        style={{ marginLeft: "1rem" }}
      >
        Ver foto
      </button>
    </div>
  );
}

function AvatarById({ id, name, className = "confirmacion-img" }) {
  const [avatarUrl, setAvatarUrl] = useState("/img/defaultIconProfile.webp");

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await axios.get(`/api/avatar/${id}`, {
          responseType: "blob",
          withCredentials: true,
        });
        const imageUrl = URL.createObjectURL(response.data);
        setAvatarUrl(imageUrl);
      } catch (err) {
        setAvatarUrl("/img/defaultIconProfile.webp");
      }
    };
    fetchAvatar();
  }, [id]);

  return (
    <img
      src={avatarUrl}
      alt={`Avatar de ${name}`}
      className={className}
      onError={e => { e.target.src = "/img/defaultIconProfile.webp"; }}
    />
  );
}

// Componente Vista de Reordenamiento
function ReorderView({ item, onGoBack, onConfirm }) {
  const [racers, setRacers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [modalImg, setModalImg] = useState(null);
  
  const { checkSession } = useAuth();
  const api = useAPI();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    checkSession();
  }, []);

  const fetchParticipants = async () => {
    if (!item) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = item.type === ITEM_TYPES.RACE 
        ? API_ENDPOINTS.raceParticipants(item.id)
        : API_ENDPOINTS.tournamentParticipants(item.id);
      
      const { data } = await api.get(endpoint);
      
      if (Array.isArray(data)) {
        setRacers(data);
      } else {
        throw new Error("Formato de respuesta inválido");
      }
    } catch (error) {
      setError(error.response?.data?.error || "Error al cargar participantes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [item]);

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    setRacers((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const newArray = arrayMove(items, oldIndex, newIndex);
      return newArray.map((i, index) => ({ ...i, position: index + 1 }));
    });
  };

  const handleConfirm = async () => {
    setLoading(true);
    setSuccessMessage(null);
    setError(null);
    
    try {
      const endpoint = item.type === ITEM_TYPES.RACE 
        ? API_ENDPOINTS.confirmRace
        : API_ENDPOINTS.confirmTournament;
        
      const payload = item.type === ITEM_TYPES.RACE
        ? { carreraId: item.id, resultados: racers }
        : { torneoId: item.id, resultados: racers };

      const { data } = await api.post(endpoint, payload);
      setSuccessMessage(data.message);
      onConfirm();
    } catch (error) {
      setError(error.response?.data?.error || "Error al confirmar resultados");
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
        <button className="confirm-button" onClick={fetchParticipants}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="admin-race-view">
      <button className="back-button" onClick={onGoBack}>← Volver</button>
      <h2>Validar Resultados - {item.name}</h2>
      <p>Arrastra y suelta los pilotos para establecer el orden final.</p>
      
      <div className="points-info">
        <strong>Sistema de puntos:</strong> {
          item.type === ITEM_TYPES.RACE 
            ? "Carreras: 25-18-15-12-10-8-6-4-2-1 puntos"
            : "Torneos: 50-36-30-24-20-16-12-8-4-2 puntos (Doble puntuación)"
        }
      </div>

      {successMessage && <div className="success-message">{successMessage}</div>}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={racers.map(r => r.id)} strategy={verticalListSortingStrategy}>
          <div className="racer-list-container">
            {racers.length === 0 ? (
              <p className="no-items-message">No hay participantes para validar</p>
            ) : (
              racers.map(racer => (
                <SortableRacerItem
                  key={racer.id}
                  id={racer.id}
                  racer={racer}
                  carreraId={item.id}
                  onImgClick={setModalImg}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      <div className="confirmaciones-section">
        <h3>Confirmación de cada piloto</h3>
        <div className="confirmaciones-list">
          {racers.map(racer => (
            <div
              key={racer.id}
              className="confirmacion-item"
              style={{ cursor: "pointer" }}
              onClick={() => setModalImg(`/api/foto-resultado-carrera/${item.id}/${racer.id}`)}
              title="Ver imagen de confirmación"
            >
              <AvatarById id={racer.id} name={racer.name} />
              <div>
                <span className="confirmacion-nombre">{racer.name}</span>
                {racer.fotoConfirmacion
                  ? <span className="confirmacion-ok">✔ Confirmado</span>
                  : <span className="confirmacion-pendiente">⏳ Pendiente</span>
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para la imagen */}
      {modalImg && (
        <div className="modal-overlay" onClick={() => setModalImg(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {console.log("Modal abierto para imagen:", modalImg)}
            <img
              src={modalImg}
              alt="Imagen de confirmación"
              className="modal-img"
              onError={e => { e.target.src = "/img/defaultIconProfile.webp"; }}
            />
            <button className="modal-close" onClick={() => setModalImg(null)}>Cerrar</button>
          </div>
        </div>
      )}

      {racers.length > 0 && (
        <button className="confirm-button" onClick={handleConfirm} disabled={loading}>
          {loading ? "Confirmando..." : "Confirmar Resultados"}
        </button>
      )}
    </div>
  );
}

// Componente Vista de Lista
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

// Hook de Estado Principal
const useAdminState = () => {
  const [state, setState] = useState({
    view: VIEWS.SELECTION,
    selectedItem: null,
    items: [],
    loading: false,
    error: null,
    successMessage: null
  });

  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));
  const resetState = () => setState({
    view: VIEWS.SELECTION,
    selectedItem: null, 
    items: [],
    loading: false,
    error: null,
    successMessage: null
  });

  return { state, updateState, resetState };
};

function HomeAdmin() {
  const navigate = useNavigate();

  const { checkSession } = useAuth();
  const api = useAPI();
  const { state, updateState, resetState } = useAdminState();

  useEffect(() => {
    checkSession();
  }, []);

  const fetchItems = async (type) => {
    updateState({ loading: true, error: null });
    
    try {
      const endpoint = type === ITEM_TYPES.RACE ? API_ENDPOINTS.races : API_ENDPOINTS.tournaments;
      const { data } = await api.get(endpoint);
      
      if (Array.isArray(data)) {
        updateState({
          items: data,
          view: type === ITEM_TYPES.RACE ? VIEWS.RACE_LIST : VIEWS.TOURNAMENT_LIST,
          loading: false
        });
      } else {
        throw new Error("Formato de respuesta inválido");
      }
    } catch (error) {
      updateState({
        error: error.response?.data?.error || `Error al cargar datos: ${error.message}`,
        loading: false
      });
    }
  };

  const handleSelectItem = (item) => {
    updateState({ selectedItem: item, view: VIEWS.REORDER });
  };

  const handleConfirmResults = () => {
    updateState({ successMessage: "¡Resultados confirmados correctamente!" });
    resetState();
  };

  const renderView = () => {
    if (state.loading) {
      return (
        <div className="selection-view">
          <p className="loading-message">Cargando...</p>
        </div>
      );
    }

    if (state.error) {
      return (
        <div className="selection-view">
          <p className="error-message">{state.error}</p>
          <button className="confirm-button" onClick={() => updateState({ error: null })}>
            Volver a intentar
          </button>
        </div>
      );
    }

    switch (state.view) {
      case VIEWS.RACE_LIST:
        return (
          <ListView
            title="Carreras"
            items={state.items}
            onSelectItem={handleSelectItem}
            onGoBack={resetState}
          />
        );
        
      case VIEWS.TOURNAMENT_LIST:
        return (
          <ListView
            title="Torneos"
            items={state.items}
            onSelectItem={handleSelectItem}
            onGoBack={resetState}
          />
        );
        
      case VIEWS.REORDER:
        return (
          <ReorderView
            item={state.selectedItem}
            onGoBack={resetState}
            onConfirm={handleConfirmResults}
          />
        );
        
      default:
        return (
          <div className="selection-view">
            <h2>¿Qué deseas gestionar?</h2>
            
            {state.successMessage && (
              <div className="success-message">{state.successMessage}</div>
            )}
            
            <div className="selection-buttons">
              <button onClick={() => fetchItems(ITEM_TYPES.RACE)}>
                <span className="btn-icon">🏁</span>
                Gestionar Carreras
              </button>
              <button onClick={() => fetchItems(ITEM_TYPES.TOURNAMENT)}>
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

      <div className="profile-actions">
        <button
          className="logout"
          onClick={async () => {
            try {
              await axios.post("/api/logout", {}, { withCredentials: true });
              navigate("/");
            } catch (err) {
              alert("Error al cerrar sesión");
            }
          }}
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

export default HomeAdmin;