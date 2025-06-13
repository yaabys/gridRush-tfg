import React, { useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useAdminState } from '../../hooks/useAdminState';
import { useAPI } from '../../hooks/useAPI';
import { useAuth } from '../../hooks/useAuth';
import SortableRacerItem from '../../components/Admin/SortableRacerItem';
import ImageModal from '../../components/Admin/ImageModal';
import AdminHeader from '../../components/Admin/AdminHeader';
import './HomeAdmin.css';

function HomeAdmin() {
  const { state, updateState, resetState } = useAdminState();
  const { get, post } = useAPI();
  const { checkSession } = useAuth();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = state.items.findIndex(item => item.id === active.id);
      const newIndex = state.items.findIndex(item => item.id === over.id);
      const newItems = arrayMove(state.items, oldIndex, newIndex);
      updateState({ items: newItems });
    }
  };

  const handleSaveOrder = async () => {
    try {
      updateState({ loading: true });
      const response = await post('/api/actualizar-orden-carrera', {
        carreraId: state.selectedItem.id,
        orden: state.items.map(item => item.id)
      });
      if (response.data.success) {
        updateState({ successMessage: "Orden actualizado correctamente" });
        setTimeout(() => {
          updateState({ successMessage: "" });
        }, 3000);
      }
    } catch (error) {
      updateState({ error: "Error al actualizar el orden" });
    } finally {
      updateState({ loading: false });
    }
  };

  const handleImgClick = (url) => {
    updateState({ selectedImageUrl: url, isImageModalOpen: true });
  };

  const handleBack = () => {
    if (state.view === state.VIEWS.REORDER) {
      updateState({ view: state.VIEWS.RACE_LIST });
    } else if (state.view === state.VIEWS.RACE_LIST || state.view === state.VIEWS.TOURNAMENT_LIST) {
      resetState();
    }
  };

  const renderContent = () => {
    switch (state.view) {
      case state.VIEWS.SELECTION:
        return (
          <div className="selection-container">
            <h2>Selecciona el tipo de elemento a gestionar</h2>
            <div className="selection-buttons">
              <button
                className="btn"
                onClick={() => updateState({ view: state.VIEWS.RACE_LIST })}
              >
                Carreras
              </button>
              <button
                className="btn"
                onClick={() => updateState({ view: state.VIEWS.TOURNAMENT_LIST })}
              >
                Torneos
              </button>
            </div>
          </div>
        );

      case state.VIEWS.RACE_LIST:
        return (
          <div className="list-container">
            <h2>Carreras</h2>
            <div className="list-grid">
              {state.items.map(carrera => (
                <div key={carrera.id} className="list-item">
                  <h3>{carrera.nombre}</h3>
                  <p>Fecha: {new Date(carrera.fecha).toLocaleDateString()}</p>
                  <p>Hora: {carrera.hora}</p>
                  <button
                    className="btn"
                    onClick={() => updateState({
                      view: state.VIEWS.REORDER,
                      selectedItem: carrera,
                      items: carrera.participantes || []
                    })}
                  >
                    Reordenar
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case state.VIEWS.TOURNAMENT_LIST:
        return (
          <div className="list-container">
            <h2>Torneos</h2>
            <div className="list-grid">
              {state.items.map(torneo => (
                <div key={torneo.id} className="list-item">
                  <h3>{torneo.nombre}</h3>
                  <p>Fecha: {new Date(torneo.fecha).toLocaleDateString()}</p>
                  <p>Hora: {torneo.hora}</p>
                  <button
                    className="btn"
                    onClick={() => updateState({
                      view: state.VIEWS.REORDER,
                      selectedItem: torneo,
                      items: torneo.participantes || []
                    })}
                  >
                    Reordenar
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case state.VIEWS.REORDER:
        return (
          <div className="reorder-container">
            <h2>Reordenar {state.selectedItem.nombre}</h2>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={state.items.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="racers-list">
                  {state.items.map(racer => (
                    <SortableRacerItem
                      key={racer.id}
                      id={racer.id}
                      racer={racer}
                      carreraId={state.selectedItem.id}
                      onImgClick={handleImgClick}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <button
              className="btn"
              onClick={handleSaveOrder}
              disabled={state.loading}
            >
              {state.loading ? "Guardando..." : "Guardar orden"}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="home-admin">
      <AdminHeader
        onBack={handleBack}
        title={
          state.view === state.VIEWS.SELECTION ? "Panel de Administración" :
          state.view === state.VIEWS.RACE_LIST ? "Carreras" :
          state.view === state.VIEWS.TOURNAMENT_LIST ? "Torneos" :
          "Reordenar"
        }
      />
      {state.error && <div className="error-message">{state.error}</div>}
      {state.successMessage && <div className="success-message">{state.successMessage}</div>}
      {renderContent()}
      <ImageModal
        isOpen={state.isImageModalOpen}
        onClose={() => updateState({ isImageModalOpen: false })}
        imageUrl={state.selectedImageUrl}
      />
    </div>
  );
}

export default HomeAdmin; 