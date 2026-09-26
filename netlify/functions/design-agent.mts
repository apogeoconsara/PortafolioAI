import type { Config } from "@netlify/functions";
import { callAgentJSON, jsonResponse, errorResponse } from "./_lib/claude.mts";

/**
 * Agente 3 · Diseñador de solución de IA
 * Entrada: la oportunidad top priorizada.
 * Salida: el diseño concreto de la herramienta/agente de IA que la
 * resolvería: arquitectura, plataforma sugerida, prompt inicial ya
 * optimizado, y riesgos a mitigar.
 * Cubre: "Guiar a los ingenieros en el desarrollo de herramientas de IA,
 * agentes y chatbots" e "ingeniería de prompts y optimización de tokens".
 */

interface DisenoAgente {
  nombre_solucion: string;
  tipo_solucion: "agente_ia" | "chatbot" | "automatizacion_script" | "prompt_reutilizable";
  plataforma_sugerida: string;
  arquitectura: string;
  prompt_inicial_optimizado: string;
  riesgos_y_mitigacion: string[];
  metrica_de_exito: string;
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Usa POST" }, 405);
  }

  try {
    const { oportunidad } = (await req.json()) as { oportunidad?: unknown };
    if (!oportunidad) {
      return jsonResponse({ error: "Se requiere una oportunidad." }, 400);
    }

    const diseno = await callAgentJSON<DisenoAgente>({
      system: `Eres un especialista en implementación de IA que diseña, para
ingenieros sin experiencia previa en LLMs, la solución concreta que resuelve
una oportunidad de automatización. Debes proponer una plataforma realista
(Mistral, Copilot, Glean, o un script simple si no amerita un LLM), una
arquitectura breve y explicable, y un prompt inicial ya escrito con buenas
prácticas de prompt engineering (rol, formato de salida, restricciones de
longitud) listo para copiar y usar.`,
      user: `Oportunidad priorizada a resolver (JSON):
${JSON.stringify(oportunidad)}

Devuelve un único objeto JSON con esta forma exacta:
{
  "nombre_solucion": string,
  "tipo_solucion": "agente_ia"|"chatbot"|"automatizacion_script"|"prompt_reutilizable",
  "plataforma_sugerida": string,
  "arquitectura": string (máx 60 palabras, explicando los componentes),
  "prompt_inicial_optimizado": string (el prompt completo, listo para usar, con rol/formato/restricciones),
  "riesgos_y_mitigacion": string[] (2-3 items, cada uno "riesgo: mitigación"),
  "metrica_de_exito": string (una métrica concreta y medible)
}`,
      maxTokens: 1500,
    });

    return jsonResponse({ diseno });
  } catch (err) {
    return errorResponse(err);
  }
};

export const config: Config = {
  path: "/api/design-agent",
};
