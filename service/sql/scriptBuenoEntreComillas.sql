CREATE DATABASE KartingDB;
USE KartingDB;

-- Tabla de usuarios
CREATE TABLE Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fotoPerfil BLOB, -- imagen JPG/PNG
    carrerasVictorias INT DEFAULT 0,
    torneosVictorias INT DEFAULT 0,
    provincia VARCHAR(100),
    fechaNacimiento DATE,
    elo INT NOT NULL DEFAULT 0 -- Elo inicial 0
);

-- Tabla de recompensas
CREATE TABLE Recompensas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    imagen BLOB, -- Imagen de la recompensa
    fechaInicioRecompensa DATE,
    fechaLimiteRecompensa DATE
);

-- Relación de usuarios con recompensas obtenidas
CREATE TABLE UsuarioRecompensas (
    id INT AUTO_INCREMENT PRIMARY KEY, -- ID de la relación
    id_usuario INT,
    id_recompensa INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id),
    FOREIGN KEY (id_recompensa) REFERENCES Recompensas(id)
);

-- Tabla de kartings
CREATE TABLE Kartings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(255) NOT NULL -- URL a Google Maps
);

-- Tabla de torneos
CREATE TABLE Torneos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombreTorneo VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    nivelMin INT NOT NULL,
    nivelMax INT NOT NULL,
    maxInscripciones INT NOT NULL
    -- Relación con kartings se hace con tabla intermedia TorneoKartings
);

-- Tabla intermedia para torneos en varios kartings
CREATE TABLE TorneoKartings ( -- Para si se celebra en uno o varios kartings el torneo
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_torneo INT,
    id_karting INT,
    FOREIGN KEY (id_torneo) REFERENCES Torneos(id),
    FOREIGN KEY (id_karting) REFERENCES Kartings(id)
);

-- Inscripciones de usuarios a torneos
CREATE TABLE InscripcionesTorneo ( -- Solo para torneos
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_torneo INT NOT NULL,
    id_piloto INT NOT NULL,
    fecha_inscripcion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_torneo) REFERENCES Torneos(id),
    FOREIGN KEY (id_piloto) REFERENCES Usuarios(id)
);

-- Carreras (parte de un torneo o sueltas)
CREATE TABLE Carreras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATETIME NOT NULL, -- Incluye fecha y hora
    id_karting INT NOT NULL,
    id_torneo INT, -- Puede ser NULL si es una carrera suelta
    nivelMin INT NOT NULL,
    nivelMax INT NOT NULL,
    maxInscripciones INT NOT NULL,
    FOREIGN KEY (id_karting) REFERENCES Kartings(id),
    FOREIGN KEY (id_torneo) REFERENCES Torneos(id)
);

-- Inscripciones de usuarios a carreras
CREATE TABLE InscripcionesCarrera ( -- Solo para libres
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_carrera INT NOT NULL,
    id_piloto INT NOT NULL,
    fecha_inscripcion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_carrera) REFERENCES Carreras(id),
    FOREIGN KEY (id_piloto) REFERENCES Usuarios(id)
);

-- Resultados de cada carrera
-- Guarda el tiempo total y la posición de cada piloto en cada carrera. Se puede usar para calcular los puntos del torneo.
CREATE TABLE ResultadosCarreras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_carrera INT,
    id_piloto INT,
    posicion INT NOT NULL,
    tiempoTotal TIME NOT NULL,
    FOREIGN KEY (id_carrera) REFERENCES Carreras(id),
    FOREIGN KEY (id_piloto) REFERENCES Usuarios(id)
);

-- Resultados finales de un torneo
CREATE TABLE ResultadosTorneo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_torneo INT,
    id_piloto INT,
    puntosTorneo INT NOT NULL,
    FOREIGN KEY (id_torneo) REFERENCES Torneos(id),
    FOREIGN KEY (id_piloto) REFERENCES Usuarios(id)
);

CREATE TABLE Temporadas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL, -- Ej. "Temporada 2025/2026"
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL
);

-- Relación de usuarios con temporadas (ranking global)
CREATE TABLE TemporadaUsuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_temporada INT,
    id_piloto INT,
    puntos INT NOT NULL DEFAULT 0,
    FOREIGN KEY (id_temporada) REFERENCES Temporadas(id),
    FOREIGN KEY (id_piloto) REFERENCES Usuarios(id)
);