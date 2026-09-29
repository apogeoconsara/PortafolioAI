import type { Config } from "@netlify/functions";
import { callAgentJSONMeta, jsonResponse, errorResponse, languageInstruction, type Language } from "./_lib/claude.mts";

/**
 * Agent 3 · AI Solution Designer
 * Takes the top-priority opportunity and first renders a verdict — does
 * this even need an AI agent, or something simpler — before designing the
 * actual intervention. "Not every workflow needs an AI agent" is the whole
 * point of this agent: it demonstrates implementation judgment, not just
 * the ability to build agents.
 */

interface ProposedNode {
  label: string;
  kind: "ai" | "rules" | "human";
  detail: string;
  replaces: number[];
}

interface Blueprint {
  proposed_workflow?: ProposedNode[];
  cycle_time_reduction_estimate?: { low_pct: number; high_pct: number; basis: string };
  implementation_verdict:
    | "no_automation"
    | "prompt"
    | "deterministic_automation"
    | "rag_assistant"
    | "ai_agent";
  verdict_reason: string;
  problem: string;
  recommended_approach:
    | "Prompt workflow"
    | "AI Agent"
    | "Chatbot"
    | "Knowledge retrieval"
    | "Report automation"
    | "Testing assistant"
    | "Document generation"
    | "Data analysis"
    | "No automation recommended";
  inputs: string[];
  ai_role: string;
  human_role: string;
  output: string;
  integration_point: string;
  success_metrics: string[];
  risks: string[];
  implementation_steps: string[];
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Use POST" }, 405);
  }

  try {
    const { opportunity, language, xray, workflow_steps, human_decision_points } = (await req.json()) as {
      opportunity?: unknown;
      /** AI Workflow X-Ray mode: also redesign the whole workflow as nodes. */
      xray?: boolean;
      workflow_steps?: unknown;
      human_decision_points?: unknown;
      language?: Language;
    };
    if (!opportunity) {
      return jsonResponse({ error: "An opportunity is required." }, 400);
    }

    const { data: blueprint, meta } = await callAgentJSONMeta<Blueprint>({
      system: `You are an AI Implementation Specialist designing the concrete
solution for a single prioritized opportunity, for a Project Leader with no
prior LLM experience to review and approve. Your first job is honesty about
scope: not every workflow needs an AI agent, and recommending one when a
prompt or a deterministic script would do is a credibility risk, not a win.

Pick implementation_verdict from exactly five levels, in order of
increasing complexity — choose the LOWEST one that solves the problem:
- "no_automation": the task requires human judgment end to end, or the
  volume/risk doesn't justify tooling. Recommend keeping it manual.
- "prompt": a single well-structured prompt a person runs manually solves it.
- "deterministic_automation": a plain script/rule-based automation solves it
  with no LLM needed at all (e.g. a report template, a scheduled export).
- "rag_assistant": the task is answering questions or finding information
  from existing documents/knowledge — retrieval, not autonomous action.
- "ai_agent": the task genuinely requires the model to make multi-step
  decisions or call tools autonomously across a loop. This is the rarest
  correct answer, not the default.

Always keep a human_role that includes reviewing or approving the output —
never propose removing human oversight entirely, even at the "ai_agent"
level.${languageInstruction(language)}`,
      user: `Prioritized opportunity to solve (JSON):
${JSON.stringify(opportunity)}
${xray ? `
Current workflow steps, numbered from 0 in order (JSON):
${JSON.stringify(workflow_steps ?? [])}

Human decision points identified by the Auditor (JSON):
${JSON.stringify(human_decision_points ?? [])}
` : ""}
Return a single JSON object with this exact shape:
{
  "implementation_verdict": "no_automation"|"prompt"|"deterministic_automation"|"rag_assistant"|"ai_agent",
  "verdict_reason": string (<=25 words: why this level, not a higher one),
  "problem": string (<=30 words, restated concretely),
  "recommended_approach": "Prompt workflow"|"AI Agent"|"Chatbot"|"Knowledge retrieval"|"Report automation"|"Testing assistant"|"Document generation"|"Data analysis"|"No automation recommended",
  "inputs": string[] (2-3 items: what data/documents/systems feed this; if implementation_verdict is "no_automation", describe what the human process needs instead),
  "ai_role": string (<=25 words: exactly what the AI does; if "no_automation", state "None — this stays human-led" and say why),
  "human_role": string (<=25 words: what stays human, including review/approval),
  "output": string (<=20 words: the concrete artifact produced),
  "integration_point": string (<=20 words: where in the existing workflow/tooling this plugs in, e.g. Jira, Confluence, Teams),
  "success_metrics": string[] (2-3 items, qualitative or structural, not invented numbers),
  "risks": string[] (2-3 items, each as "risk: mitigation"),
  "implementation_steps": string[] (3-5 concrete, sequential steps; if "no_automation", these are the process improvements that don't involve AI)${xray ? `,
  "proposed_workflow": [
    {
      "label": string (1-3 words, node name, e.g. "AI Intake", "Validation", "Knowledge Retrieval", "Human Approval", "Reporting Agent"),
      "kind": "ai"|"rules"|"human" ("ai" = model does the work, "rules" = deterministic automation, "human" = a person decides),
      "detail": string (<=12 words),
      "replaces": number[] (indexes of the current workflow steps this node replaces or absorbs)
    }
  ] (4-7 items in flow order; MUST include exactly one node with kind "human" that acts as an approval gate before anything irreversible; every current step that is not a human decision should be covered by some node's "replaces"),
  "cycle_time_reduction_estimate": {
    "low_pct": number (integer 0-90),
    "high_pct": number (integer 0-90, >= low_pct),
    "basis": string (<=20 words: what the estimate rests on — it is a reasoned estimate from the description, NOT a measurement)
  }` : ""}
}`,
      maxTokens: xray ? 2600 : 1600,
    });

    return jsonResponse({ blueprint, meta });
  } catch (err) {
    return errorResponse(err);
  }
};

export const config: Config = {
  path: "/api/design-agent",
};
