/**
 * Synthetic "Demo scenario" data for the Live Execution view: one sample
 * Engineering Change Request email, a validation rule set and a tiny
 * knowledge base. None of this is real project data — it exists so the
 * agents have something concrete to execute against.
 */

export const DEMO_ECR_EMAIL = `From: j.rivera@example-oem.test
Subject: ECR-1042 · Replace connector J7 on harness H-220

Hi team, please review this change request. We want to swap connector J7
on harness H-220 for the sealed variant (part SC-7720) because of moisture
ingress reported in field returns. Target release is the next build cycle.
Affected drawings: DWG-H220-REV-C. Urgency: medium. I have not attached the
supplier datasheet yet.`;

export const VALIDATION_RULES = [
  "Change request identifies the affected part number and drawing",
  "A reason for the change is stated",
  "Supplier documentation is attached for any new part",
  "Target release or build cycle is stated",
  "Urgency level is stated",
];

export interface KbDoc {
  id: string;
  title: string;
  keywords: string[];
  snippet: string;
}

export const DEMO_KB: KbDoc[] = [
  {
    id: "KB-014",
    title: "Connector change policy",
    keywords: ["connector", "harness", "part", "swap", "replace", "variant"],
    snippet: "Connector substitutions require a supplier datasheet and an updated wiring drawing before approval.",
  },
  {
    id: "KB-027",
    title: "Sealed connectors — environmental qualification",
    keywords: ["sealed", "moisture", "ingress", "environmental", "field", "returns"],
    snippet: "Sealed variants must reference the IP rating validation record before release to production.",
  },
  {
    id: "KB-031",
    title: "Drawing revision control",
    keywords: ["drawing", "revision", "dwg", "rev", "affected"],
    snippet: "Any change touching a released drawing bumps the revision and notifies the document owner.",
  },
  {
    id: "KB-044",
    title: "Change approval matrix",
    keywords: ["approval", "manager", "release", "cycle", "urgency", "medium"],
    snippet: "Medium-urgency changes need engineering manager approval before the next build cycle freeze.",
  },
  {
    id: "KB-052",
    title: "Status report template",
    keywords: ["status", "report", "ticket", "jira"],
    snippet: "Weekly status reports list open ECRs, owner, blocking items and next approval date.",
  },
];

/** Deterministic keyword retrieval — no model involved. */
export function retrieve(query: string, limit = 3) {
  const q = query.toLowerCase();
  return DEMO_KB.map((doc) => ({
    id: doc.id,
    title: doc.title,
    snippet: doc.snippet,
    score: doc.keywords.filter((k) => q.includes(k)).length,
  }))
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
