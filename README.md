# Portafolio · Especialista de Implementación de IA (Alten México)

Portafolio construido específicamente para la vacante de **Especialista de Implementación de IA** en
**Alten México**. No es un sitio estático: incluye un **motor funcional de 4 agentes de IA encadenados**
(`motor-ia.html` + Netlify Functions llamando a Claude en vivo), más 5 proyectos de código/documentación
adicionales, cada uno mapeado a una actividad concreta de la descripción del puesto.

## El motor de adopción de IA (`motor-ia.html`)

Pipeline real, no simulado: **Auditor → Priorizador → Diseñador de solución → Reportero**. El usuario
describe un proceso de ingeniería; cada agente es una Netlify Function (`netlify/functions/*.mts`) que llama
a la API de Claude y pasa su salida estructurada (JSON) al siguiente agente, hasta producir un reporte en
markdown descargable. Desplegado en `https://sarahiportafolioalten.netlify.app` (rama de esta sesión en
`https://claude-kind-euler-4jv3it--sarahiportafolioalten.netlify.app`).

Requiere la variable de entorno `ANTHROPIC_API_KEY` configurada en Netlify (ya está configurada en este
proyecto). Estructura de las funciones:

```
netlify/functions/
  _lib/claude.mts       Cliente de Anthropic + helpers para respuestas JSON/texto
  audit.mts             Agente 1: detecta oportunidades de automatización
  prioritize.mts        Agente 2: puntúa impacto/esfuerzo y prioriza
  design-agent.mts      Agente 3: diseña la solución (plataforma, arquitectura, prompt)
  report.mts            Agente 4: redacta el reporte final en markdown
```

## Ver el sitio

Abre `index.html` en el navegador para la landing, y `motor-ia.html` para el motor en vivo (el motor solo
funciona desplegado en Netlify, porque necesita las funciones serverless).

## Estructura

```
index.html                          Sitio del portafolio
motor-ia.html                       Motor de adopción de IA (pipeline de agentes)
netlify/functions/                  Los 4 agentes del pipeline (Netlify Functions + Claude)
assets/                             CSS/JS del sitio y del motor
projects/
  01-auditoria-automatizacion-flujos/     Auditoría de procesos + script de priorización
  02-agente-ia-soporte-tecnico/           Agente de soporte con enrutamiento y escalamiento
  03-prompt-engineering-tokens/           Biblioteca de prompts + optimizador de tokens
  04-dashboard-adopcion-ia/               Modelo de datos, SQL y especificación de dashboard Power BI
  05-capacitacion-gestion-cambio/         Plan de capacitación + plantilla de documentación interna
```

Cada carpeta de `projects/` tiene su propio `README.md` con el problema que resuelve, cómo ejecutarlo y qué
actividad de la vacante demuestra. Todo el código (`.py`, `.sql`) fue ejecutado y verificado antes de
publicarse.

## Contacto

sarahicruzsalazar@gmail.com
