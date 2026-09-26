import type { Config } from "@netlify/functions";
import { callAgentJSON, jsonResponse, errorResponse, languageInstruction, type Language } from "./_lib/claude.mts";

/**
 * Objective: "Create implementation documentation"
 * Takes a freeform description of a solution that has ALREADY been decided
 * (no audit or design needed) and produces the same Confluence/SharePoint-
 * ready brief structure as the full pipeline's Documentation step — the
 * direct entry point for "I know what I'm building, help me document it."
 */

interface Brief {
  executive_summary: string;
  technical_approach: string;
  adoption_plan: string;
  metrics: string;
  documentation: string;
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Use POST" }, 405);
  }

  try {
    const { description, language } = (await req.json()) as {
      description?: string;
      language?: Language;
    };
    if (!description || description.trim().length < 20) {
      return jsonResponse(
        { error: "Describe the solution with at least 20 characters." },
        400
      );
    }

    const brief = await callAgentJSON<Brief>({
      system: `You are an AI Implementation Specialist writing an
implementation brief for a Project Leader, in the tone of a document that
will actually be pasted into Confluence or SharePoint, for a solution that
has already been decided — your job is documentation, not re-litigating the
choice. Be concrete and concise. Never invent numeric ROI or hours-saved
figures the user did not provide.${languageInstruction(language)}`,
      user: `Solution already decided, described by the user:
"""
${description}
"""

Return a single JSON object with this exact shape:
{
  "executive_summary": string (<=70 words: what this is and why it matters),
  "technical_approach": string (<=130 words: how it works, inferred from the description),
  "adoption_plan": string (<=130 words: concrete steps to roll this out and get the team trained on it),
  "metrics": string (<=80 words: how success will be tracked; say plainly if numeric targets need baseline data),
  "documentation": string (<=100 words: what sections this should become in Confluence/SharePoint)
}`,
      maxTokens: 1600,
    });

    return jsonResponse({ brief });
  } catch (err) {
    return errorResponse(err);
  }
};

export const config: Config = {
  path: "/api/document-solution",
};
