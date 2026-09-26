const EJEMPLO_PROCESO =
  "Cada sprint, dos ingenieros dedican medio dia a ejecutar manualmente 40 casos " +
  "de prueba de regresion, luego escriben a mano un reporte de resultados para " +
  "el Lider de Proyecto y contestan por Teams las mismas 5-6 preguntas de " +
  "configuracion de entorno que hacen los ingenieros nuevos cada semana.";

const CUADRANTE_LABEL = {
  quick_win: "Quick win",
  proyecto_mayor: "Proyecto mayor",
  relleno: "Relleno",
  baja_prioridad: "Baja prioridad",
};

const STAGE_LABEL = {
  audit: "Agente Auditor",
  prioritize: "Agente Priorizador",
  design: "Diseñador de Solución",
  report: "Agente Reportero",
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const elProceso = $("#proceso");
const elBtnRun = $("#btn-run");
const elBtnEjemplo = $("#btn-ejemplo");
const elError = $("#error-msg");
const elBtnDownload = $("#btn-download");
const elConsole = $("#console");

const stepperItems = {};
$$(".stepper-item").forEach((el) => {
  stepperItems[el.dataset.stage] = el;
});

const tabButtons = {};
$$(".tab-btn").forEach((el) => {
  tabButtons[el.dataset.tab] = el;
  el.addEventListener("click", () => showTab(el.dataset.tab));
});

const tabPanels = {};
$$(".tab-panel").forEach((el) => {
  tabPanels[el.dataset.panel] = el;
});

elBtnEjemplo.addEventListener("click", () => {
  elProceso.value = EJEMPLO_PROCESO;
});

elBtnRun.addEventListener("click", ejecutarPipeline);

function showTab(name) {
  Object.entries(tabButtons).forEach(([key, btn]) => btn.classList.toggle("active", key === name));
  Object.entries(tabPanels).forEach(([key, panel]) => panel.classList.toggle("active", key === name));
}

function log(msg, type) {
  const line = document.createElement("div");
  line.className = "console-line" + (type ? ` ${type}` : "");
  const time = new Date().toLocaleTimeString("es-MX", { hour12: false });
  line.innerHTML = `<span class="t">${time}</span>${escapeHtml(msg)}`;
  elConsole.appendChild(line);
  elConsole.scrollTop = elConsole.scrollHeight;
}

function clearConsole() {
  elConsole.innerHTML = "";
}

function setStageStatus(stage, status) {
  const el = stepperItems[stage];
  el.classList.remove("active", "done", "error");
  if (status === "running") el.classList.add("active");
  if (status === "ok") el.classList.add("done");
  if (status === "error") el.classList.add("error");
  el.querySelector("[data-status]").textContent =
    status === "running" ? "procesando..." : status === "ok" ? "listo" : status === "error" ? "error" : "en espera";
}

function setStageTime(stage, ms) {
  stepperItems[stage].querySelector("[data-time]").textContent = ms ? `${(ms / 1000).toFixed(1)}s` : "";
}

function setPanel(name, html) {
  tabPanels[name].innerHTML = html;
}

function resetPipeline() {
  Object.keys(stepperItems).forEach((stage) => {
    setStageStatus(stage, "idle");
    setStageTime(stage, 0);
  });
  Object.keys(tabPanels).forEach((name) => {
    setPanel(name, `<p class="panel-placeholder">Esperando resultado del ${STAGE_LABEL[name]}...</p>`);
  });
  elBtnDownload.hidden = true;
  elError.hidden = true;
  clearConsole();
  showTab("audit");
}

async function llamarAgente(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Error llamando a ${path}`);
  }
  return data;
}

async function ejecutarAgente(stage, path, body, onSuccess) {
  showTab(stage);
  setStageStatus(stage, "running");
  log(`→ ${STAGE_LABEL[stage]}: enviando solicitud a Claude...`);
  const start = performance.now();
  try {
    const data = await llamarAgente(path, body);
    const elapsed = performance.now() - start;
    setStageTime(stage, elapsed);
    setStageStatus(stage, "ok");
    const resumen = onSuccess(data);
    log(`✓ ${STAGE_LABEL[stage]}: ${resumen} (${(elapsed / 1000).toFixed(1)}s)`, "ok");
    return data;
  } catch (err) {
    const elapsed = performance.now() - start;
    setStageTime(stage, elapsed);
    setStageStatus(stage, "error");
    log(`✗ ${STAGE_LABEL[stage]}: ${err.message}`, "err");
    throw err;
  }
}

function tablaOportunidades(items, conPriorizacion) {
  const encabezados = conPriorizacion
    ? "<tr><th>Tarea</th><th>Tipo</th><th>Horas/mes</th><th>Cuadrante</th><th>Score</th></tr>"
    : "<tr><th>Tarea</th><th>Tipo</th><th>Horas/mes</th><th>Justificación</th></tr>";

  const filas = items
    .map((o) => {
      if (conPriorizacion) {
        const badge = `<span class="badge badge-${o.cuadrante}">${CUADRANTE_LABEL[o.cuadrante] || o.cuadrante}</span>`;
        return `<tr><td>${escapeHtml(o.tarea)}</td><td>${escapeHtml(o.tipo)}</td><td>${o.horas_estimadas_mes}</td><td>${badge}</td><td>${o.score_prioridad}</td></tr>`;
      }
      return `<tr><td>${escapeHtml(o.tarea)}</td><td>${escapeHtml(o.tipo)}</td><td>${o.horas_estimadas_mes}</td><td>${escapeHtml(o.justificacion)}</td></tr>`;
    })
    .join("");

  return `<table>${encabezados}${filas}</table>`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

function renderDiseno(diseno) {
  const riesgos = diseno.riesgos_y_mitigacion.map((r) => `<li>${escapeHtml(r)}</li>`).join("");
  return `
    <p><strong>${escapeHtml(diseno.nombre_solucion)}</strong> — ${escapeHtml(diseno.tipo_solucion)} sobre ${escapeHtml(diseno.plataforma_sugerida)}</p>
    <p>${escapeHtml(diseno.arquitectura)}</p>
    <p><strong>Prompt inicial optimizado:</strong></p>
    <pre>${escapeHtml(diseno.prompt_inicial_optimizado)}</pre>
    <p><strong>Riesgos y mitigación:</strong></p>
    <ul>${riesgos}</ul>
    <p><strong>Métrica de éxito:</strong> ${escapeHtml(diseno.metrica_de_exito)}</p>
  `;
}

let ultimoReporte = "";

async function ejecutarPipeline() {
  const proceso = elProceso.value.trim();
  resetPipeline();

  if (proceso.length < 20) {
    elError.textContent = "Describe el proceso con al menos 20 caracteres.";
    elError.hidden = false;
    return;
  }

  elBtnRun.disabled = true;
  log("Iniciando pipeline de 4 agentes...");

  try {
    const { oportunidades } = await ejecutarAgente("audit", "/api/audit", { proceso }, (data) => {
      setPanel("audit", tablaOportunidades(data.oportunidades, false));
      return `${data.oportunidades.length} oportunidades detectadas`;
    });

    const { priorizadas } = await ejecutarAgente(
      "prioritize",
      "/api/prioritize",
      { oportunidades },
      (data) => {
        setPanel("prioritize", tablaOportunidades(data.priorizadas, true));
        return `priorizadas, top: "${data.priorizadas[0].tarea}"`;
      }
    );

    const top = priorizadas[0];
    const { diseno } = await ejecutarAgente(
      "design",
      "/api/design-agent",
      { oportunidad: top },
      (data) => {
        setPanel("design", renderDiseno(data.diseno));
        return `solución diseñada: "${data.diseno.nombre_solucion}"`;
      }
    );

    await ejecutarAgente(
      "report",
      "/api/report",
      { proceso, priorizadas, diseno },
      (data) => {
        ultimoReporte = data.reporte;
        setPanel("report", `<div class="report-markdown">${escapeHtml(data.reporte)}</div>`);
        return "reporte generado";
      }
    );

    elBtnDownload.hidden = false;
    log("Pipeline completo.", "ok");
  } catch (err) {
    elError.textContent = err.message || "Ocurrió un error ejecutando el pipeline.";
    elError.hidden = false;
  } finally {
    elBtnRun.disabled = false;
  }
}

elBtnDownload.addEventListener("click", () => {
  const blob = new Blob([ultimoReporte], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "reporte-adopcion-ia.md";
  a.click();
  URL.revokeObjectURL(url);
});
