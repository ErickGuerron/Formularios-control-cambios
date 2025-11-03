import { useEffect, useState } from "react";
import "../App.css";
import Notification from "./../components/Notification.jsx";

function AssigneeMultiCombo({ options, values, onChange, disabled, loading, error, max = 2 }) {
  const [open, setOpen] = useState(false);
  const [limitHit, setLimitHit] = useState(false);

  const isSelected = (login) => values.includes(login);

  const toggle = (login) => {
    if (isSelected(login)) {
      onChange(values.filter(v => v !== login));
      return;
    }
    if (values.length >= max) {
      setLimitHit(true);
      setTimeout(() => setLimitHit(false), 1200);
      return;
    }
    onChange([...values, login]);
  };

  return (
    <div className="field">
      <label>Assignees (máx {max})</label>
      <div
        className="assignee-combo"
        tabIndex={0}
        onBlur={() => setOpen(false)}
        style={{ position: "relative", width: "100%" }}
      >
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          disabled={disabled || loading}
          className="btn combo-trigger"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            background: "#fff",
            border: "1px solid #dcdcdc",
            padding: "8px 10px",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {values.length === 0 ? (
              <span style={{ color: "#888" }}>{loading ? "Cargando…" : "Seleccionar…"}</span>
            ) : (
              <>
                {values.slice(0, max).map(v => {
                  const u = options.find(o => o.login === v);
                  if (!u) return null;
                  return (
                    <span key={v} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 6px", border: "1px solid #e5e7eb", borderRadius: 999 }}>
                      <img src={u.avatarUrl} alt={u.login} width={18} height={18} style={{ borderRadius: "50%" }} />
                      <span style={{ fontSize: 12 }}>{u.login}</span>
                    </span>
                  );
                })}
                {values.length > max ? <span>+{values.length - max}</span> : null}
              </>
            )}
          </span>
          <span aria-hidden>▾</span>
        </button>

        {open && !loading && (
          <div
            role="listbox"
            className="combo-menu"
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              maxHeight: 280,
              overflowY: "auto",
              background: "#fff",
              border: "1px solid #dcdcdc",
              borderRadius: 8,
              boxShadow: "0 8px 24px rgba(0,0,0,.08)",
              zIndex: 20
            }}
          >
            {options.map(o => {
              const selected = isSelected(o.login);
              const disabledItem = !selected && values.length >= max;
              return (
                <div
                  key={o.login}
                  role="option"
                  aria-selected={selected}
                  onMouseDown={(e) => { e.preventDefault(); if (!disabledItem) toggle(o.login); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    cursor: disabledItem ? "not-allowed" : "pointer",
                    background: selected ? "#f3f4f6" : "transparent",
                    opacity: disabledItem ? 0.6 : 1
                  }}
                  title={disabledItem ? `Máximo ${max} seleccionados` : undefined}
                >
                  <img src={o.avatarUrl} alt={o.login} width={28} height={28} style={{ borderRadius: "50%" }} />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <strong style={{ fontSize: 14 }}>{o.login}</strong>
                    {o.name ? <small style={{ color: "#666" }}>{o.name}</small> : null}
                  </div>
                  <div style={{ marginLeft: "auto", fontSize: 18 }}>{selected ? "✓" : ""}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <small>
        {error
          ? `No se pudieron cargar los usuarios: ${error}`
          : limitHit
          ? `Ya alcanzaste el máximo de ${max}.`
          : "Selecciona hasta 2 responsables."}
      </small>
    </div>
  );
}

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
    solicitor: "1",
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const [assigneeOptions, setAssigneeOptions] = useState([]);
  const [assigneesLoading, setAssigneesLoading] = useState(false);
  const [assigneesError, setAssigneesError] = useState(null);
  const [selectedAssignees, setSelectedAssignees] = useState(() =>
    (form.assignees || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 2)
  );

  useEffect(() => {
    setAssigneesLoading(true);
    setAssigneesError(null);
    const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:3000";
    fetch(`${API}/rfc/assignees`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data) => setAssigneeOptions(Array.isArray(data) ? data : []))
      .catch((e) => setAssigneesError(e.message))
      .finally(() => setAssigneesLoading(false));
  }, []);

  useEffect(() => {
    setForm((f) => ({ ...f, assignees: selectedAssignees.join(",") }));
  }, [selectedAssignees]);

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
    setSelectedAssignees([]);
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
      aprobadores: [form.approvers, form.approvers2].filter(Boolean).join(","),
      assignees: form.assignees
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 2),
    };

    try {
      const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:3000";
      const response = await fetch(`${API}/rfc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Error al crear el RFC");
      }

      const result = await response.json();
      setNotification({
        message: `¡RFC creado con éxito! Issue #${result.issueNumber || result.number}`,
        type: "success",
      });
      handleReset();
    } catch (err) {
      setNotification({ message: err.message, type: "error" });
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
            <input
              id="approvers"
              name="approvers"
              type="text"
              placeholder="correo@dominio.com"
              value={form.approvers}
              onChange={handleChange}
            />
          </div>

          <hr className="divider" />
          <h3 className="subhead">Formulario de Cambios Web</h3>

          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" type="text" placeholder="Título del RFC" value={form.title} onChange={handleChange} />
          </div>

          <AssigneeMultiCombo
            options={assigneeOptions}
            values={selectedAssignees}
            onChange={setSelectedAssignees}
            disabled={loading}
            loading={assigneesLoading}
            error={assigneesError}
            max={2}
          />

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
              <input
                id="approvers2"
                name="approvers2"
                type="text"
                placeholder="correo2@dominio.com"
                value={form.approvers2}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label htmlFor="solicitor">Solicitor (Solicitante)</label>
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
