import type { Config } from "@netlify/functions";
import { callAgentText, jsonResponse, errorResponse } from "./_lib/claude.mts";

/**
 * Agente 4 · Reportero
 * Entrada: proceso original, oportunidades priorizadas y diseño de la
 * solución top.
 * Salida: reporte en markdown listo para pegar en Confluence, dirigido a
 * un Líder de Proyecto o al director técnico.
 * Cubre: "Reportar el progreso al director técnico y a las partes
 * interesadas globales" y "Documentar procesos y crear guías... (Confluence)".
 */

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Usa POST" }, 405);
  }

  try {
    const { proceso, priorizadas, diseno } = (await req.json()) as {
      proceso?: string;
      priorizadas?: unknown;
      diseno?: unknown;
    };
    if (!proceso || !priorizadas || !diseno) {
      return jsonResponse(
        { error: "Se requieren 'proceso', 'priorizadas' y 'diseno'." },
        400
      );
    }

    const reporte = await callAgentText({
      system: `Eres un Especialista de Implementación de IA redactando un reporte
ejecutivo en español para un Líder de Proyecto, en formato markdown listo para
pegar en Confluence. Sé concreto, usa tablas cuando ayuden, y no repitas
información innecesariamente.`,
      user: `Redacta el reporte con estas secciones fijas, en este orden:
1. "## Resumen ejecutivo" (máx 60 palabras)
2. "## Oportunidades detectadas y priorización" (tabla: Tarea, Tipo, Horas/mes, Cuadrante, Score)
3. "## Solución propuesta para la oportunidad top" (nombre, plataforma, arquitectura, prompt inicial en bloque de código, riesgos, métrica de éxito)
4. "## Próximos pasos" (3-4 viñetas concretas y accionables)

Datos:

Proceso auditado:
"""
${proceso}
"""

Oportunidades priorizadas (JSON):
${JSON.stringify(priorizadas)}

Diseño de la solución propuesta (JSON):
${JSON.stringify(diseno)}`,
      maxTokens: 2000,
    });

    return jsonResponse({ reporte });
  } catch (err) {
    return errorResponse(err);
  }
};

export const config: Config = {
  path: "/api/report",
};
