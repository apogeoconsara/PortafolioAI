# 03 · Biblioteca de prompts y optimizador de tokens

**Actividad de la vacante que demuestra:** *"Ingeniería de prompts y optimización de tokens"* y *"Apoyar la
implementación de soluciones de IA (ingeniería de prompts, optimización de tokens...)."*

## Contenido

- `prompts_ingenieria.md` — 5 prompts reutilizables para tareas comunes de un equipo de ingeniería
  (generación de casos de prueba, resumen de reportes, revisión de diseño, redacción de tickets, guía de
  onboarding), cada uno con versión **"antes"** (prompt ingenuo) y **"después"** (optimizado).
- `optimizador_tokens.py` — script que estima el número de tokens de cada versión y calcula el ahorro en
  tokens y en costo aproximado, para justificar cuantitativamente por qué la versión optimizada es mejor.

## Principios de optimización aplicados

1. **Especificar el rol y el formato de salida** para evitar respuestas largas y genéricas.
2. **Eliminar contexto redundante** que el modelo no necesita repetir en la respuesta.
3. **Usar restricciones explícitas** (longitud, formato de tabla, lista de viñetas) en lugar de pedir
   "sé breve", que el modelo interpreta de forma inconsistente.
4. **Separar instrucción de datos** con delimitadores claros, para reducir ambigüedad y reintentos.

## Cómo se usa

```bash
python optimizador_tokens.py
```

Salida real de la ejecución:

```
Prompt                                  Tokens antes  Tokens después    Ahorro
Generación de casos de prueba                    624             390       38%
Resumen de reporte semanal                       390             140       64%
Revisión de checklist de diseño                  455              62       86%
```

**Nota de metodología:** el ahorro no viene del tamaño del prompt de entrada, sino de que un prompt sin
restricciones ("explica con detalle", "sé lo más completo posible") produce respuestas largas y abiertas,
mientras que un prompt con restricciones explícitas (número de elementos, palabras por celda, formato de
tabla) acota la longitud de la respuesta del modelo. El script estima los tokens de la *respuesta esperada*
en ambos casos: para el prompt optimizado, calculándolos directamente de sus propias restricciones; para el
prompt abierto, usando un rango de referencia típico para una respuesta equivalente sin acotar.
