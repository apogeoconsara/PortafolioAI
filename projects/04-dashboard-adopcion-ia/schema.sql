-- Modelo de datos para el dashboard de adopción de IA.
-- Compatible con SQLite/PostgreSQL/SQL Server con ajustes menores de tipos.

CREATE TABLE equipos (
    equipo_id     INTEGER PRIMARY KEY,
    nombre_equipo TEXT NOT NULL,
    area          TEXT NOT NULL  -- ej. 'Pruebas', 'Diseño', 'Infraestructura'
);

CREATE TABLE automatizaciones (
    automatizacion_id  INTEGER PRIMARY KEY,
    equipo_id           INTEGER NOT NULL REFERENCES equipos(equipo_id),
    nombre               TEXT NOT NULL,
    tipo                 TEXT NOT NULL,   -- 'prueba', 'reporte', 'diseño', 'agente'
    fecha_lanzamiento    DATE NOT NULL,
    horas_ahorradas_mes  NUMERIC NOT NULL,
    activa               BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE tickets_agente (
    ticket_id    INTEGER PRIMARY KEY,
    equipo_id     INTEGER NOT NULL REFERENCES equipos(equipo_id),
    fecha         DATE NOT NULL,
    resuelto_por_agente BOOLEAN NOT NULL  -- TRUE = resuelto sin humano, FALSE = escalado
);
