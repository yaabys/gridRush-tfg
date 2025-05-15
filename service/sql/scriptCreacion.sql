-- SQLite no soporta CREATE DATABASE ni USE
-- Simplemente conectas a la base de datos deseada al abrir SQLite

-- Tabla de usuarios
CREATE TABLE Usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    fotoPerfil BLOB, -- imagen JPG/PNG
    avatar_tipo TEXT,
    carrerasVictorias INTEGER DEFAULT 0,
    torneosVictorias INTEGER DEFAULT 0,
    provincia TEXT,
    fechaNacimiento TEXT,
    elo INTEGER NOT NULL DEFAULT 0 -- Elo inicial 0
);

-- Tabla de recompensas
CREATE TABLE Recompensas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    imagen BLOB, -- Imagen de la recompensa
    fechaInicioRecompensa TEXT,
    fechaLimiteRecompensa TEXT
);

-- Relación de usuarios con recompensas obtenidas
CREATE TABLE UsuarioRecompensas (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- ID de la relación
    id_usuario INTEGER,
    id_recompensa INTEGER,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id),
    FOREIGN KEY (id_recompensa) REFERENCES Recompensas(id)
);

-- Tabla de kartings
CREATE TABLE Kartings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    ciudad TEXT NOT NULL,
    ubicacionLink TEXT NOT NULL -- URL a Google Maps
);

-- Tabla de torneos
CREATE TABLE Torneos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombreTorneo TEXT NOT NULL,
    fecha_inicio TEXT NOT NULL,
    fecha_fin TEXT NOT NULL,
    nivelMin INTEGER NOT NULL,
    nivelMax INTEGER NOT NULL,
    maxInscripciones INTEGER NOT NULL
    -- Relación con kartings se hace con tabla intermedia TorneoKartings
);

-- Tabla intermedia para torneos en varios kartings
CREATE TABLE TorneoKartings ( -- Para si se celebra en uno o varios kartings el torneo
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_torneo INTEGER,
    id_karting INTEGER,
    FOREIGN KEY (id_torneo) REFERENCES Torneos(id),
    FOREIGN KEY (id_karting) REFERENCES Kartings(id)
);

-- Inscripciones de usuarios a torneos
CREATE TABLE InscripcionesTorneo ( -- Solo para torneos
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_torneo INTEGER NOT NULL,
    id_piloto INTEGER NOT NULL,
    fecha_inscripcion TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_torneo) REFERENCES Torneos(id),
    FOREIGN KEY (id_piloto) REFERENCES Usuarios(id)
);

-- Carreras (parte de un torneo o sueltas)
CREATE TABLE Carreras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL, -- Incluye fecha y hora
    id_karting INTEGER NOT NULL,
    id_torneo INTEGER, -- Puede ser NULL si es una carrera suelta
    nivelMin INTEGER NOT NULL,
    nivelMax INTEGER NOT NULL,
    maxInscripciones INTEGER NOT NULL,
    FOREIGN KEY (id_karting) REFERENCES Kartings(id),
    FOREIGN KEY (id_torneo) REFERENCES Torneos(id)
);

-- Inscripciones de usuarios a carreras
CREATE TABLE InscripcionesCarrera ( -- Solo para libres
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_carrera INTEGER NOT NULL,
    id_piloto INTEGER NOT NULL,
    fecha_inscripcion TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_carrera) REFERENCES Carreras(id),
    FOREIGN KEY (id_piloto) REFERENCES Usuarios(id)
);

-- Resultados de cada carrera
-- Guarda el tiempo total y la posición de cada piloto en cada carrera. Se puede usar para calcular los puntos del torneo.
CREATE TABLE ResultadosCarreras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_carrera INTEGER,
    id_piloto INTEGER,
    posicion INTEGER NOT NULL,
    tiempoTotal TEXT NOT NULL,
    FOREIGN KEY (id_carrera) REFERENCES Carreras(id),
    FOREIGN KEY (id_piloto) REFERENCES Usuarios(id)
);

-- Resultados finales de un torneo
CREATE TABLE ResultadosTorneo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_torneo INTEGER,
    id_piloto INTEGER,
    puntosTorneo INTEGER NOT NULL,
    FOREIGN KEY (id_torneo) REFERENCES Torneos(id),
    FOREIGN KEY (id_piloto) REFERENCES Usuarios(id)
);

-- Tabla de temporadas
CREATE TABLE Temporadas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL, -- Ej. "Temporada 2025/2026"
    fecha_inicio TEXT NOT NULL,
    fecha_fin TEXT NOT NULL
);

-- Relación de usuarios con temporadas (ranking global)
CREATE TABLE TemporadaUsuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_temporada INTEGER,
    id_piloto INTEGER,
    puntos INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (id_temporada) REFERENCES Temporadas(id),
    FOREIGN KEY (id_piloto) REFERENCES Usuarios(id)
);

-- Relación de temporadas con recompensas
CREATE TABLE TemporadaRecompensas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_temporada INTEGER,
    id_recompensa INTEGER,
    nombre_recompensa TEXT NOT NULL,
    descripcion TEXT,
    posicion_min INTEGER,
    posicion_max INTEGER,
    FOREIGN KEY (id_temporada) REFERENCES Temporadas(id),
    FOREIGN KEY (id_recompensa) REFERENCES Recompensas(id)
);