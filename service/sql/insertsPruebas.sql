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

-- ULTIMOS INSERTS

-- Inserts para la tabla Usuarios
INSERT INTO Usuarios (username, nombre, apellidos, email, password, fotoPerfil, avatar_tipo, carrerasVictorias, carrerasParticipadas, torneosVictorias, torneosParticipados, provincia, fechaNacimiento, elo, rol) VALUES
('alonsofan', 'Fernando', 'Alonso Díaz', 'fer.alonso@example.com', 'hashedpass123', X'00000001', 'custom', 5, 12, 2, 4, 'Asturias', '1981-07-29', 1500, 'user'),
('leclercspeed', 'Charles', 'Leclerc', 'charles.l@example.com', 'hashedpass456', X'00000002', 'default', 3, 10, 1, 3, 'Mónaco', '1997-10-16', 1450, 'user'),
('maxfast', 'Max', 'Verstappen', 'max.v@example.com', 'hashedpass789', X'00000003', 'custom', 8, 15, 3, 5, 'Limburgo', '1997-09-30', 1600, 'user'),
('checospeed', 'Sergio', 'Pérez', 'checo.p@example.com', 'hashedpassabc', X'00000004', 'default', 1, 7, 0, 2, 'Jalisco', '1990-01-26', 1300, 'user'),
('adminuser', 'Admin', 'Karter', 'admin@example.com', 'adminpass', X'00000005', 'custom', 0, 0, 0, 0, 'Madrid', '1990-01-01', 0, 'admin'),
('danielrace', 'Daniel', 'Ricciardo', 'daniel.r@example.com', 'danny_pass', X'0000000A', 'default', 2, 8, 0, 2, 'Perth', '1989-07-01', 1350, 'user'),
('lando_norris', 'Lando', 'Norris', 'lando.n@example.com', 'lando_pass', X'0000000B', 'custom', 4, 11, 1, 3, 'Bristol', '1999-11-13', 1480, 'user');

-- TORNEOS

-- Torneos ya finalizados
INSERT INTO Torneos (nombreTorneo, fecha_inicio, fecha_fin, nivelMin, nivelMax, maxInscripciones) VALUES
('Gran Premio Primavera Sevilla 2025', '2025-04-20', '2025-04-22', 1000, 1600, 18), -- id 1
('Copa Regional Bilbao 2025', '2025-05-10', '2025-05-12', 900, 1500, 20),           -- id 2

-- Torneos próximos
('Desafío Verano Málaga 2025', '2025-07-15', '2025-07-17', 1100, 1800, 16),         -- id 3
('Open Karting Galicia 2025', '2025-08-05', '2025-08-07', 950, 1700, 20);           -- id 4

-- TORNEO-KARTINGS
INSERT INTO TorneoKartings (id_torneo, id_karting) VALUES
(4, 4), (4, 5), (2, 4), (3, 1);

-- Carreras sueltas (sin torneo)
INSERT INTO Carreras (fecha, hora, id_karting, id_torneo, nivelMin, nivelMax, maxInscripciones) VALUES
('2025-04-20', '10:00:00', 4, NULL, 1000, 1600, 9),
('2025-05-10', '11:00:00', 5, NULL, 900, 1500, 10);
-- Carreras de torneo (con id_torneo)
INSERT INTO Carreras (fecha, hora, id_karting, id_torneo, nivelMin, nivelMax, maxInscripciones) VALUES
('2025-04-20', '10:00:00', 4, 1, 1000, 1600, 9),
('2025-07-15', '11:00:00', 4, 3, 1100, 1800, 8),
('2025-08-06', '16:30:00', 1, 4, 950, 1700, 12);

-- INSCRIPCIONES A TORNEOS
INSERT INTO InscripcionesTorneo (id_torneo, id_piloto) VALUES
(1, 1), (1, 3), (1, 6),
(2, 2), (2, 4),
(3, 3), (3, 4),
(4, 1), (4, 6);

-- RESULTADOS TORNEOS
INSERT INTO ResultadosTorneo (id_torneo, id_piloto, puntosTorneo) VALUES
(1, 3, 60),
(1, 1, 50),
(1, 6, 40),
(2, 2, 55),
(2, 4, 45);

-- RECOMPENSAS
INSERT INTO TorneoRecompensas (id_torneo, id_recompensa, nombre_recompensa, descripcion, posicion_min, posicion_max) VALUES
(1, 1, 'Oro Sevilla', 'Ganador del GP Primavera Sevilla 2025', 1, 1),
(2, 2, 'Oro Bilbao', 'Ganador de la Copa Regional Bilbao 2025', 1, 1),
(3, 3, 'Reto Verano Málaga', 'Premio especial para ganadores del Desafío de Verano', 1, 3);