import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/Header/Header";
import "./IndependentRace.css";
import { useNavigate } from "react-router-dom";

const IndependentRace = () => {
  const navigate = useNavigate();
  const [carrerasLibres, setCarrerasLibres] = useState([]);
  const [nivelSeleccionado, setNivelSeleccionado] = useState("");
  const [comunidadSeleccionada, setComunidadSeleccionada] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState(null);
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });

  useEffect(() => {
    const comprobarSesion = async () => {
      try {
        const res = await axios.get("/api/comprobarSesion", {
          withCredentials: true,
        });
        if (!res.data.logueado) {
          navigate("/registro");
        } else {
          setUsername(res.data.username);
        }
      } catch (err) {
        console.log("Error al comprobar sesión:", err);
      }
    };
    comprobarSesion();
  }, [navigate]);

  useEffect(() => {
    const fetchCarreras = async () => {
      if (!username) return; // Esperar a tener el username

      try {
        const response = await axios.get("/api/carreras-libres", {
          withCredentials: true,
        });

        // Para cada carrera, verificar si el usuario está inscrito
        const carrerasConEstado = await Promise.all(
          response.data.map(async (carrera) => {
            try {
              const checkInscripcion = await axios.post(
                "/api/check-inscripcion",
                {
                  username: username,
                  idCarrera: carrera.id,
                  withCredentials: true,
                },
              );
              return {
                ...carrera,
                inscrito: checkInscripcion.data.inscrito,
              };
            } catch (err) {
              return {
                ...carrera,
                inscrito: false,
              };
            }
          }),
        );

        setCarrerasLibres(carrerasConEstado);
      } catch (err) {
        console.error("Error al cargar carreras libres:", err);
        setError("Error al cargar las carreras libres");
      } finally {
        setLoading(false);
      }
    };

    fetchCarreras();
  }, [username]); // Se ejecuta cuando tenemos el username

  const comunidades = [...new Set(carrerasLibres.map((c) => c.comunidad))];
  const niveles = [...new Set(carrerasLibres.map((c) => c.nivelRequerido))];

  const carrerasFiltradas = carrerasLibres.filter((c) => {
    const coincideNivel = nivelSeleccionado
      ? c.nivelRequerido === nivelSeleccionado
      : true;
    const coincideComunidad = comunidadSeleccionada
      ? c.comunidad === comunidadSeleccionada
      : true;
    return coincideNivel && coincideComunidad;
  });

  const showModal = (title, message, type = "info", onConfirm = null) => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  const handleReservar = async (carreraId) => {
    try {
      if (!username) {
        alert("No hay usuario logueado");
        navigate("/registro");
        return;
      }

      const response = await axios.put("/api/reservar-carreraLibre", {
        idCarrera: carreraId,
        username: username,
        withCredentials: true,
      });

      if (response.data.success) {
        showModal(
          "¡Reserva exitosa!",
          "Te has inscrito correctamente en la carrera",
          "success",
        );
        // Actualizamos las carreras para reflejar el cambio
        const updatedCarreras = carrerasLibres.map((carrera) => {
          if (carrera.id === carreraId) {
            return {
              ...carrera,
              plazasOcupadas: carrera.plazasOcupadas + 1,
              inscrito: true, // Marcar como inscrito
            };
          }
          return carrera;
        });
        setCarrerasLibres(updatedCarreras);
      } else if (response.data.inscrito) {
        showModal(
          "Ya inscrito",
          "Ya estás inscrito en esta carrera",
          "warning",
        );
      }
    } catch (err) {
      console.error("Error al reservar plaza:", err);

      if (err.response?.status === 404) {
        showModal(
          "Error",
          "Usuario no encontrado. Por favor, inicia sesión nuevamente.",
          "error",
        );
        setTimeout(() => navigate("/registro"), 2000);
      } else if (err.response?.data?.error) {
        showModal("Error", err.response.data.error, "error");
      } else {
        showModal(
          "Error",
          "Ocurrió un error al reservar. Por favor, intenta de nuevo.",
          "error",
        );
      }
    }
  };

  const handleDesapuntarse = async (carreraId) => {
    const confirmarDesapuntarse = async () => {
      try {
        const response = await axios.delete("/api/cancelar-inscripcion", {
          data: {
            idCarrera: carreraId,
            username: username,
            withCredentials: true,
          },
        });

        if (response.data.success) {
          showModal(
            "¡Cancelación exitosa!",
            "Te has desapuntado correctamente de la carrera",
            "success",
          );
          // Actualizamos las carreras para reflejar el cambio
          const updatedCarreras = carrerasLibres.map((carrera) => {
            if (carrera.id === carreraId) {
              return {
                ...carrera,
                plazasOcupadas: carrera.plazasOcupadas - 1,
                inscrito: false, // Marcar como no inscrito
              };
            }
            return carrera;
          });
          setCarrerasLibres(updatedCarreras);
        }
      } catch (err) {
        console.error("Error al desapuntarse:", err);
        showModal(
          "Error",
          "Ocurrió un error al desapuntarse. Por favor, intenta de nuevo.",
          "error",
        );
      }
    };

    showModal(
      "¿Desapuntarse de la carrera?",
      "¿Estás seguro de que quieres desapuntarte de esta carrera?",
      "warning",
      confirmarDesapuntarse,
    );
  };

  return (
    <div className="independentRace">
      <Header />
      <div className="main-container">
        <h1>Carreras Libres</h1>
        <p>Encuentra tu próxima carrera libre en los mejores kartings.</p>

        <div className="filters">
          <label>
            Nivel:
            <select
              value={nivelSeleccionado}
              onChange={(e) => setNivelSeleccionado(e.target.value)}
            >
              <option value="">Todos</option>
              {niveles.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <label>
            Comunidad:
            <select
              value={comunidadSeleccionada}
              onChange={(e) => setComunidadSeleccionada(e.target.value)}
            >
              <option value="">Todas</option>
              {comunidades.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p className="loading">Cargando carreras...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : carrerasFiltradas.length === 0 ? (
          <p className="no-data">No se encontraron carreras disponibles.</p>
        ) : (
          <div className="cards-carreras">
            {carrerasFiltradas.map((carrera, index) => (
              <div key={index} className="card-carrera">
                <h3>{carrera.nombre}</h3>
                <p>
                  <strong>🏁 Karting:</strong> {carrera.karting}
                </p>
                <p>
                  <strong>📍 Comunidad:</strong> {carrera.comunidad}
                </p>
                <p>
                  <strong>🗓 Fecha:</strong> {carrera.fecha}
                </p>
                <p>
                  <strong>⏰ Horario:</strong> {String(carrera.hora)}
                </p>
                <p>
                  <strong>🎯 Nivel:</strong> {carrera.nivelRequerido}
                </p>
                <p>
                  <strong>👥 Plazas:</strong> {carrera.plazasOcupadas}/
                  {carrera.plazasTotales}
                </p>
                <div className="card-buttons">
                  <button
                    disabled={
                      carrera.plazasOcupadas >= carrera.plazasTotales &&
                      !carrera.inscrito
                    }
                    onClick={() =>
                      carrera.inscrito
                        ? handleDesapuntarse(carrera.id)
                        : handleReservar(carrera.id)
                    }
                    className={carrera.inscrito ? "btn-desapuntarse" : ""}
                  >
                    {carrera.inscrito
                      ? "Desapuntarse"
                      : carrera.plazasOcupadas >= carrera.plazasTotales
                        ? "Completo"
                        : "Reservar Plaza"}
                  </button>
                  <button
                    className="btn-info"
                    onClick={() => {
                      navigate(`/carrera-libre/${carrera.id}`);
                    }}
                  >
                    Más información
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal.isOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-header ${modal.type}`}>
              <h3>{modal.title}</h3>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>{modal.message}</p>
            </div>
            <div className="modal-footer">
              {modal.onConfirm ? (
                <>
                  <button className="modal-btn cancel" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button
                    className={`modal-btn confirm ${modal.type}`}
                    onClick={() => {
                      modal.onConfirm();
                      closeModal();
                    }}
                  >
                    Confirmar
                  </button>
                </>
              ) : (
                <button
                  className={`modal-btn confirm ${modal.type}`}
                  onClick={closeModal}
                >
                  Aceptar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndependentRace;
