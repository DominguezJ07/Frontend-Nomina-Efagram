import { useEffect, useState } from "react";
import { createCliente, updateCliente } from "../services/clientesService";
import { X } from "lucide-react";

// ── Campos del formulario agrupados ──────────────────────
const INITIAL_FORM = {
  codigo:           "",
  nit:              "",
  razon_social:     "",
  nombre_comercial: "",
  telefono:         "",
  email:            "",
  direccion:        "",
  ciudad:           "",
  contacto_nombre:  "",
  contacto_telefono:"",
  contacto_email:   "",
  observaciones:    "",
};

// ── Sub-componentes definidos FUERA del componente principal ──
// ⚠️ Definirlos DENTRO causaría: "Cannot create components during render"

const Field = ({ label, name, type = "text", placeholder = "", required = false, form, errors, onChange }) => (
  <div className="form-group" style={{ marginBottom: 14 }}>
    <label style={{ display:"block", fontSize:13, fontWeight:700, color:"#0f172a", marginBottom:5 }}>
      {label}{required && <span style={{ color:"#dc2626" }}> *</span>}
    </label>
    <input
      type={type}
      name={name}
      value={form[name]}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width:"100%", padding:"10px 12px",
        border:`1.5px solid ${errors[name] ? "#dc2626" : "#e2e8f0"}`,
        borderRadius:10, fontSize:14, color:"#0f172a",
        background:"#fff", outline:"none", boxSizing:"border-box",
        fontFamily:"inherit",
      }}
    />
    {errors[name] && (
      <p style={{ margin:"4px 0 0", fontSize:12, color:"#dc2626" }}>{errors[name]}</p>
    )}
  </div>
);

const FieldTextarea = ({ label, name, placeholder = "", form, onChange }) => (
  <div className="form-group" style={{ marginBottom:14 }}>
    <label style={{ display:"block", fontSize:13, fontWeight:700, color:"#0f172a", marginBottom:5 }}>{label}</label>
    <textarea
      name={name}
      value={form[name]}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
      style={{
        width:"100%", padding:"10px 12px", border:"1.5px solid #e2e8f0",
        borderRadius:10, fontSize:14, color:"#0f172a", background:"#fff",
        outline:"none", resize:"vertical", fontFamily:"inherit", boxSizing:"border-box",
      }}
    />
  </div>
);

const SectionTitle = ({ children }) => (
  <p style={{
    margin:"18px 0 10px", fontSize:12, fontWeight:800, color:"#64748b",
    textTransform:"uppercase", letterSpacing:"0.5px",
    borderBottom:"1px solid #f0f2f5", paddingBottom:6,
  }}>
    {children}
  </p>
);

// ══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// Props:
//   isOpen    {boolean}
//   onClose   {function}
//   onSuccess {function}
//   cliente   {object|null}  — si viene, modo editar
// ══════════════════════════════════════════════════════════
const ClienteModal = ({ isOpen, onClose, onSuccess, cliente = null }) => {
  const modoEditar = !!cliente;
  const [form,    setForm]    = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  useEffect(() => {
    if (!isOpen) return;
    if (modoEditar && cliente) {
      setForm({
        codigo:           cliente.codigo            ?? "",
        nit:              cliente.nit               ?? "",
        razon_social:     cliente.razon_social      ?? "",
        nombre_comercial: cliente.nombre_comercial  ?? "",
        telefono:         cliente.telefono          ?? "",
        email:            cliente.email             ?? "",
        direccion:        cliente.direccion         ?? "",
        ciudad:           cliente.ciudad            ?? "",
        contacto_nombre:  cliente.contacto_nombre   ?? "",
        contacto_telefono:cliente.contacto_telefono ?? "",
        contacto_email:   cliente.contacto_email    ?? "",
        observaciones:    cliente.observaciones     ?? "",
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setErrors({});
  }, [isOpen, cliente, modoEditar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

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

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    try {
      setLoading(true);
      const payload = { ...form, codigo: form.codigo.trim().toUpperCase() };
      if (modoEditar) {
        await updateCliente(cliente._id, payload);
      } else {
        await createCliente(payload);
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.message ?? "Error guardando el cliente";
      if (err?.response?.status === 409) {
        setErrors({ nit: "Este NIT ya está registrado" });
      } else {
        alert(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:"min(620px, calc(100% - 24px))", background:"#fff",
          border:"1px solid #e6e8ef", borderRadius:18,
          boxShadow:"0 24px 64px rgba(15,23,42,0.2)",
          maxHeight:"92vh", overflowY:"auto",
          display:"flex", flexDirection:"column",
        }}
      >
        {/* HEADER */}
        <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid #f0f2f5", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h3 style={{ margin:0, fontSize:20, fontWeight:800, color:"#0f172a" }}>
              {modoEditar ? "✏️ Editar Cliente" : "➕ Nuevo Cliente"}
            </h3>
            {modoEditar && (
              <p style={{ margin:"3px 0 0", fontSize:13, color:"#64748b" }}>
                {cliente.codigo} · {cliente.razon_social}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background:"#f8fafc", border:"1px solid #e6e8ef", borderRadius:8, width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}
          >
            <X size={16} color="#64748b" />
          </button>
        </div>

        {/* BODY */}
        <div style={{ padding:"6px 24px 20px" }}>
          <SectionTitle>Datos de la empresa</SectionTitle>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
            <Field label="Código" name="codigo" placeholder="Ej: CLI-001" required form={form} errors={errors} onChange={handleChange} />
            <Field label="NIT" name="nit" placeholder="Ej: 900123456-7" required form={form} errors={errors} onChange={handleChange} />
          </div>
          <Field label="Razón Social" name="razon_social" placeholder="Nombre legal de la empresa" required form={form} errors={errors} onChange={handleChange} />
          <Field label="Nombre Comercial" name="nombre_comercial" placeholder="Nombre con el que opera (opcional)" form={form} errors={errors} onChange={handleChange} />

          <SectionTitle>Contacto empresa</SectionTitle>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
            <Field label="Teléfono" name="telefono" placeholder="Ej: 3001234567" form={form} errors={errors} onChange={handleChange} />
            <Field label="Email" name="email" type="email" placeholder="correo@empresa.com" form={form} errors={errors} onChange={handleChange} />
          </div>
          <Field label="Dirección" name="direccion" placeholder="Dirección de la empresa" form={form} errors={errors} onChange={handleChange} />
          <Field label="Ciudad" name="ciudad" placeholder="Ciudad" form={form} errors={errors} onChange={handleChange} />

          <SectionTitle>Contacto principal</SectionTitle>
          <Field label="Nombre del contacto" name="contacto_nombre" placeholder="Nombre completo" form={form} errors={errors} onChange={handleChange} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
            <Field label="Teléfono contacto" name="contacto_telefono" placeholder="Ej: 3009876543" form={form} errors={errors} onChange={handleChange} />
            <Field label="Email contacto" name="contacto_email" type="email" placeholder="contacto@empresa.com" form={form} errors={errors} onChange={handleChange} />
          </div>

          <SectionTitle>Observaciones</SectionTitle>
          <FieldTextarea label="Observaciones" name="observaciones" placeholder="Notas adicionales sobre el cliente..." form={form} onChange={handleChange} />
        </div>

        {/* FOOTER */}
        <div style={{ padding:"14px 24px", borderTop:"1px solid #f0f2f5", display:"flex", justifyContent:"flex-end", gap:10 }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{ background:"#f1f5f9", color:"#475569", border:"none", padding:"11px 20px", borderRadius:10, fontWeight:700, cursor:"pointer", fontSize:14 }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: loading ? "#94a3b8" : "#1f8f57", color:"#fff", border:"none",
              padding:"11px 24px", borderRadius:10, fontWeight:700,
              cursor: loading ? "not-allowed" : "pointer", fontSize:14,
              boxShadow: loading ? "none" : "0 4px 12px rgba(31,143,87,0.25)",
            }}
          >
            {loading ? "Guardando..." : modoEditar ? "Guardar Cambios" : "Crear Cliente"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClienteModal;