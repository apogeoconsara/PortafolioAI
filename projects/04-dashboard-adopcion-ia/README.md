# 04 · Dashboard de adopción de IA

**Actividad de la vacante que demuestra:** *"Conocimiento de herramientas de análisis de datos (Power BI,
Excel, SQL)"* y la necesidad de reportar el progreso de las iniciativas de IA al director técnico y a las
partes interesadas globales.

## Objetivo

Medir, con datos y no solo con percepción, si la adopción de IA en los equipos de ingeniería está
funcionando: cuántas automatizaciones están activas, cuántas horas ahorran y cuántos tickets resuelve el
agente de soporte sin intervención humana.

## Modelo de datos

Tres tablas simples, pensadas para vivir en una base de datos ligera o en Excel/Power Query:

- `equipos` — catálogo de equipos de ingeniería.
- `automatizaciones` — cada iniciativa de IA implementada (tipo, equipo dueño, fecha de lanzamiento,
  horas ahorradas/mes estimadas).
- `tickets_agente` — registro de interacciones del agente de soporte (resuelto vs. escalado).

Ver `schema.sql` para las definiciones y `datos_ejemplo.sql` para datos de prueba.

## Consultas clave (`consultas_metricas.sql`)

1. **Horas ahorradas por equipo y por mes** — la métrica principal para el reporte al director técnico.
2. **Tasa de resolución del agente sin intervención humana** — mide qué tan confiable es el agente.
3. **Automatizaciones activas por tipo** (prueba, reporte, diseño) — para ver en qué área hay más adopción
   y dónde falta.
4. **Ranking de equipos por adopción** — para identificar champions internos que puedan capacitar a otros.

## Especificación del dashboard en Power BI

`especificacion_dashboard.md` describe, página por página, qué visual usar para cada consulta (tarjeta KPI,
gráfico de barras, gráfico de líneas, tabla), qué filtros globales debe tener (equipo, rango de fechas, tipo
de automatización) y qué mensaje debe poder responder cada página en menos de 10 segundos de lectura.

## Archivos

- `schema.sql` — definición de tablas.
- `datos_ejemplo.sql` — datos de prueba (ficticios).
- `consultas_metricas.sql` — consultas SQL comentadas.
- `especificacion_dashboard.md` — guía para construir el dashboard en Power BI.
