import { useState } from "react";
import "./App.css";

export default function App() {
  const [form, setForm] = useState({
    // Bloque 1 (todos inputs)
    impact: "Afecta a Readme.md. Downgrade de documentación.",
    implementationPlan: "1) Análisis de tecnologías afectadas.",
    rollbackPlanning: "Revertir a versiones anteriores.",
    testPlanning: "No necesario.",
    init: "2025-10-29",
    completion: "2025-10-29",
    approvers: "erickguerron@yahoo.com",

    // Bloque 2 (mix)
    title: "",
    assignees: "ErickGuerron",
    status: "Todo",
    changeType: "estandar",
    risk: "bajo",

    // Bloque 3 (ambos inputs)
    approvers2: "erickguerron@yahoo.com",
    solicitor: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("➡️ Payload:", form);
    alert("Formulario listo (revisa la consola).");
  };

  const handleReset = () =>
    setForm({
      impact: "",
      implementationPlan: "",
      rollbackPlanning: "",
      testPlanning: "",
      init: "",
      completion: "",
      approvers: "",

      title: "",
      assignees: "",
      status: "Todo",
      changeType: "estandar",
      risk: "bajo",

      approvers2: "",
      solicitor: "",
    });

  return (
    <div className="container">
      <div className="form-section">
        <h2>Formulario de Cambios Documental</h2>

        <form className="vertical-card" onSubmit={handleSubmit}>
          {/* ----- BLOQUE 1: primera imagen (todos inputs) ----- */}
          <div className="field">
            <label htmlFor="impact">Impact</label>
            <input
              id="impact"
              name="impact"
              type="text"
              placeholder="Impact"
              value={form.impact}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="implementationPlan">Implementation Plan</label>
            <input
              id="implementationPlan"
              name="implementationPlan"
              type="text"
              placeholder="Implementation Plan"
              value={form.implementationPlan}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="rollbackPlanning">RollBack Planning</label>
            <input
              id="rollbackPlanning"
              name="rollbackPlanning"
              type="text"
              placeholder="RollBack Planning"
              value={form.rollbackPlanning}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="testPlanning">Test Planning</label>
            <input
              id="testPlanning"
              name="testPlanning"
              type="text"
              placeholder="Test Planning"
              value={form.testPlanning}
              onChange={handleChange}
            />
          </div>

          <div className="field-inline">
            <div className="field">
              <label htmlFor="init">Init</label>
              <input
                id="init"
                name="init"
                type="date"
                value={form.init}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label htmlFor="completion">Completion</label>
              <input
                id="completion"
                name="completion"
                type="date"
                value={form.completion}
                onChange={handleChange}
              />
            </div>

            
          </div>

          {/* ----- BLOQUE 2: segunda imagen (combos para status/changeType/risk) ----- */}
          <hr className="divider" />
          <h3 className="subhead">Formulario de Cambios Web</h3>

          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Título del RFC"
              value={form.title}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="assignees">Assignees</label>
            <input
              id="assignees"
              name="assignees"
              type="text"
              placeholder="Asignado a"
              value={form.assignees}
              onChange={handleChange}
            />
          </div>

          <div className="field-inline">
            <div className="field">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option>Todo</option>
                <option>In Progress</option>
                <option>Done</option>
                <option>Blocked</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="changeType">Change Type</label>
              <select
                id="changeType"
                name="changeType"
                value={form.changeType}
                onChange={handleChange}
              >
                <option value="estandar">estandar</option>
                <option value="normal">normal</option>
                <option value="emergencia">emergencia</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="risk">Risk</label>
              <select
                id="risk"
                name="risk"
                value={form.risk}
                onChange={handleChange}
              >
                <option value="bajo">bajo</option>
                <option value="medio">medio</option>
                <option value="alto">alto</option>
              </select>
            </div>
          </div>

          {/* ----- BLOQUE 3: tercera imagen (ambos inputs) ----- */}
          <hr className="divider" />
          <h3 className="subhead">Aprobación y Solicitud</h3>

          <div className="field-inline">
            <div className="field">
              <label htmlFor="approvers2">Approvers</label>
              <input
                id="approvers2"
                name="approvers2"
                type="text"
                placeholder="correo@dominio.com"
                value={form.approvers2}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label htmlFor="solicitor">Solicitor</label>
              <input
                id="solicitor"
                name="solicitor"
                type="text"
                placeholder="Nombre o ID del solicitante"
                value={form.solicitor}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="actions">
            <button type="button" className="btn secondary" onClick={handleReset}>
              Limpiar
            </button>
            <button type="submit" className="btn primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
