/* Regional AI & Integration Hub — control tower + end-to-end workflow.
 * Extraction runs on a local rules engine by default, or on Claude via
 * /api/hub-extract. Validation, CRM reconciliation, governance and routing
 * are ALWAYS deterministic rules: the model never decides. */
(function () {
  "use strict";
  const D = window.HUB_DATA;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const fmt = (n) => Number(n).toLocaleString("en-US");
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const guessLang = () => ((navigator.language || "en").toLowerCase().startsWith("es") ? "es" : "en");

  const state = { lang: guessLang(), country: "MX", scenario: "clean", sessionAuto: 0, sessionHuman: 0, run: null };

  const t = (key, params) => {
    let s = (window.HUB_I18N[state.lang] || {})[key];
    if (s === undefined) s = window.HUB_I18N.en[key] ?? key;
    return params ? s.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? params[k] : "")) : s;
  };
  const L = (v) => (v && typeof v === "object" ? v[state.lang] : v);

  /* ---------------- static rendering ---------------- */
  function applyI18n() {
    document.documentElement.lang = state.lang;
    $$("[data-i18n]").forEach((el) => {
      const v = t(el.dataset.i18n);
      if (v.includes("<")) el.innerHTML = v; else el.textContent = v;
    });
    $("#lang-en").classList.toggle("active", state.lang === "en");
    $("#lang-es").classList.toggle("active", state.lang === "es");
    $$("#role option").forEach((o) => {
      o.textContent = { analyst: { en: "Operations Analyst", es: "Analista de Operaciones" }, manager: { en: "Account Manager", es: "Account Manager" }, compliance: { en: "Compliance Officer", es: "Oficial de Cumplimiento" } }[o.value][state.lang];
    });
    renderKpis(); renderCountries(); renderConfig(); renderIntegrations(); renderScenarios();
    renderPortfolio(); renderPhases(); renderStrategy(); renderCoverage(); renderSteps(); renderAudit(); renderGateAndOutcome();
  }

  function totals() {
    const req = D.countries.reduce((a, c) => a + c.req, 0);
    const auto = D.countries.reduce((a, c) => a + c.auto, 0);
    return { req, auto, human: req - auto };
  }

  function renderKpis() {
    const T = totals();
    const pct = (n) => Math.round((n / T.req) * 100);
    const sess = state.sessionAuto + state.sessionHuman;
    const tile = (label, value, sub) => `<div class="kpi"><span class="k-label">${label}</span><span class="k-value">${value}</span><span class="k-sub">${sub || "&nbsp;"}</span></div>`;
    $("#kpis").innerHTML =
      tile(t("k_req"), fmt(T.req + sess), sess ? t("k_session", { n: sess }) : "") +
      tile(t("k_auto"), pct(T.auto) + "%", state.sessionAuto ? t("k_session", { n: state.sessionAuto }) : "") +
      tile(t("k_human"), pct(T.human) + "%", state.sessionHuman ? t("k_session", { n: state.sessionHuman }) : "") +
      tile(t("k_integ"), `${D.integrations.length}/${D.integrations.length}`, t("k_up"));
  }

  function renderCountries() {
    $("#country-table tbody").innerHTML = D.countries.map((c) => {
      const pct = Math.round((c.auto / c.req) * 100);
      return `<tr class="${c.code === state.country ? "sel" : ""}" data-code="${c.code}" tabindex="0">
        <td><b>${c.code}</b> ${L(c.name)}</td><td class="num">${fmt(c.req)}</td>
        <td class="num">${pct}%</td><td class="num"><span class="dq ${c.dq >= 90 ? "g" : c.dq >= 87 ? "y" : "r"}">${c.dq}</span></td><td class="num">${c.exc}</td></tr>`;
    }).join("");
    $$("#country-table tbody tr").forEach((tr) => {
      const pick = () => { state.country = tr.dataset.code; renderCountries(); renderConfig(); };
      tr.addEventListener("click", pick);
      tr.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
    });
  }

  function renderConfig() {
    const c = D.countries.find((x) => x.code === state.country);
    const row = (k, v) => `<div class="cfg-row"><span>${t(k)}</span><b>${v}</b></div>`;
    $("#country-config").innerHTML = `<h3>${c.code} · ${L(c.name)}</h3>` +
      row("cfg_regulator", c.regulator) + row("cfg_privacy", L(c.privacy)) + row("cfg_lang", L(c.lang)) +
      row("cfg_thr", "USD " + fmt(c.thr)) + `<p class="cfg-res">${L(c.res)}</p><p class="note">${t("cfg_note")}</p>`;
  }

  function renderIntegrations() {
    $("#integ").innerHTML = D.integrations.map((i) =>
      `<div class="int"><span class="dot"></span><div><b>${L(i.name)}</b><small>${i.kind} · ${i.ms} ms</small></div></div>`).join("");
  }

  function renderScenarios() {
    $("#scenarios").innerHTML = D.scenarios.map((s) =>
      `<button type="button" role="tab" class="sc ${s.id === state.scenario ? "active" : ""}" data-id="${s.id}" aria-selected="${s.id === state.scenario}">${L(s.label)}</button>`).join("");
    $$("#scenarios .sc").forEach((b) => b.addEventListener("click", () => {
      if (state.busy) return;
      state.scenario = b.dataset.id; state.run = null; renderScenarios(); renderSteps(); renderAudit(); renderGateAndOutcome();
    }));
    $("#email").textContent = D.scenarios.find((s) => s.id === state.scenario).email;
  }

  function renderPortfolio() {
    const rows = D.initiatives.map((i) => ({ ...i, score: 3 * i.value - i.effort - 1.5 * i.risk }))
      .sort((a, b) => b.score - a.score);
    const max = Math.max(...rows.map((r) => r.score));
    $("#pf-table tbody").innerHTML = rows.map((r) => {
      const wave = r.score >= 8 ? 1 : r.score >= 5 ? 2 : 3;
      return `<tr><td>${L(r.name)}</td><td class="num">${r.value}</td><td class="num">${r.effort}</td><td class="num">${r.risk}</td>
        <td><span class="bar"><i style="width:${Math.max(6, (r.score / max) * 100)}%"></i></span> <b>${r.score.toFixed(1)}</b></td>
        <td><span class="wave w${wave}">${t("wave", { n: wave })}</span></td></tr>`;
    }).join("");
  }

  function renderPhases() {
    $("#phases").innerHTML = D.phases.map((p, i) => `<article class="phase">
      <span class="ph-days">${state.lang === "es" ? "Días" : "Days"} ${p.days}</span><h3>${L(p.title)}</h3>
      <ul>${L(p.items).map((x) => `<li>${x}</li>`).join("")}</ul>
      <p class="ph-gate"><b>${t("gate_label")}:</b> ${L(p.gate)}</p></article>`).join("");
  }

  function renderStrategy() {
    $("#strategy-list").innerHTML = D.strategy.map((s, i) => `<li><span class="st-n">${i + 1}</span><div><b>${L(s.t)}</b><p>${L(s.d)}</p></div></li>`).join("");
  }

  function renderCoverage() {
    $("#cov-table tbody").innerHTML = D.coverage.map((c) => `<tr><th>${c.req}</th><td>${L(c.what)}</td></tr>`).join("");
  }

  /* ---------------- workflow engine ---------------- */
  const STEP_KEYS = ["intake", "extract", "validate", "crm", "gov", "route", "gate", "action"];

  const toISO = (dmy) => { const m = dmy && dmy.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/); return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : null; };

  /** Local rules-based classification + extraction (default engine). */
  function extractLocal(email) {
    const subject = (email.match(/Asunto:\s*(.+)/) || [])[1] || "";
    const policy = (email.match(/POL-[A-Z]{2}-\d+/) || [null])[0];
    const sum = (email.match(/USD\s*([\d,]+)/) || [])[1];
    const expiry = toISO((email.match(/(?:vence el|vencimiento)\s+(?:el\s+)?(\d{1,2}\/\d{1,2}\/\d{4})/i) || [])[1]);
    const attachedClause = (email.match(/Adjunt\w+[^:]*:\s*([^.]+)\./i) || [])[1] || "";
    const docs = [];
    if (/lista de activos/i.test(attachedClause)) docs.push("asset_list");
    if (/siniestr/i.test(attachedClause)) docs.push("loss_history");
    if (/solicitud/i.test(attachedClause)) docs.push("signed_application");
    const parts = subject.split(" – ");
    return {
      request_type: /renov/i.test(subject) ? "renewal" : "other",
      urgency: /urgente/i.test(subject) ? "urgent" : "normal",
      client: parts.length > 1 ? parts[parts.length - 1].trim() : null,
      country: policy ? policy.split("-")[1] : null,
      policy_id: policy,
      expiry_date: expiry,
      sum_insured_usd: sum ? Number(sum.replace(/,/g, "")) : null,
      documents_attached: docs,
      contact: (email.match(/Contacto:\s*([^,.]+)/) || [])[1] || null,
    };
  }

  async function extract(email, live) {
    if (live) {
      try {
        const ctl = new AbortController();
        const timer = setTimeout(() => ctl.abort(), 25000);
        const res = await fetch("/api/hub-extract", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }), signal: ctl.signal });
        clearTimeout(timer);
        const json = await res.json();
        if (res.ok && json.extraction) return { data: json.extraction, engine: t("engine_claude"), meta: json.meta };
      } catch (e) { /* fall through to rules engine */ }
      return { data: extractLocal(email), engine: t("engine_fallback") };
    }
    return { data: extractLocal(email), engine: t("engine_rules") };
  }

  /** Mock CRM "API": the only place that knows the synthetic accounts. */
  async function crmLookup(policy) {
    await sleep(350);
    return { status: 200, matches: D.crm.filter((a) => a.policy === policy) };
  }

  const ROLE_OK = { analyst: ["analyst", "manager", "compliance"], manager: ["manager", "compliance"], compliance: ["compliance"] };

  function log(key, actor, params, detail) {
    state.run.audit.push({ ts: new Date().toISOString(), actor, key, params: params || {}, detail: detail || "" });
    renderAudit();
  }
  function setStep(key, status, out, extra) {
    state.run.steps[key] = { status, out: out || "", extra: extra || "" };
    renderSteps();
  }

  async function runWorkflow() {
    if (state.busy) return;
    state.busy = true;
    $("#btn-run").disabled = true; $("#btn-run").textContent = t("running");
    const sc = D.scenarios.find((s) => s.id === state.scenario);
    state.run = { scenario: sc.id, steps: {}, audit: [], gate: null, outcome: null, result: {} };
    renderGateAndOutcome();
    const R = state.run;
    log("ev_received", "system", {}, sc.id);

    // 1-2 Intake + extraction
    setStep("intake", "running"); setStep("extract", "waiting");
    const { data: x, engine } = await extract(sc.email, $("#live-toggle").checked);
    R.result.x = x;
    const typeName = x.request_type === "renewal" ? t("t_renewal") : t("t_other");
    setStep("intake", "done", t("intake_out", { type: typeName, urgency: x.urgency === "urgent" ? t("u_urgent") : t("u_normal"), country: x.country || "?", engine }));
    log("ev_classified", "ai", { engine }, typeName);
    setStep("extract", "running"); await sleep(350);
    setStep("extract", "done", t("extract_out", { client: x.client || "?", policy: x.policy_id || "?", expiry: x.expiry_date || "?", sum: x.sum_insured_usd ? fmt(x.sum_insured_usd) : "?" }));
    log("ev_extracted", "ai", {}, JSON.stringify(x));

    // 3 Completeness
    setStep("validate", "running"); await sleep(350);
    const missing = D.requiredDocs.filter((d) => !(x.documents_attached || []).includes(d));
    const missingNames = missing.map((d) => t("doc_" + d)).join(", ");
    setStep("validate", missing.length ? "flag" : "done", missing.length ? t("val_missing", { docs: missingNames }) : t("val_ok"));
    log("ev_validated", "system", {}, missing.length ? "missing: " + missing.join(",") : "complete");

    // 4 CRM reconciliation
    setStep("crm", "running"); await sleep(100);
    const call = t("crm_call", { policy: x.policy_id });
    const crm = await crmLookup(x.policy_id);
    const acct = crm.matches[0];
    const mismatch = !!acct && (acct.expiry !== x.expiry_date || acct.sumInsured !== x.sum_insured_usd);
    const dupes = crm.matches.length > 1;
    let crmOut, crmStatus = "done";
    if (!acct) { crmOut = t("crm_out_none"); crmStatus = "flag"; }
    else if (mismatch) {
      crmOut = t("crm_out_conflict", { n: crm.matches.length, reqExp: x.expiry_date, crmExp: acct.expiry, reqSum: fmt(x.sum_insured_usd), crmSum: fmt(acct.sumInsured) });
      crmStatus = "flag";
    } else crmOut = t("crm_out_ok");
    setStep("crm", crmStatus, crmOut, call + " → HTTP " + crm.status);
    log("ev_crm", "system", {}, `${call} → ${crm.matches.length} match(es)`);

    // 5 Governance
    setStep("gov", "running"); await sleep(350);
    const cfg = D.countries.find((c) => c.code === x.country) || D.countries[0];
    const overThr = (x.sum_insured_usd || 0) > cfg.thr;
    const issues = [];
    if (dupes) issues.push(t("gov_dup", { n: crm.matches.length }));
    if (overThr) issues.push(t("gov_thr", { sum: fmt(x.sum_insured_usd), country: cfg.code, thr: fmt(cfg.thr) }));
    if (mismatch) issues.push(t("gov_mismatch"));
    setStep("gov", issues.length ? "flag" : "done", issues.length ? issues.join(" ") : t("gov_pass", { country: cfg.code, thr: fmt(cfg.thr) }));
    log("ev_gov", "system", {}, issues.length ? issues.length + " finding(s)" : "pass");

    // 6 Routing (pure rules)
    setStep("route", "running"); await sleep(300);
    let route, need = null;
    if (mismatch || dupes || overThr || !acct) { route = "human"; need = overThr || dupes ? "compliance" : "manager"; }
    else if (missing.length) { route = "info"; need = "analyst"; }
    else route = "auto";
    R.result.route = route; R.result.need = need; R.result.client = x.client; R.result.missingNames = missingNames; R.result.overThr = overThr;
    setStep("route", route === "auto" ? "done" : "flag", t("route_" + route));
    log("ev_routed", "system", { route: route.toUpperCase() }, need || "");

    if (route === "auto") {
      setStep("gate", "skipped");
      await finish("auto");
    } else {
      setStep("gate", "waiting-human", t("need_" + need));
      R.gate = { need, route };
      log("ev_gate", "system", { role: need }, need);
      renderGateAndOutcome();
      setStep("action", "waiting");
    }
    state.busy = false;
    $("#btn-run").disabled = false; $("#btn-run").textContent = t("run_btn");
    $("#btn-download").disabled = false;
  }

  const roleName = (r) => ({ analyst: { en: "Operations Analyst", es: "Analista de Operaciones" }, manager: { en: "Account Manager", es: "Account Manager" }, compliance: { en: "Compliance Officer", es: "Oficial de Cumplimiento" } }[r][state.lang]);

  async function finish(kind, rejected) {
    const R = state.run;
    setStep("action", "running"); await sleep(400);
    let msgKey, outKey;
    if (rejected) { msgKey = R.result.route === "info" ? "act_reject_info" : "act_reject_conflict"; outKey = "out_reject"; }
    else if (kind === "auto") { msgKey = "act_auto"; outKey = "out_auto"; }
    else if (R.result.route === "info") { msgKey = "act_info"; outKey = "out_info"; }
    else { msgKey = "act_conflict"; outKey = "out_conflict"; }
    setStep("action", rejected ? "flag" : "done", t(msgKey));
    log("ev_action", "system", {}, msgKey);
    R.outcome = { key: outKey, rejected: !!rejected, auto: kind === "auto" };
    if (kind === "auto") state.sessionAuto++; else state.sessionHuman++;
    renderKpis(); renderGateAndOutcome();
  }

  async function decide(approve) {
    const R = state.run;
    if (!R || !R.gate) return;
    const role = $("#role").value;
    const allowed = ROLE_OK[R.gate.need].includes(role);
    if (!allowed) {
      log("ev_denied", "human", { role }, role);
      $("#gate-need").textContent = t("role_denied"); $("#gate-need").classList.add("denied");
      return;
    }
    R.gate = null;
    log(approve ? "ev_approved" : "ev_rejected", "human", { role }, role);
    setStep("gate", approve ? "done" : "flag", (approve ? "✔ " : "↩ ") + roleName(role));
    renderGateAndOutcome();
    await finish("human", !approve);
    $("#btn-download").disabled = false;
  }

  /* ---------------- run-time rendering ---------------- */
  function renderSteps() {
    const R = state.run;
    $("#steps").innerHTML = STEP_KEYS.map((k, i) => {
      const s = (R && R.steps[k]) || { status: "waiting", out: "" };
      const label = { waiting: t("waiting"), running: t("running_s"), done: t("done"), flag: t("flag"), skipped: t("skipped"), "waiting-human": t("awaiting") }[s.status];
      return `<li class="step st-${s.status}"><span class="s-idx">${String(i + 1).padStart(2, "0")}</span><span class="s-name">${t("s_" + k)}</span><span class="s-state">${label}</span>
        ${s.extra ? `<code class="s-api">${s.extra}</code>` : ""}${s.out ? `<p class="s-out">${s.out}</p>` : ""}</li>`;
    }).join("");
  }

  function renderGateAndOutcome() {
    const R = state.run;
    const gate = $("#gate"), out = $("#outcome");
    if (R && R.gate) {
      const r = R.result;
      gate.hidden = false;
      $("#gate-body").textContent = r.route === "info"
        ? t("gate_info", { client: r.client, docs: r.missingNames })
        : t("gate_conflict", { client: r.client, extra: r.overThr ? t("gate_conflict_thr") : "" });
      $("#gate-need").textContent = t("need_" + R.gate.need); $("#gate-need").classList.remove("denied");
    } else gate.hidden = true;
    if (R && R.outcome) {
      out.hidden = false;
      out.className = "outcome " + (R.outcome.rejected ? "o-stop" : R.outcome.auto ? "o-auto" : "o-human");
      out.textContent = t(R.outcome.key);
    } else out.hidden = true;
  }

  function renderAudit() {
    const R = state.run;
    const ol = $("#audit");
    if (!R || !R.audit.length) { ol.innerHTML = `<li class="audit-empty">${t("audit_empty")}</li>`; return; }
    ol.innerHTML = R.audit.map((a) => {
      const p = Object.assign({}, a.params);
      if (p.role) p.role = roleName(p.role);
      const ev = t(a.key, p);
      return `<li><time>${a.ts.slice(11, 19)}</time><span class="actor a-${a.actor}">${t("actor_" + a.actor)}</span><span class="ev">${ev}</span></li>`;
    }).join("");
  }

  function downloadAudit() {
    const R = state.run;
    if (!R) return;
    const blob = new Blob([JSON.stringify({ scenario: R.scenario, outcome: R.outcome && R.outcome.key, audit: R.audit.map((a) => ({ ts: a.ts, actor: a.actor, event: t(a.key, Object.assign({}, a.params, a.params.role ? { role: roleName(a.params.role) } : {})), detail: a.detail })) }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `audit-${R.scenario}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ---------------- wiring ---------------- */
  $("#btn-run").addEventListener("click", runWorkflow);
  $("#btn-approve").addEventListener("click", () => decide(true));
  $("#btn-reject").addEventListener("click", () => decide(false));
  $("#btn-download").addEventListener("click", downloadAudit);
  $("#lang-en").addEventListener("click", () => { state.lang = "en"; applyI18n(); });
  $("#lang-es").addEventListener("click", () => { state.lang = "es"; applyI18n(); });
  applyI18n();
})();
