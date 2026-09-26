import type { Config } from "@netlify/functions";
import { callAgentJSON, jsonResponse, errorResponse, languageInstruction, type Language } from "./_lib/claude.mts";

/**
 * Objective: "Build a training plan"
 * Generates an enablement program for a described team/context — the same
 * structure as the Training Plan project, produced live for the visitor's
 * own situation instead of a fixed example.
 */

interface Session {
  title: string;
  objective: string;
  activity: string;
  deliverable: string;
}

interface TrainingPlan {
  program_title: string;
  sessions: Session[];
  enablement_notes: string;
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Use POST" }, 405);
  }

  try {
    const { context, language } = (await req.json()) as { context?: string; language?: Language };
    if (!context || context.trim().length < 15) {
      return jsonResponse(
        { error: "Describe the team or situation with at least 15 characters." },
        400
      );
    }

    const plan = await callAgentJSON<TrainingPlan>({
      system: `You are an AI Implementation Specialist designing a hands-on
enablement program, not a lecture series. Every session must end with a
concrete deliverable made by the participants themselves — the goal is
engineers who can build their own small AI tools afterward, not engineers
who watched a demo. Keep it to 3-5 sessions.${languageInstruction(language)}`,
      user: `Team / situation described by the user:
"""
${context}
"""

Return a single JSON object with this exact shape:
{
  "program_title": string (<=8 words),
  "sessions": [
    {
      "title": string,
      "objective": string (<=20 words),
      "activity": string (<=30 words: what participants actually do, hands-on),
      "deliverable": string (<=20 words: the concrete artifact each participant leaves with)
    }
  ] (3-5 sessions, in order),
  "enablement_notes": string (<=90 words: how adoption will be measured afterward and how this gets documented for the team, e.g. a re-audit, an internal doc template)
}`,
      maxTokens: 1600,
    });

    return jsonResponse({ plan });
  } catch (err) {
    return errorResponse(err);
  }
};

export const config: Config = {
  path: "/api/training-plan",
};
