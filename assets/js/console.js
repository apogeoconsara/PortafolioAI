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

/* ============================================================
   i18n
   ============================================================ */

const I18N = {
  en: {
    "nav.assistant": "Assistant",
    "nav.how": "How it works",
    "nav.capabilities": "Capabilities",
    "nav.contact": "Contact",
    "hero.role": "AI Implementation Assistant",
    "hero.h1": "One assistant. Seven ways to implement AI in an engineering workflow.",
    "hero.lead": "Pick a goal, describe your situation, and watch the right combination of agents run — live, on your own words.",
    "offer.label": "What I bring to this role",
    "offer.audit": "Find where AI actually helps in a real workflow",
    "offer.judgment": "Know when NOT to use AI",
    "offer.design": "Design the right solution — prompt, automation or agent",
    "offer.docs": "Document it so a team can run it without me",
    "offer.train": "Train people to adopt it",
    "common.tryExample": "Try an example",
    "panel.audit.title": "Workflow Audit",
    "panel.audit.bottlenecks": "Bottlenecks",
    "panel.audit.repetitive": "Repetitive work",
    "panel.audit.dependencies": "Information dependencies",
    "panel.audit.decisions": "Human decision points",
    "panel.audit.risks": "Potential risks",
    "panel.audit.opportunities": "Automation opportunities",
    "panel.prioritize.title": "Opportunity Prioritization",
    "panel.prioritize.quickWin": "Quick win",
    "panel.prioritize.strategic": "Strategic",
    "panel.prioritize.experiment": "Experiment",
    "panel.prioritize.lowPriority": "Low priority",
    "panel.prioritize.col.opportunity": "Opportunity",
    "panel.prioritize.col.impact": "Business impact",
    "panel.prioritize.col.effort": "Implementation effort",
    "panel.prioritize.col.frequency": "Frequency",
    "panel.prioritize.col.risk": "Risk",
    "panel.prioritize.col.priority": "Priority",
    "panel.design.title": "AI Solution Blueprint",
    "panel.design.tagline": "Not every workflow needs an AI agent.",
    "panel.design.diagram.workflow": "Engineering Workflow",
    "panel.design.diagram.input": "Input / Data",
    "panel.design.diagram.ai": "AI Layer",
    "panel.design.diagram.validation": "Validation / Human-in-the-loop",
    "panel.design.diagram.output": "Engineering Output",
    "panel.design.diagram.metrics": "Metrics",
    "panel.design.inputs": "Inputs",
    "panel.design.aiRole": "AI role",
    "panel.design.humanRole": "Human role",
    "panel.design.output": "Output",
    "panel.design.integration": "Integration point",
    "panel.design.metrics": "Success metrics",
    "panel.design.risks": "Risks",
    "panel.design.steps": "Implementation steps",
    "panel.prompt.title": "Prompt Improvement",
    "panel.prompt.improved": "Improved prompt",
    "panel.prompt.techniques": "Techniques applied",
    "panel.prompt.rationale": "Rationale",
    "panel.prompt.impact": "Estimated impact",
    "panel.training.col.session": "Session",
    "panel.training.col.objective": "Objective",
    "panel.training.col.activity": "Activity",
    "panel.training.col.deliverable": "Deliverable",
    "panel.training.notes": "Enablement & measurement",
    "panel.training.download": "Download training plan",
    "panel.report.title": "Implementation Brief",
    "panel.report.tab.summary": "Executive Summary",
    "panel.report.tab.approach": "Technical Approach",
    "panel.report.tab.adoption": "Adoption Plan",
    "panel.report.tab.metrics": "Metrics",
    "panel.report.tab.docs": "Documentation",
    "panel.report.export": "Export for implementation",
    "panel.report.exportHint": "Generated preview — not a live Confluence/Jira integration, but the same handoff step a real implementation would need.",
    "panel.report.export.executive": "Executive Brief",
    "panel.report.export.confluence": "Confluence Page",
    "panel.report.export.jira": "Jira Epic",
    "panel.report.export.markdown": "Markdown",
    "panel.report.download": "Download this format",
    "how.title": "How it works",
    "how.intro": "One goal picker routes your input to the right combination of specialized steps — the same shared roster of agents, recombined differently for each objective.",
    "how.auditor.name": "Auditor",
    "how.auditor.desc": "Understands the process before recommending anything.",
    "how.prioritizer.name": "Prioritizer",
    "how.prioritizer.desc": "Scores impact vs. effort — no invented ROI.",
    "how.designer.name": "Solution Designer",
    "how.designer.desc": "Picks the right intervention, including no automation at all.",
    "how.prompter.name": "Prompt Engineer",
    "how.prompter.desc": "Rewrites a prompt with explicit technique, not guesswork.",
    "how.documenter.name": "Documentation / Enablement",
    "how.documenter.desc": "Turns a decision into something a team can run without me.",
    "how.col.goal": "Goal",
    "how.col.steps": "Steps used",
    "cap.title": "What this demonstrates",
    "cap.intro": "Every result above is generated live by Claude when you run it — nothing on this page is pre-written.",
    "cap.audit": "Workflow auditing",
    "cap.llm": "LLM integration",
    "cap.agents": "AI agents & chatbots",
    "cap.prompt": "Prompt engineering",
    "cap.automation": "Workflow automation",
    "cap.docs": "Technical documentation",
    "cap.training": "Training & change management",
    "cap.analytics": "Analytics & measurement",
    "cap.judgment": "Implementation judgment — knowing when not to use AI",
    "contact.title": "Contact",
    "contact.line": "Available to discuss the AI Implementation Specialist role at Alten México.",
    "contact.additional": "View additional work →",
    "footer.built": "Built with Netlify Functions + Claude (Anthropic)",
    "obj.audit.label": "Audit a workflow",
    "obj.audit.field": "Describe an engineering workflow",
    "obj.audit.placeholder": "Each week, engineers manually consolidate testing results from multiple files, summarize failures and create a status report for the Project Leader.",
    "obj.audit.run": "Analyze workflow",
    "obj.opportunities.label": "Find automation opportunities",
    "obj.opportunities.field": "Describe an engineering workflow",
    "obj.opportunities.placeholder": "Our design team reviews every new drawing against a 40-item checklist by hand, and re-does it after every revision.",
    "obj.opportunities.run": "Find opportunities",
    "obj.design.label": "Design an AI agent",
    "obj.design.field": "Describe the problem you want to solve",
    "obj.design.placeholder": "New engineers ask the same setup and access questions over Teams every week, and senior engineers keep answering them one by one.",
    "obj.design.run": "Design solution",
    "obj.prompt.label": "Improve a prompt",
    "obj.prompt.field": "Paste a prompt you currently use",
    "obj.prompt.placeholder": "Summarize this test report and tell me what's important.",
    "obj.prompt.run": "Improve prompt",
    "obj.optimize.label": "Optimize reporting/testing",
    "obj.optimize.field": "Describe a testing or reporting workflow",
    "obj.optimize.placeholder": "QA runs 60 regression tests before every release and manually writes a pass/fail summary for the release notes.",
    "obj.optimize.run": "Optimize workflow",
    "obj.docs.label": "Create implementation documentation",
    "obj.docs.field": "Describe a solution that's already decided",
    "obj.docs.placeholder": "We're building a Slack bot that answers deployment questions using our runbooks, with a human reviewing any answer it's unsure about.",
    "obj.docs.run": "Generate documentation",
    "obj.training.label": "Build a training plan",
    "obj.training.field": "Describe the team or situation",
    "obj.training.placeholder": "A 6-person QA team with no prior LLM experience needs to start using AI for test case generation and reporting.",
    "obj.training.run": "Build training plan",
  },
  es: {
    "nav.assistant": "Asistente",
    "nav.how": "Cómo funciona",
    "nav.capabilities": "Capacidades",
    "nav.contact": "Contacto",
    "hero.role": "Asistente de Implementación de IA",
    "hero.h1": "Un asistente. Siete formas de implementar IA en un flujo de ingeniería.",
    "hero.lead": "Elige un objetivo, describe tu situación, y observa la combinación correcta de agentes ejecutarse — en vivo, con tus propias palabras.",
    "offer.label": "Qué aporto a este puesto",
    "offer.audit": "Encontrar dónde la IA realmente ayuda en un flujo real",
    "offer.judgment": "Saber cuándo NO usar IA",
    "offer.design": "Diseñar la solución correcta — prompt, automatización o agente",
    "offer.docs": "Documentarlo para que el equipo lo opere sin mí",
    "offer.train": "Capacitar a las personas para adoptarlo",
    "common.tryExample": "Probar un ejemplo",
    "panel.audit.title": "Auditoría del flujo de trabajo",
    "panel.audit.bottlenecks": "Cuellos de botella",
    "panel.audit.repetitive": "Trabajo repetitivo",
    "panel.audit.dependencies": "Dependencias de información",
    "panel.audit.decisions": "Puntos de decisión humana",
    "panel.audit.risks": "Riesgos potenciales",
    "panel.audit.opportunities": "Oportunidades de automatización",
    "panel.prioritize.title": "Priorización de oportunidades",
    "panel.prioritize.quickWin": "Quick win",
    "panel.prioritize.strategic": "Estratégico",
    "panel.prioritize.experiment": "Experimento",
    "panel.prioritize.lowPriority": "Baja prioridad",
    "panel.prioritize.col.opportunity": "Oportunidad",
    "panel.prioritize.col.impact": "Impacto de negocio",
    "panel.prioritize.col.effort": "Esfuerzo de implementación",
    "panel.prioritize.col.frequency": "Frecuencia",
    "panel.prioritize.col.risk": "Riesgo",
    "panel.prioritize.col.priority": "Prioridad",
    "panel.design.title": "Blueprint de solución de IA",
    "panel.design.tagline": "No todo flujo de trabajo necesita un agente de IA.",
    "panel.design.diagram.workflow": "Flujo de ingeniería",
    "panel.design.diagram.input": "Entrada / Datos",
    "panel.design.diagram.ai": "Capa de IA",
    "panel.design.diagram.validation": "Validación / Humano en el loop",
    "panel.design.diagram.output": "Salida de ingeniería",
    "panel.design.diagram.metrics": "Métricas",
    "panel.design.inputs": "Entradas",
    "panel.design.aiRole": "Rol de la IA",
    "panel.design.humanRole": "Rol humano",
    "panel.design.output": "Salida",
    "panel.design.integration": "Punto de integración",
    "panel.design.metrics": "Métricas de éxito",
    "panel.design.risks": "Riesgos",
    "panel.design.steps": "Pasos de implementación",
    "panel.prompt.title": "Mejora de prompt",
    "panel.prompt.improved": "Prompt mejorado",
    "panel.prompt.techniques": "Técnicas aplicadas",
    "panel.prompt.rationale": "Justificación",
    "panel.prompt.impact": "Impacto estimado",
    "panel.training.col.session": "Sesión",
    "panel.training.col.objective": "Objetivo",
    "panel.training.col.activity": "Actividad",
    "panel.training.col.deliverable": "Entregable",
    "panel.training.notes": "Adopción y medición",
    "panel.training.download": "Descargar plan de capacitación",
    "panel.report.title": "Implementation Brief",
    "panel.report.tab.summary": "Resumen ejecutivo",
    "panel.report.tab.approach": "Enfoque técnico",
    "panel.report.tab.adoption": "Plan de adopción",
    "panel.report.tab.metrics": "Métricas",
    "panel.report.tab.docs": "Documentación",
    "panel.report.export": "Exportar para implementación",
    "panel.report.exportHint": "Vista previa generada — no es una integración real con Confluence/Jira, pero demuestra el mismo paso de entrega que una implementación real necesitaría.",
    "panel.report.export.executive": "Executive Brief",
    "panel.report.export.confluence": "Página de Confluence",
    "panel.report.export.jira": "Épica de Jira",
    "panel.report.export.markdown": "Markdown",
    "panel.report.download": "Descargar este formato",
    "how.title": "Cómo funciona",
    "how.intro": "Un selector de objetivo enruta tu descripción hacia la combinación correcta de pasos especializados — el mismo conjunto de agentes, recombinado distinto según el objetivo.",
    "how.auditor.name": "Auditor",
    "how.auditor.desc": "Entiende el proceso antes de recomendar cualquier cosa.",
    "how.prioritizer.name": "Priorizador",
    "how.prioritizer.desc": "Puntúa impacto vs. esfuerzo — sin inventar ROI.",
    "how.designer.name": "Diseñador de solución",
    "how.designer.desc": "Elige la intervención correcta, incluyendo no automatizar.",
    "how.prompter.name": "Ingeniero de prompts",
    "how.prompter.desc": "Reescribe un prompt con técnica explícita, no al tanteo.",
    "how.documenter.name": "Documentación / Habilitación",
    "how.documenter.desc": "Convierte una decisión en algo que el equipo puede operar sin mí.",
    "how.col.goal": "Objetivo",
    "how.col.steps": "Pasos usados",
    "cap.title": "Qué demuestra esto",
    "cap.intro": "Cada resultado de arriba se genera en vivo con Claude al ejecutarlo — nada en esta página está preescrito.",
    "cap.audit": "Auditoría de procesos",
    "cap.llm": "Integración de LLMs",
    "cap.agents": "Agentes de IA y chatbots",
    "cap.prompt": "Ingeniería de prompts",
    "cap.automation": "Automatización de flujos",
    "cap.docs": "Documentación técnica",
    "cap.training": "Capacitación y gestión del cambio",
    "cap.analytics": "Analítica y medición",
    "cap.judgment": "Criterio de implementación — saber cuándo NO usar IA",
    "contact.title": "Contacto",
    "contact.line": "Disponible para conversar sobre la posición de Especialista de Implementación de IA en Alten México.",
    "contact.additional": "Ver más trabajo →",
    "footer.built": "Construido con Netlify Functions + Claude (Anthropic)",
    "obj.audit.label": "Auditar un flujo de trabajo",
    "obj.audit.field": "Describe un flujo de trabajo de ingeniería",
    "obj.audit.placeholder": "Cada semana, los ingenieros consolidan a mano resultados de pruebas de varios archivos, resumen las fallas y crean un reporte de estatus para el Líder de Proyecto.",
    "obj.audit.run": "Analizar flujo",
    "obj.opportunities.label": "Encontrar oportunidades de automatización",
    "obj.opportunities.field": "Describe un flujo de trabajo de ingeniería",
    "obj.opportunities.placeholder": "Nuestro equipo de diseño revisa a mano cada plano nuevo contra un checklist de 40 puntos, y lo vuelve a hacer después de cada revisión.",
    "obj.opportunities.run": "Encontrar oportunidades",
    "obj.design.label": "Diseñar un agente de IA",
    "obj.design.field": "Describe el problema que quieres resolver",
    "obj.design.placeholder": "Los ingenieros nuevos preguntan lo mismo sobre configuración y accesos por Teams cada semana, y los ingenieros senior siguen respondiendo uno por uno.",
    "obj.design.run": "Diseñar solución",
    "obj.prompt.label": "Mejorar un prompt",
    "obj.prompt.field": "Pega un prompt que usas actualmente",
    "obj.prompt.placeholder": "Resume este reporte de pruebas y dime qué es importante.",
    "obj.prompt.run": "Mejorar prompt",
    "obj.optimize.label": "Optimizar reportes/pruebas",
    "obj.optimize.field": "Describe un flujo de pruebas o reportes",
    "obj.optimize.placeholder": "QA ejecuta 60 pruebas de regresión antes de cada release y escribe a mano el resumen de pass/fail para las notas de versión.",
    "obj.optimize.run": "Optimizar flujo",
    "obj.docs.label": "Crear documentación de implementación",
    "obj.docs.field": "Describe una solución que ya está decidida",
    "obj.docs.placeholder": "Vamos a construir un bot de Slack que responde preguntas de despliegue usando nuestros runbooks, con un humano revisando cualquier respuesta de baja confianza.",
    "obj.docs.run": "Generar documentación",
    "obj.training.label": "Construir un plan de capacitación",
    "obj.training.field": "Describe al equipo o la situación",
    "obj.training.run": "Construir plan",
    "obj.training.placeholder": "Un equipo de QA de 6 personas sin experiencia previa en LLMs necesita empezar a usar IA para generación de casos de prueba y reportes.",
  },
};

let currentLang = localStorage.getItem("lang") === "es" ? "es" : "en";

function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
}

function applyStaticTranslations() {
  $$("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  $$("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.documentElement.lang = currentLang;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  $("#lang-en").classList.toggle("active", lang === "en");
  $("#lang-es").classList.toggle("active", lang === "es");
  applyStaticTranslations();
  applyObjective(currentObjective, { keepInput: true });
}

$("#lang-en").addEventListener("click", () => setLang("en"));
$("#lang-es").addEventListener("click", () => setLang("es"));

/* ============================================================
   Objectives
   ============================================================ */

const OBJECTIVES = {
  audit: { steps: ["auditor"] },
  opportunities: { steps: ["auditor", "prioritizer"] },
  design: { steps: ["designer"] },
  prompt: { steps: ["prompter"] },
  optimize: { steps: ["auditor", "prioritizer", "designer"] },
  docs: { steps: ["documenter"] },
  training: { steps: ["documenter"] },
};

const STEP_LABEL_KEY = {
  auditor: "how.auditor.name",
  prioritizer: "how.prioritizer.name",
  designer: "how.designer.name",
  prompter: "how.prompter.name",
  documenter: "how.documenter.name",
};

let currentObjective = "audit";

const elInput = $("#workflow-input");
const elInputLabel = $("#input-label");
const elBtnRun = $("#btn-run");
const elBtnExample = $("#btn-example");
const elError = $("#error-msg");
const elPipeline = $("#pipeline");

function applyObjective(objective, opts = {}) {
  currentObjective = objective;
  $$(".objective-chip").forEach((chip) => chip.classList.toggle("active", chip.dataset.objective === objective));

  elInputLabel.textContent = t(`obj.${objective}.field`);
  elInput.placeholder = t(`obj.${objective}.placeholder`);
  elBtnRun.textContent = t(`obj.${objective}.run`);
  if (!opts.keepInput) elInput.value = "";

  renderPipelineStages(OBJECTIVES[objective].steps);
  resetResults();
}

function renderPipelineStages(steps) {
  elPipeline.innerHTML = steps
    .map(
      (step, i) => `
      ${i > 0 ? '<div class="pipeline-arrow">→</div>' : ""}
      <div class="pipeline-stage" data-stage="${step}">
        <span class="pipeline-num">0${i + 1}</span>
        <span class="pipeline-name">${escapeHtml(t(STEP_LABEL_KEY[step]))}</span>
      </div>`
    )
    .join("");
}

$$(".objective-chip").forEach((chip) => {
  chip.addEventListener("click", () => applyObjective(chip.dataset.objective));
});

$("#btn-example").addEventListener("click", () => {
  elInput.value = t(`obj.${currentObjective}.placeholder`);
});

/* ============================================================
   Console log + pipeline stage status
   ============================================================ */

const elLog = $("#console-log");

function log(msg, type) {
  const line = document.createElement("div");
  line.className = "console-line" + (type ? ` ${type}` : "");
  const time = new Date().toLocaleTimeString("en-US", { hour12: false });
  line.innerHTML = `<span class="t">${time}</span>${escapeHtml(msg)}`;
  elLog.appendChild(line);
  elLog.scrollTop = elLog.scrollHeight;
}

function setStage(step, status) {
  const el = elPipeline.querySelector(`[data-stage="${step}"]`);
  if (!el) return;
  el.classList.remove("active", "done", "error");
  if (status) el.classList.add(status);
}

async function callAgent(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, language: currentLang }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Error calling ${path}`);
  return data;
}

async function runStep(step, path, body, onSuccess) {
  setStage(step, "active");
  log(`→ ${t(STEP_LABEL_KEY[step])}: sending request to Claude...`);
  const start = performance.now();
  try {
    const data = await callAgent(path, body);
    const elapsed = ((performance.now() - start) / 1000).toFixed(1);
    setStage(step, "done");
    const summary = onSuccess(data);
    log(`✓ ${t(STEP_LABEL_KEY[step])}: ${summary} (${elapsed}s)`, "ok");
    return data;
  } catch (err) {
    setStage(step, "error");
    log(`✗ ${t(STEP_LABEL_KEY[step])}: ${err.message}`, "err");
    throw err;
  }
}

/* ============================================================
   Rendering: Audit
   ============================================================ */

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
  fillList(panel.querySelector('[data-field="information_dependencies"]'), audit.information_dependencies);
  fillList(panel.querySelector('[data-field="human_decision_points"]'), audit.human_decision_points);
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

/* ============================================================
   Rendering: Prioritization
   ============================================================ */

const PRIORITY_LABEL_KEY = {
  quick_win: "panel.prioritize.quickWin",
  strategic: "panel.prioritize.strategic",
  experiment: "panel.prioritize.experiment",
  low_priority: "panel.prioritize.lowPriority",
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
        <td><strong>${escapeHtml(t(PRIORITY_LABEL_KEY[row.recommended_priority]) || row.recommended_priority)}</strong></td>
      </tr>`
    )
    .join("");

  panel.hidden = false;
}

/* ============================================================
   Rendering: Blueprint
   ============================================================ */

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

/* ============================================================
   Rendering: Prompt improvement
   ============================================================ */

function renderPromptImprovement(result) {
  const panel = $("#panel-prompt");
  panel.querySelector('[data-field="improved_prompt"]').textContent = result.improved_prompt;
  fillList(panel.querySelector('[data-field="techniques_applied"]'), result.techniques_applied);
  panel.querySelector('[data-field="rationale"]').textContent = result.rationale;
  panel.querySelector('[data-field="estimated_impact"]').textContent = result.estimated_impact;
  panel.hidden = false;
}

/* ============================================================
   Rendering: Training plan
   ============================================================ */

let lastTrainingMarkdown = "";

function renderTrainingPlan(plan) {
  const panel = $("#panel-training");
  panel.querySelector('[data-field="program_title"]').textContent = plan.program_title;
  const tbody = panel.querySelector('[data-field="sessions-rows"]');
  tbody.innerHTML = plan.sessions
    .map(
      (s) => `
      <tr>
        <td><strong>${escapeHtml(s.title)}</strong></td>
        <td>${escapeHtml(s.objective)}</td>
        <td>${escapeHtml(s.activity)}</td>
        <td>${escapeHtml(s.deliverable)}</td>
      </tr>`
    )
    .join("");
  panel.querySelector('[data-field="enablement_notes"]').textContent = plan.enablement_notes;

  lastTrainingMarkdown = `# ${plan.program_title}\n\n${plan.sessions
    .map((s, i) => `## Session ${i + 1}: ${s.title}\n- Objective: ${s.objective}\n- Activity: ${s.activity}\n- Deliverable: ${s.deliverable}\n`)
    .join("\n")}\n## Enablement & Measurement\n${plan.enablement_notes}\n`;

  panel.hidden = false;
}

$("#btn-download-training").addEventListener("click", () => {
  const blob = new Blob([lastTrainingMarkdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "training-plan.md";
  a.click();
  URL.revokeObjectURL(url);
});

/* ============================================================
   Rendering: Implementation Brief (docs objective)
   ============================================================ */

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
    $$(".brief-panel").forEach((p) => p.classList.toggle("active", p.dataset.briefPanel === btn.dataset.briefTab));
  });
});

/* ---- Export for implementation ---- */

let docsData = null; // { description, brief }
let currentExportFormat = "executive";

function generateExecutiveBrief(d) {
  return `EXECUTIVE BRIEF

${d.brief.executive_summary}

Metrics: ${d.brief.metrics}`;
}

function generateConfluencePage(d) {
  return `h1. Implementation Brief

h2. Executive Summary
${d.brief.executive_summary}

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
  return `Epic Name: ${d.description.slice(0, 60)}

Summary:
${d.brief.executive_summary}

Description:
${d.brief.technical_approach}

Adoption Plan:
${d.brief.adoption_plan}

Metrics:
${d.brief.metrics}`;
}

function generateMarkdown(d) {
  return `# Implementation Brief

## Solution described
${d.description}

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
  if (!docsData) {
    el.textContent = "";
    return;
  }
  el.textContent = EXPORT_GENERATORS[currentExportFormat].generate(docsData);
}

$$("#export-tabs .tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$("#export-tabs .tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
    currentExportFormat = btn.dataset.export;
    renderExportPreview();
  });
});

$("#btn-download").addEventListener("click", () => {
  if (!docsData) return;
  const { generate, filename, mime } = EXPORT_GENERATORS[currentExportFormat];
  const blob = new Blob([generate(docsData)], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
});

/* ============================================================
   Orchestration
   ============================================================ */

function resetResults() {
  elError.hidden = true;
  elLog.innerHTML = "";
  docsData = null;
  ["audit", "prioritize", "design", "prompt", "training", "report"].forEach((name) => {
    $(`#panel-${name}`).hidden = true;
  });
}

elBtnRun.addEventListener("click", runAssistant);

async function runAssistant() {
  const input = elInput.value.trim();
  const minLen = currentObjective === "prompt" ? 10 : 20;
  resetResults();
  $$(".pipeline-stage").forEach((el) => el.classList.remove("active", "done", "error"));

  if (input.length < minLen) {
    elError.textContent =
      currentLang === "es"
        ? `Escribe al menos ${minLen} caracteres.`
        : `Please write at least ${minLen} characters.`;
    elError.hidden = false;
    return;
  }

  elBtnRun.disabled = true;
  log(currentLang === "es" ? "Iniciando el asistente..." : "Starting the assistant...");

  try {
    switch (currentObjective) {
      case "audit": {
        const { audit } = await runStep("auditor", "/api/audit", { process: input }, (data) => {
          renderAudit(data.audit);
          return `${data.audit.opportunities.length} opportunities identified`;
        });
        void audit;
        break;
      }

      case "opportunities": {
        const { audit } = await runStep("auditor", "/api/audit", { process: input }, (data) => {
          renderAudit(data.audit);
          return `${data.audit.opportunities.length} opportunities identified`;
        });
        await runStep(
          "prioritizer",
          "/api/prioritize",
          { opportunities: audit.opportunities },
          (data) => {
            renderPrioritization(data);
            return `${data.matrix.length} opportunities scored`;
          }
        );
        break;
      }

      case "design": {
        const syntheticOpportunity = {
          opportunity: input,
          business_impact: "not specified",
          implementation_effort: "not specified",
          risk: "not specified",
          recommended_priority: "n/a",
        };
        await runStep("designer", "/api/design-agent", { opportunity: syntheticOpportunity }, (data) => {
          renderBlueprint(data.blueprint);
          return `verdict: ${VERDICT_LABEL[data.blueprint.implementation_verdict] || data.blueprint.implementation_verdict}`;
        });
        break;
      }

      case "prompt": {
        await runStep("prompter", "/api/improve-prompt", { prompt: input }, (data) => {
          renderPromptImprovement(data.result);
          return `${data.result.techniques_applied.length} techniques applied`;
        });
        break;
      }

      case "optimize": {
        const { audit } = await runStep(
          "auditor",
          "/api/audit",
          { process: input, focus: "testing and reporting workflows" },
          (data) => {
            renderAudit(data.audit);
            return `${data.audit.opportunities.length} opportunities identified`;
          }
        );
        const { matrix } = await runStep(
          "prioritizer",
          "/api/prioritize",
          { opportunities: audit.opportunities },
          (data) => {
            renderPrioritization(data);
            return `${data.matrix.length} opportunities scored, top: "${data.matrix[0].opportunity}"`;
          }
        );
        await runStep("designer", "/api/design-agent", { opportunity: matrix[0] }, (data) => {
          renderBlueprint(data.blueprint);
          return `verdict: ${VERDICT_LABEL[data.blueprint.implementation_verdict] || data.blueprint.implementation_verdict}`;
        });
        break;
      }

      case "docs": {
        await runStep("documenter", "/api/document-solution", { description: input }, (data) => {
          renderBrief(data.brief);
          docsData = { description: input, brief: data.brief };
          renderExportPreview();
          return "implementation brief generated";
        });
        break;
      }

      case "training": {
        await runStep("documenter", "/api/training-plan", { context: input }, (data) => {
          renderTrainingPlan(data.plan);
          return `${data.plan.sessions.length} sessions designed`;
        });
        break;
      }
    }

    log(currentLang === "es" ? "Listo." : "Done.", "ok");
  } catch (err) {
    elError.textContent = err.message || (currentLang === "es" ? "Algo falló." : "Something failed.");
    elError.hidden = false;
  } finally {
    elBtnRun.disabled = false;
  }
}

/* ============================================================
   Init
   ============================================================ */

setLang(currentLang);
