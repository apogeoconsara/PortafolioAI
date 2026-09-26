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

function renderBlueprint(blueprint) {
  const panel = $("#panel-design");
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

let lastBriefMarkdown = "";

function buildBriefMarkdown(workflow, audit, opportunity, blueprint, brief) {
  return `# Implementation Brief

## Workflow audited
${workflow}

## Executive Summary
${brief.executive_summary}

## Technical Approach
${brief.technical_approach}

## Adoption Plan
${brief.adoption_plan}

## Metrics
${brief.metrics}

## Documentation
${brief.documentation}

---

## Appendix: Workflow Audit
- Current process: ${audit.current_process}
- Bottlenecks: ${audit.bottlenecks.join("; ")}
- Repetitive work: ${audit.repetitive_work.join("; ")}
- Human decision points: ${audit.human_decision_points.join("; ")}
- Potential risks: ${audit.potential_risks.join("; ")}

## Appendix: Prioritized Opportunity
- Opportunity: ${opportunity.opportunity}
- Business impact: ${opportunity.business_impact} · Effort: ${opportunity.implementation_effort} · Risk: ${opportunity.risk}
- Priority: ${opportunity.recommended_priority}

## Appendix: AI Solution Blueprint
- Recommended approach: ${blueprint.recommended_approach}
- AI role: ${blueprint.ai_role}
- Human role: ${blueprint.human_role}
- Integration point: ${blueprint.integration_point}
- Implementation steps: ${blueprint.implementation_steps.join(" → ")}
`;
}

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

$("#btn-download").addEventListener("click", () => {
  const blob = new Blob([lastBriefMarkdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "implementation-brief.md";
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

    const { matrix, data_note } = await runStage(
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
        return `recommended approach: ${data.blueprint.recommended_approach}`;
      }
    );

    const { brief } = await runStage(
      "report",
      "/api/report",
      { process: workflow, audit, opportunity: topOpportunity, blueprint },
      (data) => {
        renderBrief(data.brief);
        lastBriefMarkdown = buildBriefMarkdown(workflow, audit, topOpportunity, blueprint, data.brief);
        return "implementation brief generated";
      }
    );

    log("Pipeline complete.", "ok");
    void data_note;
    void brief;
  } catch (err) {
    elError.textContent = err.message || "The pipeline failed to complete.";
    elError.hidden = false;
  } finally {
    elBtnRun.disabled = false;
  }
}

/* ============ AI Implementation Map (static, no API call) ============ */

const MAP_DATA = {
  requirements: [
    "Draft-to-checklist gap analysis against acceptance criteria",
    "Summarizing stakeholder requirements from meeting notes",
    "Flagging ambiguous or conflicting requirements early",
  ],
  design: [
    "Design checklist review against standards",
    "Drafting first-pass technical documentation from specs",
    "Comparing a new design against prior similar designs",
  ],
  development: [
    "Code review assistance and pattern flagging",
    "Boilerplate and repetitive code generation",
    "Explaining legacy code sections to new engineers",
  ],
  testing: [
    "Test case generation",
    "Failure summarization",
    "Regression analysis support",
    "Technical documentation",
    "Automated reporting",
  ],
  reporting: [
    "Project status summaries",
    "Cross-source information consolidation",
    "Risk identification",
    "Stakeholder reporting",
  ],
  knowledge: [
    "Internal AI assistant",
    "Knowledge retrieval",
    "Technical Q&A",
    "Documentation search",
  ],
  pm: [
    "Sprint status consolidation across Jira/Confluence",
    "Meeting notes to action items",
    "Early risk flagging from status patterns",
  ],
};

const MAP_TITLE = {
  requirements: "Requirements",
  design: "Design",
  development: "Development",
  testing: "Testing",
  reporting: "Reporting",
  knowledge: "Knowledge",
  pm: "Project Management",
};

$$(".map-stage").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$(".map-stage").forEach((b) => b.classList.toggle("active", b === btn));
    const key = btn.dataset.map;
    $("#map-panel-title").textContent = MAP_TITLE[key];
    $("#map-panel-list").innerHTML = MAP_DATA[key].map((i) => `<li>${escapeHtml(i)}</li>`).join("");
  });
});

// Initialize map panel with the default active stage (Testing).
const initialMapStage = $(".map-stage.active") || $(".map-stage");
if (initialMapStage) {
  $("#map-panel-title").textContent = MAP_TITLE[initialMapStage.dataset.map];
  $("#map-panel-list").innerHTML = MAP_DATA[initialMapStage.dataset.map]
    .map((i) => `<li>${escapeHtml(i)}</li>`)
    .join("");
}
