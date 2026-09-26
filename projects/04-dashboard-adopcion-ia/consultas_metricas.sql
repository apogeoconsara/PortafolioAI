-- Consultas para el dashboard de adopción de IA.
-- Diseñadas para conectarse directamente como fuente de datos en Power BI
-- (cada consulta puede usarse como una "vista" independiente).

-- 1. Horas ahorradas por equipo y por mes de lanzamiento (métrica principal).
SELECT
    e.nombre_equipo,
    strftime('%Y-%m', a.fecha_lanzamiento) AS mes_lanzamiento,
    SUM(a.horas_ahorradas_mes) AS horas_ahorradas_mes_total
FROM automatizaciones a
JOIN equipos e ON e.equipo_id = a.equipo_id
WHERE a.activa = TRUE
GROUP BY e.nombre_equipo, mes_lanzamiento
ORDER BY mes_lanzamiento;

-- 2. Tasa de resolución del agente sin intervención humana, por equipo.
SELECT
    e.nombre_equipo,
    COUNT(*) AS total_tickets,
    SUM(CASE WHEN t.resuelto_por_agente THEN 1 ELSE 0 END) AS resueltos_por_agente,
    ROUND(
        100.0 * SUM(CASE WHEN t.resuelto_por_agente THEN 1 ELSE 0 END) / COUNT(*),
        1
    ) AS tasa_resolucion_pct
FROM tickets_agente t
JOIN equipos e ON e.equipo_id = t.equipo_id
GROUP BY e.nombre_equipo;

-- 3. Automatizaciones activas por tipo (prueba, reporte, diseño, agente).
SELECT
    tipo,
    COUNT(*) AS automatizaciones_activas,
    SUM(horas_ahorradas_mes) AS horas_ahorradas_mes_total
FROM automatizaciones
WHERE activa = TRUE
GROUP BY tipo
ORDER BY horas_ahorradas_mes_total DESC;

-- 4. Ranking de equipos por adopción (para identificar "champions" internos).
SELECT
    e.nombre_equipo,
    COUNT(a.automatizacion_id) AS num_automatizaciones,
    SUM(a.horas_ahorradas_mes) AS horas_ahorradas_mes_total
FROM equipos e
LEFT JOIN automatizaciones a ON a.equipo_id = e.equipo_id AND a.activa = TRUE
GROUP BY e.nombre_equipo
ORDER BY horas_ahorradas_mes_total DESC;
