import { useState } from "react";
import "../App.css";
import Notification from "./../components/Notification.jsx";

export default function App() {
  const [form, setForm] = useState({
    formName: "",
    requesterName: "",
    department: "",
    email: "",
    changeType: "",
    description: "",
    reason: "",
    priority: "Media",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification(null);

    const requeridos = ["formName","requesterName","email","changeType","description","reason","priority"];
    const vacios = requeridos.filter((k) => !String(form[k]).trim());
    if (vacios.length) {
      setNotification({
        message: "Por favor completa los campos obligatorios marcados con *.",
        type: "error"
      });
      return;
    }

    // --- INICIO DE LA CORRECCIÓN ---
    const payload = {
      title: form.formName, // 1. Usa formName como el 'title' requerido
      formName: form.formName,
      requesterName: form.requesterName,
      department: form.department || null,
      email: form.email,
      requestDate: new Date().toISOString().split('T')[0],
      changeType: form.changeType,
      description: form.description,
      reason: form.reason,
      priorityName: form.priority, // 2. Renombra 'priority' a 'priorityName'
      notes: form.notes || null,
      assignees: [],
    };
    // --- FIN DE LA CORRECCIÓN ---

    try {
      setSubmitting(true);
      const res = await fetch("http://localhost:3000/rfc/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "No se pudo crear la solicitud");
      }

      const data = await res.json();
      setNotification({
        message: `Solicitud creada ✅ Issue #${data.issueNumber}`,
        type: "success"
      });
      handleReset();
    } catch (e) {
      setNotification({ message: e.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({
      formName: "",
      requesterName: "",
      department: "",
      email: "",
      changeType: "",
      description: "",
      reason: "",
      priority: "Media",
      notes: "",
    });
    setNotification(null);
  };

  return (
    <div className="container">
      <div className="form-section">
        <h2>Solicitud de Cambio de Software (Usuario Final)</h2>

        <form className="vertical-card" onSubmit={handleSubmit}>
          
          {notification && (
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
            />
          )}
          
          <div className="field">
            <label htmlFor="formName">Nombre del formulario *</label>
            <input
              id="formName"
              name="formName"
              type="text"
              placeholder="Ej. Formulario de SolicBaja"
              value={form.formName}
              onChange={handleChange}
              required
              maxLength={40}
            />
          </div>

          <div className="field-inline">
            <div className="field">
              <label htmlFor="requesterName">Nombre del solicitante *</label>
              <input
                id="requesterName"
                name="requesterName"
                type="text"
                placeholder="Tu nombre completo"
                value={form.requesterName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="department">Área / Departamento</label>
              <input
                id="department"
                name="department"
                type="text"
                placeholder="Ej. Finanzas, Ventas, RRHH"
                value={form.department}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label htmlFor="email">Correo de contacto *</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="tu@correo.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="field-inline">
            <div className="field">
              <label htmlFor="changeType">Motivo de cambio *</label>
              <select
                id="changeType"
                name="changeType"
                value={form.changeType}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona…</option>
                <option value="Corrección de error">Corrección de error</option>
                <option value="Mejora funcional">Mejora funcional</option>
                <option value="Cambio estético">Cambio estético</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="priority">Prioridad *</label>
              <select
                id="priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                required
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="description">Descripción del cambio solicitado *</label>
            <textarea
              id="description"
              name="description"
              placeholder="Explica claramente qué cambio necesitas"
              value={form.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="reason">Motivo del cambio *</label>
            <textarea
              id="reason"
              name="reason"
              placeholder="¿Por qué se requiere este cambio?"
              value={form.reason}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="notes">Observaciones adicionales</label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Información extra que ayude a evaluar tu solicitud"
              value={form.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="actions">
            <button type="button" className="btn secondary" onClick={handleReset} disabled={submitting}>
              Limpiar
            </button>
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}