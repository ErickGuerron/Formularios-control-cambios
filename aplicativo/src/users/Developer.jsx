import { useState } from "react";
import "../App.css";
import Notification from "./../components/Notification.jsx";

export default function App() {
  const [form, setForm] = useState({
    impact: "Afecta a Readme.md. Downgrade de documentación.",
    implementationPlan: "1) Análisis de tecnologías afectadas.\n2) Pruebas.",
    rollbackPlanning: "Revertir a versiones anteriores.",
    testPlanning: "No necesario.",
    init: "2025-10-29",
    completion: "2025-10-29",
    approvers: "erickguerron@yahoo.com",
    title: "Mi RFC de prueba",
    assignees: "ErickGuerron",
    status: "Todo",
    changeType: "estandar",
    risk: "bajo",
    approvers2: "otro@dominio.com",
    solicitor: "1 ",
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleReset = () => {
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
      changeType: "estandar",
      risk: "bajo",
      approvers2: "",
      solicitor: "",
    });
    setNotification(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    const payload = {
      title: form.title,
      tipo: form.changeType,
      riesgo: form.risk,
      impacto: form.impact,
      plan: form.implementationPlan,
      rollback: form.rollbackPlanning,
      pruebas: form.testPlanning,
      vIni: form.init,
      vFin: form.completion,
      solicitante: form.solicitor,
      aprobadores: [form.approvers, form.approvers2]
        .filter(Boolean)
        .join(','),
      assignees: form.assignees
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    console.log("➡️ Payload enviado:", payload);

    try {
      const response = await fetch('http://localhost:3000/rfc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error al crear el RFC');
      }

      const result = await response.json();
      
      setNotification({
        message: `¡RFC creado con éxito! Issue #${result.issueNumber || result.number}`,
        type: 'success'
      });
      handleReset();

    } catch (err) {
      console.error("Error en handleSubmit:", err);
      setNotification({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-section">
        <h2>Formulario de Cambios Documental</h2>

        <form className="vertical-card" onSubmit={handleSubmit}>
          
          {notification && (
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
            />
          )}

          <div className="field">
            <label htmlFor="impact">Impact</label>
            <input id="impact" name="impact" type="text" placeholder="Impact" value={form.impact} onChange={handleChange} />
          </div>

          <div className="field">
            <label htmlFor="implementationPlan">Implementation Plan</label>
            <textarea
              id="implementationPlan"
              name="implementationPlan"
              placeholder="Pasos de la implementación..."
              value={form.implementationPlan}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="field">
            <label htmlFor="rollbackPlanning">RollBack Planning</label>
            <textarea
              id="rollbackPlanning"
              name="rollbackPlanning"
              placeholder="Plan de reversa..."
              value={form.rollbackPlanning}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="field">
            <label htmlFor="testPlanning">Test Planning</label>
            <textarea
              id="testPlanning"
              name="testPlanning"
              placeholder="Plan de pruebas..."
              value={form.testPlanning}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="field-inline">
            <div className="field">
              <label htmlFor="init">Init</label>
              <input id="init" name="init" type="date" value={form.init} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="completion">Completion</label>
              <input id="completion" name="completion" type="date" value={form.completion} onChange={handleChange} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="approvers">Approvers (Campo 1)</label>
            <input id="approvers" name="approvers" type="text" placeholder="correo@dominio.com" value={form.approvers} onChange={handleChange} />
          </div>

          <hr className="divider" />
          <h3 className="subhead">Formulario de Cambios Web</h3>

          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" type="text" placeholder="Título del RFC" value={form.title} onChange={handleChange} />
          </div>

          <div className="field">
            <label htmlFor="assignees">Assignees (separados por coma)</label>
            <input id="assignees" name="assignees" type="text" placeholder="usuario1,usuario2" value={form.assignees} onChange={handleChange} />
          </div>

          <div className="field-inline">
            <div className="field">
              <label htmlFor="changeType">Change Type (Tipo)</label>
              <select id="changeType" name="changeType" value={form.changeType} onChange={handleChange}>
                <option value="estandar">estandar</option>
                <option value="normal">normal</option>
                <option value="emergencia">emergencia</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="risk">Risk (Riesgo)</label>
              <select id="risk" name="risk" value={form.risk} onChange={handleChange}>
                <option value="bajo">bajo</option>
                <option value="medio">medio</option>
                <option value="alto">alto</option>
              </select>
            </div>
          </div>

          <hr className="divider" />
          <h3 className="subhead">Aprobación y Solicitud</h3>

          <div className="field-inline">
            <div className="field">
              <label htmlFor="approvers2">Approvers (Campo 2)</label>
              <input id="approvers2" name="approvers2" type="text" placeholder="correo2@dominio.com" value={form.approvers2} onChange={handleChange} />
            </div>

            <div className="field">
              <label htmlFor="solicitor">Solicitor (Solicitante)</label>
              <input id="solicitor" name="solicitor" type="text" placeholder="Nombre o ID del solicitante" value={form.solicitor} onChange={handleChange} />
            </div>
          </div>

          <div className="actions">
            <button type="button" className="btn secondary" onClick={handleReset} disabled={loading}>
              Limpiar
            </button>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? "Enviando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}