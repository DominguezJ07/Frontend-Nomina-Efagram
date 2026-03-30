import { useEffect, useState } from "react";
import {
  createActividadProyecto,
  updateActividadProyecto,
} from "../services/subproyectosService";
import { getActividades } from "../services/actividadesService";
import { getClientes } from "../services/Clientesservice";
import { getPersonal } from "../services/personalService";
import { getIntervenciones } from "../services/intervencionesService";
import { Package, DollarSign, Hash, AlertCircle } from "lucide-react";

const fmtMoney = (n) =>
  n > 0 ? "$ " + Number(n).toLocaleString("es-CO") : "—";

// Paleta de colores por índice
const PALETA = [
  { bg: "#f0faf4", border: "#1f8f57", color: "#1f8f57", light: "#e8f5ee", emoji: "🌿" },
  { bg: "#eff6ff", border: "#3b82f6", color: "#1d4ed8", light: "#dbeafe", emoji: "💧" },
  { bg: "#fff5f5", border: "#ef4444", color: "#dc2626", light: "#fee2e2", emoji: "🌱" },
  { bg: "#fff7ed", border: "#f97316", color: "#ea580c", light: "#ffedd5", emoji: "🔶" },
  { bg: "#f5f3ff", border: "#8b5cf6", color: "#7c3aed", light: "#ede9fe", emoji: "🔷" },
  { bg: "#fdf4ff", border: "#d946ef", color: "#c026d3", light: "#fae8ff", emoji: "🌸" },
];
const getColor = (idx) => PALETA[idx % PALETA.length];

const inputStyle = {
  width: "100%", padding: "9px 12px", border: "1.5px solid #d1d5db",
  borderRadius: 8, fontSize: 14, color: "#0f172a", background: "#fff",
  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};
const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 700, color: "#475569",
  marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px",
};

const ActividadProyectoModal = ({
  isOpen, onClose, onSuccess, proyecto, actividad = null,
}) => {
  const isEdit = !!actividad;

  const [catalogo,            setCatalogo]            = useState([]);
  const [clientes,            setClientes]            = useState([]);
  const [personas,            setPersonas]            = useState([]);
  const [intervencionesLista, setIntervencionesLista] = useState([]);
  const [loadData,            setLoadData]            = useState(false);
  const [loading,             setLoading]             = useState(false);
  const [errors,              setErrors]              = useState({});

  const [form, setForm] = useState({
    actividad_id:    "",
    intervencion:    "",   // ObjectId de la intervención
    cliente:         "",
    supervisor:      "",
    precio_unitario: "",
    cantidad_total:  "",
    observaciones:   "",
  });

  const total = (Number(form.precio_unitario) || 0) * (Number(form.cantidad_total) || 0);

  useEffect(() => {
    if (!isOpen) return;

    const cargar = async () => {
      try {
        setLoadData(true);
        const [aRes, cRes, pRes, iRes] = await Promise.all([
          getActividades(),
          getClientes(),
          getPersonal(),
          getIntervenciones(),
        ]);
        setCatalogo(aRes?.data?.data ?? []);
        setClientes(cRes?.data?.data ?? []);
        setPersonas(pRes?.data?.data ?? []);
        const lista = (iRes?.data?.data ?? iRes?.data ?? []).filter((i) => i.activo !== false);
        setIntervencionesLista(lista);

        // Al editar, rellenar el form
        if (isEdit && actividad) {
          setForm({
            actividad_id:    actividad.actividad?._id    ?? actividad.actividad    ?? "",
            intervencion:    actividad.intervencion?._id ?? actividad.intervencion ?? "",
            cliente:         actividad.cliente?._id      ?? actividad.cliente      ?? "",
            supervisor:      actividad.supervisor?._id   ?? actividad.supervisor   ?? "",
            precio_unitario: actividad.precio_unitario != null ? String(actividad.precio_unitario) : "",
            cantidad_total:  actividad.cantidad_total  != null ? String(actividad.cantidad_total)  : "",
            observaciones:   actividad.observaciones   ?? "",
          });
        } else {
          setForm({
            actividad_id: "", intervencion: "",
            cliente: "", supervisor: "",
            precio_unitario: "", cantidad_total: "", observaciones: "",
          });
        }
      } catch (e) {
        console.error("Error cargando datos:", e);
      } finally {
        setLoadData(false);
      }
    };
    cargar();
    setErrors({});
  }, [isOpen, actividad, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.actividad_id)  e.actividad_id  = "Selecciona una actividad del catálogo";
    if (!form.intervencion)  e.intervencion   = "Selecciona el tipo de intervención";
    if (!form.cantidad_total || Number(form.cantidad_total) <= 0)
      e.cantidad_total = "La cantidad total debe ser mayor a 0";
    if (form.precio_unitario !== "" && Number(form.precio_unitario) < 0)
      e.precio_unitario = "El precio no puede ser negativo";
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    try {
      setLoading(true);
      const payload = {
        proyecto:        proyecto._id,
        actividad:       form.actividad_id,
        intervencion:    form.intervencion,
        cliente:         form.cliente      || undefined,
        supervisor:      form.supervisor   || undefined,
        precio_unitario: Number(form.precio_unitario) || 0,
        cantidad_total:  Number(form.cantidad_total),
        observaciones:   form.observaciones || undefined,
      };

      if (isEdit) {
        await updateActividadProyecto(actividad._id, payload);
      } else {
        await createActividadProyecto(payload);
      }

      onSuccess?.();
      onClose?.();
    } catch (e) {
      const msg =
        e?.response?.data?.errors?.[0]?.message ??
        e?.response?.data?.message ??
        "Error guardando la actividad";
      setErrors({ _general: msg });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Color de la intervención seleccionada
  const intervIdx = intervencionesLista.findIndex((i) => i._id === form.intervencion);
  const col = intervIdx >= 0 ? getColor(intervIdx) : { bg: "#f8fafc", border: "#e2e8f0", color: "#64748b", light: "#f1f5f9", emoji: "📦" };
  const actSeleccionada = catalogo.find((a) => a._id === form.actividad_id);

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(580px, calc(100% - 24px))", background: "#fff", borderRadius: 16, boxShadow: "0 24px 64px rgba(15,23,42,0.22)", display: "flex", flexDirection: "column", maxHeight: "92vh", overflowY: "auto" }}
      >
        {/* HEADER */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f0f2f5", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: col.light, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
              {col.emoji}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                {isEdit ? "✏️ Editar Actividad" : "➕ Nueva Actividad del Proyecto"}
              </h3>
              <p style={{ margin: "3px 0 0", fontSize: 13, color: "#64748b" }}>
                Proyecto: <strong>{proyecto?.codigo}</strong> · {proyecto?.nombre}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #e6e8ef", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, color: "#64748b", flexShrink: 0 }}>
            ×
          </button>
        </div>

        {/* BODY */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

          {errors._general && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626", display: "flex", alignItems: "center", gap: 8 }}>
              <AlertCircle size={14} /> {errors._general}
            </div>
          )}

          {/* Tipo de intervención — dinámico */}
          <div>
            <label style={labelStyle}>Tipo de intervención *</label>
            {loadData ? (
              <div style={{ padding: "9px 12px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#94a3b8" }}>
                Cargando intervenciones...
              </div>
            ) : intervencionesLista.length === 0 ? (
              <div style={{ padding: "10px 14px", background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 8, fontSize: 13, color: "#92400e", display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle size={14} /> No hay intervenciones en el catálogo.
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {intervencionesLista.map((interv, idx) => {
                  const c = getColor(idx);
                  const sel = form.intervencion === interv._id;
                  return (
                    <button
                      key={interv._id}
                      type="button"
                      onClick={() => { setForm((p) => ({ ...p, intervencion: interv._id })); if (errors.intervencion) setErrors((p) => ({ ...p, intervencion: null })); }}
                      style={{ flex: "1 1 auto", minWidth: 120, padding: "9px 8px", border: sel ? `2px solid ${c.border}` : "1.5px solid #e2e8f0", borderRadius: 9, background: sel ? c.bg : "#f8fafc", color: sel ? c.color : "#64748b", fontWeight: sel ? 700 : 500, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, transition: "all 0.15s" }}
                    >
                      <span>{c.emoji}</span>
                      <span style={{ fontSize: 12 }}>{interv.nombre}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {errors.intervencion && (
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>{errors.intervencion}</p>
            )}
          </div>

          {/* Actividad del catálogo */}
          <div>
            <label style={labelStyle}><Package size={12} style={{ marginRight: 4 }} /> Actividad del catálogo *</label>
            {loadData ? (
              <div style={{ padding: "9px 12px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#94a3b8" }}>Cargando actividades...</div>
            ) : (
              <select name="actividad_id" value={form.actividad_id} onChange={handleChange} style={{ ...inputStyle, border: errors.actividad_id ? "1.5px solid #dc2626" : "1.5px solid #d1d5db", cursor: "pointer" }}>
                <option value="">— Selecciona una actividad —</option>
                {catalogo.map((a) => (
                  <option key={a._id} value={a._id}>{a.nombre} ({a.unidad_medida}) — {a.codigo}</option>
                ))}
              </select>
            )}
            {errors.actividad_id && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>{errors.actividad_id}</p>}
            {actSeleccionada && (
              <div style={{ marginTop: 8, padding: "8px 12px", background: col.bg, border: `1px solid ${col.border}33`, borderRadius: 8, fontSize: 12, color: col.color, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <span><strong>Categoría:</strong> {actSeleccionada.categoria}</span>
                <span><strong>Unidad:</strong> {actSeleccionada.unidad_medida}</span>
                {actSeleccionada.rendimiento_diario_estimado && (
                  <span><strong>Rendimiento:</strong> {actSeleccionada.rendimiento_diario_estimado}/día</span>
                )}
              </div>
            )}
          </div>

          {/* Cantidad + Precio */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}><Hash size={11} style={{ marginRight: 4 }} /> Cantidad total *</label>
              <input type="number" name="cantidad_total" min="0.01" step="0.01" placeholder="Ej: 500" value={form.cantidad_total} onChange={handleChange} style={{ ...inputStyle, border: errors.cantidad_total ? "1.5px solid #dc2626" : "1.5px solid #d1d5db" }} />
              {errors.cantidad_total && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>{errors.cantidad_total}</p>}
              {actSeleccionada && form.cantidad_total && (
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "#64748b" }}>{form.cantidad_total} {actSeleccionada.unidad_medida}</p>
              )}
            </div>
            <div>
              <label style={labelStyle}><DollarSign size={11} style={{ marginRight: 4 }} /> Precio unitario</label>
              <input type="number" name="precio_unitario" min="0" step="0.01" placeholder="Ej: 85000" value={form.precio_unitario} onChange={handleChange} style={{ ...inputStyle, border: errors.precio_unitario ? "1.5px solid #dc2626" : "1.5px solid #d1d5db" }} />
              {errors.precio_unitario && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>{errors.precio_unitario}</p>}
            </div>
          </div>

          {/* Total calculado */}
          {total > 0 && (
            <div style={{ background: "linear-gradient(135deg, #f0faf4, #e8f5ee)", border: "1.5px solid rgba(31,143,87,0.3)", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1f8f57" }}>💰 Valor total de la actividad</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: "#1f8f57" }}>{fmtMoney(total)}</span>
            </div>
          )}

          {/* Cliente + Supervisor */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Cliente</label>
              <select name="cliente" value={form.cliente} onChange={handleChange} style={{ ...inputStyle, cursor: "pointer" }} disabled={loadData}>
                <option value="">Sin cliente</option>
                {clientes.map((c) => <option key={c._id} value={c._id}>{c.nombre || c.razon_social || "Cliente"}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Supervisor</label>
              <select name="supervisor" value={form.supervisor} onChange={handleChange} style={{ ...inputStyle, cursor: "pointer" }} disabled={loadData}>
                <option value="">Sin supervisor</option>
                {personas.map((p) => <option key={p._id} value={p._id}>{`${p.nombres ?? ""} ${p.apellidos ?? ""}`.trim() || "Persona"}</option>)}
              </select>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label style={labelStyle}>Observaciones</label>
            <textarea name="observaciones" value={form.observaciones} onChange={handleChange} placeholder="Notas adicionales..." rows={2} style={{ ...inputStyle, resize: "vertical", minHeight: 60 }} />
          </div>

          {isEdit && actividad?.estado === "CERRADA" && (
            <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626", display: "flex", alignItems: "center", gap: 8 }}>
              🔒 Esta actividad está <strong>CERRADA</strong> — solo puedes aumentar la cantidad total.
            </div>
          )}
          {isEdit && (
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#64748b" }}>
              <strong>Asignado actualmente:</strong> {actividad?.cantidad_asignada ?? 0} de {actividad?.cantidad_total ?? 0}
              {" · "}
              <strong>Disponible:</strong> {(actividad?.cantidad_total ?? 0) - (actividad?.cantidad_asignada ?? 0)}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid #f0f2f5", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} disabled={loading} style={{ background: "#f1f5f9", color: "#475569", border: "none", padding: "10px 20px", borderRadius: 9, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={loading} style={{ background: loading ? "#94a3b8" : "#1f8f57", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 9, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontSize: 14, boxShadow: loading ? "none" : "0 4px 12px rgba(31,143,87,0.25)" }}>
            {loading ? "Guardando..." : isEdit ? "Guardar Cambios" : "Agregar Actividad"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActividadProyectoModal;