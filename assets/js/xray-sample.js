/* Saved demo run of the Engineering Change Request example. It is shown ONLY
   when the live Claude pipeline fails or times out, and the page labels it
   as a saved run. Nothing here is a measurement. */
window.XRAY_SAMPLE = (function () {
  const step = (label, detail, classification) => ({ label, detail, classification });
  const node = (label, kind, detail, replaces) => ({ label, kind, detail, replaces });

  const en = {
    audit: {
      current_process: "Change requests arrive by email, are re-keyed into Excel, validated by an engineer, tracked in Jira, and reported manually.",
      bottlenecks: ["Re-keying email data into Excel", "Manual documentation search", "Waiting on manager approval", "Status report assembled by hand"],
      repetitive_work: ["Copying request data between tools", "Preparing the status report"],
      information_dependencies: ["Email inbox", "Excel tracker", "Jira", "Engineering documentation"],
      human_decision_points: ["Validation of requirements", "Manager approval"],
      potential_risks: ["Wrong field extraction from free-text emails", "Approving without the supporting documents"],
      workflow_steps: [
        step("Request", "Change request arrives by email", "rules_based"),
        step("Excel", "Data copied into a spreadsheet by hand", "manual_repetitive"),
        step("Engineer", "Reads and validates the requirements", "ai_candidate"),
        step("Jira", "Ticket created by hand", "manual_repetitive"),
        step("Search", "Documentation searched manually", "ai_candidate"),
        step("Approval", "Manager reviews and approves", "human_decision"),
        step("Report", "Status report prepared by hand", "manual_repetitive"),
      ],
      opportunities: [
        { opportunity: "Automate intake, validation and ticket drafting", automation_potential: "high", recommended_intervention: "ai_agent", rationale: "Structured extraction from repetitive emails" },
        { opportunity: "Retrieve supporting documents automatically", automation_potential: "medium", recommended_intervention: "knowledge_assistant", rationale: "Answers come from existing documents" },
        { opportunity: "Keep manager approval human", automation_potential: "low", recommended_intervention: "keep_human", rationale: "Accountability and judgment" },
      ],
    },
    prioritize: {
      matrix: [
        { opportunity: "Automate intake, validation and ticket drafting", business_impact: "high", implementation_effort: "low", frequency: "every request", risk: "low", recommended_priority: "quick_win", note: "High volume, low risk with a human reviewing" },
        { opportunity: "Retrieve supporting documents automatically", business_impact: "medium", implementation_effort: "medium", frequency: "every request", risk: "low", recommended_priority: "strategic", note: "Needs a curated document source first" },
      ],
      data_note: "Impact, effort and risk are qualitative judgments. Quantified ROI needs the project's real baseline data.",
    },
    blueprint: {
      implementation_verdict: "rag_assistant",
      verdict_reason: "Extraction and retrieval, not autonomous action, so no free-running agent is needed.",
      problem: "Engineers re-key emailed change requests and search documents by hand before approval.",
      recommended_approach: "Knowledge retrieval",
      inputs: ["Incoming request emails", "Engineering documentation", "Validation rules"],
      ai_role: "Extract fields, check them against rules and retrieve supporting documents; prepare a recommendation.",
      human_role: "Reviews the recommendation and approves or rejects every change.",
      output: "Validated request with draft ticket and supporting documents",
      integration_point: "Email inbox, Jira and the documentation space",
      success_metrics: ["Fewer manual touches per request", "Fewer requests returned for missing information"],
      risks: ["Wrong extraction: sample-check outputs in shadow mode", "Stale documents: assign a document owner"],
      implementation_steps: ["Collect 30 past requests as test cases", "Run intake and validation in shadow mode", "Add retrieval over curated documents", "Enable the human approval gate in production"],
    },
    workflow: {
      proposed_workflow: [
        node("Request", "rules", "Inbox trigger", [0]),
        node("AI Intake", "ai", "Extract structured fields", [1]),
        node("Validation", "ai", "Check against requirement rules", [2]),
        node("Knowledge Retrieval", "ai", "Find supporting documents", [4]),
        node("Human Approval", "human", "Approver decides with context", [5]),
        node("Reporting Agent", "ai", "Draft ticket and status report", [3, 6]),
      ],
      cycle_time_reduction_estimate: { low_pct: 40, high_pct: 60, basis: "Removes re-keying and manual search (illustrative)" },
    },
    extras: {
      roadmap: [
        { phase: "Phase 1 · Pilot", focus: "Intake and validation in shadow mode on past requests." },
        { phase: "Phase 2 · Retrieval", focus: "Add document retrieval and measure missing-information returns." },
        { phase: "Phase 3 · Rollout", focus: "Enable the approval gate and draft tickets for one team." },
      ],
      testing_plan: ["Replay past requests and compare extracted fields to the real ones", "Sample-review a share of outputs every week", "Test incomplete and contradictory emails", "Confirm nothing is sent without human approval"],
    },
    brief: {
      executive_summary: "An engineering change workflow was audited. Intake, validation, retrieval and reporting can be assisted by AI while approval stays with a person.",
      technical_approach: "A retrieval-based assistant extracts request fields, validates them against rules, retrieves supporting documents and drafts the ticket. A person approves every change.",
      adoption_plan: "Start with a pilot team in shadow mode, document the flow, train engineers on reviewing the recommendations, and re-audit after the pilot.",
      metrics: "Track manual touches and requests returned for missing information from a baseline measured before the pilot.",
      documentation: "Process map, validation rules, data sources, approval policy, test results and a short reviewer guide.",
    },
    ecr: {
      intake: { ecr_id: "ECR-1042", requester: "j.rivera", component: "Connector J7, harness H-220", change_summary: "Swap connector J7 for the sealed variant SC-7720", reason: "Moisture ingress in field returns", urgency: "medium", target_release: "next build cycle", drawings: ["DWG-H220-REV-C"], attachments_present: false },
      validation: { checks: [
        { rule: "Change request identifies the affected part number and drawing", status: "pass", note: "J7 and DWG-H220-REV-C" },
        { rule: "A reason for the change is stated", status: "pass", note: "Moisture ingress" },
        { rule: "Supplier documentation is attached for any new part", status: "flag", note: "Datasheet missing" },
        { rule: "Target release or build cycle is stated", status: "pass", note: "Next build cycle" },
        { rule: "Urgency level is stated", status: "pass", note: "Medium" },
      ], summary: "One flag: supplier datasheet missing" },
      documents: [
        { id: "KB-014", title: "Connector change policy", snippet: "Connector substitutions require a supplier datasheet and an updated wiring drawing before approval.", score: 3 },
        { id: "KB-027", title: "Sealed connectors — environmental qualification", snippet: "Sealed variants must reference the IP rating validation record before release to production.", score: 3 },
        { id: "KB-031", title: "Drawing revision control", snippet: "Any change touching a released drawing bumps the revision and notifies the document owner.", score: 2 },
      ],
      decision: { recommendation: "needs_review", rationale: "Supplier datasheet is missing, which KB-014 requires before approval; KB-027 also asks for the IP rating record.", open_items: ["Attach the supplier datasheet", "Reference the IP rating validation record"], ticket_title: "ECR-1042: replace connector J7 with sealed SC-7720" },
    },
  };

  const es = JSON.parse(JSON.stringify(en));
  Object.assign(es.audit, {
    current_process: "Las solicitudes de cambio llegan por correo, se recapturan en Excel, un ingeniero las valida, se registran en Jira y se reportan a mano.",
    bottlenecks: ["Recaptura de datos del correo en Excel", "Búsqueda manual de documentación", "Espera de la aprobación del gerente", "Reporte de estatus armado a mano"],
    repetitive_work: ["Copiar datos de la solicitud entre herramientas", "Preparar el reporte de estatus"],
    information_dependencies: ["Bandeja de correo", "Excel de seguimiento", "Jira", "Documentación de ingeniería"],
    human_decision_points: ["Validación de requisitos", "Aprobación del gerente"],
    potential_risks: ["Extracción incorrecta de campos en correos de texto libre", "Aprobar sin los documentos de soporte"],
  });
  const esSteps = [["Solicitud", "La solicitud llega por correo"], ["Excel", "Datos copiados a mano a una hoja de cálculo"], ["Ingeniero", "Lee y valida los requisitos"], ["Jira", "Ticket creado a mano"], ["Búsqueda", "Documentación buscada manualmente"], ["Aprobación", "El gerente revisa y aprueba"], ["Reporte", "Reporte de estatus hecho a mano"]];
  es.audit.workflow_steps.forEach((s, i) => { s.label = esSteps[i][0]; s.detail = esSteps[i][1]; });
  [["Automatizar intake, validación y borrador de ticket", "Extracción estructurada de correos repetitivos"], ["Recuperar documentos de soporte automáticamente", "Las respuestas salen de documentos existentes"], ["Mantener la aprobación del gerente como humana", "Responsabilidad y criterio"]].forEach((t, i) => { es.audit.opportunities[i].opportunity = t[0]; es.audit.opportunities[i].rationale = t[1]; });
  es.prioritize.matrix[0].opportunity = es.audit.opportunities[0].opportunity;
  es.prioritize.matrix[1].opportunity = es.audit.opportunities[1].opportunity;
  es.prioritize.matrix[0].frequency = es.prioritize.matrix[1].frequency = "cada solicitud";
  es.prioritize.matrix[0].note = "Alto volumen, bajo riesgo con una persona revisando";
  es.prioritize.matrix[1].note = "Requiere primero una fuente de documentos curada";
  es.prioritize.data_note = "Impacto, esfuerzo y riesgo son juicios cualitativos. Un ROI cuantificado requiere los datos base reales del proyecto.";
  Object.assign(es.blueprint, {
    verdict_reason: "Extracción y recuperación, no acción autónoma; no hace falta un agente libre.",
    problem: "Los ingenieros recapturan solicitudes por correo y buscan documentos a mano antes de aprobar.",
    inputs: ["Correos de solicitud", "Documentación de ingeniería", "Reglas de validación"],
    ai_role: "Extrae campos, los valida contra reglas y recupera documentos de soporte; prepara una recomendación.",
    human_role: "Revisa la recomendación y aprueba o rechaza cada cambio.",
    output: "Solicitud validada con borrador de ticket y documentos de soporte",
    integration_point: "Bandeja de correo, Jira y el espacio de documentación",
    success_metrics: ["Menos intervenciones manuales por solicitud", "Menos solicitudes devueltas por información faltante"],
    risks: ["Extracción incorrecta: revisar muestras en modo sombra", "Documentos desactualizados: asignar un dueño"],
    implementation_steps: ["Reunir 30 solicitudes pasadas como casos de prueba", "Correr intake y validación en modo sombra", "Agregar recuperación sobre documentos curados", "Activar la compuerta de aprobación en producción"],
  });
  const esNodes = [["Solicitud", "Disparador de bandeja"], ["Intake con IA", "Extrae campos estructurados"], ["Validación", "Revisa contra reglas de requisitos"], ["Búsqueda de conocimiento", "Encuentra documentos de soporte"], ["Aprobación humana", "El aprobador decide con contexto"], ["Agente de reporte", "Borrador de ticket y reporte"]];
  es.workflow.proposed_workflow.forEach((n, i) => { n.label = esNodes[i][0]; n.detail = esNodes[i][1]; });
  es.workflow.cycle_time_reduction_estimate.basis = "Elimina recaptura y búsqueda manual (ilustrativo)";
  es.extras = {
    roadmap: [{ phase: "Fase 1 · Piloto", focus: "Intake y validación en modo sombra sobre solicitudes pasadas." }, { phase: "Fase 2 · Recuperación", focus: "Agregar recuperación de documentos y medir devoluciones por información faltante." }, { phase: "Fase 3 · Despliegue", focus: "Activar la compuerta de aprobación y borradores de ticket en un equipo." }],
    testing_plan: ["Reproducir solicitudes pasadas y comparar los campos extraídos con los reales", "Revisar una muestra de salidas cada semana", "Probar correos incompletos y contradictorios", "Confirmar que nada se envía sin aprobación humana"],
  };
  es.brief = {
    executive_summary: "Se auditó un flujo de cambios de ingeniería. Intake, validación, recuperación y reporte pueden asistirse con IA; la aprobación sigue en manos de una persona.",
    technical_approach: "Un asistente basado en recuperación extrae campos, los valida contra reglas, recupera documentos de soporte y redacta el ticket. Una persona aprueba cada cambio.",
    adoption_plan: "Empezar con un equipo piloto en modo sombra, documentar el flujo, capacitar a los ingenieros en revisar las recomendaciones y re-auditar tras el piloto.",
    metrics: "Medir intervenciones manuales y solicitudes devueltas por información faltante contra una línea base tomada antes del piloto.",
    documentation: "Mapa del proceso, reglas de validación, fuentes de datos, política de aprobación, resultados de pruebas y una guía breve para revisores.",
  };
  Object.assign(es.ecr.intake, { component: "Conector J7, arnés H-220", change_summary: "Cambiar el conector J7 por la variante sellada SC-7720", reason: "Entrada de humedad en devoluciones de campo", target_release: "siguiente ciclo de build" });
  es.ecr.validation.checks.forEach((c, i) => { c.note = ["J7 y DWG-H220-REV-C", "Entrada de humedad", "Falta la hoja de datos", "Siguiente ciclo de build", "Media"][i]; });
  es.ecr.validation.summary = "Una alerta: falta la hoja de datos del proveedor";
  es.ecr.decision = { recommendation: "needs_review", rationale: "Falta la hoja de datos del proveedor, que KB-014 exige antes de aprobar; KB-027 también pide el registro de grado IP.", open_items: ["Adjuntar la hoja de datos del proveedor", "Referenciar el registro de validación de grado IP"], ticket_title: "ECR-1042: reemplazar el conector J7 por el sellado SC-7720" };

  return { en, es };
})();
