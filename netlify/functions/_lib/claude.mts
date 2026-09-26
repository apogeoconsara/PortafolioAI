import Anthropic from "@anthropic-ai/sdk";

declare const Netlify: { env: { get(key: string): string | undefined } };

const MODEL = "claude-sonnet-5";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY no está configurada en este entorno de Netlify."
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

/**
 * Llama a Claude pidiendo una respuesta que sea únicamente un objeto/array
 * JSON, y la parsea. Cada agente del pipeline usa esto para producir una
 * salida estructurada que el siguiente agente puede consumir directamente.
 */
export async function callAgentJSON<T>(params: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<T> {
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: params.maxTokens ?? 2000,
    system:
      params.system +
      "\n\nResponde ÚNICAMENTE con JSON válido, sin texto antes ni después, sin backticks de markdown.",
    messages: [{ role: "user", content: params.user }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "";
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "");

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    throw new Error(
      `El agente no devolvió JSON válido. Respuesta cruda: ${raw.slice(0, 500)}`
    );
  }
}

/** Llama a Claude pidiendo texto libre (usado por el agente Reportero). */
export async function callAgentText(params: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: params.maxTokens ?? 2000,
    system: params.system,
    messages: [{ role: "user", content: params.user }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock && "text" in textBlock ? textBlock.text : "";
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function errorResponse(err: unknown): Response {
  const message = err instanceof Error ? err.message : "Error desconocido";
  return jsonResponse({ error: message }, 500);
}
