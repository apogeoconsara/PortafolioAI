import type { Config } from "@netlify/functions";
import { callAgentJSONMeta, jsonResponse, errorResponse, languageInstruction, type Language } from "./_lib/claude.mts";

/**
 * Agent 4 · Implementation Brief
 * Compiles the audit, prioritization and blueprint into a document a
 * Project Leader could actually act on — structured into the same
 * sections a real Confluence/SharePoint page for this would have.
 */

interface Brief {
  executive_summary: string;
  technical_approach: string;
  adoption_plan: string;
  metrics: string;
  documentation: string;
  roadmap?: { phase: string; focus: string }[];
  testing_plan?: string[];
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Use POST" }, 405);
  }

  try {
    const { process: workflow, audit, opportunity, blueprint, language, xray } = (await req.json()) as {
      /** AI Workflow X-Ray mode: also return a roadmap and a testing plan. */
      xray?: boolean;
      process?: string;
      audit?: unknown;
      opportunity?: unknown;
      blueprint?: unknown;
      language?: Language;
    };
    if (!workflow || !audit || !opportunity || !blueprint) {
      return jsonResponse(
        { error: "'process', 'audit', 'opportunity' and 'blueprint' are required." },
        400
      );
    }

    const { data: brief, meta } = await callAgentJSONMeta<Brief>({
      system: `You are an AI Implementation Specialist writing an
implementation brief for a Project Leader, in the tone of a document that
will actually be pasted into Confluence or SharePoint. Be concrete and
concise. Never invent numeric ROI or hours-saved figures that were not
established earlier in the pipeline — if none were given, say metrics will
be tracked from a baseline once implemented.${languageInstruction(language)}`,
      user: `Data to compile:

Original workflow description:
"""
${workflow}
"""

Audit findings (JSON):
${JSON.stringify(audit)}

Prioritized opportunity selected (JSON):
${JSON.stringify(opportunity)}

Solution blueprint (JSON):
${JSON.stringify(blueprint)}

Return a single JSON object with this exact shape:
{
  "executive_summary": string (<=70 words: what was audited and what is recommended),
  "technical_approach": string (<=130 words: summarize the blueprint — approach, AI role, human role, integration point),
  "adoption_plan": string (<=130 words: concrete steps to train the team and get this adopted — reference documentation, a pilot, and re-auditing later),
  "metrics": string (<=80 words: how success will be tracked; state plainly that quantified targets require baseline data if none was given),
  "documentation": string (<=100 words: what sections this should become in Confluence/SharePoint so another engineer could pick it up)${xray ? `,
  "roadmap": [{ "phase": string (e.g. "Phase 1 · Pilot"), "focus": string (<=25 words: what gets built and validated, no dates or invented durations) }] (3-4 items),
  "testing_plan": string[] (3-5 items, each <=25 words: how the solution is validated before rollout — e.g. shadow mode on past cases, human review sampling, failure-mode checks)` : ""}
}`,
      maxTokens: xray ? 2600 : 1800,
    });

    return jsonResponse({ brief, meta });
  } catch (err) {
    return errorResponse(err);
  }
};

export const config: Config = {
  path: "/api/report",
};
