import Anthropic from "@anthropic-ai/sdk";

declare const Netlify: { env: { get(key: string): string | undefined } };

const MODEL = "claude-sonnet-5";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured in this Netlify environment.");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export type Language = "en" | "es";

/**
 * Instruction appended to every agent's system prompt so the whole
 * AI Implementation Assistant responds in the language the visitor picked
 * (EN by default, ES available), while keeping fixed enum-like field
 * values in English so the frontend's rendering logic never breaks.
 */
export function languageInstruction(language: Language | undefined): string {
  const lang = language === "es" ? "es" : "en";
  if (lang === "en") {
    return "\n\nWrite all free-text field values in English.";
  }
  return `\n\nWrite all free-text field values in Spanish (español). Any field
value that is one of a fixed set of English tokens explicitly listed in this
prompt (e.g. "low"/"medium"/"high", "quick_win", "ai_agent", etc.) must stay
in English exactly as listed — only the free-text explanations, summaries
and lists get translated to Spanish.`;
}

/** Real measurements from one Claude call (tokens as reported by the API). */
export interface CallMeta {
  model: string;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  stop_reason: string | null;
}

function toMeta(response: Anthropic.Message, startedAt: number): CallMeta {
  return {
    model: response.model,
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
    latency_ms: Date.now() - startedAt,
    stop_reason: response.stop_reason,
  };
}

/**
 * Calls Claude asking for a response that is ONLY a JSON object/array, and
 * parses it. Each agent in the Implementation Assistant uses this to
 * produce structured output the next step (or the frontend) can consume
 * directly. The `Meta` variant also returns the real token usage and
 * latency of the call.
 */
export async function callAgentJSONMeta<T>(params: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<{ data: T; meta: CallMeta }> {
  const anthropic = getClient();
  const startedAt = Date.now();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: params.maxTokens ?? 2000,
    system:
      params.system +
      "\n\nRespond with ONLY valid JSON, no text before or after, no markdown code fences.",
    messages: [{ role: "user", content: params.user }],
  });
  const meta = toMeta(response, startedAt);

  const textBlock = response.content.find((block) => block.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "";
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "");

  try {
    return { data: JSON.parse(cleaned) as T, meta };
  } catch (err) {
    throw new Error(`The agent did not return valid JSON. Raw response: ${raw.slice(0, 500)}`);
  }
}

export async function callAgentJSON<T>(params: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<T> {
  return (await callAgentJSONMeta<T>(params)).data;
}

/** Free-text call that also returns real usage/latency (used by the Optimization Lab). */
export async function callAgentTextMeta(params: {
  system?: string;
  user: string;
  maxTokens?: number;
}): Promise<{ text: string; meta: CallMeta }> {
  const anthropic = getClient();
  const startedAt = Date.now();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: params.maxTokens ?? 2000,
    ...(params.system ? { system: params.system } : {}),
    messages: [{ role: "user", content: params.user }],
  });
  const textBlock = response.content.find((block) => block.type === "text");
  return {
    text: textBlock && "text" in textBlock ? textBlock.text : "",
    meta: toMeta(response, startedAt),
  };
}

/** Calls Claude asking for free text (used by text-based agents). */
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
  const message = err instanceof Error ? err.message : "Unknown error";
  return jsonResponse({ error: message }, 500);
}
