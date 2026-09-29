import type { Config } from "@netlify/functions";
import { callAgentJSONMeta, jsonResponse, errorResponse, languageInstruction, type Language } from "./_lib/claude.mts";
import { DEMO_ECR_EMAIL, VALIDATION_RULES, retrieve } from "./_lib/ecr-demo.mts";

/**
 * Live Execution · sample run of the proposed workflow
 * Executes one stage of the proposed flow against a SYNTHETIC Engineering
 * Change Request (Demo scenario). Three stages call Claude for real
 * (intake, validate, decide); retrieval is a deterministic keyword search
 * over a small synthetic knowledge base. The frontend calls this once per
 * stage so progress is genuine, and stops at the Human Gate.
 */

type Stage = "email" | "intake" | "validate" | "retrieve" | "decide";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Use POST" }, 405);
  }

  try {
    const body = (await req.json()) as {
      stage?: Stage;
      intake?: Record<string, unknown>;
      validation?: unknown;
      documents?: unknown;
      language?: Language;
    };
    const lang = languageInstruction(body.language);

    switch (body.stage) {
      case "email":
        return jsonResponse({ email: DEMO_ECR_EMAIL, rules: VALIDATION_RULES });

      case "intake": {
        const { data, meta } = await callAgentJSONMeta<Record<string, unknown>>({
          system: `You are the Intake Agent of an engineering change workflow. Extract structured
fields from an incoming change request email. Use only what the email states;
use null for anything missing — never guess.${lang}`,
          user: `Email:
"""
${DEMO_ECR_EMAIL}
"""

Return one JSON object:
{
  "ecr_id": string|null,
  "requester": string|null,
  "component": string|null,
  "change_summary": string (<=25 words),
  "reason": string|null,
  "urgency": "low"|"medium"|"high"|null (keep these English tokens),
  "target_release": string|null,
  "drawings": string[],
  "attachments_present": boolean
}`,
          maxTokens: 500,
        });
        return jsonResponse({ intake: data, meta });
      }

      case "validate": {
        const { data, meta } = await callAgentJSONMeta<{ checks: unknown[]; summary: string }>({
          system: `You are the Validation step of an engineering change workflow. Check the extracted
request against each rule. Mark "flag" whenever the information is missing or
unclear. Be strict and brief.${lang}`,
          user: `Extracted request (JSON):
${JSON.stringify(body.intake ?? {})}

Rules to check:
${VALIDATION_RULES.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Return one JSON object:
{
  "checks": [{ "rule": string (same wording as above), "status": "pass"|"flag" (keep these English tokens), "note": string (<=14 words) }],
  "summary": string (<=20 words)
}`,
          maxTokens: 700,
        });
        return jsonResponse({ validation: data, meta });
      }

      case "retrieve": {
        const query = `${DEMO_ECR_EMAIL} ${JSON.stringify(body.intake ?? {})}`;
        return jsonResponse({ documents: retrieve(query, 3) });
      }

      case "decide": {
        const { data, meta } = await callAgentJSONMeta<Record<string, unknown>>({
          system: `You are the Decision step of an engineering change workflow. You PREPARE a
recommendation for a human approver; you never approve on your own. Ground
every statement in the request, the validation result and the retrieved
documents provided.${lang}`,
          user: `Extracted request (JSON):
${JSON.stringify(body.intake ?? {})}

Validation result (JSON):
${JSON.stringify(body.validation ?? {})}

Retrieved knowledge base documents (JSON):
${JSON.stringify(body.documents ?? [])}

Return one JSON object:
{
  "recommendation": "approve"|"needs_review" (keep these English tokens),
  "rationale": string (<=40 words, cite document ids like KB-014),
  "open_items": string[] (0-3 items the approver should know about),
  "ticket_title": string (<=12 words, a draft ticket title)
}`,
          maxTokens: 600,
        });
        return jsonResponse({ decision: data, meta });
      }

      default:
        return jsonResponse({ error: "Unknown stage." }, 400);
    }
  } catch (err) {
    return errorResponse(err);
  }
};

export const config: Config = {
  path: "/api/run-ecr",
};
