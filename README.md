# AI Implementation Console — Sarahí Cruz Salazar

Built for the **AI Implementation Specialist** role at **Alten México**. This is not a static resume site: the
homepage IS a working 4-agent AI implementation pipeline (Netlify Functions calling Claude live), followed by
the methodology, an interactive map of where AI fits an engineering workflow, and proof-of-execution code.

## The console (`index.html`)

Describe a real engineering workflow and watch four chained agents run against it:

**Audit → Prioritize → Design → Deliver**

| Agent | Function | What it produces |
|---|---|---|
| Audit | `netlify/functions/audit.mts` | Current process, bottlenecks, repetitive work, dependencies, human decision points, risks, and scored automation opportunities |
| Prioritize | `netlify/functions/prioritize.mts` | An impact × effort matrix (quick win / strategic / experiment / low priority) — never invents ROI or hours saved without baseline data |
| Design | `netlify/functions/design-agent.mts` | An AI Solution Blueprint: approach, AI role vs. human role, integration point, success metrics, risks, implementation steps |
| Deliver | `netlify/functions/report.mts` | An Implementation Brief (Executive Summary / Technical Approach / Adoption Plan / Metrics / Documentation), exportable as Markdown |

Each agent's structured JSON output feeds the next — this is a real chained pipeline, not four independent
prompts. Deployed at `https://sarahiportafolioalten.netlify.app`. Requires `ANTHROPIC_API_KEY` set in Netlify
(already configured for this project).

`motor-ia.html` is kept only as a redirect to `index.html#console` for the old link.

## Structure

```
index.html                          The AI Implementation Console (homepage)
netlify/functions/                  The 4 chained agents (Netlify Functions + Claude)
  _lib/claude.mts                     Anthropic client + JSON/text response helpers
assets/css/console.css              Console UI: pipeline, results panels, map, methodology
assets/js/console.js                Pipeline orchestration + AI Implementation Map data
projects/
  01-auditoria-automatizacion-flujos/     Audit checklist + opportunity-scoring script
  02-agente-ia-soporte-tecnico/           Support agent: classify → retrieve → escalate
  03-prompt-engineering-tokens/           Prompt library + token optimizer
  04-dashboard-adopcion-ia/               Data model, SQL and Power BI spec for adoption metrics
  05-capacitacion-gestion-cambio/         Training plan + internal documentation template
```

Each `projects/` folder has its own README with the problem it solves and how to run it. All code (`.py`,
`.sql`) was executed and verified before publishing. The homepage's "Selected AI & Automation Work" section
links directly to projects 01, 02 and 04 as proof of execution.

## Contact

sarahicruzsalazar@gmail.com
