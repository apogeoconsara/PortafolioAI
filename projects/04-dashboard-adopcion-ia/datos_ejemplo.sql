-- Datos ficticios de ejemplo para probar las consultas de consultas_metricas.sql

INSERT INTO equipos (equipo_id, nombre_equipo, area) VALUES
    (1, 'Equipo QA Automotriz', 'Pruebas'),
    (2, 'Equipo Diseño Estructural', 'Diseño'),
    (3, 'Equipo Soporte Global', 'Infraestructura');

INSERT INTO automatizaciones
    (automatizacion_id, equipo_id, nombre, tipo, fecha_lanzamiento, horas_ahorradas_mes, activa) VALUES
    (1, 1, 'Generador de reportes de smoke tests', 'reporte', '2026-01-15', 24, TRUE),
    (2, 1, 'Clasificador de bugs por severidad',   'prueba',  '2026-02-01', 10, TRUE),
    (3, 2, 'Checklist automático de diseño',       'diseño',  '2026-02-10', 12, TRUE),
    (4, 3, 'Agente de soporte técnico nivel 1',    'agente',  '2026-01-20', 30, TRUE),
    (5, 2, 'Piloto de revisión de planos con IA',  'diseño',  '2026-03-01', 8,  FALSE);

INSERT INTO tickets_agente (ticket_id, equipo_id, fecha, resuelto_por_agente) VALUES
    (1, 3, '2026-03-02', TRUE),
    (2, 3, '2026-03-02', TRUE),
    (3, 3, '2026-03-03', FALSE),
    (4, 3, '2026-03-04', TRUE),
    (5, 3, '2026-03-05', TRUE),
    (6, 3, '2026-03-05', FALSE),
    (7, 3, '2026-03-06', TRUE);
