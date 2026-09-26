import type { Config } from "@netlify/functions";
import { callAgentJSON, jsonResponse, errorResponse } from "./_lib/claude.mts";

/**
 * Agent 3 · AI Solution Designer
 * Takes the top-priority opportunity and designs the actual intervention:
 * what kind of AI approach fits (never defaulting to "AI Agent" for
 * everything), who does what (AI vs. human), where it plugs into the
 * existing workflow, and how success is measured.
 */

interface Blueprint {
  problem: string;
  recommended_approach:
    | "Prompt workflow"
    | "AI Agent"
    | "Chatbot"
    | "Knowledge retrieval"
    | "Report automation"
    | "Testing assistant"
    | "Document generation"
    | "Data analysis";
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
    const { opportunity } = (await req.json()) as { opportunity?: unknown };
    if (!opportunity) {
      return jsonResponse({ error: "An opportunity is required." }, 400);
    }

    const blueprint = await callAgentJSON<Blueprint>({
      system: `You are an AI Implementation Specialist designing the concrete
solution for a single prioritized opportunity, for a Project Leader with no
prior LLM experience to review and approve. Match the recommended_approach
to the actual problem — do not default to "AI Agent" unless the task truly
requires multi-step autonomous decisions. A simple repetitive task is a
"Prompt workflow" or "Report automation"; a lookup problem is "Knowledge
retrieval"; a Q&A need is a "Chatbot"; a data question is "Data analysis".
Always keep a human_role that includes reviewing or approving the output —
never propose removing human oversight entirely.`,
      user: `Prioritized opportunity to solve (JSON):
${JSON.stringify(opportunity)}

Return a single JSON object with this exact shape:
{
  "problem": string (<=30 words, restated concretely),
  "recommended_approach": "Prompt workflow"|"AI Agent"|"Chatbot"|"Knowledge retrieval"|"Report automation"|"Testing assistant"|"Document generation"|"Data analysis",
  "inputs": string[] (2-3 items: what data/documents/systems feed this),
  "ai_role": string (<=25 words: exactly what the AI does),
  "human_role": string (<=25 words: what stays human, including review/approval),
  "output": string (<=20 words: the concrete artifact produced),
  "integration_point": string (<=20 words: where in the existing workflow/tooling this plugs in, e.g. Jira, Confluence, Teams),
  "success_metrics": string[] (2-3 items, qualitative or structural, not invented numbers),
  "risks": string[] (2-3 items, each as "risk: mitigation"),
  "implementation_steps": string[] (3-5 concrete, sequential steps)
}`,
      maxTokens: 1500,
    });

    return jsonResponse({ blueprint });
  } catch (err) {
    return errorResponse(err);
  }
};

export const config: Config = {
  path: "/api/design-agent",
};
