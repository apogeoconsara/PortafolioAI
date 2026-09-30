import type { Config } from "@netlify/functions";
import {
  callAgentJSONMeta,
  callAgentTextMeta,
  jsonResponse,
  errorResponse,
  languageInstruction,
  type Language,
} from "./_lib/claude.mts";

/**
 * AI Optimization Lab
 * Measures an original prompt against its optimized version on the SAME
 * workflow input. "run" executes one prompt and returns the real token
 * usage and latency reported by the API. "judge" asks Claude to grade two
 * outputs blind (order shuffled) against a fixed rubric — a model-graded
 * evaluation, labelled as such in the UI. Cost is derived from real token
 * counts times per-million-token rates that can be set with the
 * PRICE_INPUT_PER_MTOK / PRICE_OUTPUT_PER_MTOK env vars; if they are not
 * set, the response says the rates are an assumption.
 */

declare const Netlify: { env: { get(key: string): string | undefined } };

const RUN_MAX_TOKENS = 500;

function pricing() {
  const input = Number(Netlify.env.get("PRICE_INPUT_PER_MTOK"));
  const output = Number(Netlify.env.get("PRICE_OUTPUT_PER_MTOK"));
  if (input > 0 && output > 0) {
    return { input_per_mtok: input, output_per_mtok: output, source: "env" as const };
  }
  return { input_per_mtok: 3, output_per_mtok: 15, source: "assumed" as const };
}

interface Scores {
  relevance: number;
  actionability: number;
  structure: number;
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Use POST" }, 405);
  }

  try {
    const body = (await req.json()) as {
      action?: "run" | "judge";
      prompt?: string;
      workflow?: string;
      outputs?: { original?: string; optimized?: string };
      language?: Language;
      fast?: boolean;
    };

    if (!body.workflow || body.workflow.trim().length < 20) {
      return jsonResponse({ error: "A workflow description is required." }, 400);
    }

    if (body.action === "run") {
      if (!body.prompt) return jsonResponse({ error: "A prompt is required." }, 400);
      const { text, meta } = await callAgentTextMeta({
        fast: body.fast,
        user: `${body.prompt}\n\n"""\n${body.workflow}\n"""`,
        maxTokens: RUN_MAX_TOKENS,
      });
      const p = pricing();
      const cost_usd =
        (meta.input_tokens * p.input_per_mtok + meta.output_tokens * p.output_per_mtok) / 1_000_000;
      return jsonResponse({
        output: text,
        meta,
        cost_usd,
        pricing: p,
        max_tokens: RUN_MAX_TOKENS,
        truncated: meta.stop_reason === "max_tokens",
      });
    }

    if (body.action === "judge") {
      const original = body.outputs?.original;
      const optimized = body.outputs?.optimized;
      if (!original || !optimized) {
        return jsonResponse({ error: "Both outputs are required." }, 400);
      }
      // Blind grading: shuffle which output is presented as "A".
      const optimizedFirst = Math.random() < 0.5;
      const clip = (t: string) => (t.length > 1800 ? t.slice(0, 1800) + " […]" : t);
      const [a, b] = optimizedFirst ? [clip(optimized), clip(original)] : [clip(original), clip(optimized)];

      try {
        const { data, meta } = await callAgentJSONMeta<{
          a: Scores;
          b: Scores;
          verdict: string;
        }>({
          fast: body.fast,
          system: `You are a strict evaluator of AI responses about engineering workflows. You grade
two anonymous responses to the same task against a fixed rubric. Judge only
what is written; do not reward length. A response that is cut off is graded
on what it contains.${languageInstruction(body.language)}`,
          user: `Task input (workflow description):
"""
${body.workflow}
"""

Response A:
"""
${a}
"""

Response B:
"""
${b}
"""

Score each response from 1 to 5 on:
- relevance: grounded in the described workflow, no invented details
- actionability: says concretely where and how AI should be applied
- structure: easy to scan and consistent

Return one JSON object:
{
  "a": { "relevance": number, "actionability": number, "structure": number },
  "b": { "relevance": number, "actionability": number, "structure": number },
  "verdict": string (<=20 words, neutral, which is more useful and why)
}`,
          maxTokens: 500,
        });

        const total = (s: Scores) => s.relevance + s.actionability + s.structure;
        const scoresOptimized = optimizedFirst ? data.a : data.b;
        const scoresOriginal = optimizedFirst ? data.b : data.a;
        return jsonResponse({
          original: { ...scoresOriginal, total: total(scoresOriginal) },
          optimized: { ...scoresOptimized, total: total(scoresOptimized) },
          verdict: data.verdict,
          meta,
          method: "LLM-judged (Claude, blind A/B, 1-5 rubric)",
        });
      } catch (err) {
        // Measurements already shown stay valid; only the grade is missing.
        return jsonResponse({ unavailable: true, reason: err instanceof Error ? err.message : "judge failed" });
      }
    }

    return jsonResponse({ error: "Unknown action." }, 400);
  } catch (err) {
    return errorResponse(err);
  }
};

export const config: Config = {
  path: "/api/prompt-lab",
};
