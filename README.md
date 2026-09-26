# AI Implementation Assistant — Sarahí Cruz Salazar

Built for the **AI Implementation Specialist** role at **Alten México**. One project, one page: a single
assistant with seven selectable objectives, each routing to the right combination of specialized agents. EN
by default, ES available via the toggle in the header — the toggle itself doubles as evidence of the
technical English the role asks for.

## The assistant (`index.html`)

Pick a goal, describe your situation in your own words, and the assistant runs the right subset of a shared
agent roster against it:

| Goal | Steps used | Backend |
|---|---|---|
| Audit a workflow | Auditor | `audit.mts` |
| Find automation opportunities | Auditor → Prioritizer | `audit.mts`, `prioritize.mts` |
| Design an AI agent | Solution Designer | `design-agent.mts` |
| Improve a prompt | Prompt Engineer | `improve-prompt.mts` |
| Optimize reporting/testing | Auditor → Prioritizer → Solution Designer | `audit.mts`, `prioritize.mts`, `design-agent.mts` |
| Create implementation documentation | Documentation/Enablement | `document-solution.mts` |
| Build a training plan | Documentation/Enablement | `training-plan.mts` |

The Solution Designer always renders a verdict first — `no_automation` / `prompt` /
`deterministic_automation` / `rag_assistant` / `ai_agent` — before any solution detail. Not every workflow
needs an agent, and the assistant says so.

All 7 functions accept a `language: "en"|"es"` field so the output matches whichever language is selected in
the header, while structural fields (badges, quadrant keys) stay in English so the UI never breaks.

Deployed at `https://sarahiportafolioalten.netlify.app`. Requires `ANTHROPIC_API_KEY` set in Netlify (already
configured for this project). `motor-ia.html` is kept only as a redirect to `index.html#assistant` for the
old link.

## Structure

```
index.html                          The AI Implementation Assistant (homepage)
netlify/functions/
  _lib/claude.mts                     Anthropic client + JSON/text helpers + language instruction
  audit.mts                           Auditor
  prioritize.mts                      Prioritizer
  design-agent.mts                    Solution Designer (verdict + blueprint)
  improve-prompt.mts                  Prompt Engineer
  document-solution.mts               Documentation (freeform solution → brief)
  training-plan.mts                   Documentation/Enablement (team → training plan)
  report.mts                          Documentation (full-pipeline brief, used by the "optimize" flow)
assets/css/console.css              UI: objective picker, pipeline, result panels, how-it-works, capabilities
assets/js/console.js                Objective routing, i18n (EN/ES), orchestration
case-audit-automation.html          Case study: Workflow Audit Framework (project 01)
case-support-agent.html             Case study: Support Agent Prototype (project 02)
projects/
  01-auditoria-automatizacion-flujos/     Audit checklist + opportunity-scoring script
  02-agente-ia-soporte-tecnico/           Support agent: classify → retrieve → escalate
  03-prompt-engineering-tokens/           Prompt library + token optimizer
  04-dashboard-adopcion-ia/               Data model, SQL and Power BI spec for adoption metrics
  05-capacitacion-gestion-cambio/         Training plan + internal documentation template
```

`projects/` and the two case-study pages are kept as supporting evidence, linked discreetly from the
homepage's "View additional work" link rather than presented as separate flagship projects — the whole page
is built to demonstrate one thing well.

## Contact

sarahicruzsalazar@gmail.com
