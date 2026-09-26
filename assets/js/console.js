const EXAMPLE_WORKFLOW =
  "Each week, engineers manually consolidate testing results from multiple " +
  "files, summarize failures and create a status report for the Project " +
  "Leader. New engineers also ask the same 5-6 environment setup questions " +
  "over Teams every week.";

const STAGE_LABEL = {
  audit: "Audit Agent",
  prioritize: "Prioritize Agent",
  design: "Design Agent",
  report: "Deliver Agent",
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = String(str ?? "");
  return div.innerHTML;
}

function fillList(el, items) {
  el.innerHTML = (items || []).map((i) => `<li>${escapeHtml(i)}</li>`).join("");
}

/* ============ Console log + pipeline ============ */

const elLog = $("#console-log");
const pipelineStages = {};
$$(".pipeline-stage").forEach((el) => (pipelineStages[el.dataset.stage] = el));

function log(msg, type) {
  const line = document.createElement("div");
  line.className = "console-line" + (type ? ` ${type}` : "");
  const time = new Date().toLocaleTimeString("en-US", { hour12: false });
  line.innerHTML = `<span class="t">${time}</span>${escapeHtml(msg)}`;
  elLog.appendChild(line);
  elLog.scrollTop = elLog.scrollHeight;
}

function setStage(stage, status) {
  const el = pipelineStages[stage];
  el.classList.remove("active", "done", "error");
  if (status) el.classList.add(status);
}

async function callAgent(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Error calling ${path}`);
  return data;
}

async function runStage(stage, path, body, onSuccess) {
  setStage(stage, "active");
  log(`→ ${STAGE_LABEL[stage]}: sending request to Claude...`);
  const start = performance.now();
  try {
    const data = await callAgent(path, body);
    const elapsed = ((performance.now() - start) / 1000).toFixed(1);
    setStage(stage, "done");
    const summary = onSuccess(data);
    log(`✓ ${STAGE_LABEL[stage]}: ${summary} (${elapsed}s)`, "ok");
    return data;
  } catch (err) {
    setStage(stage, "error");
    log(`✗ ${STAGE_LABEL[stage]}: ${err.message}`, "err");
    throw err;
  }
}

/* ============ Rendering: Audit ============ */

const INTERVENTION_LABEL = {
  prompt: "Prompt",
  automation: "Automation",
  ai_agent: "AI Agent",
  knowledge_assistant: "Knowledge Assistant",
  analytics: "Analytics",
  keep_human: "Keep Human",
};

function renderAudit(audit) {
  const panel = $("#panel-audit");
  panel.querySelector('[data-field="current_process"]').textContent = audit.current_process;
  fillList(panel.querySelector('[data-field="bottlenecks"]'), audit.bottlenecks);
  fillList(panel.querySelector('[data-field="repetitive_work"]'), audit.repetitive_work);
  fillList(
    panel.querySelector('[data-field="information_dependencies"]'),
    audit.information_dependencies
  );
  fillList(
    panel.querySelector('[data-field="human_decision_points"]'),
    audit.human_decision_points
  );
  fillList(panel.querySelector('[data-field="potential_risks"]'), audit.potential_risks);

  const list = panel.querySelector('[data-field="opportunities"]');
  list.innerHTML = audit.opportunities
    .map(
      (o) => `
      <div class="opportunity-item">
        <span class="opportunity-text">${escapeHtml(o.opportunity)}<span class="opportunity-rationale">${escapeHtml(o.rationale)}</span></span>
        <span class="badge badge-${o.automation_potential}">${o.automation_potential} potential</span>
        <span class="badge badge-intervention">${INTERVENTION_LABEL[o.recommended_intervention] || o.recommended_intervention}</span>
      </div>`
    )
    .join("");

  panel.hidden = false;
}

/* ============ Rendering: Prioritization ============ */

const PRIORITY_LABEL = {
  quick_win: "Quick win",
  strategic: "Strategic",
  experiment: "Experiment",
  low_priority: "Low priority",
};

function renderPrioritization(payload) {
  const panel = $("#panel-prioritize");
  panel.querySelector('[data-field="data_note"]').textContent = payload.data_note;

  $$(".quadrant-items").forEach((el) => (el.innerHTML = ""));
  payload.matrix.forEach((row) => {
    const cell = panel.querySelector(`.quadrant-cell[data-quadrant="${row.recommended_priority}"] .quadrant-items`);
    if (cell) {
      const chip = document.createElement("span");
      chip.className = "quadrant-chip";
      chip.textContent = row.opportunity;
      cell.appendChild(chip);
    }
  });

  const tbody = panel.querySelector('[data-field="matrix-rows"]');
  tbody.innerHTML = payload.matrix
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.opportunity)}</td>
        <td><span class="badge badge-${row.business_impact}">${row.business_impact}</span></td>
        <td><span class="badge badge-${row.implementation_effort}">${row.implementation_effort}</span></td>
        <td>${escapeHtml(row.frequency)}</td>
        <td><span class="badge badge-${row.risk}">${row.risk}</span></td>
        <td><strong>${PRIORITY_LABEL[row.recommended_priority] || row.recommended_priority}</strong></td>
      </tr>`
    )
    .join("");

  panel.hidden = false;
}

/* ============ Rendering: Blueprint ============ */

const VERDICT_LABEL = {
  no_automation: "No automation",
  prompt: "Prompt",
  deterministic_automation: "Deterministic automation",
  rag_assistant: "RAG assistant",
  ai_agent: "AI Agent",
};

function renderBlueprint(blueprint) {
  const panel = $("#panel-design");
  panel.querySelector('[data-field="implementation_verdict"]').textContent =
    VERDICT_LABEL[blueprint.implementation_verdict] || blueprint.implementation_verdict;
  panel.querySelector('[data-field="verdict_reason"]').textContent = blueprint.verdict_reason;
  panel.querySelector('[data-field="problem"]').textContent = blueprint.problem;
  panel.querySelector('[data-field="recommended_approach"]').textContent = blueprint.recommended_approach;
  fillList(panel.querySelector('[data-field="inputs"]'), blueprint.inputs);
  panel.querySelector('[data-field="ai_role"]').textContent = blueprint.ai_role;
  panel.querySelector('[data-field="human_role"]').textContent = blueprint.human_role;
  panel.querySelector('[data-field="output"]').textContent = blueprint.output;
  panel.querySelector('[data-field="integration_point"]').textContent = blueprint.integration_point;
  fillList(panel.querySelector('[data-field="success_metrics"]'), blueprint.success_metrics);
  fillList(panel.querySelector('[data-field="risks"]'), blueprint.risks);
  fillList(panel.querySelector('[data-field="implementation_steps"]'), blueprint.implementation_steps);
  panel.hidden = false;
}

/* ============ Rendering: Implementation Brief ============ */

function renderBrief(brief) {
  const panel = $("#panel-report");
  Object.keys(brief).forEach((key) => {
    const el = panel.querySelector(`[data-brief-panel="${key}"]`);
    if (el) el.textContent = brief[key];
  });
  panel.hidden = false;
}

$$("#brief-tabs .tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$("#brief-tabs .tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
    $$(".brief-panel").forEach((p) =>
      p.classList.toggle("active", p.dataset.briefPanel === btn.dataset.briefTab)
    );
  });
});

/* ============ Export for implementation (generated previews) ============ */

let pipelineData = null; // { workflow, audit, opportunity, blueprint, brief }
let currentExportFormat = "executive";

function generateExecutiveBrief(d) {
  return `EXECUTIVE BRIEF
${d.opportunity.opportunity}

${d.brief.executive_summary}

Recommended approach: ${VERDICT_LABEL[d.blueprint.implementation_verdict] || d.blueprint.implementation_verdict} — ${d.blueprint.recommended_approach}
Why this level: ${d.blueprint.verdict_reason}

Impact: ${d.opportunity.business_impact} · Effort: ${d.opportunity.implementation_effort} · Risk: ${d.opportunity.risk}

Metrics: ${d.brief.metrics}`;
}

function generateConfluencePage(d) {
  return `h1. ${d.opportunity.opportunity} — Implementation Brief

h2. Executive Summary
${d.brief.executive_summary}

h2. Current Process
${d.audit.current_process}

h2. Technical Approach
${d.brief.technical_approach}

h2. Adoption Plan
${d.brief.adoption_plan}

h2. Metrics
${d.brief.metrics}

h2. Documentation
${d.brief.documentation}

{note}
Generated preview — paste into Confluence and adjust formatting as needed. Not a live Confluence integration.
{note}`;
}

function generateJiraEpic(d) {
  const steps = d.blueprint.implementation_steps
    .map((s, i) => `${i + 1}. ${s}`)
    .join("\n");
  const risks = d.blueprint.risks.map((r) => `- ${r}`).join("\n");
  return `Epic Name: ${d.opportunity.opportunity}

Summary:
${d.blueprint.problem}

Description:
${d.brief.technical_approach}

AI role: ${d.blueprint.ai_role}
Human role: ${d.blueprint.human_role}
Integration point: ${d.blueprint.integration_point}

Acceptance Criteria:
${steps}

Risks:
${risks}

Priority: ${PRIORITY_LABEL[d.opportunity.recommended_priority] || d.opportunity.recommended_priority}
Labels: ai-implementation, ${d.blueprint.implementation_verdict}`;
}

function generateMarkdown(d) {
  return `# Implementation Brief

## Workflow audited
${d.workflow}

## Executive Summary
${d.brief.executive_summary}

## Technical Approach
${d.brief.technical_approach}

## Adoption Plan
${d.brief.adoption_plan}

## Metrics
${d.brief.metrics}

## Documentation
${d.brief.documentation}

---

## Appendix: Workflow Audit
- Current process: ${d.audit.current_process}
- Bottlenecks: ${d.audit.bottlenecks.join("; ")}
- Repetitive work: ${d.audit.repetitive_work.join("; ")}
- Human decision points: ${d.audit.human_decision_points.join("; ")}
- Potential risks: ${d.audit.potential_risks.join("; ")}

## Appendix: Prioritized Opportunity
- Opportunity: ${d.opportunity.opportunity}
- Business impact: ${d.opportunity.business_impact} · Effort: ${d.opportunity.implementation_effort} · Risk: ${d.opportunity.risk}
- Priority: ${d.opportunity.recommended_priority}

## Appendix: AI Solution Blueprint
- Verdict: ${VERDICT_LABEL[d.blueprint.implementation_verdict] || d.blueprint.implementation_verdict} (${d.blueprint.verdict_reason})
- Recommended approach: ${d.blueprint.recommended_approach}
- AI role: ${d.blueprint.ai_role}
- Human role: ${d.blueprint.human_role}
- Integration point: ${d.blueprint.integration_point}
- Implementation steps: ${d.blueprint.implementation_steps.join(" → ")}
`;
}

const EXPORT_GENERATORS = {
  executive: { generate: generateExecutiveBrief, filename: "executive-brief.txt", mime: "text/plain" },
  confluence: { generate: generateConfluencePage, filename: "confluence-page.txt", mime: "text/plain" },
  jira: { generate: generateJiraEpic, filename: "jira-epic.txt", mime: "text/plain" },
  markdown: { generate: generateMarkdown, filename: "implementation-brief.md", mime: "text/markdown" },
};

function renderExportPreview() {
  const el = $("#export-preview");
  if (!pipelineData) {
    el.textContent = "";
    return;
  }
  el.textContent = EXPORT_GENERATORS[currentExportFormat].generate(pipelineData);
}

$$("#export-tabs .tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$("#export-tabs .tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
    currentExportFormat = btn.dataset.export;
    renderExportPreview();
  });
});

$("#btn-download").addEventListener("click", () => {
  if (!pipelineData) return;
  const { generate, filename, mime } = EXPORT_GENERATORS[currentExportFormat];
  const blob = new Blob([generate(pipelineData)], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
});

/* ============ Pipeline orchestration ============ */

const elInput = $("#workflow-input");
const elBtnRun = $("#btn-run");
const elBtnExample = $("#btn-example");
const elError = $("#error-msg");

elBtnExample.addEventListener("click", () => {
  elInput.value = EXAMPLE_WORKFLOW;
});

elBtnRun.addEventListener("click", runPipeline);

function resetUI() {
  Object.keys(pipelineStages).forEach((stage) => setStage(stage, null));
  elLog.innerHTML = "";
  elError.hidden = true;
  pipelineData = null;
  ["audit", "prioritize", "design", "report"].forEach((name) => {
    $(`#panel-${name}`).hidden = true;
  });
}

async function runPipeline() {
  const workflow = elInput.value.trim();
  resetUI();

  if (workflow.length < 20) {
    elError.textContent = "Describe the workflow with at least 20 characters.";
    elError.hidden = false;
    return;
  }

  elBtnRun.disabled = true;
  log("Starting 4-agent implementation pipeline...");

  try {
    const { audit } = await runStage("audit", "/api/audit", { process: workflow }, (data) => {
      renderAudit(data.audit);
      return `${data.audit.opportunities.length} opportunities identified`;
    });

    const { matrix } = await runStage(
      "prioritize",
      "/api/prioritize",
      { opportunities: audit.opportunities },
      (data) => {
        renderPrioritization(data);
        return `${data.matrix.length} opportunities scored, top: "${data.matrix[0].opportunity}"`;
      }
    );

    const topOpportunity = matrix[0];
    const { blueprint } = await runStage(
      "design",
      "/api/design-agent",
      { opportunity: topOpportunity },
      (data) => {
        renderBlueprint(data.blueprint);
        return `verdict: ${VERDICT_LABEL[data.blueprint.implementation_verdict] || data.blueprint.implementation_verdict}`;
      }
    );

    await runStage(
      "report",
      "/api/report",
      { process: workflow, audit, opportunity: topOpportunity, blueprint },
      (data) => {
        renderBrief(data.brief);
        pipelineData = { workflow, audit, opportunity: topOpportunity, blueprint, brief: data.brief };
        renderExportPreview();
        return "implementation brief generated";
      }
    );

    log("Pipeline complete.", "ok");
  } catch (err) {
    elError.textContent = err.message || "The pipeline failed to complete.";
    elError.hidden = false;
  } finally {
    elBtnRun.disabled = false;
  }
}

/* ============ Enablement kit modal ============ */

const elKitModal = $("#kit-modal");
const elBtnPreviewKit = $("#btn-preview-kit");
const elBtnCloseKit = $("#btn-close-kit");

if (elBtnPreviewKit) {
  elBtnPreviewKit.addEventListener("click", () => {
    elKitModal.hidden = false;
  });
}
if (elBtnCloseKit) {
  elBtnCloseKit.addEventListener("click", () => {
    elKitModal.hidden = true;
  });
}
if (elKitModal) {
  elKitModal.addEventListener("click", (e) => {
    if (e.target === elKitModal) elKitModal.hidden = true;
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") elKitModal.hidden = true;
  });
}
