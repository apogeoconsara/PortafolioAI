import type { Config } from "@netlify/functions";
import { callAgentJSONMeta, jsonResponse, errorResponse } from "./_lib/claude.mts";

/**
 * Regional AI & Integration Hub · optional live extraction
 * Classifies and extracts structured fields from a (synthetic) client
 * request email. The Hub's default path is a local rules engine; this
 * function is the "Live Claude" alternative and returns the exact same
 * schema so the rest of the pipeline (validation, CRM lookup, governance,
 * routing) is unchanged. The model only extracts — it never decides.
 */

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Use POST" }, 405);
  }
  try {
    const body = (await req.json()) as { email?: string };
    const email = (body.email ?? "").slice(0, 4000);
    if (!email.trim()) {
      return jsonResponse({ error: "Missing email text." }, 400);
    }

    const { data, meta } = await callAgentJSONMeta<Record<string, unknown>>({
      fast: true,
      system: `You are the Intake Agent of an insurance-brokerage request pipeline. Classify the
incoming client email and extract structured fields. Use only what the email states;
use null for anything missing — never guess. In "documents_attached" list ONLY documents
the sender says are attached now; documents promised for later are NOT attached.`,
      user: `Email:
"""
${email}
"""

Return one JSON object:
{
  "request_type": "renewal"|"new_business"|"claim"|"other",
  "urgency": "normal"|"urgent",
  "client": string|null,
  "country": "MX"|"GT"|"CR"|"PA"|"DO"|null (infer from the policy code prefix),
  "policy_id": string|null,
  "expiry_date": "YYYY-MM-DD"|null,
  "sum_insured_usd": number|null,
  "documents_attached": ("asset_list"|"loss_history"|"signed_application")[],
  "contact": string|null
}`,
      maxTokens: 500,
    });
    return jsonResponse({ extraction: data, meta });
  } catch (err) {
    return errorResponse(err);
  }
};

export const config: Config = {
  path: "/api/hub-extract",
};
