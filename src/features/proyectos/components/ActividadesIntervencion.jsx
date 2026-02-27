import { useState, useEffect, useCallback } from "react";
import { getActividades } from "../services/actividadesService";
import { getClientes } from "../services/Clientesservice";
import { getPersonal } from "../services/personalService";
import {
  Plus, Trash2, ChevronDown, ChevronUp, User,
  Package, DollarSign, Hash, AlertCircle, CheckCircle2
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const fmtMoney = (n) =>
  n != null && n > 0
    ? "$ " + Number(n).toLocaleString("es-CO", { minimumFractionDigits: 0 })
    : "$ 0";

const TIPO_COLOR = {
  mantenimiento:  { bg: "#f0faf4", border: "#1f8f57", accent: "#1f8f57", light: "#e8f5ee" },
  no_programadas: { bg: "#eff6ff", border: "#3b82f6", accent: "#1d4ed8", light: "#dbeafe" },
  establecimiento:{ bg: "#fff5f5", border: "#ef4444", accent: "#dc2626", light: "#fee2e2" },
};

const TIPO_EMOJI = {
  mantenimiento: "🔧",
  no_programadas: "⚡",
  establecimiento: "🌱",
};

// ─────────────────────────────────────────────────────────────
// Subcomponente: una instancia de intervención (bloque)
// ─────────────────────────────────────────────────────────────
const IntervencionBloque = ({
  bloque,
  index,
  tipoKey,
  clientes,
  actividadesCatalogo,
  onUpdate,
  onRemove,
  canRemove,
}) => {
  const col = TIPO_COLOR[tipoKey] ?? { bg: "#f8fafc", border: "#e6e8ef", accent: "#475569", light: "#f1f5f9" };
  const [expanded, setExpanded] = useState(true);

  // ── Totales del bloque ──
  const totalBloque = bloque.actividades.reduce(
    (sum, a) => sum + (Number(a.precio_unitario) || 0) * (Number(a.cantidad) || 0),
    0
  );

  const handleField = (field, value) => {
    onUpdate(index, { ...bloque, [field]: value });
  };

  // ── Agregar actividad desde catálogo ──
  const handleAddActividad = (actCatalogo) => {
    const yaExiste = bloque.actividades.some((a) => a.catalogo_id === actCatalogo._id);
    if (yaExiste) return; // no duplicar
    const nueva = {
      catalogo_id: actCatalogo._id,
      nombre: actCatalogo.nombre,
      unidad: actCatalogo.unidad_medida,
      precio_unitario: "",
      cantidad: "",
    };
    onUpdate(index, { ...bloque, actividades: [...bloque.actividades, nueva] });
  };

  // ── Actualizar campo de actividad ──
  const handleActField = (i, field, value) => {
    const copia = bloque.actividades.map((a, idx) =>
      idx === i ? { ...a, [field]: value } : a
    );
    onUpdate(index, { ...bloque, actividades: copia });
  };

  // ── Eliminar actividad ──
  const handleRemoveAct = (i) => {
    const copia = bloque.actividades.filter((_, idx) => idx !== i);
    onUpdate(index, { ...bloque, actividades: copia });
  };

  const actividadesNoAgregadas = actividadesCatalogo.filter(
    (ac) => !bloque.actividades.some((a) => a.catalogo_id === ac._id)
  );

  return (
    <div
      style={{
        border: `1.5px solid ${col.border}`,
        borderRadius: 14,
        background: col.bg,
        marginBottom: 14,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      {/* ── Cabecera bloque ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: col.light,
          borderBottom: expanded ? `1px solid ${col.border}` : "none",
          cursor: "pointer",
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>{TIPO_EMOJI[tipoKey]}</span>
          <span style={{ fontWeight: 700, color: col.accent, fontSize: 14 }}>
            {tipoKey.replace(/_/g, " ").charAt(0).toUpperCase() +
              tipoKey.replace(/_/g, " ").slice(1)}{" "}
            #{index + 1}
          </span>
          {totalBloque > 0 && (
            <span
              style={{
                background: col.accent,
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 999,
              }}
            >
              {fmtMoney(totalBloque)}
            </span>
          )}
          {bloque.actividades.length > 0 && (
            <span
              style={{
                background: "rgba(0,0,0,0.08)",
                color: col.accent,
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: 999,
              }}
            >
              {bloque.actividades.length} act.
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {canRemove && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(index); }}
              style={{
                background: "rgba(220,38,38,0.1)",
                border: "1px solid rgba(220,38,38,0.25)",
                color: "#dc2626",
                width: 28,
                height: 28,
                borderRadius: 7,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Trash2 size={13} />
            </button>
          )}
          {expanded ? <ChevronUp size={16} color={col.accent} /> : <ChevronDown size={16} color={col.accent} />}
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "16px 16px 18px" }}>

          {/* ── Cliente ── */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>
              <User size={12} /> Cliente *
            </label>
            <select
              value={bloque.cliente_id || ""}
              onChange={(e) => handleField("cliente_id", e.target.value)}
              style={selectStyle(col)}
            >
              <option value="">Seleccione cliente</option>
              {clientes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.nombre || c.razon_social || c.razonSocial || "Cliente"}
                </option>
              ))}
            </select>
          </div>

          {/* ── Selector de actividades del catálogo ── */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ ...labelStyle, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <Package size={12} /> Actividades disponibles — haz clic para agregar
            </label>
            {actividadesNoAgregadas.length === 0 && actividadesCatalogo.length === 0 ? (
              <div style={{ padding: "10px 14px", background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 8, fontSize: 13, color: "#92400e", display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle size={14} /> No hay actividades en el catálogo. Crea actividades primero.
              </div>
            ) : actividadesNoAgregadas.length === 0 ? (
              <div style={{ padding: "10px 14px", background: "#f0faf4", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: 13, color: "#166534", display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={14} /> Todas las actividades han sido agregadas.
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {actividadesNoAgregadas.map((ac) => (
                  <button
                    key={ac._id}
                    type="button"
                    onClick={() => handleAddActividad(ac)}
                    style={{
                      background: "#fff",
                      border: `1.5px solid ${col.border}`,
                      color: col.accent,
                      borderRadius: 8,
                      padding: "5px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = col.light;
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <Plus size={11} /> {ac.nombre}
                    <span style={{ fontSize: 10, opacity: 0.6, fontWeight: 400 }}>
                      ({ac.unidad_medida})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Lista de actividades seleccionadas ── */}
          {bloque.actividades.length > 0 && (
            <div>
              <label style={{ ...labelStyle, marginBottom: 8 }}>Actividades seleccionadas</label>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e6e8ef",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                {/* Cabecera tabla */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 110px 100px 110px 32px",
                    gap: 8,
                    padding: "8px 12px",
                    background: "#f8fafc",
                    borderBottom: "1px solid #e6e8ef",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.4px",
                  }}
                >
                  <span>Actividad</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <DollarSign size={10} /> Precio unit.
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Hash size={10} /> Cantidad
                  </span>
                  <span>Total</span>
                  <span></span>
                </div>

                {bloque.actividades.map((act, i) => {
                  const total =
                    (Number(act.precio_unitario) || 0) * (Number(act.cantidad) || 0);
                  return (
                    <div
                      key={i}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 110px 100px 110px 32px",
                        gap: 8,
                        padding: "9px 12px",
                        borderBottom:
                          i < bloque.actividades.length - 1
                            ? "1px solid #f0f2f5"
                            : "none",
                        alignItems: "center",
                      }}
                    >
                      {/* Nombre actividad (solo lectura) */}
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                          {act.nombre}
                        </p>
                        <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>
                          {act.unidad}
                        </p>
                      </div>

                      {/* Precio */}
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={act.precio_unitario}
                        onChange={(e) => handleActField(i, "precio_unitario", e.target.value)}
                        style={inputNumStyle}
                      />

                      {/* Cantidad */}
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={act.cantidad}
                        onChange={(e) => handleActField(i, "cantidad", e.target.value)}
                        style={inputNumStyle}
                      />

                      {/* Total calculado */}
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: total > 0 ? col.accent : "#94a3b8",
                        }}
                      >
                        {fmtMoney(total)}
                      </span>

                      {/* Eliminar */}
                      <button
                        type="button"
                        onClick={() => handleRemoveAct(i)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#ef4444",
                          padding: 4,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 6,
                          opacity: 0.7,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}

                {/* Total bloque */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    background: col.light,
                    borderTop: `1.5px solid ${col.border}`,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: col.accent }}>
                    Total intervención #{index + 1}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: col.accent }}>
                    {fmtMoney(totalBloque)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Estilos inline reutilizables
// ─────────────────────────────────────────────────────────────
const labelStyle = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  fontSize: 12,
  fontWeight: 700,
  color: "#475569",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.4px",
};

const selectStyle = (col) => ({
  width: "100%",
  padding: "9px 12px",
  border: `1.5px solid ${col?.border ?? "#e6e8ef"}`,
  borderRadius: 9,
  fontSize: 13,
  color: "#0f172a",
  background: "#fff",
  outline: "none",
  cursor: "pointer",
  appearance: "auto",
});

const inputNumStyle = {
  width: "100%",
  padding: "7px 10px",
  border: "1.5px solid #e6e8ef",
  borderRadius: 8,
  fontSize: 13,
  color: "#0f172a",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
};

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// Props:
//   intervenciones: [ { tipo, bloqueid, cliente_id, supervisor_id, actividades:[] } ]
//   setIntervenciones: fn
// ─────────────────────────────────────────────────────────────
const TIPOS_DISPONIBLES = ["mantenimiento", "no_programadas", "establecimiento"];

const TIPO_LABEL = {
  mantenimiento: "Mantenimiento",
  no_programadas: "No programadas",
  establecimiento: "Establecimiento",
};

let _uid = 0;
const uid = () => `blq-${++_uid}-${Date.now()}`;

const ActividadesIntervencion = ({ intervenciones = [], setIntervenciones }) => {
  const [clientes,  setClientes]  = useState([]);
  const [personas,  setPersonas]  = useState([]);
  const [catalogo,  setCatalogo]  = useState([]);
  const [loadData,  setLoadData]  = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoadData(true);
        const [cRes, pRes, aRes] = await Promise.all([
          getClientes(),
          getPersonal(),
          getActividades(),
        ]);
        setClientes(cRes?.data?.data ?? cRes?.data ?? []);
        setPersonas(pRes?.data?.data ?? pRes?.data ?? []);
        setCatalogo(aRes?.data?.data ?? aRes?.data ?? []);
      } catch (e) {
        console.error("Error cargando datos de intervención:", e);
      } finally {
        setLoadData(false);
      }
    };
    cargar();
  }, []);

  // ── Agregar una nueva instancia de un tipo ──
  const agregarIntervencion = (tipo) => {
    const nuevo = {
      _uid: uid(),
      tipo,
      cliente_id: "",
      supervisor_id: "",
      actividades: [],
    };
    setIntervenciones((prev) => [...prev, nuevo]);
  };

  // ── Actualizar un bloque ──
  const actualizarBloque = useCallback((index, data) => {
    setIntervenciones((prev) => prev.map((b, i) => (i === index ? data : b)));
  }, [setIntervenciones]);

  // ── Eliminar un bloque ──
  const eliminarBloque = (index) => {
    setIntervenciones((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Total general ──
  const totalGeneral = intervenciones.reduce((sum, bloque) => {
    return (
      sum +
      bloque.actividades.reduce(
        (s, a) =>
          s + (Number(a.precio_unitario) || 0) * (Number(a.cantidad) || 0),
        0
      )
    );
  }, 0);

  return (
    <div style={{ marginBottom: 24 }}>
      {/* ── Encabezado sección ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 800,
              color: "#0f172a",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            🌿 Intervenciones
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>
            Agrega las intervenciones del proyecto. Puedes repetir tipos con diferentes supervisores.
          </p>
        </div>
        {totalGeneral > 0 && (
          <div
            style={{
              background: "linear-gradient(135deg, #1f8f57, #2bb673)",
              color: "#fff",
              padding: "6px 14px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 900,
              boxShadow: "0 4px 12px rgba(31,143,87,0.3)",
            }}
          >
            {fmtMoney(totalGeneral)}
          </div>
        )}
      </div>

      {/* ── Botones para agregar tipos ── */}
      <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>
        + Agregar intervención:
      </p>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        {TIPOS_DISPONIBLES.map((tipo) => {
          const col = TIPO_COLOR[tipo];
          const count = intervenciones.filter((b) => b.tipo === tipo).length;
          return (
            <button
              key={tipo}
              type="button"
              onClick={() => agregarIntervencion(tipo)}
              disabled={loadData}
              style={{
                background: col.bg,
                border: `1.5px solid ${col.border}`,
                color: col.accent,
                borderRadius: 9,
                padding: "7px 14px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = `0 4px 12px ${col.border}55`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span>{TIPO_EMOJI[tipo]}</span>
              {TIPO_LABEL[tipo]}
              {count > 0 && (
                <span
                  style={{
                    background: col.accent,
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 800,
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Indicador de carga ── */}
      {loadData && (
        <div
          style={{
            textAlign: "center",
            padding: "12px",
            color: "#64748b",
            fontSize: 13,
          }}
        >
          Cargando datos...
        </div>
      )}

      {/* ── Bloques de intervenciones ── */}
      {intervenciones.length === 0 && !loadData && (
        <div
          style={{
            textAlign: "center",
            padding: "28px 20px",
            background: "#f8fafc",
            border: "2px dashed #e2e8f0",
            borderRadius: 12,
            color: "#94a3b8",
            fontSize: 13,
          }}
        >
          <p style={{ margin: "0 0 6px", fontSize: 24 }}>🌿</p>
          <p style={{ margin: 0, fontWeight: 600 }}>
            Sin intervenciones aún. Usa los botones de arriba para agregar.
          </p>
        </div>
      )}

      {intervenciones.map((bloque, i) => (
        <IntervencionBloque
          key={bloque._uid || i}
          bloque={bloque}
          index={i}
          tipoKey={bloque.tipo}
          clientes={clientes}
          personas={personas}
          actividadesCatalogo={catalogo}
          onUpdate={actualizarBloque}
          onRemove={eliminarBloque}
          canRemove={intervenciones.length > 0}
        />
      ))}

      {/* ── Total general si hay múltiples bloques ── */}
      {intervenciones.length > 1 && totalGeneral > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 18px",
            background: "linear-gradient(135deg, #f0faf4, #e8f5ee)",
            border: "1.5px solid rgba(31,143,87,0.3)",
            borderRadius: 12,
            marginTop: 4,
          }}
        >
          <span
            style={{ fontSize: 14, fontWeight: 800, color: "#1f8f57" }}
          >
            💰 Total general del proyecto
          </span>
          <span
            style={{ fontSize: 20, fontWeight: 900, color: "#1f8f57" }}
          >
            {fmtMoney(totalGeneral)}
          </span>
        </div>
      )}
    </div>
  );
};

export default ActividadesIntervencion;