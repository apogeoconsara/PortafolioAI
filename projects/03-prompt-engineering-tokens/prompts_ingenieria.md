# Biblioteca de prompts para ingeniería

Cada prompt incluye una versión "antes" (como la escribiría alguien sin experiencia en prompt engineering) y
una versión "después" (optimizada para precisión y menor consumo de tokens).

---

## 1. Generación de casos de prueba

**Antes:**
> Necesito que me ayudes a pensar en casos de prueba para una funcionalidad de login de un sistema web,
> por favor dame varios casos que se te ocurran, tanto positivos como negativos, y explica cada uno con
> detalle para que cualquiera lo entienda.

**Después:**
> Rol: QA senior.
> Tarea: genera 6 casos de prueba para el login de un sistema web (2 positivos, 2 negativos, 2 de borde).
> Formato: tabla con columnas [ID, Tipo, Precondición, Pasos, Resultado esperado].
> Restricción: máximo 15 palabras por celda.

---

## 2. Resumen de reporte semanal

**Antes:**
> Aquí está el reporte semanal completo del equipo, ¿puedes resumirlo de forma que se entienda bien y
> mencionar lo más importante que pasó y lo que hay que hacer?

**Después:**
> Rol: Project Manager.
> Entrada: reporte semanal delimitado por ---.
> Salida: 3 viñetas de "Logros", 3 de "Riesgos", 3 de "Próximos pasos". Máximo 12 palabras por viñeta.
> ---
> {reporte}
> ---

---

## 3. Revisión de checklist de diseño

**Antes:**
> Revisa este documento de diseño y dime si está bien o si le falta algo, sé lo más completo posible en
> tu revisión.

**Después:**
> Rol: revisor técnico de arquitectura.
> Entrada: documento de diseño delimitado por ---.
> Evalúa contra este checklist: [seguridad, escalabilidad, dependencias externas, plan de rollback].
> Salida: tabla [Criterio, Cumple (Sí/No/Parcial), Comentario en máx. 10 palabras].
> ---
> {documento}
> ---

---

## 4. Redacción de ticket de Jira

**Antes:**
> Escribe un ticket de Jira para el bug que encontramos, describe el problema y ponle todo lo necesario.

**Después:**
> Rol: ingeniero redactando un ticket de Jira.
> Entrada: descripción libre del bug delimitada por ---.
> Salida en este formato exacto:
> Título: (máx 10 palabras)
> Pasos para reproducir: (lista numerada, máx 5 pasos)
> Resultado esperado:
> Resultado actual:
> Severidad sugerida: (Baja/Media/Alta/Crítica)
> ---
> {descripcion}
> ---

---

## 5. Guía de onboarding para nueva herramienta de IA

**Antes:**
> Escríbeme una guía para que los ingenieros aprendan a usar la nueva herramienta de IA que estamos
> implementando en el equipo.

**Después:**
> Rol: especialista en adopción de IA escribiendo para Confluence.
> Audiencia: ingenieros sin experiencia previa en LLMs.
> Salida: guía con 4 secciones fijas: "Qué es y para qué sirve", "Primeros 3 pasos", "Un ejemplo end-to-end",
> "Errores comunes a evitar". Máximo 80 palabras por sección.
