# 01 · Auditoría de flujo de pruebas y detección de automatización con IA

**Actividad de la vacante que demuestra:** *"Auditar proyectos de ingeniería para identificar oportunidades de
automatización y optimización impulsadas por IA (pruebas, reportes, diseño y mejoras en flujos de trabajo)."*

## Problema

Los equipos de ingeniería suelen tener tareas repetitivas (ejecutar checklists de pruebas, redactar reportes de
estatus, revisar formatos de diseño) que consumen horas de ingenieros senior y son candidatas naturales para
IA generativa o automatización simple.

## Solución

Un framework de auditoría en dos partes:

1. **Checklist de auditoría** (`checklist_auditoria.md`) que un especialista de IA puede aplicar en una reunión
   de 45 minutos con un Líder de Proyecto para mapear el flujo actual.
2. **Script `auditor.py`**, que toma un inventario de tareas (CSV) con su frecuencia y duración, y calcula:
   - Horas/mes consumidas por tarea.
   - Un score de "automatizable con IA" (0-3) según criterios objetivos.
   - Ahorro estimado si se automatiza con IA generativa vs. scripting clásico.

## Cómo se usa

```bash
python auditor.py tareas_ejemplo.csv
```

Salida esperada (resumen impreso en consola + `hallazgos.csv` generado):

```
Tarea                                         Horas/mes  Score IA   Ahorro estimado/mes
Clasificar tickets entrantes de soporte            10.0         3           8.0 h (80%)
Generar reporte semanal de avance                   8.0         3           6.4 h (80%)
Ejecutar smoke tests manuales                      12.0         2           6.0 h (50%)
Redactar minuta de reunión de status                4.0         3           3.2 h (80%)
Actualizar documentación técnica tras cada release  6.0         2           3.0 h (50%)
Revisar checklist de diseño                         5.0         2           2.5 h (50%)
```

## Entregable para el cliente/Líder de Proyecto

`hallazgos.csv` se diseñó para pegarse directamente como tabla en Confluence o adjuntarse en un ticket de Jira
como respaldo de la iniciativa de automatización priorizada.

## Archivos

- `checklist_auditoria.md` — guía de la entrevista de auditoría.
- `auditor.py` — script de análisis y priorización.
- `tareas_ejemplo.csv` — datos de ejemplo (ficticios) de un proyecto de ingeniería.
