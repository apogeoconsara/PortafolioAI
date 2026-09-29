import type { Config } from "@netlify/functions";
import { callAgentJSONMeta, jsonResponse, errorResponse, languageInstruction, type Language } from "./_lib/claude.mts";

/**
 * Agent 1 · Auditor
 * Reads a free-text description of an engineering workflow and produces a
 * grounded understanding of it BEFORE recommending any AI solution:
 * bottlenecks, repetitive work, dependencies, human decision points, risks,
 * and only then a short list of automation opportunities — each explicitly
 * scored by automation potential and mapped to a recommended intervention
 * type (which can be "keep_human").
 */

interface Opportunity {
  opportunity: string;
  automation_potential: "low" | "medium" | "high";
  recommended_intervention:
    | "prompt"
    | "automation"
    | "ai_agent"
    | "knowledge_assistant"
    | "analytics"
    | "keep_human";
  rationale: string;
}

interface WorkflowStep {
  label: string;
  detail: string;
  classification: "manual_repetitive" | "rules_based" | "ai_candidate" | "human_decision";
}

interface AuditResult {
  workflow_steps?: WorkflowStep[];
  current_process: string;
  bottlenecks: string[];
  repetitive_work: string[];
  information_dependencies: string[];
  human_decision_points: string[];
  potential_risks: string[];
  opportunities: Opportunity[];
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Use POST" }, 405);
  }

  try {
    const { process: workflow, focus, language, xray } = (await req.json()) as {
      process?: string;
      focus?: string;
      /** AI Workflow X-Ray mode: also return the step-by-step classification. */
      xray?: boolean;
      language?: Language;
    };
    if (!workflow || workflow.trim().length < 20) {
      return jsonResponse(
        { error: "Describe the workflow with at least 20 characters." },
        400
      );
    }

    const { data: audit, meta } = await callAgentJSONMeta<AuditResult>({
      system: `You are a senior AI Implementation Specialist auditing a real
engineering workflow. Your job is to understand how the process actually
works TODAY before recommending anything. Never assume AI is the answer.
Be concrete and grounded strictly in what the user described — do not
invent details, tools, or team structure they did not mention. If the
description is vague about frequency or volume, say so instead of guessing
a number.${focus ? ` Focus the audit specifically on ${focus}.` : ""}${languageInstruction(language)}`,
      user: `Engineering workflow described by the user:
"""
${workflow}
"""

Return a single JSON object with this exact shape:
{
  "current_process": string (<=40 words, restate what happens today in your own words),
  "bottlenecks": string[] (2-4 items, concrete),
  "repetitive_work": string[] (1-3 items),
  "information_dependencies": string[] (1-3 items: sources of truth, handoffs, or systems this process depends on),
  "human_decision_points": string[] (1-3 items: where judgment must stay human even after automating),
  "potential_risks": string[] (1-3 items: what could go wrong if this is automated carelessly),
${xray ? `  "workflow_steps": [
    {
      "label": string (1-2 words, the step as a node name, e.g. "Request", "Excel", "Jira"),
      "detail": string (<=12 words, what happens in this step today),
      "classification": "manual_repetitive"|"rules_based"|"ai_candidate"|"human_decision"
    }
  ] (5-8 items, in the order the work flows; classify each step honestly: "manual_repetitive" = copy/paste or re-keying a person does by hand, "rules_based" = deterministic logic a script or integration could do, "ai_candidate" = needs reading/understanding/generating unstructured content, "human_decision" = judgment or approval that must stay human),
` : ""}  "opportunities": [
    {
      "opportunity": string,
      "automation_potential": "low"|"medium"|"high",
      "recommended_intervention": "prompt"|"automation"|"ai_agent"|"knowledge_assistant"|"analytics"|"keep_human",
      "rationale": string (<=20 words)
    }
  ] (2-4 items, ordered by automation_potential descending)
}

Be honest: if something should stay human-led, use "keep_human" for it.
Do not recommend an AI agent for everything — most real opportunities are a
prompt, a simple automation, or a knowledge assistant.`,
      maxTokens: xray ? 2000 : 1400,
    });

    return jsonResponse({ audit, meta });
  } catch (err) {
    return errorResponse(err);
  }
};

export const config: Config = {
  path: "/api/audit",
};
