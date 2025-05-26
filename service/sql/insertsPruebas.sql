-- Kartings
INSERT INTO Kartings (nombre, ciudad, ubicacionLink)
VALUES 
('Carlos Sainz Karting Las Rozas', 'Madrid', 'https://maps.app.goo.gl/h8fCMHW5mYEKasnF9'),
('Carlos Sainz Karting Madrid', 'Madrid', 'https://maps.app.goo.gl/VZVmVj6zsnB65yn36'),
('Karting Rivas','Madrid','https://maps.app.goo.gl/Jncgzjhn7iRaUFiW6'),
('Karting Madrid Angel Burgueño','Madrid','https://maps.app.goo.gl/rQentssFjvL7rjya8'),
('Formula Cero Outdoor Karting','Madrid','https://maps.app.goo.gl/xgPVVXhaKwiU292DA'),
('Karting Club Los Santos','Madrid','https://maps.app.goo.gl/oVzuJyU2Auduh7T39'),
('Karting Speed Park Oasiz','Madrid','https://maps.app.goo.gl/EmyvR7Pn1zGdCxNt8'),
('Karting Asupark','Madrid','https://maps.app.goo.gl/rTEqpAUfb9dpYjMq8'),
('Henakart Karts Madrid','Madrid','https://maps.app.goo.gl/uxrB5bqVQoSuqrpY7'),
('Circuito Montoya','Madrid','https://maps.app.goo.gl/N6GeTgy57mXzqsTs7'),
('Jarama Karting','Madrid','https://maps.app.goo.gl/2ECnVwkC9SqoEUPs7'),
('Karting Paracuellos','Madrid','https://maps.app.goo.gl/9HUHzgrqB7YtuiRr9'),
('Karting Pinto','Madrid','https://maps.app.goo.gl/xhr9FTUVCgRrtFyz8'),
('Indoor Karting Barcelona','Barcelona','https://maps.app.goo.gl/dB8GSSTtMgr327w96');

INSERT INTO Carreras (fecha, id_karting, nivelMin, nivelMax, maxInscripciones)
VALUES
('2025-06-01','1','1','5','12'),
('2026-06-01','2','1','5','12');

INSERT INTO InscripcionesCarrera (id_carrera, id_piloto,fecha_inscripcion)
VALUES
('1','1','2025-05-08');

INSERT INTO Recompensas (nombre, fechaInicioRecompensa,fechaLimiteRecompensa)
VALUES
('Casco Fernando Alonso','2025-06-01','2025-06-30'),
('Mono de carreras','2025-07-01','2025-07-31');

INSERT INTO Temporadas (nombre, fecha_inicio, fecha_fin)
VALUES
('Temporada 2025 (1)','2025-01-01','2025-06-30'),
('Temporada 2025 (2)','2025-07-01','2026-12-31');

INSERT INTO Torneos (nombreTorneo, fecha_inicio,fecha_fin, nivelMin, nivelMax, maxInscripciones)
VALUES
('Torneo de Verano 2025','2025-06-01','2025-08-31','1','5','12'),
('Torneo de Invierno 2025','2025-09-01','2025-12-31','1','5','12');

INSERT INTO InscripcionesTorneo (id_torneo, id_piloto, fecha_inscripcion)
VALUES
('1','1','2025-05-08'),
('2','1','2025-09-01');

INSERT INTO ResultadosCarreras (id_carrera, id_piloto, posicion, tiempoTotal)
VALUES
('1','1','1','01:01:30'),
('2','1','1','01:01:25');

INSERT INTO ResultadosTorneo (id_torneo, id_piloto, puntosTorneo)
VALUES
('1','1','100'),
('2','1','200');

INSERT INTO TemporadaRecompensas (id_temporada, id_recompensa, nombre_recompensa, descripcion, posicion_min, posicion_max) 
VALUES 
(1, 1, 'Casco Fernando Alonso', 'Otorgado al campeón de la temporada', 1, 1),
(1, 2, 'Mono de carreras', 'Otorgado a los competidores del 2° al 5° puesto', 2, 5);

INSERT INTO TemporadaUsuarios (id_temporada, id_piloto, puntos)
VALUES
(1, 1, 100),
(2, 1, 200);

INSERT INTO TorneoKartings (id_torneo, id_karting)
VALUES
(1, 1),
(2, 2);

INSERT INTO UsuarioRecompensas (id_usuario, id_recompensa)
VALUES
(1, 1),
(1, 2);


// -- Inserciones de prueba para las tablas de la base de datos

-- Primero, necesitas insertar usuarios para que las referencias funcionen
INSERT INTO Usuarios (username, nombre, apellidos, email, password, provincia, fechaNacimiento, elo)
VALUES 
('piloto1', 'Juan', 'García López', 'juan.garcia@email.com', 'hashedpassword123', 'Madrid', '1995-03-15', 1200),
('piloto2', 'María', 'Rodríguez Sánchez', 'maria.rodriguez@email.com', 'hashedpassword456', 'Barcelona', '1992-07-22', 1350),
('piloto3', 'Carlos', 'Martín Ruiz', 'carlos.martin@email.com', 'hashedpassword789', 'Madrid', '1988-11-08', 1450),
('piloto4', 'Ana', 'López Fernández', 'ana.lopez@email.com', 'hashedpassword321', 'Valencia', '1997-01-30', 1100),
('piloto5', 'Pedro', 'Sánchez Gil', 'pedro.sanchez@email.com', 'hashedpassword654', 'Madrid', '1990-05-12', 1280);

-- Kartings (ya los tienes, pero aquí están para referencia)
INSERT INTO Kartings (nombre, ciudad, ubicacionLink)
VALUES 
('Carlos Sainz Karting Las Rozas', 'Madrid', 'https://maps.app.goo.gl/h8fCMHW5mYEKasnF9'),
('Carlos Sainz Karting Madrid', 'Madrid', 'https://maps.app.goo.gl/VZVmVj6zsnB65yn36'),
('Karting Rivas','Madrid','https://maps.app.goo.gl/Jncgzjhn7iRaUFiW6'),
('Karting Madrid Angel Burgueño','Madrid','https://maps.app.goo.gl/rQentssFjvL7rjya8'),
('Formula Cero Outdoor Karting','Madrid','https://maps.app.goo.gl/xgPVVXhaKwiU292DA'),
('Karting Club Los Santos','Madrid','https://maps.app.goo.gl/oVzuJyU2Auduh7T39'),
('Karting Speed Park Oasiz','Madrid','https://maps.app.goo.gl/EmyvR7Pn1zGdCxNt8'),
('Karting Asupark','Madrid','https://maps.app.goo.gl/rTEqpAUfb9dpYjMq8'),
('Henakart Karts Madrid','Madrid','https://maps.app.goo.gl/uxrB5bqVQoSuqrpY7'),
('Circuito Montoya','Madrid','https://maps.app.goo.gl/N6GeTgy57mXzqsTs7'),
('Jarama Karting','Madrid','https://maps.app.goo.gl/2ECnVwkC9SqoEUPs7'),
('Karting Paracuellos','Madrid','https://maps.app.goo.gl/9HUHzgrqB7YtuiRr9'),
('Karting Pinto','Madrid','https://maps.app.goo.gl/xhr9FTUVCgRrtFyz8'),
('Indoor Karting Barcelona','Barcelona','https://maps.app.goo.gl/dB8GSSTtMgr327w96');

-- Recompensas
INSERT INTO Recompensas (nombre, fechaInicioRecompensa, fechaLimiteRecompensa)
VALUES
('Casco Fernando Alonso','2025-06-01','2025-06-30'),
('Mono de carreras','2025-07-01','2025-07-31'),
('Trofeo Oro','2025-08-01','2025-08-31'),
('Medalla Plata','2025-09-01','2025-09-30'),
('Guantes Racing','2025-10-01','2025-10-31');

-- Temporadas
INSERT INTO Temporadas (nombre, fecha_inicio, fecha_fin)
VALUES
('Temporada 2025 (1)','2025-01-01','2025-06-30'),
('Temporada 2025 (2)','2025-07-01','2025-12-31');

-- Torneos
INSERT INTO Torneos (nombreTorneo, fecha_inicio, fecha_fin, nivelMin, nivelMax, maxInscripciones)
VALUES
('Torneo de Verano 2025','2025-06-01','2025-08-31','1','5','12'),
('Torneo de Invierno 2025','2025-09-01','2025-12-31','1','5','12'),
('Copa Primavera 2025','2025-03-01','2025-05-31','2','4','10'),
('Gran Premio Madrid','2025-07-15','2025-07-20','3','5','8');

-- CARRERAS ACTUALIZADAS CON CAMPO HORA
INSERT INTO Carreras (fecha, hora, id_karting, id_torneo, nivelMin, nivelMax, maxInscripciones)
VALUES
('2025-06-01', '10:00:00', 1, 1, 1, 5, 12),
('2025-06-01', '15:30:00', 2, 1, 1, 5, 12),
('2025-06-08', '11:00:00', 3, 1, 2, 4, 10),
('2025-06-15', '16:00:00', 4, NULL, 1, 3, 8), -- Carrera suelta
('2025-07-05', '14:00:00', 5, 2, 2, 5, 12),
('2025-07-12', '17:30:00', 6, 2, 1, 4, 10),
('2025-03-15', '12:00:00', 7, 3, 2, 4, 10),
('2025-07-17', '18:00:00', 8, 4, 3, 5, 8);

-- Inscripciones a Torneos
INSERT INTO InscripcionesTorneo (id_torneo, id_piloto, fecha_inscripcion)
VALUES
(1, 1, '2025-05-08'),
(1, 2, '2025-05-10'),
(1, 3, '2025-05-12'),
(2, 1, '2025-08-15'),
(2, 4, '2025-08-18'),
(3, 2, '2025-02-20'),
(3, 3, '2025-02-22'),
(4, 1, '2025-07-01'),
(4, 5, '2025-07-03');

-- Inscripciones a Carreras (solo para carreras sueltas)
INSERT INTO InscripcionesCarrera (id_carrera, id_piloto, fecha_inscripcion)
VALUES
(4, 1, '2025-06-10'), -- Carrera suelta del 15 de junio
(4, 2, '2025-06-11'),
(4, 3, '2025-06-12'),
(4, 5, '2025-06-13');

-- Relación Torneos-Kartings
INSERT INTO TorneoKartings (id_torneo, id_karting)
VALUES
(1, 1), -- Torneo Verano en Carlos Sainz Las Rozas
(1, 2), -- Torneo Verano también en Carlos Sainz Madrid
(1, 3), -- Torneo Verano también en Karting Rivas
(2, 4), -- Torneo Invierno en Angel Burgueño
(2, 5), -- Torneo Invierno también en Formula Cero
(3, 6), -- Copa Primavera en Los Santos
(3, 7), -- Copa Primavera también en Speed Park
(4, 8); -- Gran Premio Madrid en Asupark

-- Resultados de Carreras
INSERT INTO ResultadosCarreras (id_carrera, id_piloto, posicion, tiempoTotal)
VALUES
-- Carrera 1
(1, 1, 1, '01:01:30'),
(1, 2, 2, '01:02:15'),
(1, 3, 3, '01:03:45'),
-- Carrera 2
(2, 1, 2, '01:01:25'),
(2, 2, 1, '01:00:58'),
(2, 4, 3, '01:02:30'),
-- Carrera 3
(3, 2, 1, '01:05:12'),
(3, 3, 2, '01:05:45'),
-- Carrera suelta
(4, 1, 1, '00:58:30'),
(4, 2, 2, '00:59:15'),
(4, 3, 3, '01:00:22'),
(4, 5, 4, '01:01:10');

-- Resultados de Torneos
INSERT INTO ResultadosTorneo (id_torneo, id_piloto, puntosTorneo)
VALUES
(1, 1, 250), -- Juan en Torneo Verano
(1, 2, 200), -- María en Torneo Verano
(1, 3, 150), -- Carlos en Torneo Verano
(2, 1, 180), -- Juan en Torneo Invierno
(2, 4, 220), -- Ana en Torneo Invierno
(3, 2, 300), -- María en Copa Primavera
(3, 3, 250), -- Carlos en Copa Primavera
(4, 1, 400), -- Juan en Gran Premio
(4, 5, 350); -- Pedro en Gran Premio

-- Puntos por Temporada
INSERT INTO TemporadaUsuarios (id_temporada, id_piloto, puntos)
VALUES
(1, 1, 650), -- Juan en Temporada 1
(1, 2, 500), -- María en Temporada 1
(1, 3, 400), -- Carlos en Temporada 1
(2, 1, 580), -- Juan en Temporada 2
(2, 4, 220), -- Ana en Temporada 2
(2, 5, 350); -- Pedro en Temporada 2

-- Recompensas por Temporada
INSERT INTO TemporadaRecompensas (id_temporada, id_recompensa, nombre_recompensa, descripcion, posicion_min, posicion_max) 
VALUES 
(1, 1, 'Casco Fernando Alonso', 'Otorgado al campeón de la temporada', 1, 1),
(1, 2, 'Mono de carreras', 'Otorgado a los competidores del 2° al 5° puesto', 2, 5),
(2, 3, 'Trofeo Oro', 'Para el primer clasificado', 1, 1),
(2, 4, 'Medalla Plata', 'Para el segundo y tercer clasificado', 2, 3),
(2, 5, 'Guantes Racing', 'Para el cuarto al décimo clasificado', 4, 10);

-- Recompensas por Torneo
INSERT INTO TorneoRecompensas (id_torneo, id_recompensa, nombre_recompensa, descripcion, posicion_min, posicion_max)
VALUES
(1, 1, 'Casco Fernando Alonso', 'Premio al ganador del Torneo de Verano', 1, 1),
(1, 2, 'Mono de carreras', 'Premio al podio del Torneo de Verano', 2, 3),
(2, 3, 'Trofeo Oro', 'Premio al ganador del Torneo de Invierno', 1, 1),
(3, 4, 'Medalla Plata', 'Premio al ganador de la Copa Primavera', 1, 1),
(4, 5, 'Guantes Racing', 'Premio al ganador del Gran Premio Madrid', 1, 1);

-- Recompensas obtenidas por usuarios
INSERT INTO UsuarioRecompensas (id_usuario, id_recompensa)
VALUES
(1, 1), -- Juan obtiene Casco Fernando Alonso
(1, 3), -- Juan obtiene Trofeo Oro
(1, 5), -- Juan obtiene Guantes Racing
(2, 2), -- María obtiene Mono de carreras
(2, 4), -- María obtiene Medalla Plata
(3, 2), -- Carlos obtiene Mono de carreras
(4, 3), -- Ana obtiene Trofeo Oro
(5, 5); -- Pedro obtiene Guantes Racing
