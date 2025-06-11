-- Inserts para la tabla Usuarios
INSERT INTO Usuarios (username, nombre, apellidos, email, password, fotoPerfil, avatar_tipo, carrerasVictorias, carrerasParticipadas, torneosVictorias, torneosParticipados, provincia, fechaNacimiento, elo, rol) VALUES
('alonsofan', 'Fernando', 'Alonso Díaz', 'fer.alonso@example.com', 'hashedpass123', X'00000001', 'custom', 5, 12, 2, 4, 'Asturias', '1981-07-29', 1500, 'user'),
('leclercspeed', 'Charles', 'Leclerc', 'charles.l@example.com', 'hashedpass456', X'00000002', 'default', 3, 10, 1, 3, 'Mónaco', '1997-10-16', 1450, 'user'),
('maxfast', 'Max', 'Verstappen', 'max.v@example.com', 'hashedpass789', X'00000003', 'custom', 8, 15, 3, 5, 'Limburgo', '1997-09-30', 1600, 'user'),
('checospeed', 'Sergio', 'Pérez', 'checo.p@example.com', 'hashedpassabc', X'00000004', 'default', 1, 7, 0, 2, 'Jalisco', '1990-01-26', 1300, 'user'),
('adminuser', 'Admin', 'Karter', 'admin@example.com', 'adminpass', X'00000005', 'custom', 0, 0, 0, 0, 'Madrid', '1990-01-01', 0, 'admin'),
('danielrace', 'Daniel', 'Ricciardo', 'daniel.r@example.com', 'danny_pass', X'0000000A', 'default', 2, 8, 0, 2, 'Perth', '1989-07-01', 1350, 'user'),
('lando_norris', 'Lando', 'Norris', 'lando.n@example.com', 'lando_pass', X'0000000B', 'custom', 4, 11, 1, 3, 'Bristol', '1999-11-13', 1480, 'user');

-- Inserts para la tabla Recompensas
INSERT INTO Recompensas (nombre, imagen, fechaInicioRecompensa, fechaLimiteRecompensa) VALUES
('Campeón de Oro', X'00000006', '2024-01-01', '2024-12-31'),
('Mejor Vuelta', X'00000007', '2024-01-01', '2024-12-31'),
('Participante Destacado', X'00000008', '2024-01-01', '2024-12-31'),
('Maestro del Derrape', X'00000009', '2024-01-01', '2024-12-31'),
('Leyenda Histórica', X'0000000C', '2023-01-01', '2023-12-31'),
('Novato del Año', X'0000000D', '2023-01-01', '2023-12-31');

-- Inserts para la tabla UsuarioRecompensas
INSERT INTO UsuarioRecompensas (id_usuario, id_recompensa) VALUES
(1, 1),
(1, 2),
(2, 3),
(3, 1),
(3, 4),
(6, 3), -- Daniel Ricciardo tiene "Participante Destacado"
(7, 2), -- Lando Norris tiene "Mejor Vuelta"
(3, 5); -- Max Verstappen tiene "Leyenda Histórica"

-- Inserts para la tabla Kartings
INSERT INTO Kartings (nombre, ciudad, ubicacionLink) VALUES
('Karting La Pista', 'Madrid', 'https://maps.app.goo.gl/ABCDEF12345'),
('Karting Indoor Barcelona', 'Barcelona', 'https://maps.app.goo.gl/XYZUVW67890'),
('Karting Valencia Circuit', 'Valencia', 'https://maps.app.goo.gl/QWERTY98765'),
('Karting Málaga Park', 'Málaga', 'https://maps.app.goo.gl/MALAGAKART'),
('Karting Zaragoza GP', 'Zaragoza', 'https://maps.app.goo.gl/ZARAGOZAKART');

-- Inserts para la tabla Torneos (actualizados y con nuevas entradas pasadas)
INSERT INTO Torneos (nombreTorneo, fecha_inicio, fecha_fin, nivelMin, nivelMax, maxInscripciones) VALUES
('Gran Premio de Madrid', '2024-07-10', '2024-07-12', 1000, 2000, 20),
('Copa Ciudad de Barcelona', '2024-08-01', '2024-08-03', 1200, 1800, 15),
('Campeonato Regional Valencia', '2024-09-05', '2024-09-07', 800, 1500, 25),
-- Nuevos torneos pasados
('Copa Invierno Málaga 2023', '2023-11-15', '2023-11-17', 900, 1600, 18),
('Challenge Zaragoza Spring 2024', '2024-03-20', '2024-03-22', 1100, 1900, 22),
('Trofeo de Verano Madrid 2023', '2023-07-01', '2023-07-03', 700, 1400, 10);


-- Inserts para la tabla TorneoKartings (actualizados para incluir los nuevos torneos)
INSERT INTO TorneoKartings (id_torneo, id_karting) VALUES
(1, 1), -- Gran Premio de Madrid en Karting La Pista
(2, 2), -- Copa Ciudad de Barcelona en Karting Indoor Barcelona
(3, 3), -- Campeonato Regional Valencia en Karting Valencia Circuit
(4, 4), -- Copa Invierno Málaga 2023 en Karting Málaga Park
(5, 5), -- Challenge Zaragoza Spring 2024 en Karting Zaragoza GP
(6, 1); -- Trofeo de Verano Madrid 2023 en Karting La Pista

-- Inserts para la tabla InscripcionesTorneo (actualizados para incluir los nuevos torneos y usuarios)
INSERT INTO InscripcionesTorneo (id_torneo, id_piloto) VALUES
(1, 1), (1, 2), (1, 3),
(2, 2), (2, 4),
(3, 1), (3, 3), (3, 4),
-- Inscripciones para torneos pasados
(4, 1), (4, 6), (4, 7), -- Copa Invierno Málaga 2023
(5, 3), (5, 4), (5, 6), (5, 7), -- Challenge Zaragoza Spring 2024
(6, 1), (6, 2); -- Trofeo de Verano Madrid 2023

-- Inserts para la tabla Carreras (actualizados y con nuevas entradas pasadas)
INSERT INTO Carreras (fecha, hora, id_karting, id_torneo, nivelMin, nivelMax, maxInscripciones) VALUES
('2024-07-10', '10:00:00', 1, 1, 1000, 2000, 10), -- Carrera 1 GP Madrid
('2024-07-11', '14:30:00', 1, 1, 1000, 2000, 10), -- Carrera 2 GP Madrid
('2024-08-02', '11:00:00', 2, 2, 1200, 1800, 8),  -- Carrera 1 Copa Barcelona
('2024-09-06', '16:00:00', 3, 3, 800, 1500, 12),  -- Carrera 1 Campeonato Valencia
('2024-06-20', '18:00:00', 1, NULL, 500, 1000, 15), -- Carrera suelta futura
-- Nuevas carreras pasadas
('2023-11-15', '10:30:00', 4, 4, 900, 1600, 9), -- Carrera 1 Copa Invierno Málaga
('2023-11-16', '15:00:00', 4, 4, 900, 1600, 9), -- Carrera 2 Copa Invierno Málaga
('2024-03-21', '11:00:00', 5, 5, 1100, 1900, 11), -- Carrera 1 Challenge Zaragoza
('2024-03-22', '14:00:00', 5, 5, 1100, 1900, 11), -- Carrera 2 Challenge Zaragoza
('2023-07-02', '17:00:00', 1, 6, 700, 1400, 7), -- Carrera 1 Trofeo de Verano Madrid
('2023-01-10', '19:00:00', 2, NULL, 600, 1100, 12), -- Carrera suelta pasada (Barcelona)
('2024-02-28', '13:00:00', 3, NULL, 850, 1350, 10); -- Carrera suelta pasada (Valencia)


-- Inserts para la tabla InscripcionesCarrera (actualizados para nuevas carreras y pilotos)
INSERT INTO InscripcionesCarrera (id_carrera, id_piloto) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 2), (2, 3),
(3, 2), (3, 4),
(4, 1), (4, 3), (4, 4),
(5, 1), (5, 2), (5, 4),
-- Inscripciones para las nuevas carreras pasadas
(6, 1), (6, 6), (6, 7),
(7, 1), (7, 6), (7, 7),
(8, 3), (8, 4), (8, 6),
(9, 3), (9, 4), (9, 7),
(10, 1), (10, 2),
(11, 4), (11, 6), (11, 7),
(12, 1), (12, 3), (12, 6);

-- Inserts para la tabla ResultadosCarreras (actualizados para nuevas carreras pasadas)
INSERT INTO ResultadosCarreras (id_carrera, id_piloto, posicion, tiempoTotal, fotoConfirmacion, fotoConfirmacionTipo) VALUES
(1, 3, 1, '00:01:25.123', X'00000010', 'image/jpeg'),
(1, 1, 2, '00:01:25.500', X'00000011', 'image/jpeg'),
(1, 2, 3, '00:01:26.010', X'00000012', 'image/jpeg'),
(2, 1, 1, '00:01:24.900', X'00000013', 'image/png'),
(2, 3, 2, '00:01:25.200', X'00000014', 'image/png'),
(3, 2, 1, '00:01:30.000', X'00000015', 'image/jpeg'),
(4, 3, 1, '00:01:28.500', X'00000016', 'image/jpeg'),
(5, 4, 1, '00:01:35.000', X'00000017', 'image/png'),
-- Resultados para nuevas carreras pasadas
(6, 6, 1, '00:01:29.000', X'00000023', 'image/jpeg'), -- Daniel Ricciardo gana en Málaga
(6, 1, 2, '00:01:29.500', X'00000024', 'image/jpeg'),
(7, 7, 1, '00:01:28.100', X'00000025', 'image/png'), -- Lando Norris gana en Málaga
(7, 6, 2, '00:01:28.300', X'00000026', 'image/png'),
(8, 3, 1, '00:01:27.000', X'00000027', 'image/jpeg'), -- Max Verstappen gana en Zaragoza
(8, 7, 2, '00:01:27.400', X'00000028', 'image/jpeg'),
(9, 3, 1, '00:01:26.500', X'00000029', 'image/png'),
(10, 1, 1, '00:01:32.000', X'0000002A', 'image/jpeg'), -- Fernando Alonso gana en Madrid (verano 2023)
(10, 2, 2, '00:01:32.500', X'0000002B', 'image/jpeg'),
(11, 4, 1, '00:01:36.000', X'0000002C', 'image/png'), -- Checo Pérez gana carrera suelta en Barcelona
(12, 1, 1, '00:01:31.000', X'0000002D', 'image/jpeg'); -- Fernando Alonso gana carrera suelta en Valencia

-- Inserts para la tabla ResultadosTorneo (actualizados para incluir los nuevos torneos pasados)
INSERT INTO ResultadosTorneo (id_torneo, id_piloto, puntosTorneo) VALUES
(1, 3, 50),
(1, 1, 40),
(1, 2, 30),
(2, 2, 50),
(2, 4, 35),
(3, 3, 60),
(3, 1, 45),
(3, 4, 20),
-- Resultados para torneos pasados
(4, 6, 55), -- Daniel Ricciardo ganó Copa Invierno Málaga
(4, 1, 45),
(4, 7, 30),
(5, 3, 70), -- Max Verstappen ganó Challenge Zaragoza
(5, 7, 40),
(5, 4, 25),
(6, 1, 50), -- Fernando Alonso ganó Trofeo de Verano Madrid
(6, 2, 30);

-- Inserts para la tabla Temporadas
INSERT INTO Temporadas (nombre, fecha_inicio, fecha_fin) VALUES
('Temporada 2024', '2024-01-01', '2024-12-31'),
('Temporada 2025', '2025-01-01', '2025-12-31'),
('Temporada 2023', '2023-01-01', '2023-12-31'); -- Nueva temporada pasada

-- Inserts para la tabla TemporadaUsuarios (actualizados para nueva temporada y usuarios)
INSERT INTO TemporadaUsuarios (id_temporada, id_piloto, puntos) VALUES
(1, 1, 120),
(1, 2, 100),
(1, 3, 150),
(1, 4, 80),
(2, 1, 10), -- Puntos iniciales para 2025
(2, 3, 15),
(3, 1, 200), -- Puntos de 2023
(3, 3, 180),
(3, 6, 90),
(3, 7, 110);

-- Inserts para la tabla TemporadaRecompensas (actualizados para nueva temporada)
INSERT INTO TemporadaRecompensas (id_temporada, id_recompensa, nombre_recompensa, descripcion, posicion_min, posicion_max) VALUES
(1, 1, 'Campeón Anual', 'Recompensa para el campeón de la temporada', 1, 1),
(1, 3, 'Top 5 Temporada', 'Recompensa para los 5 mejores pilotos de la temporada', 1, 5),
(3, 5, 'Leyenda 2023', 'Recompensa para el mejor piloto de la temporada 2023', 1, 1),
(3, 6, 'Rookie 2023', 'Recompensa para el novato destacado de 2023', 1, 3);

-- Inserts para la tabla TorneoRecompensas (actualizados para nuevos torneos)
INSERT INTO TorneoRecompensas (id_torneo, id_recompensa, nombre_recompensa, descripcion, posicion_min, posicion_max) VALUES
(1, 1, 'Oro GP Madrid', 'Para el ganador del Gran Premio de Madrid', 1, 1),
(1, 2, 'Podio GP Madrid', 'Para los 3 primeros del Gran Premio de Madrid', 1, 3),
(2, 1, 'Oro Copa Barcelona', 'Para el ganador de la Copa Ciudad de Barcelona', 1, 1),
(4, 1, 'Campeón Invierno Málaga', 'Ganador de la Copa Invierno Málaga 2023', 1, 1), -- Nueva recompensa
(5, 1, 'Campeón Zaragoza Spring', 'Ganador de la Challenge Zaragoza Spring 2024', 1, 1), -- Nueva recompensa
(6, 1, 'Campeón Verano Madrid 2023', 'Ganador del Trofeo de Verano Madrid 2023', 1, 1); -- Nueva recompensa

-- Inserts para la tabla VerificacionesCarreraFoto (actualizados para nuevas carreras)
INSERT INTO VerificacionesCarreraFoto (id_carrera, id_piloto, fotoVerificacion, tipoFotoVerificacion) VALUES
(1, 3, X'00000020', 'image/jpeg'),
(1, 1, X'00000021', 'image/jpeg'),
(3, 2, X'00000022', 'image/png'),
(6, 6, X'0000002E', 'image/jpeg'),
(8, 3, X'0000002F', 'image/png'),
(11, 4, X'00000030', 'image/jpeg');