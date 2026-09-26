# 02 · Agente de soporte técnico con enrutamiento y base de conocimiento

**Actividad de la vacante que demuestra:** *"Guiar a los ingenieros en el desarrollo de herramientas de IA,
agentes y chatbots utilizando plataformas como Mistral, Copilot, Glean u otros LLMs específicos del proyecto."*

## Qué resuelve

Muchos equipos de soporte reciben preguntas repetidas (cómo configurar el entorno, dónde está la
documentación, cómo reabrir un ticket) que consumen tiempo de ingenieros senior. Este agente:

1. Clasifica el ticket entrante por intención (`configuración`, `documentación`, `bug`, `otro`).
2. Busca en una base de conocimiento local (`kb.json`) la respuesta más relevante.
3. Responde directamente si la confianza es alta; si es baja, **escala a un humano** en lugar de inventar
   una respuesta — un requisito no negociable para un agente de soporte interno.

Está escrito sin dependencias externas para que se pueda leer y ejecutar en cualquier máquina, y su diseño
(clasificador + recuperación + umbral de confianza + fallback humano) es el mismo patrón que se usa al
integrar un LLM real (Mistral, Copilot, Glean) en producción: solo cambiaría el clasificador por una llamada
al modelo y la búsqueda por un retriever vectorial.

## Cómo se usa

```bash
python agente_soporte.py
```

Ejecuta una demo interactiva por consola. También se puede importar y usar programáticamente:

```python
from agente_soporte import AgenteSoporte

agente = AgenteSoporte("kb.json")
respuesta = agente.responder("¿Cómo configuro mi entorno local de pruebas?")
print(respuesta)
```

## Ruta de evolución hacia producción

| Componente actual              | Reemplazo sugerido en producción                          |
|--------------------------------|-------------------------------------------------------------|
| Clasificador por palabras clave | Prompt de clasificación con Mistral/Copilot                |
| `kb.json` estático              | Glean o un índice vectorial sobre Confluence/SharePoint     |
| Umbral de confianza fijo        | Calibración con datos reales de tickets resueltos/escalados |
| Consola                         | Integración con el canal de soporte (Teams, Slack, Jira)    |

## Archivos

- `agente_soporte.py` — lógica del agente (clasificación, recuperación, escalamiento).
- `kb.json` — base de conocimiento de ejemplo.
