import type { Config } from "@netlify/functions";
import { callAgentJSONMeta, jsonResponse, errorResponse, languageInstruction, type Language } from "./_lib/claude.mts";

/**
 * Objective: "Improve a prompt"
 * Takes a prompt someone already uses and rewrites it with explicit prompt
 * engineering technique — role, output format, length constraints — the
 * same structure demonstrated in the Prompt Engineering Playbook, applied
 * live to the visitor's own prompt instead of a canned example.
 */

interface PromptImprovement {
  improved_prompt: string;
  techniques_applied: string[];
  rationale: string;
  estimated_impact: string;
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Use POST" }, 405);
  }

  try {
    const { prompt, language, goal, fast } = (await req.json()) as {
      prompt?: string;
      language?: Language;
      /** "concise": optimize for token efficiency (used by the Optimization Lab). */
      goal?: "concise";
      /** Use the faster model (X-Ray). */
      fast?: boolean;
    };
    if (!prompt || prompt.trim().length < 10) {
      return jsonResponse({ error: "Paste a prompt with at least 10 characters." }, 400);
    }

    const { data: result, meta } = await callAgentJSONMeta<PromptImprovement>({
      fast,
      system: `You are a prompt engineering specialist. Given a prompt someone
already uses, rewrite it to be more reliable and predictable, applying
concrete techniques: an explicit role, a defined output format, length or
structure constraints, and separating instructions from data with clear
delimiters when relevant. Do not change what the prompt is trying to
accomplish — only how well it is specified. If the original prompt is
already well-structured, say so honestly rather than inventing changes for
their own sake.${
        goal === "concise"
          ? `

Optimization goal: TOKEN EFFICIENCY. The rewritten prompt itself must stay
under 70 words, and it must tell the model to answer with at most 5 bullets of
at most 20 words each, with no preamble or closing remarks. Keep any
placeholder or instruction to use the provided input.`
          : ""
      }${languageInstruction(language)}`,
      user: `Original prompt:
"""
${prompt}
"""

Return a single JSON object with this exact shape:
{
  "improved_prompt": string (the rewritten prompt, ready to copy and use),
  "techniques_applied": string[] (2-4 items, each naming one specific technique used, e.g. "Added an explicit role", "Constrained output to a fixed format", "Set an explicit length limit"),
  "rationale": string (<=50 words: why these changes make the output more reliable),
  "estimated_impact": string (<=30 words: qualitative — e.g. shorter/more consistent output, fewer follow-up clarifications — never invent a numeric percentage)
}`,
      maxTokens: fast ? 700 : 1200,
    });

    return jsonResponse({ result, meta });
  } catch (err) {
    return errorResponse(err);
  }
};

export const config: Config = {
  path: "/api/improve-prompt",
};
