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
