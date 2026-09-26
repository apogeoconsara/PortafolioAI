# Plan de capacitación: adopción de IA en ingeniería

Duración total: 4 sesiones de 1.5 horas, una por semana. Audiencia: ingenieros sin experiencia previa en
LLMs. Modalidad: taller práctico (no solo presentación).

## Sesión 1 · Fundamentos de LLMs y casos de uso en ingeniería

- **Objetivo:** que cada participante identifique 2 tareas de su propio trabajo que podría acelerar con IA.
- **Contenido:** qué es un LLM, qué puede y qué no puede hacer bien, ejemplos reales de Mistral/Copilot/Glean
  en pruebas, reportes y diseño.
- **Actividad práctica:** cada participante lista 2 tareas repetitivas de su día a día (usando el checklist
  del proyecto 01) y las comparte con el grupo.
- **Evaluación:** lista de tareas candidatas entregada por cada participante.

## Sesión 2 · Ingeniería de prompts y optimización de tokens

- **Objetivo:** escribir prompts efectivos y entender por qué un prompt vago cuesta más (en tokens y en
  calidad de la respuesta).
- **Contenido:** estructura rol + tarea + formato + restricciones (ver proyecto 03), errores comunes.
- **Actividad práctica:** cada participante reescribe uno de sus prompts actuales usando la estructura
  enseñada y mide la diferencia con el script `optimizador_tokens.py`.
- **Evaluación:** par de prompts "antes/después" entregado por cada participante.

## Sesión 3 · Construyendo tu primer agente o automatización

- **Objetivo:** que cada participante tenga un prototipo funcional, aunque sea simple, de una automatización
  para su equipo.
- **Contenido:** patrón clasificar → recuperar → decidir/escalar (ver proyecto 02), cuándo usar un agente vs.
  un script simple.
- **Actividad práctica:** en parejas, construyen un prototipo mínimo sobre una de las tareas identificadas en
  la Sesión 1.
- **Evaluación:** demo de 5 minutos por pareja al final de la sesión.

## Sesión 4 · Medición, buenas prácticas y plan de adopción

- **Objetivo:** que cada equipo salga con un plan para llevar su prototipo a producción y medir su impacto.
- **Contenido:** cómo definir métricas simples (horas ahorradas, tasa de resolución), buenas prácticas de
  gobierno de IA (revisión humana, manejo de datos sensibles), cómo documentar en Confluence/SharePoint
  (ver `plantilla_guia_interna.md`).
- **Actividad práctica:** cada equipo redacta su guía interna usando la plantilla y define 1 métrica de éxito.
- **Evaluación:** guía interna completa + métrica de éxito definida por cada equipo.

## Seguimiento post-capacitación

- Re-auditoría a las 4 semanas (usando el mismo checklist del proyecto 01) para medir adopción real y
  detectar nuevas oportunidades.
- Canal de soporte continuo (ej. canal de Teams/Slack) para dudas de los equipos al implementar sus
  prototipos.
