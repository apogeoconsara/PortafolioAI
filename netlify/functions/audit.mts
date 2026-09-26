import type { Config } from "@netlify/functions";
import { callAgentJSON, jsonResponse, errorResponse } from "./_lib/claude.mts";

/**
 * Agente 1 · Auditor
 * Entrada: descripción libre de un flujo/proceso de ingeniería.
 * Salida: lista de oportunidades de automatización con IA detectadas,
 * cada una con tipo, horas/mes estimadas y justificación.
 * Cubre: "Auditar proyectos de ingeniería para identificar oportunidades
 * de automatización y optimización impulsadas por IA".
 */

interface Oportunidad {
  tarea: string;
  tipo: "prueba" | "reporte" | "diseño" | "soporte" | "gestion_proyecto" | "otro";
  horas_estimadas_mes: number;
  justificacion: string;
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Usa POST" }, 405);
  }

  try {
    const { proceso } = (await req.json()) as { proceso?: string };
    if (!proceso || proceso.trim().length < 20) {
      return jsonResponse(
        { error: "Describe el proceso de ingeniería con al menos 20 caracteres." },
        400
      );
    }

    const oportunidades = await callAgentJSON<Oportunidad[]>({
      system: `Eres un auditor senior de adopción de IA para equipos de ingeniería,
rol equivalente a un Especialista de Implementación de IA. Tu trabajo es leer la
descripción de un flujo de trabajo y detectar tareas concretas de pruebas, reportes,
diseño, soporte o gestión de proyecto que sean candidatas realistas a automatizarse
con IA generativa (LLMs tipo Mistral, Copilot, Glean) o con agentes de IA.
No inventes tareas que no estén respaldadas por el texto del usuario.`,
      user: `Descripción del proceso de ingeniería:
"""
${proceso}
"""

Devuelve un array JSON de 3 a 6 objetos con esta forma exacta:
[{"tarea": string, "tipo": "prueba"|"reporte"|"diseño"|"soporte"|"gestion_proyecto"|"otro", "horas_estimadas_mes": number, "justificacion": string}]

"horas_estimadas_mes" debe ser tu mejor estimación razonable basada en lo descrito.
"justificacion" en máximo 25 palabras, explicando por qué es automatizable con IA.`,
      maxTokens: 1200,
    });

    return jsonResponse({ oportunidades });
  } catch (err) {
    return errorResponse(err);
  }
};

export const config: Config = {
  path: "/api/audit",
};
