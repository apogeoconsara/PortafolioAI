import type { Config } from "@netlify/functions";
import { callAgentJSON, jsonResponse, errorResponse } from "./_lib/claude.mts";

/**
 * Agente 2 · Priorizador
 * Entrada: oportunidades detectadas por el Agente Auditor.
 * Salida: las mismas oportunidades con score de impacto/esfuerzo y
 * cuadrante de la matriz de priorización, ordenadas de mayor a menor
 * prioridad.
 * Cubre: priorizar antes de "guiar a los ingenieros" y "apoyar la
 * implementación" — no toda oportunidad detectada merece el mismo esfuerzo.
 */

interface OportunidadPriorizada {
  tarea: string;
  tipo: string;
  horas_estimadas_mes: number;
  justificacion: string;
  impacto: 1 | 2 | 3 | 4 | 5;
  esfuerzo: 1 | 2 | 3 | 4 | 5;
  cuadrante: "quick_win" | "proyecto_mayor" | "relleno" | "baja_prioridad";
  score_prioridad: number;
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Usa POST" }, 405);
  }

  try {
    const { oportunidades } = (await req.json()) as { oportunidades?: unknown };
    if (!Array.isArray(oportunidades) || oportunidades.length === 0) {
      return jsonResponse({ error: "Se requiere un array de oportunidades." }, 400);
    }

    const priorizadas = await callAgentJSON<OportunidadPriorizada[]>({
      system: `Eres un especialista en priorización de iniciativas de IA para
ingeniería. Recibes una lista de oportunidades de automatización y debes
calificar cada una en impacto (1-5, basado en horas ahorradas y alineación con
demandas de cliente) y esfuerzo de implementación (1-5, basado en qué tan
compleja es de construir con las herramientas típicas: Mistral, Copilot, Glean).
Clasifica cada una en un cuadrante:
- "quick_win": impacto alto (4-5), esfuerzo bajo (1-2)
- "proyecto_mayor": impacto alto (4-5), esfuerzo alto (4-5)
- "relleno": impacto bajo (1-3), esfuerzo bajo (1-2)
- "baja_prioridad": impacto bajo (1-3), esfuerzo alto (4-5)
score_prioridad = impacto * 2 - esfuerzo (puede ser negativo).`,
      user: `Oportunidades detectadas (JSON):
${JSON.stringify(oportunidades)}

Devuelve el mismo array pero con los campos adicionales "impacto", "esfuerzo",
"cuadrante" y "score_prioridad" en cada objeto, ordenado de mayor a menor
score_prioridad.`,
      maxTokens: 1500,
    });

    return jsonResponse({ priorizadas });
  } catch (err) {
    return errorResponse(err);
  }
};

export const config: Config = {
  path: "/api/prioritize",
};
