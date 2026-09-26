import type { Config } from "@netlify/functions";
import { callAgentJSON, jsonResponse, errorResponse } from "./_lib/claude.mts";

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

interface AuditResult {
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
    const { process: workflow } = (await req.json()) as { process?: string };
    if (!workflow || workflow.trim().length < 20) {
      return jsonResponse(
        { error: "Describe the workflow with at least 20 characters." },
        400
      );
    }

    const audit = await callAgentJSON<AuditResult>({
      system: `You are a senior AI Implementation Specialist auditing a real
engineering workflow. Your job is to understand how the process actually
works TODAY before recommending anything. Never assume AI is the answer.
Be concrete and grounded strictly in what the user described — do not
invent details, tools, or team structure they did not mention. If the
description is vague about frequency or volume, say so instead of guessing
a number.`,
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
  "opportunities": [
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
      maxTokens: 1400,
    });

    return jsonResponse({ audit });
  } catch (err) {
    return errorResponse(err);
  }
};

export const config: Config = {
  path: "/api/audit",
};
