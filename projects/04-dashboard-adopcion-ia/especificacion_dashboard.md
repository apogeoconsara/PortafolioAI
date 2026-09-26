# Especificación del dashboard de adopción de IA (Power BI)

## Filtros globales (panel lateral, aplican a todas las páginas)

- Equipo (`equipos.nombre_equipo`)
- Rango de fechas (`automatizaciones.fecha_lanzamiento`)
- Tipo de automatización (`automatizaciones.tipo`)

## Página 1 · Resumen ejecutivo

Pregunta que debe responder en menos de 10 segundos: **¿la adopción de IA está generando impacto medible?**

| Visual                | Fuente (consulta)                          | Notas de diseño |
|------------------------|---------------------------------------------|------------------|
| Tarjeta KPI            | Suma de `horas_ahorradas_mes_total` (consulta 1) | Número grande, comparado contra el mes anterior |
| Tarjeta KPI            | `tasa_resolucion_pct` global (consulta 2)   | Con semáforo de color (rojo <60%, ámbar 60-80%, verde >80%) |
| Gráfico de líneas      | Consulta 1, por mes                         | Tendencia de horas ahorradas en el tiempo |
| Gráfico de barras      | Consulta 3, por tipo                        | Para ver en qué área hay más adopción |

## Página 2 · Detalle por equipo

Pregunta: **¿qué equipos están adoptando IA y cuáles necesitan apoyo?**

| Visual         | Fuente (consulta)     | Notas de diseño |
|-----------------|-------------------------|------------------|
| Tabla           | Consulta 4              | Ordenada por horas ahorradas descendente |
| Gráfico de barras horizontal | Consulta 4 | Para comparación visual rápida entre equipos |

## Página 3 · Salud del agente de soporte

Pregunta: **¿el agente de IA está resolviendo tickets de forma confiable?**

| Visual         | Fuente (consulta) | Notas de diseño |
|-----------------|----------------------|------------------|
| Tarjeta KPI     | Consulta 2, total_tickets | Volumen total procesado |
| Gráfico de dona | Consulta 2, resueltos vs. escalados | Visualiza la proporción directamente |

## Buenas prácticas aplicadas

- Cada página responde **una sola pregunta clave**, evitando dashboards sobrecargados.
- Los KPIs usan semáforos de color en lugar de solo números, para lectura rápida por parte de directivos.
- Las consultas SQL (`consultas_metricas.sql`) están escritas para poder conectarse directamente como fuente
  de datos en Power BI (Get Data > SQL Server/ODBC), evitando duplicar lógica de negocio en DAX.
