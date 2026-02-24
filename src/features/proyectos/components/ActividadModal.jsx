import { useEffect, useState } from "react";
import { createActividad, updateActividad } from "../services/actividadesService";
import { X } from "lucide-react";

// ── Constantes ────────────────────────────────────────────
const CATEGORIAS = [
  { value: "PREPARACION_TERRENO", label: "Preparacion de Terreno" },
  { value: "SIEMBRA",             label: "Siembra" },
  { value: "MANTENIMIENTO",       label: "Mantenimiento" },
  { value: "CONTROL_MALEZA",      label: "Control de Maleza" },
  { value: "FERTILIZACION",       label: "Fertilizacion" },
  { value: "PODAS",               label: "Podas" },
  { value: "OTRO",                label: "Otro" },
];

const UNIDADES = [
  { value: "HECTAREA",       label: "Hectarea" },
  { value: "ARBOL",          label: "Arbol" },
  { value: "METRO",          label: "Metro" },
  { value: "METRO_CUADRADO", label: "Metro Cuadrado" },
  { value: "KILOGRAMO",      label: "Kilogramo" },
  { value: "LITRO",          label: "Litro" },
  { value: "JORNAL",         label: "Jornal" },
  { value: "UNIDAD",         label: "Unidad" },
];

const FORM_INICIAL = {
  codigo:                      "",
  nombre:                      "",
  categoria:                   "PREPARACION_TERRENO",
  unidad_medida:               "HECTAREA",
  activa:                      "true",
  rendimiento_diario_estimado: "",
  descripcion:                 "",
};

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

const readOnlyInputStyle = {
  ...inputStyle(),
  background: "#f1f5f9",
  color: "#64748b",
  cursor: "not-allowed",
};

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

// ══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// Props:
//   isOpen          {boolean}
//   onClose         {function}
//   onSuccess       {function}
//   actividadEditar {object|null} — null = crear, objeto = editar
// ══════════════════════════════════════════════════════════
const ActividadModal = ({ isOpen, onClose, onSuccess, actividadEditar = null }) => {
  const isEdit = Boolean(actividadEditar);

  const [form,    setForm]    = useState(FORM_INICIAL);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  // ── Cargar datos al abrir ──────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && actividadEditar) {
      setForm({
        codigo:                      actividadEditar.codigo                      ?? "",
        nombre:                      actividadEditar.nombre                      ?? "",
        categoria:                   actividadEditar.categoria                   ?? "PREPARACION_TERRENO",
        unidad_medida:               actividadEditar.unidad_medida               ?? "HECTAREA",
        activa:                      String(actividadEditar.activa ?? true),
        rendimiento_diario_estimado: actividadEditar.rendimiento_diario_estimado != null
                                       ? String(actividadEditar.rendimiento_diario_estimado)
                                       : "",
        descripcion:                 actividadEditar.descripcion ?? "",
      });
    } else {
      setForm(FORM_INICIAL);
    }

    setErrors({});
  }, [isOpen, actividadEditar]);

  // ── Handler de cambios ─────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  // ── Validación frontend ────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.codigo.trim()) errs.codigo = "El código es obligatorio";
    if (!form.nombre.trim()) errs.nombre = "El nombre es obligatorio";
    if (form.rendimiento_diario_estimado !== "" && isNaN(Number(form.rendimiento_diario_estimado)))
      errs.rendimiento_diario_estimado = "Debe ser un número válido";
    return errs;
  };

  // ── Enviar formulario ──────────────────────────────────
  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    try {
      setLoading(true);

      const payload = {
        nombre:      form.nombre.trim(),
        categoria:   form.categoria,
        unidad_medida: form.unidad_medida,
        activa:      form.activa === "true",
        descripcion: form.descripcion.trim(),
        ...(form.rendimiento_diario_estimado !== ""
          ? { rendimiento_diario_estimado: Number(form.rendimiento_diario_estimado) }
          : {}),
      };

      if (isEdit) {
        // FIX: en edición NO se envía codigo para evitar conflicto con
        // la validación del backend (el campo es de solo lectura)
        await updateActividad(actividadEditar._id, payload);
      } else {
        // En creación sí incluimos el codigo
        await createActividad({
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
        "Error guardando la actividad";

      if (err?.response?.status === 409) {
        setErrors({ codigo: "Este código ya está en uso" });
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
          width: "min(560px, calc(100% - 24px))",
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
              {isEdit ? "Editar Actividad" : "Nueva Actividad"}
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "#6b7280" }}>
              Catálogo de actividades del sistema
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

          {/* Error general del servidor */}
          {errors._general && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 8, padding: "10px 14px",
              fontSize: 13, color: "#dc2626", marginBottom: 16,
            }}>
              {errors._general}
            </div>
          )}

          {/* ── FILA 1: Código + Nombre ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px", marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>
                Codigo{!isEdit && <span style={{ color: "#dc2626" }}> *</span>}
              </label>
              <input
                name="codigo"
                value={form.codigo}
                onChange={handleChange}
                placeholder="Ej: ACT-001"
                // FIX: readOnly en edición (visible pero no editable), no disabled
                readOnly={isEdit}
                style={isEdit ? readOnlyInputStyle : inputStyle(!!errors.codigo)}
                title={isEdit ? "El código no puede modificarse" : ""}
              />
              {errors.codigo && (
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>{errors.codigo}</p>
              )}
            </div>

            <div>
              <label style={labelStyle}>
                Nombre <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre de la actividad"
                style={inputStyle(!!errors.nombre)}
              />
              {errors.nombre && (
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>{errors.nombre}</p>
              )}
            </div>
          </div>

          {/* ── FILA 2: Categoría + Unidad + Estado ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 12px", marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Categoria</label>
              <select name="categoria" value={form.categoria} onChange={handleChange} style={selectStyle}>
                {CATEGORIAS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Unidad</label>
              <select name="unidad_medida" value={form.unidad_medida} onChange={handleChange} style={selectStyle}>
                {UNIDADES.map(u => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Estado</label>
              {/* FIX: reemplaza el checkbox por un dropdown para coincidir con la imagen */}
              <select name="activa" value={form.activa} onChange={handleChange} style={selectStyle}>
                <option value="true">Activa</option>
                <option value="false">Inactiva</option>
              </select>
            </div>
          </div>

          {/* ── FILA 3: Precio Base / Rendimiento ── */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Precio Base ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="rendimiento_diario_estimado"
              value={form.rendimiento_diario_estimado}
              onChange={handleChange}
              placeholder="Ej: 850000"
              style={inputStyle(!!errors.rendimiento_diario_estimado)}
            />
            {errors.rendimiento_diario_estimado && (
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>
                {errors.rendimiento_diario_estimado}
              </p>
            )}
          </div>

          {/* ── FILA 4: Descripción ── */}
          <div>
            <label style={labelStyle}>Descripcion</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripción detallada de la actividad..."
              rows={4}
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
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActividadModal;