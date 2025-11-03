/* eslint-disable no-unused-vars */
import { useState } from "react";
import "../App.css";

export default function App() {
  const [form, setForm] = useState({
    title: "",
    formName: "",
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

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requeridos = ["title","formName","requesterName","email","requestDate","changeType","description","reason","priority"];
    const vacios = requeridos.filter((k) => !String(form[k]).trim());
    if (vacios.length) {
      alert("Por favor completa los campos obligatorios marcados con *.");
      return;
    }

    const payload = {
      title: form.title,
      formName: form.formName,
      requesterName: form.requesterName,
      department: form.department || null,
      email: form.email,
      requestDate: form.requestDate,
      changeType: form.changeType,
      description: form.description,
      reason: form.reason,
      priority: form.priority,         // Se mapeará a Change Type vía priorityname
      desiredDate: form.desiredDate || null,
      notes: form.notes || null,
      assignees: [],                   // opcional: respeta el máximo de 2 en backend
    };

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
      alert(`Solicitud creada ✅ Issue #${data.issueNumber}`);
      setForm({
        title: "",
        formName: "",
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
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({
      title: "",
      formName: "",
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
  };

  return (
    <div className="container">
      <div className="form-section">
        <h2>Solicitud de Cambio de Software (Usuario Final)</h2>

        <form className="vertical-card" onSubmit={handleSubmit}>
          <div className="field-inline">
            <div className="field">
              <label htmlFor="title">Título de la solicitud *</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="Ej. Mejorar búsqueda de productos"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="formName">Nombre del formulario *</label>
              <input
                id="formName"
                name="formName"
                type="text"
                placeholder="Ej. Formulario de Solicitud de Usuario"
                value={form.formName}
                onChange={handleChange}
                required
              />
            </div>
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

            <div className="field">
              <label htmlFor="desiredDate">Fecha deseada</label>
              <input
                id="desiredDate"
                name="desiredDate"
                type="date"
                value={form.desiredDate}
                onChange={handleChange}
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
