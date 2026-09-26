import type { Config } from "@netlify/functions";
import { callAgentJSON, jsonResponse, errorResponse } from "./_lib/claude.mts";

/**
 * Agent 2 · Prioritizer
 * Turns the Auditor's opportunities into a prioritization matrix using
 * implementation judgment (impact, effort, frequency, risk), the way a
 * real AI Implementation Specialist would in a project retro — not by
 * inventing ROI, hours saved, or cost figures the user never provided.
 */

interface MatrixRow {
  opportunity: string;
  business_impact: "low" | "medium" | "high";
  implementation_effort: "low" | "medium" | "high";
  frequency: string;
  risk: "low" | "medium" | "high";
  recommended_priority: "quick_win" | "strategic" | "experiment" | "low_priority";
  note: string;
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Use POST" }, 405);
  }

  try {
    const { opportunities } = (await req.json()) as { opportunities?: unknown };
    if (!Array.isArray(opportunities) || opportunities.length === 0) {
      return jsonResponse({ error: "An array of opportunities is required." }, 400);
    }

    const matrix = await callAgentJSON<MatrixRow[]>({
      system: `You are prioritizing AI implementation opportunities with the
judgment of a real AI Implementation Specialist, not with hype. You do NOT
have access to the project's actual metrics, so you must NEVER invent
numeric ROI, hours saved, or cost figures. Score qualitatively (low/medium/
high) based only on what is reasonable to infer from the description of
each opportunity. Classify each into a quadrant:
- "quick_win": high business_impact, low implementation_effort
- "strategic": high business_impact, high implementation_effort
- "experiment": low/medium business_impact, low implementation_effort
- "low_priority": low business_impact, high implementation_effort
Skip any opportunity whose recommended_intervention is "keep_human" — it
does not belong in an implementation matrix.`,
      user: `Opportunities detected by the Audit agent (JSON):
${JSON.stringify(opportunities)}

Return a JSON array (not an object) with one row per opportunity kept, in
this exact shape, ordered with the highest-priority quick wins first:
[{
  "opportunity": string (same text as input),
  "business_impact": "low"|"medium"|"high",
  "implementation_effort": "low"|"medium"|"high",
  "frequency": string (qualitative — infer from the text if stated, e.g. "weekly", "every sprint"; otherwise "not specified in the description"),
  "risk": "low"|"medium"|"high",
  "recommended_priority": "quick_win"|"strategic"|"experiment"|"low_priority",
  "note": string (<=20 words, the reasoning, not a number)
}]`,
      maxTokens: 1500,
    });

    return jsonResponse({
      matrix,
      data_note:
        "Impact, effort and risk are qualitative judgments based on the description provided. Quantified ROI or hours-saved estimates require the project's actual baseline data.",
    });
  } catch (err) {
    return errorResponse(err);
  }
};

export const config: Config = {
  path: "/api/prioritize",
};
