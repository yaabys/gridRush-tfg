import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header/Header";
import "./OfficialTournaments.css";

const OfficialTournaments = () => {
  const navigate = useNavigate();
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inscripciones, setInscripciones] = useState({});
  const [nivelSeleccionado, setNivelSeleccionado] = useState("");
  const [comunidadSeleccionada, setComunidadSeleccionada] = useState("");

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
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
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    const comprobarSesion = async () => {
      try {
        const res = await axios.get("/api/comprobarSesion", {
          withCredentials: true,
        });
        if (!res.data.logueado) {
          navigate("/registro");
        }
      } catch (err) {
        console.log("Error al comprobar sesión:", err);
      }
    };
    comprobarSesion();
  }, [navigate]);

  useEffect(() => {
    const fetchTorneos = async () => {
      try {
        setLoading(true);
        setError(null);


        const sessionResponse = await axios.get("/api/comprobarSesion", {
          withCredentials: true,
        });


        const response = await axios.get("/api/torneos", {
          withCredentials: true,
        });
        setTorneos(response.data);


        if (sessionResponse.data.logueado) {
          const username = sessionResponse.data.username;
          const inscripcionesPromises = response.data.map((torneo) =>
            axios.post("/api/check-inscripcion-torneo", {
              username,
              idTorneo: torneo.id,
              withCredentials: true,
            }),
          );

          const inscripcionesResults = await Promise.all(inscripcionesPromises);
          const inscripcionesMap = {};
          response.data.forEach((torneo, index) => {
            inscripcionesMap[torneo.id] =
              inscripcionesResults[index].data.inscrito;
          });
          setInscripciones(inscripcionesMap);
        }
      } catch (err) {
        setError(
          "Error al cargar los torneos. Por favor, inténtalo de nuevo más tarde.",
        );
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTorneos();
  }, []);

  const niveles = ["Principiante", "Intermedio", "Avanzado"];
  const comunidades =
    torneos.length > 0 ? [...new Set(torneos.map((t) => t.comunidad))] : [];

  const torneosFiltrados = torneos.filter((t) => {
    const coincideNivel = nivelSeleccionado
      ? t.nivelMinimo === nivelSeleccionado
      : true;
    const coincideComunidad = comunidadSeleccionada
      ? t.comunidad === comunidadSeleccionada
      : true;
    return coincideNivel && coincideComunidad;
  });

  const handleMasInfo = (torneoId) => {
    navigate(`/torneo/${torneoId}`);
  };

  const handleInscripcion = async (idTorneo) => {
    try {
      const response = await axios.get("/api/comprobarSesion", {
        withCredentials: true,
      });
      if (!response.data.logueado) {
        showModal(
          "Debes iniciar sesión",
          "Inicia sesión para inscribirte",
          "error",
        );
        navigate("/registro");
        return;
      }

      const username = response.data.username;
      const inscripcionResponse = await axios.put("/api/reservar-torneo", {
        idTorneo,
        username,
        withCredentials: true,
      });

      if (inscripcionResponse.data.success) {
        setInscripciones((prev) => ({
          ...prev,
          [idTorneo]: true,
        }));
        setTorneos((prev) =>
          prev.map((torneo) => {
            if (torneo.id === idTorneo) {
              return {
                ...torneo,
                plazasOcupadas: torneo.plazasOcupadas + 1,
              };
            }
            return torneo;
          }),
        );
        showModal(
          "¡Inscripción realizada con éxito!",
          "Te has inscrito correctamente al torneo",
          "success",
        );
      } else {
        showModal("Información", inscripcionResponse.data.message, "info");
      }
    } catch (err) {
      console.error("Error al inscribirse:", err);
      showModal(
        "Error",
        err.response?.data?.error || "Error al realizar la inscripción",
        "error",
      );
    }
  };

  const handleDesapuntarse = async (idTorneo) => {
    try {
      const response = await axios.get("/api/comprobarSesion", {
        withCredentials: true,
      });
      if (!response.data.logueado) {
        showModal(
          "Debes iniciar sesión",
          "Inicia sesión para desapuntarte",
          "error",
        );
        navigate("/registro");
        return;
      }

      const username = response.data.username;
      const desapuntarseResponse = await axios.delete(
        "/api/cancelar-inscripcion-torneo",
        {
          data: {
            idTorneo,
            username,
            withCredentials: true,
          },
        },
      );

      if (desapuntarseResponse.data.success) {
        setInscripciones((prev) => ({
          ...prev,
          [idTorneo]: false,
        }));
        setTorneos((prev) =>
          prev.map((torneo) => {
            if (torneo.id === idTorneo) {
              return {
                ...torneo,
                plazasOcupadas: torneo.plazasOcupadas - 1,
              };
            }
            return torneo;
          }),
        );
        showModal(
          "Cancelación exitosa",
          "Te has desapuntado correctamente del torneo",
          "success",
        );
      } else {
        showModal("Información", desapuntarseResponse.data.message, "info");
      }
    } catch (err) {
      console.error("Error al desapuntarse:", err);
      showModal(
        "Error",
        err.response?.data?.error || "Error al desapuntarse del torneo",
        "error",
      );
    }
  };

  const confirmarDesapuntarse = (idTorneo) => {
    showModal(
      "¿Desapuntarse del torneo?",
      "¿Estás seguro de que quieres desapuntarte de este torneo?",
      "warning",
      () => handleDesapuntarse(idTorneo),
    );
  };

  return (
    <div className="officialTournaments">
      <Header />
      <div className="main-container">
        <h1>Torneos Oficiales</h1>
        <p>Filtra por nivel y comunidad para encontrar tu próximo reto.</p>

        {loading ? (
          <div className="loading">Cargando torneos oficiales...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : torneos.length === 0 ? (
          <div className="no-data">
            No se encontraron torneos oficiales disponibles.
          </div>
        ) : (
          <>
            <div className="filters">
              <label>
                Nivel mínimo:
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

            <div className="cards-torneos">
              {torneosFiltrados.map((torneo, index) => (
                <div
                  key={torneo.id}
                  className="card-torneo"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <h3>{torneo.nombre}</h3>
                  <p>
                    <strong>📍 Ubicación:</strong> {torneo.ubicacion}
                  </p>
                  <p>
                    <strong>🌍 Comunidad:</strong> {torneo.comunidad}
                  </p>
                  <p>
                    <strong>🗓 Fecha:</strong> {torneo.fecha}
                  </p>
                  <p>
                    <strong>🎯 Nivel mínimo:</strong> {torneo.nivelMinimo}
                  </p>
                  <p>
                    <strong>👥 Inscritos:</strong> {torneo.plazasOcupadas}/
                    {torneo.maximo}
                  </p>
                  <div className="card-torneo__buttons">
                    <button
                      className={`btn-apuntarse ${inscripciones[torneo.id] ? "inscrito" : ""}`}
                      disabled={
                        torneo.plazasOcupadas >= torneo.maximo &&
                        !inscripciones[torneo.id]
                      }
                      onClick={() =>
                        inscripciones[torneo.id]
                          ? confirmarDesapuntarse(torneo.id)
                          : handleInscripcion(torneo.id)
                      }
                    >
                      {inscripciones[torneo.id]
                        ? "Desapuntarse"
                        : torneo.plazasOcupadas >= torneo.maximo
                          ? "Completo"
                          : "¡Apuntarme!"}
                    </button>
                    <button
                      className="btn-mas-info"
                      onClick={() => handleMasInfo(torneo.id)}
                    >
                      Más información
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
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

export default OfficialTournaments;
