import { useEffect, useState } from "react";
import { createCliente, updateCliente } from "../services/Clientesservice";
import { X } from "lucide-react";

// ── Estilos inline reutilizables ──────────────────────────
const inputStyle = (hasError = false) => ({
  width: "100%",
  padding: "9px 12px",
  border: `1.5px solid ${hasError ? "#dc2626" : "#d1d5db"}`,
  borderRadius: 8,
  fontSize: 14,
  color: "#0f172a",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
});

const selectStyle = {
  width: "100%",
  padding: "9px 12px",
  border: "1.5px solid #d1d5db",
  borderRadius: 8,
  fontSize: 14,
  color: "#0f172a",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  cursor: "pointer",
};

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 5,
};

const FORM_INICIAL = {
  codigo: "",
  nit: "",
  razon_social: "",
  nombre_comercial: "",
  telefono: "",
  email: "",
  direccion: "",
  ciudad: "",
  contacto_nombre: "",
  contacto_telefono: "",
  contacto_email: "",
  observaciones: "",
  activo: "true",
};

// ══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// Props:
//   isOpen   {boolean}
//   onClose  {function}
//   onSuccess{function}
//   cliente  {object|null} — null = crear, objeto = editar
// ══════════════════════════════════════════════════════════
const ClienteModal = ({ isOpen, onClose, onSuccess, cliente = null }) => {
  const isEdit = Boolean(cliente);

  const [form,    setForm]    = useState(FORM_INICIAL);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  // ── Cargar datos al abrir ──────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && cliente) {
      setForm({
        codigo:           cliente.codigo           ?? "",
        nit:              cliente.nit              ?? "",
        razon_social:     cliente.razon_social     ?? "",
        nombre_comercial: cliente.nombre_comercial ?? "",
        telefono:         cliente.telefono         ?? "",
        email:            cliente.email            ?? "",
        direccion:        cliente.direccion         ?? "",
        ciudad:           cliente.ciudad           ?? "",
        contacto_nombre:  cliente.contacto_nombre  ?? "",
        contacto_telefono:cliente.contacto_telefono?? "",
        contacto_email:   cliente.contacto_email   ?? "",
        observaciones:    cliente.observaciones    ?? "",
        activo:           String(cliente.activo ?? true),
      });
    } else {
      setForm(FORM_INICIAL);
    }

    setErrors({});
  }, [isOpen, cliente]);

  // ── Handler de cambios ─────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  // ── Validación frontend ────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.codigo.trim())       errs.codigo       = "El código es obligatorio";
    if (!form.nit.trim())          errs.nit          = "El NIT es obligatorio";
    if (!form.razon_social.trim()) errs.razon_social = "La razón social es obligatoria";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Email inválido";
    if (form.contacto_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contacto_email))
      errs.contacto_email = "Email de contacto inválido";
    return errs;
  };

  // ── Enviar formulario ──────────────────────────────────
  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    try {
      setLoading(true);

      const payload = {
        nit:              form.nit.trim(),
        razon_social:     form.razon_social.trim(),
        nombre_comercial: form.nombre_comercial.trim() || undefined,
        telefono:         form.telefono.trim()         || undefined,
        email:            form.email.trim()            || undefined,
        direccion:        form.direccion.trim()        || undefined,
        ciudad:           form.ciudad.trim()           || undefined,
        contacto_nombre:  form.contacto_nombre.trim()  || undefined,
        contacto_telefono:form.contacto_telefono.trim()|| undefined,
        contacto_email:   form.contacto_email.trim()   || undefined,
        observaciones:    form.observaciones.trim()    || undefined,
        activo:           form.activo === "true",
      };

      if (isEdit) {
        await updateCliente(cliente._id, payload);
      } else {
        await createCliente({
          ...payload,
          codigo: form.codigo.trim().toUpperCase(),
        });
      }

      onSuccess?.();
      onClose?.();

    } catch (err) {
      const serverMsg =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.errors?.[0]?.msg     ||
        err?.response?.data?.message              ||
        err?.message                              ||
        "Error guardando el cliente";

      if (err?.response?.status === 409) {
        setErrors({ codigo: "Este código o NIT ya está en uso" });
      } else {
        setErrors({ _general: serverMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(15,23,42,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "min(600px, calc(100% - 24px))",
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 20px 60px rgba(15,23,42,0.2)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        {/* ── HEADER ── */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>
              {isEdit ? "Editar Cliente" : "Nuevo Cliente"}
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "#6b7280" }}>
              {isEdit ? "Actualiza los datos del cliente" : "Completa los datos para registrar un nuevo cliente"}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "1px solid #e5e7eb",
              borderRadius: 7, width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            <X size={15} color="#6b7280" />
          </button>
        </div>

        {/* ── BODY ── */}
        <div style={{ padding: "20px 24px" }}>

          {/* Error general */}
          {errors._general && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 8, padding: "10px 14px",
              fontSize: 13, color: "#dc2626", marginBottom: 16,
            }}>
              {errors._general}
            </div>
          )}

          {/* ── FILA 1: Código + NIT ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px", marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>
                Código{!isEdit && <span style={{ color: "#dc2626" }}> *</span>}
              </label>
              <input
                name="codigo"
                value={form.codigo}
                onChange={handleChange}
                placeholder="Ej: CLI-001"
                readOnly={isEdit}
                style={isEdit
                  ? { ...inputStyle(), background: "#f1f5f9", color: "#64748b", cursor: "not-allowed" }
                  : inputStyle(!!errors.codigo)
                }
                title={isEdit ? "El código no puede modificarse" : ""}
              />
              {errors.codigo && (
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>{errors.codigo}</p>
              )}
            </div>

            <div>
              <label style={labelStyle}>
                NIT <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                name="nit"
                value={form.nit}
                onChange={handleChange}
                placeholder="Ej: 900123456-7"
                style={inputStyle(!!errors.nit)}
              />
              {errors.nit && (
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>{errors.nit}</p>
              )}
            </div>
          </div>

          {/* ── FILA 2: Razón Social + Nombre Comercial ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px", marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>
                Razón Social <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                name="razon_social"
                value={form.razon_social}
                onChange={handleChange}
                placeholder="Nombre legal de la empresa"
                style={inputStyle(!!errors.razon_social)}
              />
              {errors.razon_social && (
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>{errors.razon_social}</p>
              )}
            </div>

            <div>
              <label style={labelStyle}>Nombre Comercial</label>
              <input
                name="nombre_comercial"
                value={form.nombre_comercial}
                onChange={handleChange}
                placeholder="Nombre comercial (opcional)"
                style={inputStyle()}
              />
            </div>
          </div>

          {/* ── FILA 3: Teléfono + Email + Estado ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 12px", marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Teléfono</label>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Ej: 3001234567"
                style={inputStyle()}
              />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="correo@empresa.com"
                style={inputStyle(!!errors.email)}
              />
              {errors.email && (
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>{errors.email}</p>
              )}
            </div>

            <div>
              <label style={labelStyle}>Estado</label>
              <select name="activo" value={form.activo} onChange={handleChange} style={selectStyle}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

          {/* ── FILA 4: Dirección + Ciudad ── */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0 16px", marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Dirección</label>
              <input
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Dirección de la empresa"
                style={inputStyle()}
              />
            </div>

            <div>
              <label style={labelStyle}>Ciudad</label>
              <input
                name="ciudad"
                value={form.ciudad}
                onChange={handleChange}
                placeholder="Ciudad"
                style={inputStyle()}
              />
            </div>
          </div>

          {/* ── SECCIÓN CONTACTO ── */}
          <p style={{ margin: "4px 0 12px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>
            Contacto Principal
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 12px", marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Nombre</label>
              <input
                name="contacto_nombre"
                value={form.contacto_nombre}
                onChange={handleChange}
                placeholder="Nombre del contacto"
                style={inputStyle()}
              />
            </div>

            <div>
              <label style={labelStyle}>Teléfono</label>
              <input
                name="contacto_telefono"
                value={form.contacto_telefono}
                onChange={handleChange}
                placeholder="Teléfono del contacto"
                style={inputStyle()}
              />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input
                name="contacto_email"
                type="email"
                value={form.contacto_email}
                onChange={handleChange}
                placeholder="email@contacto.com"
                style={inputStyle(!!errors.contacto_email)}
              />
              {errors.contacto_email && (
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>{errors.contacto_email}</p>
              )}
            </div>
          </div>

          {/* ── Observaciones ── */}
          <div>
            <label style={labelStyle}>Observaciones</label>
            <textarea
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              placeholder="Observaciones adicionales..."
              rows={3}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1.5px solid #d1d5db",
                borderRadius: 8,
                fontSize: 14,
                color: "#0f172a",
                background: "#fff",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          padding: "14px 24px",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: "#f9fafb",
              color: "#374151",
              border: "1px solid #d1d5db",
              padding: "10px 20px",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: loading ? "#9ca3af" : "#1f8f57",
              color: "#fff",
              border: "none",
              padding: "10px 24px",
              borderRadius: 8,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14,
              boxShadow: loading ? "none" : "0 4px 12px rgba(31,143,87,0.25)",
            }}
          >
            {loading ? "Guardando..." : isEdit ? "Actualizar" : "Crear Cliente"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClienteModal;