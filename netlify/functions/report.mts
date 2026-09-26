import type { Config } from "@netlify/functions";
import { callAgentJSON, jsonResponse, errorResponse } from "./_lib/claude.mts";

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
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Use POST" }, 405);
  }

  try {
    const { process: workflow, audit, opportunity, blueprint } = (await req.json()) as {
      process?: string;
      audit?: unknown;
      opportunity?: unknown;
      blueprint?: unknown;
    };
    if (!workflow || !audit || !opportunity || !blueprint) {
      return jsonResponse(
        { error: "'process', 'audit', 'opportunity' and 'blueprint' are required." },
        400
      );
    }

    const brief = await callAgentJSON<Brief>({
      system: `You are an AI Implementation Specialist writing an
implementation brief for a Project Leader, in the tone of a document that
will actually be pasted into Confluence or SharePoint. Be concrete and
concise. Never invent numeric ROI or hours-saved figures that were not
established earlier in the pipeline — if none were given, say metrics will
be tracked from a baseline once implemented.`,
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
  "documentation": string (<=100 words: what sections this should become in Confluence/SharePoint so another engineer could pick it up)
}`,
      maxTokens: 1800,
    });

    return jsonResponse({ brief });
  } catch (err) {
    return errorResponse(err);
  }
};

export const config: Config = {
  path: "/api/report",
};
