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

const $ = (sel) => document.querySelector(sel);

const elProceso = $("#proceso");
const elBtnRun = $("#btn-run");
const elBtnEjemplo = $("#btn-ejemplo");
const elError = $("#error-msg");
const elBtnDownload = $("#btn-download");

const stages = {
  audit: $("#stage-audit"),
  prioritize: $("#stage-prioritize"),
  design: $("#stage-design"),
  report: $("#stage-report"),
};

elBtnEjemplo.addEventListener("click", () => {
  elProceso.value = EJEMPLO_PROCESO;
});

elBtnRun.addEventListener("click", ejecutarPipeline);

function setStage(stage, status, html) {
  const el = stages[stage];
  el.classList.remove("active", "done", "error");
  el.classList.add(status === "ok" ? "done" : status === "error" ? "error" : "active");
  el.querySelector("[data-status]").textContent =
    status === "ok" ? "listo" : status === "error" ? "error" : "procesando...";
  if (html !== undefined) {
    el.querySelector("[data-body]").innerHTML = html;
  }
}

function resetPipeline() {
  Object.keys(stages).forEach((key) => {
    const el = stages[key];
    el.classList.remove("active", "done", "error");
    el.querySelector("[data-status]").textContent = "en espera";
    el.querySelector("[data-body]").innerHTML = "";
  });
  elBtnDownload.hidden = true;
  elError.hidden = true;
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

  try {
    setStage("audit", "running");
    const { oportunidades } = await llamarAgente("/api/audit", { proceso });
    setStage("audit", "ok", tablaOportunidades(oportunidades, false));

    setStage("prioritize", "running");
    const { priorizadas } = await llamarAgente("/api/prioritize", { oportunidades });
    setStage("prioritize", "ok", tablaOportunidades(priorizadas, true));

    setStage("design", "running");
    const top = priorizadas[0];
    const { diseno } = await llamarAgente("/api/design-agent", { oportunidad: top });
    setStage("design", "ok", renderDiseno(diseno));

    setStage("report", "running");
    const { reporte } = await llamarAgente("/api/report", { proceso, priorizadas, diseno });
    ultimoReporte = reporte;
    setStage("report", "ok", `<div class="report-markdown">${escapeHtml(reporte)}</div>`);
    elBtnDownload.hidden = false;
  } catch (err) {
    elError.textContent = err.message || "Ocurrió un error ejecutando el pipeline.";
    elError.hidden = false;
    const stageEnCurso = Object.values(stages).find((el) => el.classList.contains("active"));
    if (stageEnCurso) {
      stageEnCurso.classList.remove("active");
      stageEnCurso.classList.add("error");
      stageEnCurso.querySelector("[data-status]").textContent = "error";
    }
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
