/* eslint-disable no-unused-vars */
import { useState } from "react";
import "../App.css";

export default function App() {
  const [form, setForm] = useState({
    requesterName: "",
    department: "",
    email: "",
    requestDate: "",
    changeType: "",
    description: "",
    reason: "",
    priority: "Media",
    desiredDate: "",
    notes: "",
  });

  const [files, setFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones mínimas
    const requeridos = ["requesterName", "email", "requestDate", "changeType", "description", "reason", "priority"];
    const vacios = requeridos.filter((k) => !String(form[k]).trim());
    if (vacios.length) {
      alert("Por favor completa los campos obligatorios marcados con *.");
      return;
    }

    const payload = {
      ...form,
      attachments: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
      requestId: `SCR-${Date.now()}`, // ID autogenerado (opcional)
    };

    console.log("📤 Solicitud enviada:", payload);
    alert("Solicitud de cambio enviada correctamente ✅");
  };

  const handleReset = () => {
    setForm({
      requesterName: "",
      department: "",
      email: "",
      requestDate: "",
      changeType: "",
      description: "",
      reason: "",
      priority: "Media",
      desiredDate: "",
      notes: "",
    });
    setFiles([]);
  };

  return (
    <div className="container">
      <div className="form-section">
        <h2>Solicitud de Cambio de Software (Usuario Final)</h2>

        <form className="vertical-card" onSubmit={handleSubmit}>
          {/* Identificación del solicitante */}
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

          {/* Fechas */}
          <div className="field-inline">
            <div className="field">
              <label htmlFor="requestDate">Fecha de solicitud *</label>
              <input
                id="requestDate"
                name="requestDate"
                type="date"
                value={form.requestDate}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          {/* Tipo y prioridad */}
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

          {/* Descripción y motivo */}
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
              placeholder="¿Por qué se requiere este cambio? (impacto en tu trabajo, cumplimiento, etc.)"
              value={form.reason}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>

          {/* Adjuntos y notas */}
         

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

          {/* Acciones */}
          <div className="actions">
            <button type="button" className="btn secondary" onClick={handleReset}>
              Limpiar
            </button>
            <button type="submit" className="btn primary">
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
