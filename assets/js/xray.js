/* AI Workflow X-Ray — orchestrates the existing Claude agent pipeline
   (Auditor → Prioritizer → Solution Designer → Reporter) and renders each
   stage as it completes. Every result comes from the Netlify Functions. */
(function () {
  "use strict";

  /* ---------- i18n (EN default, ES available) ---------- */
  const I18N = {
    en: {
      example: "Engineering Change Request: requests arrive by email, data is copied to Excel, an engineer validates requirements, creates a Jira ticket, searches documentation, requests manager approval and manually prepares a status report.",
      baseline: "Look at this process and tell me where we could use AI.",
      brandBy: "Sarahí Cruz Salazar · AI Implementation",
      tech: "Explore technical implementation",
      h1: "Give me a workflow.<br><span>I'll show you where AI belongs.</span>",
      sub: "Audit the process. Design the automation. Keep humans in control. Measure the result.",
      how1: "Use the loaded example or paste your own workflow",
      how2: "Press Run and watch 4 AI agents work",
      how3: "Approve at the Human Gate to finish the execution",
      workflow: "Workflow", demo: "Demo scenario", note: "Runs the live Claude pipeline on your text",
      run: "RUN AI IMPLEMENTATION", running: "RUNNING…",
      a_auditor: "Auditor", a_prioritizer: "Prioritizer", a_designer: "Solution Designer", a_reporter: "Reporter",
      r_auditor: "Detects steps, friction and repetitive work", r_prioritizer: "Decides what to automate and what stays human",
      r_designer: "Designs the proposed architecture", r_reporter: "Writes the implementation plan",
      idle: "Idle", analyzing: "Analyzing…", completed: "✓ Completed", failed: "Failed",
      lg_manual: "Manual repetitive", lg_rules: "Rules-based", lg_ai: "AI candidate", lg_human: "Human decision",
      current: "CURRENT WORKFLOW", proposed: "PROPOSED AI WORKFLOW",
      emptyCur: "Run the analysis to X-ray your workflow.", analyzingCur: "Analyzing your workflow…", emptyProp: "The redesigned process appears here.",
      k_manual_repetitive: "Manual repetitive", k_rules_based: "Rules-based", k_ai_candidate: "AI candidate", k_human_decision: "Human decision",
      k_ai: "AI", k_rules: "Rules", k_human: "Human gate",
      live: "LIVE EXECUTION", s_intake: "Intake Agent", s_validate: "Validation", s_retrieve: "Knowledge Retrieval", s_decide: "Decision", s_gate: "Human Gate", s_report: "Reporting",
      waiting: "Waiting", working: "Working…", done: "✓ Done", paused: "Paused", approved: "✓ Approved", complete: "✓ Complete",
      gateTitle: "Awaiting human decision — the flow is paused", approve: "APPROVE", review: "REVIEW",
      impact: "IMPACT", m_automation: "Automation potential", m_manual: "Manual steps reduced", m_human: "Human checkpoints retained", m_cycle: "Estimated cycle-time reduction",
      lab: "AI OPTIMIZATION LAB", labSub: "Original vs optimized prompt", original: "Original", optimized: "Optimized",
      l_tokens: "Tokens (in / out)", l_latency: "Latency", l_cost: "Est. cost", l_eval: "Evaluation", viewPrompts: "View prompts",
      labIdle: "Tokens and latency are measured from the Claude API. Cost is estimated from token counts.",
      pack: "IMPLEMENTATION PACK", openReport: "Open report", download: "Download .md",
      p_audit: "Process Audit", p_opportunities: "Automation Opportunities", p_architecture: "Proposed Architecture", p_human: "Human Control Points",
      p_roadmap: "Implementation Roadmap", p_testing: "Testing Plan", p_training: "Documentation / Training Plan",
      footer: "Built with Netlify Functions + Claude (Anthropic). Example data is synthetic.",
      drawerTitle: "Implementation Pack",
      // dynamic
      err20: "Describe the workflow with at least 20 characters.", retry: "you can run it again.",
      steps: "steps", manualRep: "manual repetitive", bottlenecks: "bottlenecks",
      toAutomate: "to automate", quickWin: "quick win", quickWins: "quick wins", keptHuman: "kept human",
      verdict: "Verdict", nodes: "nodes", planReady: "Implementation plan ready",
      src_auto: "From the audit's step classification", src_manual: "Manual repetitive steps covered by AI / rules", src_human: "Approval gates kept in the flow",
      src_est: "AI estimate / demo", src_none: "No estimate returned", of: "of",
      urgency: "urgency", compNA: "component n/a", passed: "passed", flagged: "flagged", noDocs: "No matching documents",
      recommendation: "Recommendation", approvedBy: "Approved by a human reviewer", draftTicket: "Draft ticket",
      reportDone: "status report generated (demo, nothing sent)",
      rvRequest: "Request", rvFlag: "Flag", rvOpen: "Open item",
      labMeasuring: "Measuring with the Claude API…", tokMeasured: "Tokens and latency: measured (Claude API).",
      costAssumed: (a, b) => ` Cost: estimated, assumes $${a}/$${b} per M tokens.`, costEnv: (a, b) => ` Cost: estimated at $${a}/$${b} per M tokens.`,
      capped: (n) => ` Output capped at ${n} tokens.`, evaluating: " Evaluating…",
      evalNote: " Evaluation: blind A/B grading by Claude (relevance, actionability, structure), not a human review.",
      labFail: "Lab unavailable: ", judged: "LLM-judged", inOut: (i, o) => `${i} in / ${o} out`,
      verdicts: { no_automation: "no automation", prompt: "prompt", deterministic_automation: "deterministic automation", rag_assistant: "RAG assistant", ai_agent: "AI agent" },
      prios: { quick_win: "quick win", strategic: "strategic", experiment: "experiment", low_priority: "low priority" },
      impactW: "Impact", effortW: "effort", riskW: "risk",
      d_current: "Current process", d_bottlenecks: "Bottlenecks", d_repetitive: "Repetitive work", d_deps: "Information dependencies", d_risks: "Potential risks",
      d_kept: "Kept human", d_note: "Note", d_problem: "Problem", d_workflow: "Proposed workflow", d_airole: "AI role", d_integration: "Integration point",
      d_inputs: "Inputs", d_output: "Output", d_success: "Success metrics", d_humanrole: "Human role", d_humandec: "Decisions that stay human",
      d_gates: "Approval gates in the proposed flow", d_steps: "Implementation steps", d_validation: "Validation before rollout", d_measured: "How success is measured",
      d_exec: "Executive summary", d_adoption: "Adoption & training", d_docs: "Documentation", d_verdict: "Verdict",
      mdTitle: "AI Workflow X-Ray — Implementation Pack", mdNote: "Generated live with Claude. Estimates are AI estimates; example inputs are a demo scenario.", mdWorkflow: "Workflow analyzed",
    },
    es: {
      example: "Solicitud de Cambio de Ingeniería (ECR): las solicitudes llegan por correo, los datos se copian a Excel, un ingeniero valida los requisitos, crea un ticket en Jira, busca en la documentación, pide aprobación al gerente y prepara a mano un reporte de estatus.",
      baseline: "Revisa este proceso y dime dónde podríamos usar IA.",
      brandBy: "Sarahí Cruz Salazar · Implementación de IA",
      tech: "Explorar la implementación técnica",
      h1: "Dame un workflow.<br><span>Te mostraré dónde debe entrar la IA.</span>",
      sub: "Audito el proceso. Diseño la automatización. Mantengo a las personas al control. Mido el resultado.",
      how1: "Usa el ejemplo cargado o pega tu propio workflow",
      how2: "Pulsa Run y observa trabajar a 4 agentes de IA",
      how3: "Aprueba en el Human Gate para terminar la ejecución",
      workflow: "Workflow", demo: "Escenario demo", note: "Ejecuta el pipeline real de Claude sobre tu texto",
      run: "EJECUTAR IMPLEMENTACIÓN DE IA", running: "EJECUTANDO…",
      a_auditor: "Auditor", a_prioritizer: "Priorizador", a_designer: "Diseñador de soluciones", a_reporter: "Reportero",
      r_auditor: "Detecta pasos, fricciones y trabajo repetitivo", r_prioritizer: "Decide qué automatizar y qué se queda humano",
      r_designer: "Diseña la arquitectura propuesta", r_reporter: "Redacta el plan de implementación",
      idle: "En espera", analyzing: "Analizando…", completed: "✓ Completado", failed: "Falló",
      lg_manual: "Manual repetitivo", lg_rules: "Basado en reglas", lg_ai: "Candidato a IA", lg_human: "Decisión humana",
      current: "WORKFLOW ACTUAL", proposed: "WORKFLOW PROPUESTO CON IA",
      emptyCur: "Ejecuta el análisis para ver el rayos X de tu workflow.", analyzingCur: "Analizando tu workflow…", emptyProp: "El proceso rediseñado aparece aquí.",
      k_manual_repetitive: "Manual repetitivo", k_rules_based: "Basado en reglas", k_ai_candidate: "Candidato a IA", k_human_decision: "Decisión humana",
      k_ai: "IA", k_rules: "Reglas", k_human: "Compuerta humana",
      live: "EJECUCIÓN EN VIVO", s_intake: "Agente de intake", s_validate: "Validación", s_retrieve: "Búsqueda de conocimiento", s_decide: "Decisión", s_gate: "Compuerta humana", s_report: "Reporte",
      waiting: "En espera", working: "Trabajando…", done: "✓ Listo", paused: "Pausado", approved: "✓ Aprobado", complete: "✓ Completo",
      gateTitle: "Esperando decisión humana — el flujo está en pausa", approve: "APROBAR", review: "REVISAR",
      impact: "IMPACTO", m_automation: "Potencial de automatización", m_manual: "Pasos manuales reducidos", m_human: "Puntos de control humano conservados", m_cycle: "Reducción estimada del tiempo de ciclo",
      lab: "LABORATORIO DE OPTIMIZACIÓN DE IA", labSub: "Prompt original vs optimizado", original: "Original", optimized: "Optimizado",
      l_tokens: "Tokens (ent. / sal.)", l_latency: "Latencia", l_cost: "Costo est.", l_eval: "Evaluación", viewPrompts: "Ver prompts",
      labIdle: "Tokens y latencia se miden desde la API de Claude. El costo se estima a partir de los tokens.",
      pack: "PAQUETE DE IMPLEMENTACIÓN", openReport: "Abrir reporte", download: "Descargar .md",
      p_audit: "Auditoría del proceso", p_opportunities: "Oportunidades de automatización", p_architecture: "Arquitectura propuesta", p_human: "Puntos de control humano",
      p_roadmap: "Roadmap de implementación", p_testing: "Plan de pruebas", p_training: "Plan de documentación / capacitación",
      footer: "Construido con Netlify Functions + Claude (Anthropic). Los datos de ejemplo son sintéticos.",
      drawerTitle: "Paquete de implementación",
      err20: "Describe el workflow con al menos 20 caracteres.", retry: "puedes ejecutarlo de nuevo.",
      steps: "pasos", manualRep: "manuales repetitivos", bottlenecks: "cuellos de botella",
      toAutomate: "a automatizar", quickWin: "victoria rápida", quickWins: "victorias rápidas", keptHuman: "se quedan humanos",
      verdict: "Veredicto", nodes: "nodos", planReady: "Plan de implementación listo",
      src_auto: "De la clasificación de pasos del auditor", src_manual: "Pasos manuales repetitivos cubiertos por IA / reglas", src_human: "Compuertas de aprobación conservadas en el flujo",
      src_est: "Estimación de IA / demo", src_none: "Sin estimación", of: "de",
      urgency: "urgencia", compNA: "componente n/d", passed: "aprobadas", flagged: "marcadas", noDocs: "Sin documentos relevantes",
      recommendation: "Recomendación", approvedBy: "Aprobado por una persona", draftTicket: "Borrador de ticket",
      reportDone: "reporte de estatus generado (demo, no se envió nada)",
      rvRequest: "Solicitud", rvFlag: "Alerta", rvOpen: "Pendiente",
      labMeasuring: "Midiendo con la API de Claude…", tokMeasured: "Tokens y latencia: medidos (API de Claude).",
      costAssumed: (a, b) => ` Costo: estimado, supone $${a}/$${b} por M de tokens.`, costEnv: (a, b) => ` Costo: estimado a $${a}/$${b} por M de tokens.`,
      capped: (n) => ` Salida limitada a ${n} tokens.`, evaluating: " Evaluando…",
      evalNote: " Evaluación: calificación A/B a ciegas hecha por Claude (relevancia, accionabilidad, estructura), no una revisión humana.",
      labFail: "Laboratorio no disponible: ", judged: "Evaluado por LLM", inOut: (i, o) => `${i} ent. / ${o} sal.`,
      verdicts: { no_automation: "sin automatización", prompt: "prompt", deterministic_automation: "automatización determinista", rag_assistant: "asistente RAG", ai_agent: "agente de IA" },
      prios: { quick_win: "victoria rápida", strategic: "estratégico", experiment: "experimento", low_priority: "baja prioridad" },
      impactW: "Impacto", effortW: "esfuerzo", riskW: "riesgo",
      d_current: "Proceso actual", d_bottlenecks: "Cuellos de botella", d_repetitive: "Trabajo repetitivo", d_deps: "Dependencias de información", d_risks: "Riesgos potenciales",
      d_kept: "Se queda humano", d_note: "Nota", d_problem: "Problema", d_workflow: "Workflow propuesto", d_airole: "Rol de la IA", d_integration: "Punto de integración",
      d_inputs: "Entradas", d_output: "Salida", d_success: "Métricas de éxito", d_humanrole: "Rol humano", d_humandec: "Decisiones que siguen siendo humanas",
      d_gates: "Compuertas de aprobación en el flujo propuesto", d_steps: "Pasos de implementación", d_validation: "Validación antes del despliegue", d_measured: "Cómo se mide el éxito",
      d_exec: "Resumen ejecutivo", d_adoption: "Adopción y capacitación", d_docs: "Documentación", d_verdict: "Veredicto",
      mdTitle: "AI Workflow X-Ray — Paquete de implementación", mdNote: "Generado en vivo con Claude. Las estimaciones son estimaciones de IA; los datos de ejemplo son un escenario demo.", mdWorkflow: "Workflow analizado",
    },
  };
  let lang = "en";
  try { lang = localStorage.getItem("xray-lang") === "es" ? "es" : "en"; } catch (e) { /* ignore */ }
  const t = (k) => I18N[lang][k];


  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const KIND_LABEL = new Proxy({}, { get: (_, k) => t("k_" + k) });

  const input = $("#workflow-input");
  const btnRun = $("#btn-run");
  const errorBar = $("#error-bar");
  input.value = t("example");

  const state = { runId: 0, data: {} };
  const isExample = () => input.value.trim() === I18N.en.example || input.value.trim() === I18N.es.example;

  input.addEventListener("input", () => {
    $("#example-tag").hidden = !isExample();
  });

  /* ---------- helpers ---------- */
  async function post(path, body) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    let json = {};
    try {
      json = await res.json();
    } catch (e) {
      /* non-JSON error page */
    }
    if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
    return json;
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function setAgent(name, status, out) {
    const card = $(`.agent[data-agent="${name}"]`);
    card.classList.remove("working", "done", "failed");
    const label = { idle: t("idle"), working: t("analyzing"), done: t("completed"), failed: t("failed") }[status];
    if (status !== "idle") card.classList.add(status);
    $("[data-status]", card).textContent = label;
    if (out !== undefined) $("[data-out]", card).textContent = out;
  }

  function setStep(name, status, label, out) {
    const li = $(`#live-steps [data-step="${name}"]`);
    li.classList.remove("working", "done", "failed", "gate-open");
    if (status) li.classList.add(status);
    const stateEl = $(".s-state", li);
    stateEl.className = "s-state" + (status === "working" ? " working" : "");
    stateEl.textContent = label;
    if (out !== undefined) $(".s-out", li).textContent = out;
  }

  function markPack(key) {
    $(`#pack-list [data-pack="${key}"]`).classList.add("done");
  }

  function showError(msg) {
    errorBar.textContent = msg;
    errorBar.hidden = false;
  }

  /* ---------- reset ---------- */
  function reset() {
    errorBar.hidden = true;
    ["auditor", "prioritizer", "designer", "reporter"].forEach((a) => setAgent(a, "idle", ""));
    setFlowEmpty(t("analyzingCur"));
    ["intake", "validate", "retrieve", "decide", "gate", "report"].forEach((s) => setStep(s, null, t("waiting"), ""));
    $("#gate").hidden = true;
    $("#gate-review").hidden = true;
    $$(".metric").forEach((m) => {
      m.classList.remove("ready", "est");
      $(".m-value", m).textContent = "—";
      $(".m-src", m).textContent = "";
    });
    $$("#lab tbody tr").forEach((r) => $$("td", r).forEach((td) => { td.textContent = "—"; td.className = ""; }));
    $("#lab-note").textContent = t("labMeasuring");
    $("#lab-prompts").hidden = true;
    $$("#pack-list li").forEach((li) => li.classList.remove("done"));
    $("#btn-open-report").disabled = true;
    state.data = {};
  }

  /* ---------- X-ray flows ---------- */
  async function renderFlow(container, nodes, runId, opts) {
    container.innerHTML = "";
    for (let i = 0; i < nodes.length; i++) {
      if (runId !== state.runId) return;
      const n = nodes[i];
      const cls = opts.kind(n);
      const node = el("div", "node " + cls);
      node.style.animationDelay = "0s";
      node.appendChild(el("span", "n-idx", String(i + 1).padStart(2, "0")));
      node.appendChild(el("p", "n-label", n.label));
      if (n.detail) node.appendChild(el("p", "n-detail", n.detail));
      node.appendChild(el("p", "n-kind", KIND_LABEL[cls] || cls));
      if (i > 0) container.appendChild(el("span", "link"));
      container.appendChild(node);
      await sleep(140);
    }
  }

  /* ---------- pipeline ---------- */
  async function run() {
    const workflow = input.value.trim();
    if (workflow.length < 20) {
      showError(t("err20"));
      return;
    }
    const runId = ++state.runId;
    const alive = () => runId === state.runId;
    document.body.classList.add("running");
    btnRun.disabled = true;
    btnRun.textContent = t("running");
    btnRun.classList.remove("idle");
    reset();

    const d = state.data;
    d.workflow = workflow;
    let current = "auditor";
    try {
      runLab(workflow, runId); // real measurements, in parallel with the pipeline

      /* 1 · Auditor */
      setAgent("auditor", "working");
      const a = await post("/api/audit", { process: workflow, xray: true, language: lang });
      if (!alive()) return;
      d.audit = a.audit;
      const steps = Array.isArray(d.audit.workflow_steps) ? d.audit.workflow_steps : [];
      d.steps = steps;
      const manual = steps.filter((s) => s.classification === "manual_repetitive").length;
      setAgent("auditor", "done", `${steps.length} ${t("steps")} · ${manual} ${t("manualRep")} · ${d.audit.bottlenecks.length} ${t("bottlenecks")}`);
      markPack("audit");
      await renderFlow($("#flow-current"), steps, runId, { kind: (n) => n.classification });

      /* 2 · Prioritizer */
      current = "prioritizer";
      setAgent("prioritizer", "working");
      const p = await post("/api/prioritize", { opportunities: d.audit.opportunities, language: lang });
      if (!alive()) return;
      d.matrix = p.matrix || [];
      d.dataNote = p.data_note;
      const keep = d.audit.opportunities.filter((o) => o.recommended_intervention === "keep_human").length;
      const quick = d.matrix.filter((m) => m.recommended_priority === "quick_win").length;
      setAgent("prioritizer", "done", `${d.matrix.length} ${t("toAutomate")} (${quick} ${quick === 1 ? t("quickWin") : t("quickWins")}) · ${keep} ${t("keptHuman")}`);
      markPack("opportunities");

      /* 3 · Solution Designer */
      current = "designer";
      setAgent("designer", "working");
      const top =
        d.audit.opportunities.find((o) => d.matrix[0] && o.opportunity === d.matrix[0].opportunity) ||
        d.audit.opportunities.find((o) => o.recommended_intervention !== "keep_human") ||
        d.audit.opportunities[0];
      d.top = Object.assign({}, top, d.matrix[0] ? { priority: d.matrix[0].recommended_priority } : {});
      const g = await post("/api/design-agent", {
        opportunity: d.top,
        xray: true,
        workflow_steps: steps,
        human_decision_points: d.audit.human_decision_points,
        language: lang,
      });
      if (!alive()) return;
      d.blueprint = g.blueprint;
      const proposed = Array.isArray(d.blueprint.proposed_workflow) ? d.blueprint.proposed_workflow : [];
      const verdict = t("verdicts")[d.blueprint.implementation_verdict] || String(d.blueprint.implementation_verdict || "").replace(/_/g, " ");
      setAgent("designer", "done", `${t("verdict")}: ${verdict} · ${proposed.length} ${t("nodes")}`);
      markPack("architecture");
      markPack("human");
      await renderFlow($("#flow-proposed"), proposed, runId, { kind: (n) => n.kind });
      renderImpact(steps, proposed, d.blueprint);
      runLive(runId); // sample execution of the proposed workflow, in parallel with the Reporter

      /* 4 · Reporter */
      current = "reporter";
      setAgent("reporter", "working");
      const r = await post("/api/report", {
        process: workflow,
        audit: d.audit,
        opportunity: d.top,
        blueprint: d.blueprint,
        xray: true,
        language: lang,
      });
      if (!alive()) return;
      d.brief = r.brief;
      setAgent("reporter", "done", t("planReady"));
      ["roadmap", "testing", "training"].forEach(markPack);
      $("#btn-open-report").disabled = false;
    } catch (err) {
      if (!alive()) return;
      setAgent(current, "failed", "");
      showError(err.message + " — " + t("retry"));
    } finally {
      if (alive()) {
        btnRun.disabled = false;
        btnRun.textContent = t("run");
        btnRun.classList.add("idle");
      }
    }
  }

  /* ---------- impact ---------- */
  function countUp(node, target, suffix, prefix) {
    const t0 = performance.now();
    const dur = 700;
    function tick(now) {
      const k = Math.min(1, (now - t0) / dur);
      node.textContent = (prefix || "") + Math.round(target * (1 - Math.pow(1 - k, 3))) + (suffix || "");
      if (k < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function setMetric(key, render, src, estimated) {
    const m = $(`.metric[data-metric="${key}"]`);
    m.classList.add("ready");
    if (estimated) m.classList.add("est");
    render($(".m-value", m));
    $(".m-src", m).textContent = src;
  }

  function renderImpact(steps, proposed, blueprint) {
    const total = steps.length || 1;
    // Automation potential = share of steps that are not human decisions.
    const potential = Math.round((steps.filter((s) => s.classification !== "human_decision").length / total) * 100);

    const manualIdx = steps.map((s, i) => (s.classification === "manual_repetitive" ? i : -1)).filter((i) => i >= 0);
    const covered = new Set();
    proposed.filter((n) => n.kind !== "human").forEach((n) => (n.replaces || []).forEach((i) => covered.add(i)));
    const reduced = manualIdx.filter((i) => covered.has(i)).length;

    const gates = proposed.filter((n) => n.kind === "human").length;
    const est = blueprint.cycle_time_reduction_estimate;

    setMetric("automation", (n) => countUp(n, potential, "%"), t("src_auto"), false);
    setMetric("manual", (n) => (n.textContent = `${reduced} ${t("of")} ${manualIdx.length}`), t("src_manual"), false);
    setMetric("human", (n) => (n.textContent = String(gates)), t("src_human"), false);
    if (est && Number.isFinite(est.low_pct)) {
      setMetric(
        "cycle",
        (n) => (n.textContent = `${est.low_pct}–${est.high_pct}%`),
        t("src_est"),
        true
      );
      $('.metric[data-metric="cycle"]').title = est.basis || "";
    } else {
      setMetric("cycle", (n) => (n.textContent = "n/a"), t("src_none"), true);
    }
  }

  /* ---------- live execution ---------- */
  let gateResolve = null;

  async function runLive(runId) {
    const alive = () => runId === state.runId;
    gateResolve = null;
    const exec = {};
    let stage = "intake";
    try {
      setStep("intake", "working", t("working"));
      const intake = (await post("/api/run-ecr", { stage: "intake", language: lang })).intake;
      if (!alive()) return;
      exec.intake = intake;
      setStep("intake", "done", t("done"), `${intake.ecr_id || "ECR"} · ${intake.component || t("compNA")} · ${t("urgency")} ${intake.urgency || "n/a"}`);

      stage = "validate";
      setStep("validate", "working", t("working"));
      const validation = (await post("/api/run-ecr", { stage: "validate", intake, language: lang })).validation;
      if (!alive()) return;
      exec.validation = validation;
      const flags = (validation.checks || []).filter((c) => c.status === "flag");
      setStep("validate", "done", t("done"), `${(validation.checks || []).length - flags.length} ${t("passed")} · ${flags.length} ${t("flagged")}`);

      stage = "retrieve";
      setStep("retrieve", "working", t("working"));
      const documents = (await post("/api/run-ecr", { stage: "retrieve", intake })).documents;
      if (!alive()) return;
      exec.documents = documents;
      setStep("retrieve", "done", t("done"), documents.map((x) => x.id).join(" · ") || t("noDocs"));

      stage = "decide";
      setStep("decide", "working", t("working"));
      const decision = (await post("/api/run-ecr", { stage: "decide", intake, validation, documents, language: lang })).decision;
      if (!alive()) return;
      exec.decision = decision;
      setStep("decide", "done", t("done"), `${t("recommendation")}: ${String(decision.recommendation).replace("_", " ")}`);

      // Human Gate: the flow stops here until a person decides.
      setStep("gate", "gate-open", t("paused"));
      $("#gate-body").textContent = decision.rationale || "";
      $("#gate").hidden = false;
      $("#gate-review").hidden = true;
      $("#gate-review").innerHTML = "";
      state.data.exec = exec;
      await new Promise((resolve) => (gateResolve = resolve));
      if (!alive()) return;

      setStep("gate", "done", t("approved"), t("approvedBy"));
      $("#gate").hidden = true;
      setStep("report", "working", t("working"));
      await sleep(700);
      if (!alive()) return;
      // Deterministic local step: no Jira/Excel is connected in this demo.
      setStep("report", "done", t("complete"), `${t("draftTicket")}: “${decision.ticket_title || intake.change_summary}” · ${t("reportDone")}`);
    } catch (err) {
      if (!alive()) return;
      setStep(stage, "failed", t("failed"), err.message);
    }
  }

  $("#btn-approve").addEventListener("click", () => gateResolve && gateResolve());
  $("#btn-review").addEventListener("click", () => {
    const box = $("#gate-review");
    const exec = state.data.exec;
    if (!exec) return;
    if (!box.hidden) {
      box.hidden = true;
      return;
    }
    box.innerHTML = "";
    const add = (k, v) => {
      const row = el("p");
      row.appendChild(el("b", null, k + ": "));
      row.appendChild(document.createTextNode(v));
      box.appendChild(row);
    };
    add(t("rvRequest"), exec.intake.change_summary || "");
    (exec.validation.checks || []).filter((c) => c.status === "flag").forEach((c) => add(t("rvFlag"), `${c.rule} — ${c.note}`));
    (exec.decision.open_items || []).forEach((o) => add(t("rvOpen"), o));
    (exec.documents || []).forEach((doc) => add(doc.id, doc.title));
    box.hidden = false;
  });

  /* ---------- optimization lab (real measurements) ---------- */
  const fmt = {
    ms: (v) => (v / 1000).toFixed(1) + " s",
    cost: (v) => "$" + (v < 0.01 ? v.toFixed(4) : v.toFixed(3)),
  };

  function labCell(row, col, html, small) {
    const td = $$(`#lab [data-row="${row}"] td`)[col];
    td.textContent = html;
    if (small) td.appendChild(el("small", null, small));
    return td;
  }

  async function runLab(workflow, runId) {
    const alive = () => runId === state.runId;
    try {
      const improved = await post("/api/improve-prompt", { prompt: t("baseline"), language: lang });
      if (!alive()) return;
      const optimizedPrompt = improved.result.improved_prompt;
      $("#lp-original").textContent = t("baseline");
      $("#lp-optimized").textContent = optimizedPrompt;
      $("#lab-prompts").hidden = false;

      const [o, p] = await Promise.all([
        post("/api/prompt-lab", { action: "run", prompt: t("baseline"), workflow }),
        post("/api/prompt-lab", { action: "run", prompt: optimizedPrompt, workflow }),
      ]);
      if (!alive()) return;
      const runs = [o, p];
      const totals = runs.map((r) => r.meta.input_tokens + r.meta.output_tokens);
      runs.forEach((r, i) => {
        labCell("tokens", i, String(totals[i]), t("inOut")(r.meta.input_tokens, r.meta.output_tokens));
        labCell("latency", i, fmt.ms(r.meta.latency_ms));
        labCell("cost", i, fmt.cost(r.cost_usd));
      });
      const mark = (row, vals) => {
        const best = vals.indexOf(Math.min(...vals));
        if (vals[0] !== vals[1]) $$(`#lab [data-row="${row}"] td`)[best].classList.add("best");
      };
      mark("tokens", totals);
      mark("latency", runs.map((r) => r.meta.latency_ms));
      mark("cost", runs.map((r) => r.cost_usd));

      const pr = o.pricing;
      const capped = runs.some((r) => r.truncated) ? t("capped")(o.max_tokens) : "";
      const costNote = (pr.source === "env" ? t("costEnv") : t("costAssumed"))(pr.input_per_mtok, pr.output_per_mtok);
      const baseNote = t("tokMeasured") + costNote + capped;
      $("#lab-note").textContent = baseNote + t("evaluating");

      const judged = await post("/api/prompt-lab", {
        action: "judge",
        workflow,
        language: lang,
        outputs: { original: o.output, optimized: p.output },
      });
      if (!alive()) return;
      labCell("eval", 0, `${judged.original.total}/15`, t("judged"));
      labCell("eval", 1, `${judged.optimized.total}/15`, t("judged"));
      mark("eval", [-judged.original.total, -judged.optimized.total]);
      $("#lab-note").textContent = baseNote + t("evalNote");
    } catch (err) {
      if (!alive()) return;
      $("#lab-note").textContent = t("labFail") + err.message;
    }
  }

  /* ---------- implementation report drawer ---------- */
  const drawer = $("#drawer");
  const backdrop = $("#drawer-backdrop");
  const SECTIONS = ["audit", "opportunities", "architecture", "human", "roadmap", "testing", "training"];
  const sectionLabel = (k) => t("p_" + k);

  function list(items, tag) {
    const ul = el(tag || "ul");
    (items || []).forEach((t) => ul.appendChild(el("li", null, t)));
    return ul;
  }

  // Each builder returns [{h, p?, items?, ordered?}] so the drawer and the
  // markdown export share one source.
  function sectionData(key) {
    const d = state.data;
    const a = d.audit || {};
    const b = d.blueprint || {};
    const r = d.brief || {};
    switch (key) {
      case "audit":
        return [
          { h: t("d_current"), p: a.current_process },
          { h: t("d_bottlenecks"), items: a.bottlenecks },
          { h: t("d_repetitive"), items: a.repetitive_work },
          { h: t("d_deps"), items: a.information_dependencies },
          { h: t("d_risks"), items: a.potential_risks },
        ];
      case "opportunities":
        return [
          ...(d.matrix || []).map((m) => ({
            h: `${m.opportunity} — ${t("prios")[m.recommended_priority] || m.recommended_priority}`,
            p: `${t("impactW")} ${m.business_impact} · ${t("effortW")} ${m.implementation_effort} · ${t("riskW")} ${m.risk}. ${m.note}`,
          })),
          {
            h: t("d_kept"),
            items: (a.opportunities || []).filter((o) => o.recommended_intervention === "keep_human").map((o) => `${o.opportunity} — ${o.rationale}`),
          },
          { h: t("d_note"), p: d.dataNote },
        ];
      case "architecture":
        return [
          { h: `${t("d_verdict")}: ${t("verdicts")[b.implementation_verdict] || b.implementation_verdict}`, p: b.verdict_reason },
          { h: t("d_problem"), p: b.problem },
          { h: t("d_workflow"), items: (b.proposed_workflow || []).map((n) => `${n.label} (${KIND_LABEL[n.kind] || n.kind}) — ${n.detail}`), ordered: true },
          { h: t("d_airole"), p: b.ai_role },
          { h: t("d_integration"), p: b.integration_point },
          { h: t("d_inputs"), items: b.inputs },
          { h: t("d_output"), p: b.output },
          { h: t("d_success"), items: b.success_metrics },
          { h: t("d_risks"), items: b.risks },
        ];
      case "human":
        return [
          { h: t("d_humanrole"), p: b.human_role },
          { h: t("d_humandec"), items: a.human_decision_points },
          { h: t("d_gates"), items: (b.proposed_workflow || []).filter((n) => n.kind === "human").map((n) => `${n.label} — ${n.detail}`) },
        ];
      case "roadmap":
        return [
          ...(r.roadmap || []).map((x) => ({ h: x.phase, p: x.focus })),
          { h: t("d_steps"), items: b.implementation_steps, ordered: true },
        ];
      case "testing":
        return [
          { h: t("d_validation"), items: r.testing_plan },
          { h: t("d_measured"), p: r.metrics },
        ];
      case "training":
        return [
          { h: t("d_exec"), p: r.executive_summary },
          { h: t("d_adoption"), p: r.adoption_plan },
          { h: t("d_docs"), p: r.documentation },
        ];
    }
    return [];
  }

  function renderSection(key) {
    const box = $("#drawer-content");
    box.innerHTML = "";
    const title = sectionLabel(key);
    const h3 = el("h3", null, title);
    box.appendChild(h3);
    sectionData(key).forEach((blk) => {
      if (!blk.p && !(blk.items && blk.items.length)) return;
      box.appendChild(el("h4", null, blk.h));
      if (blk.p) box.appendChild(el("p", null, blk.p));
      if (blk.items && blk.items.length) box.appendChild(list(blk.items, blk.ordered ? "ol" : "ul"));
    });
    $$("#drawer-nav button").forEach((b) => b.classList.toggle("active", b.dataset.key === key));
  }

  function openDrawer(key) {
    const nav = $("#drawer-nav");
    if (!nav.children.length) {
      SECTIONS.forEach((k) => {
        const b = el("button", null, sectionLabel(k));
        b.dataset.key = k;
        b.type = "button";
        b.addEventListener("click", () => renderSection(k));
        nav.appendChild(b);
      });
    }
    renderSection(key || "audit");
    drawer.hidden = false;
    backdrop.hidden = false;
  }

  function closeDrawer() {
    drawer.hidden = true;
    backdrop.hidden = true;
  }

  function toMarkdown() {
    const lines = [`# ${t("mdTitle")}`, "", `> ${t("mdNote")}`, "", `## ${t("mdWorkflow")}`, "", state.data.workflow, ""];
    SECTIONS.forEach((k) => {
      lines.push(`## ${sectionLabel(k)}`, "");
      sectionData(k).forEach((blk) => {
        if (!blk.p && !(blk.items && blk.items.length)) return;
        lines.push(`### ${blk.h}`, "");
        if (blk.p) lines.push(blk.p, "");
        (blk.items || []).forEach((t, i) => lines.push(blk.ordered ? `${i + 1}. ${t}` : `- ${t}`));
        if (blk.items && blk.items.length) lines.push("");
      });
    });
    return lines.join("\n");
  }

  $("#btn-open-report").addEventListener("click", () => openDrawer("audit"));
  $("#btn-close").addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeDrawer());
  $("#pack-list").addEventListener("click", (e) => {
    const li = e.target.closest("li[data-pack]");
    if (li && li.classList.contains("done")) openDrawer(li.dataset.pack);
  });
  $("#btn-download").addEventListener("click", () => {
    const blob = new Blob([toMarkdown()], { type: "text/markdown" });
    const a = el("a");
    a.href = URL.createObjectURL(blob);
    a.download = "implementation-pack.md";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  /* ---------- language ---------- */
  function setFlowEmpty(cur) {
    $("#flow-current").innerHTML = "";
    $("#flow-current").appendChild(el("p", "flow-empty", cur));
    $("#flow-proposed").innerHTML = "";
    $("#flow-proposed").appendChild(el("p", "flow-empty", t("emptyProp")));
  }

  const STATIC = [
    [".brand-by", "brandBy"], [".hero-sub", "sub"], [".input-head label", "workflow"], [".input-note", "note"],
    [".howto li:nth-child(1) span", "how1"], [".howto li:nth-child(2) span", "how2"], [".howto li:nth-child(3) span", "how3"],
    [".lg-manual", "lg_manual"], [".lg-rules", "lg_rules"], [".lg-ai", "lg_ai"], [".lg-human", "lg_human"],
    ["#xray .lane:not(.lane-proposed) .lane-title", "current"], [".lane-proposed .lane-title", "proposed"],
    ["#live .panel-head h2", "live"], ["#impact .panel-head h2", "impact"], ["#lab .panel-head h2", "lab"], [".lab-sub", "labSub"],
    ["#pack .panel-head h2", "pack"], ["#btn-open-report", "openReport"], ["#btn-download", "download"], [".gate-title", "gateTitle"],
    ["#btn-approve", "approve"], ["#btn-review", "review"], [".foot span:first-child", "footer"], [".drawer-head h2", "drawerTitle"],
    ["#lab summary", "viewPrompts"], [".lab-table thead th:nth-child(2)", "original"], [".lab-table thead th:nth-child(3)", "optimized"],
    ['[data-row="tokens"] th', "l_tokens"], ['[data-row="latency"] th', "l_latency"], ['[data-row="cost"] th', "l_cost"], ['[data-row="eval"] th', "l_eval"],
  ];

  function applyLang() {
    document.documentElement.lang = lang;
    STATIC.forEach(([sel, key]) => { const n = $(sel); if (n) n.textContent = t(key); });
    $(".hero h1").innerHTML = t("h1"); // static, developer-controlled markup
    const tech = $(".tech-link");
    tech.textContent = t("tech") + " ";
    tech.appendChild(el("span", null, "→"));
    $$(".demo-tag").forEach((n) => (n.textContent = t("demo")));
    ["auditor", "prioritizer", "designer", "reporter"].forEach((a) => {
      const card = $(`.agent[data-agent="${a}"]`);
      $("h3", card).textContent = t("a_" + a);
      $(".agent-role", card).textContent = t("r_" + a);
    });
    ["intake", "validate", "retrieve", "decide", "gate", "report"].forEach((k) => ($(`#live-steps [data-step="${k}"] .s-name`).textContent = t("s_" + k)));
    $$("#pack-list li").forEach((li) => {
      li.lastChild.textContent = t("p_" + li.dataset.pack);
    });
    ["automation", "manual", "human", "cycle"].forEach((k) => ($(`.metric[data-metric="${k}"] .m-label`).textContent = t("m_" + k)));
    $("#lang-en").classList.toggle("active", lang === "en");
    $("#lang-es").classList.toggle("active", lang === "es");
    btnRun.textContent = btnRun.disabled ? t("running") : t("run");
  }

  function setLang(next) {
    if (next === lang) return;
    const wasExample = isExample();
    lang = next;
    try { localStorage.setItem("xray-lang", lang); } catch (e) { /* ignore */ }
    state.runId++; // cancel any run in flight; results are language-specific
    document.body.classList.remove("running");
    closeDrawer();
    $("#drawer-nav").innerHTML = "";
    btnRun.disabled = false;
    reset();
    setFlowEmpty(t("emptyCur"));
    if (wasExample || !input.value.trim()) input.value = t("example");
    $("#example-tag").hidden = !isExample();
    $("#lab-note").textContent = t("labIdle");
    applyLang();
    btnRun.classList.add("idle");
  }

  $("#lang-en").addEventListener("click", () => setLang("en"));
  $("#lang-es").addEventListener("click", () => setLang("es"));
  setFlowEmpty(t("emptyCur"));
  $("#lab-note").textContent = t("labIdle");
  applyLang();
  btnRun.classList.add("idle");

  btnRun.addEventListener("click", run);
})();
