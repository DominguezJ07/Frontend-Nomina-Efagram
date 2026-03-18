import { useEffect, useMemo, useState } from "react";
import { createProyecto, updateProyecto } from "../services/proyectosService";
import { getPersonas } from "../../../personal/services/personalService";
import { getZonas } from "../../territorial/services/zonas.service";
import ActividadesIntervencion from "./ActividadesIntervencion";
import {
  Folder, Calendar, User, Tag, TrendingUp,
  FileText, Pencil, DollarSign, MapPin, PlusCircle
} from "lucide-react";

// ══════════════════════════════════════════════════════════
// HELPERS (TODO IGUAL)
// ══════════════════════════════════════════════════════════
const toDateInput = (iso) => (iso ? iso.slice(0, 10) : "");

const fmtFecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("es-CO", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "—";

const fmtMonto = (n) =>
  n != null ? "$ " + Number(n).toLocaleString("es-CO") : "—";

const ESTADO_LABEL = {
  ACTIVO: "Activo", PLANEADO: "Planeado", FINALIZADO: "Finalizado",
  SUSPENDIDO: "Suspendido", CERRADO: "Cerrado",
  EN_NEGOCIACION: "En negociación", CANCELADO: "Cancelado",
};

const ESTADO_COLOR = {
  ACTIVO:        { bg: "rgba(31,143,87,0.1)",  border: "rgba(31,143,87,0.3)",  color: "#1f8f57" },
  PLANEADO:      { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)", color: "#3b82f6" },
  CERRADO:       { bg: "rgba(100,116,139,0.1)",border: "rgba(100,116,139,0.3)",color: "#64748b" },
  CANCELADO:     { bg: "rgba(220,38,38,0.1)",  border: "rgba(220,38,38,0.3)",  color: "#dc2626" },
  SUSPENDIDO:    { bg: "rgba(234,179,8,0.1)",  border: "rgba(234,179,8,0.3)",  color: "#ca8a04" },
  EN_NEGOCIACION:{ bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.3)", color: "#7c3aed" },
};

const INTERVENCION_COLOR = {
  mantenimiento:  { bg: "#f0faf4", border: "#1f8f57", color: "#1f8f57" },
  no_programadas: { bg: "#eff6ff", border: "#3b82f6", color: "#1d4ed8" },
  establecimiento:{ bg: "#fff5f5", border: "#ef4444", color: "#dc2626" },
};

const CONTRATO_LABEL = {
  FIJO_TODO_COSTO: "Fijo todo costo", ADMINISTRACION: "Administración",
  VARIABLE: "Variable", CONTRATO_ESPECIAL: "Contrato especial", OTRO: "Otro",
};

const TIPO_EMOJI = {
  mantenimiento: "🔧", no_programadas: "⚡", establecimiento: "🌱",
};

// ── Info row para modo ver ──
const InfoRow = ({ icon, label, value }) => {
  const Icon = icon;
  return (
    <div
      style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        padding: "10px 0", borderBottom: "1px solid #f0f2f5",
      }}
    >
      <div
        style={{
          width: 32, height: 32, borderRadius: 8, background: "#f8fafc",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginTop: 1,
        }}
      >
        <Icon size={15} color="#64748b" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0, fontSize: 11, color: "#94a3b8", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 2,
          }}
        >
          {label}
        </p>
        <p style={{ margin: 0, fontSize: 14, color: "#0f172a", fontWeight: 500 }}>
          {value}
        </p>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════
const ProyectoModal = ({
  isOpen,
  onClose,
  onSuccess,
  proyecto = null,
  modo = "crear",
}) => {
  const modoEditar = modo === "editar";
  const modoVer    = modo === "ver";

  const [personas,     setPersonas]     = useState([]);
  const [zonas,        setZonas]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [loadingData,  setLoadingData]  = useState(false);
  const [intervenciones, setIntervenciones] = useState([]);

  const initialForm = useMemo(() => ({
    codigo: "", nombre: "", responsable: "", zona: "",
    fecha_inicio: "", fecha_fin_estimada: "",
    tipo_contrato: "FIJO_TODO_COSTO", avance: 0, descripcion: "",
  }), []);

  const [form, setForm] = useState(initialForm);

  // ── Cargar datos al abrir ──
  useEffect(() => {
    if (!isOpen) return;

    if ((modoEditar || modoVer) && proyecto) {
      setForm({
        codigo:            proyecto.codigo               ?? "",
        nombre:            proyecto.nombre               ?? "",
        responsable:       proyecto.responsable?._id     ?? proyecto.responsable ?? "",
        zona:              proyecto.zona?._id            ?? proyecto.zona ?? "",
        fecha_inicio:      toDateInput(proyecto.fecha_inicio),
        fecha_fin_estimada:toDateInput(proyecto.fecha_fin_estimada),
        tipo_contrato:     proyecto.tipo_contrato        ?? "FIJO_TODO_COSTO",
        avance:            proyecto.avance               ?? 0,
        descripcion:       proyecto.descripcion          ?? "",
      });

      const bloquesMigrados = [];
      const api = proyecto.actividades_por_intervencion ?? {};
      ["mantenimiento", "no_programadas", "establecimiento"].forEach((tipo) => {
        (api[tipo] ?? []).forEach((act) => {
          let bloque = bloquesMigrados.find(
            (b) => b.tipo === tipo && !b._migrated_closed
          );
          if (!bloque) {
            bloque = {
              _uid: `migrado-${tipo}-${bloquesMigrados.length}`,
              tipo,
              cliente_id: proyecto.cliente?._id ?? proyecto.cliente ?? "",
              supervisor_id: "",
              actividades: [],
              _migrated_closed: false,
            };
            bloquesMigrados.push(bloque);
          }
          bloque.actividades.push({
            catalogo_id: act._id ?? "",
            nombre: act.nombre,
            unidad: act.unidad ?? "",
            precio_unitario: act.precio_unitario ?? "",
            cantidad: act.cantidad ?? "",
          });
        });
      });
      setIntervenciones(bloquesMigrados);
    } else {
      setForm(initialForm);
      setIntervenciones([]);
    }

    if (!modoVer) {
      const cargar = async () => {
        try {
          setLoadingData(true);
          const [pRes, zRes] = await Promise.all([getPersonas(), getZonas()]);
          const pd = pRes?.data?.data ?? pRes?.data ?? [];
          setPersonas(Array.isArray(pd) ? pd : []);
          const zd = zRes?.data ?? zRes ?? [];
          setZonas(Array.isArray(zd) ? zd : []);
        } catch {
          setPersonas([]);
          setZonas([]);
        } finally {
          setLoadingData(false);
        }
      };
      cargar();
    }
  }, [isOpen, modo, proyecto, modoEditar, modoVer, initialForm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "avance" ? Number(value) : value,
    }));
  };

  const buildPayload = () => {
    const actividadesPorIntervencion = {
      mantenimiento:  [],
      no_programadas: [],
      establecimiento:[],
    };

    let clienteId = "";

    intervenciones.forEach((bloque) => {
      if (!clienteId && bloque.cliente_id) clienteId = bloque.cliente_id;

      bloque.actividades.forEach((act) => {
        actividadesPorIntervencion[bloque.tipo]?.push({
          nombre: act.nombre,
          precio_unitario: Number(act.precio_unitario) || 0,
          cantidad: Number(act.cantidad) || 0,
          unidad: act.unidad || "UNIDAD",
          estado: "Pendiente",
          supervisor_id: bloque.supervisor_id || undefined,
          cliente_id_bloque: bloque.cliente_id || undefined,
        });
      });
    });

    return {
      ...form,
      codigo: form.codigo.trim().toUpperCase(),
      nombre: form.nombre.trim(),
      zona: form.zona || undefined,
      cliente: clienteId,
      actividades_por_intervencion: actividadesPorIntervencion,
    };
  };

  const handleSubmit = async () => {
    if (!form.codigo.trim()) return alert("Código obligatorio");
    if (!form.nombre.trim()) return alert("Nombre obligatorio");

    const algTieneCliente = intervenciones.some((b) => b.cliente_id);
    if (intervenciones.length > 0 && !algTieneCliente) {
      return alert("Al menos una intervención debe tener un cliente asignado");
    }

    try {
      setLoading(true);
      const payload = buildPayload();

      if (!payload.cliente) {
        return alert("Debes asignar un cliente en al menos una intervención");
      }

      let proyectoId;

      if (modoEditar) {
        await updateProyecto(proyecto._id, payload);
        proyectoId = proyecto._id;
        alert("Proyecto actualizado correctamente");
      } else {
        const res = await createProyecto(payload);
        proyectoId = res?.data?.data?._id;
        alert("Proyecto creado correctamente");
      }

      if (proyectoId) {
        for (const bloque of intervenciones) {
          for (const act of bloque.actividades) {
            if (!act.catalogo_id) continue;
            try {
              await import("../services/subproyectosService").then(({ createActividadProyecto }) =>
                createActividadProyecto({
                  proyecto:        proyectoId,
                  actividad:       act.catalogo_id,
                  intervencion:    bloque.tipo,
                  cliente:         bloque.cliente_id   || undefined,
                  supervisor:      bloque.supervisor_id || undefined,
                  precio_unitario: Number(act.precio_unitario) || 0,
                  cantidad_total:  Number(act.cantidad)        || 1,
                  unidad:          act.unidad || "UNIDAD",
                })
              );
            } catch (e) {
              if (!e?.response?.data?.message?.includes("duplicate")) {
                console.warn("No se pudo sincronizar actividad:", act.nombre, e?.response?.data?.message);
              }
            }
          }
        }
      }

      onSuccess?.();
      onClose?.();
    } catch (err) {
      alert(err?.response?.data?.message ?? "Error guardando el proyecto");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // ══════════════════════════════════════════════════════
  // MODO VER - CON SCROLL ARREGLADO
  // ══════════════════════════════════════════════════════
  if (modoVer && proyecto) {
    const estado      = proyecto.estado?.toUpperCase();
    const estadoStyle = ESTADO_COLOR[estado] ?? { bg: "#f8fafc", border: "#e6e8ef", color: "#475569" };
    const avance      = proyecto.avance ?? 0;

    const apiInter = proyecto.actividades_por_intervencion ?? {};
    const interEntries = Object.entries(apiInter).filter(
      ([, arr]) => Array.isArray(arr) && arr.length > 0
    );

    const presupuesto    = proyecto.presupuesto_por_intervencion ?? {};
    const totalPresupuesto = Object.values(presupuesto).reduce(
      (acc, p) => acc + (p?.monto_presupuestado ?? 0),
      0
    );

    const clienteNombre =
      proyecto.cliente?.nombre ??
      proyecto.cliente?.razon_social ??
      "Sin cliente";

    const responsableNombre = proyecto.responsable
      ? (`${proyecto.responsable.nombres ?? ""} ${proyecto.responsable.apellidos ?? ""}`).trim() || "—"
      : "—";

    return (
      <div className="modal-overlay">
        <div
          style={{
            width: "min(680px, calc(100% - 24px))",
            background: "#fff",
            border: "1px solid #e6e8ef",
            borderRadius: 18,
            boxShadow: "0 24px 64px rgba(15,23,42,0.22)",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* HEADER - FIJO */}
          <div
            style={{
              padding: "22px 24px 18px",
              borderBottom: "1px solid #f0f2f5",
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 48, height: 48, borderRadius: 12, background: "#e8f5ee",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
            >
              <Folder size={24} color="#1f8f57" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
                  {proyecto.nombre}
                </h2>
                <span
                  style={{
                    display: "inline-flex", alignItems: "center",
                    padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                    border: `1.5px solid ${estadoStyle.border}`,
                    background: estadoStyle.bg, color: estadoStyle.color,
                  }}
                >
                  {ESTADO_LABEL[estado] ?? proyecto.estado}
                </span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                <strong style={{ color: "#475569" }}>{proyecto.codigo}</strong> · {clienteNombre}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "#f8fafc", border: "1px solid #e6e8ef", borderRadius: 8,
                width: 34, height: 34, display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer", flexShrink: 0,
                fontSize: 18, color: "#64748b", lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* BODY - CON SCROLL */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >

            {/* Avance */}
            <div
              style={{
                background: "#f8fafc", borderRadius: 12, padding: "16px 20px",
                border: "1px solid #e6e8ef",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <TrendingUp size={16} color="#1f8f57" />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Avance del proyecto</span>
                </div>
                <span
                  style={{
                    fontSize: 22, fontWeight: 900,
                    color: avance >= 80 ? "#1f8f57" : avance >= 40 ? "#e67e22" : "#0f172a",
                  }}
                >
                  {avance}%
                </span>
              </div>
              <div
                style={{
                  width: "100%", height: 10, background: "#e2e8f0",
                  borderRadius: 999, overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${avance}%`,
                    background:
                      avance >= 80
                        ? "linear-gradient(90deg,#1f8f57,#2bb673)"
                        : avance >= 40
                        ? "linear-gradient(90deg,#e67e22,#f39c12)"
                        : "linear-gradient(90deg,#3b82f6,#60a5fa)",
                    borderRadius: 999,
                    minWidth: 4,
                  }}
                />
              </div>
            </div>

            {/* Info general */}
            <div>
              <p
                style={{
                  margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "#475569",
                  textTransform: "uppercase", letterSpacing: "0.5px",
                }}
              >
                Información general
              </p>
              <InfoRow icon={User}     label="Cliente"            value={clienteNombre} />
              <InfoRow icon={User}     label="Responsable"        value={responsableNombre} />
              <InfoRow icon={MapPin}   label="Zona"               value={proyecto.zona?.nombre ?? proyecto.zona ?? "Sin zona"} />
              <InfoRow icon={Tag}      label="Tipo de contrato"   value={CONTRATO_LABEL[proyecto.tipo_contrato] ?? proyecto.tipo_contrato ?? "—"} />
              <InfoRow icon={Calendar} label="Fecha de inicio"    value={fmtFecha(proyecto.fecha_inicio)} />
              <InfoRow icon={Calendar} label="Fecha fin estimada" value={fmtFecha(proyecto.fecha_fin_estimada)} />
              {proyecto.fecha_fin_real && (
                <InfoRow icon={Calendar} label="Fecha fin real" value={fmtFecha(proyecto.fecha_fin_real)} />
              )}
              {proyecto.descripcion && (
                <InfoRow icon={FileText} label="Descripción" value={proyecto.descripcion} />
              )}
            </div>

            {/* Intervenciones */}
            {interEntries.length > 0 && (
              <div>
                <p
                  style={{
                    margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#475569",
                    textTransform: "uppercase", letterSpacing: "0.5px",
                  }}
                >
                  Intervenciones
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {interEntries.map(([tipo, acts]) => {
                    const col  = INTERVENCION_COLOR[tipo] ?? { bg: "#f8fafc", border: "#e6e8ef", color: "#475569" };
                    const pres = presupuesto[tipo];
                    return (
                      <div
                        key={tipo}
                        style={{
                          background: col.bg, border: `1.5px solid ${col.border}`,
                          borderRadius: 12, padding: "14px 16px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex", alignItems: "center",
                            justifyContent: "space-between", marginBottom: 10,
                          }}
                        >
                          <span style={{ fontSize: 14, fontWeight: 700, color: col.color }}>
                            {TIPO_EMOJI[tipo]} {tipo.replace(/_/g, " ").charAt(0).toUpperCase() + tipo.replace(/_/g, " ").slice(1)}
                          </span>
                          <span style={{ fontSize: 13, color: col.color, fontWeight: 600 }}>
                            {acts.length} actividad{acts.length !== 1 ? "es" : ""}
                            {pres?.monto_presupuestado
                              ? ` · ${fmtMonto(pres.monto_presupuestado)}`
                              : ""}
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {acts.map((act, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex", justifyContent: "space-between",
                                alignItems: "center", background: "#fff",
                                borderRadius: 8, padding: "8px 12px", fontSize: 13,
                              }}
                            >
                              <span style={{ color: "#0f172a", fontWeight: 500 }}>
                                {act.nombre}
                              </span>
                              <div style={{ display: "flex", gap: 12, color: "#64748b", flexShrink: 0 }}>
                                <span>{act.cantidad} {act.unidad ?? ""}</span>
                                {act.precio_unitario > 0 && (
                                  <span style={{ fontWeight: 600, color: "#0f172a" }}>
                                    {fmtMonto(act.precio_unitario)}
                                  </span>
                                )}
                                {act.precio_unitario > 0 && act.cantidad > 0 && (
                                  <span style={{ fontWeight: 700, color: col.color }}>
                                    = {fmtMonto(act.precio_unitario * act.cantidad)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalPresupuesto > 0 && (
                  <div
                    style={{
                      marginTop: 12, padding: "12px 16px",
                      background: "#f0faf4", borderRadius: 10,
                      border: "1px solid rgba(31,143,87,0.2)",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1f8f57" }}>
                      Total presupuestado
                    </span>
                    <span style={{ fontSize: 18, fontWeight: 900, color: "#1f8f57" }}>
                      {fmtMonto(totalPresupuesto)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {interEntries.length === 0 && (
              <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 14, margin: 0 }}>
                Este proyecto no tiene intervenciones registradas.
              </p>
            )}
          </div>

          {/* FOOTER - FIJO */}
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #f0f2f5",
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <button
              onClick={onClose}
              style={{
                background: "#f1f5f9", color: "#475569", border: "none",
                padding: "10px 18px", borderRadius: 10, fontWeight: 700,
                cursor: "pointer", fontSize: 14,
              }}
            >
              Cerrar
            </button>
            <button
              onClick={() => onSuccess?.("editar")}
              style={{
                background: "#1f8f57", color: "#fff", border: "none",
                padding: "10px 20px", borderRadius: 10, fontWeight: 700,
                cursor: "pointer", fontSize: 14,
                display: "flex", alignItems: "center", gap: 8,
                boxShadow: "0 4px 12px rgba(31,143,87,0.25)",
              }}
            >
              <Pencil size={15} /> Editar proyecto
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // MODO CREAR / EDITAR - CON SCROLL ARREGLADO
  // ══════════════════════════════════════════════════════
  return (
    <div className="modal-overlay">
      <div
        className="modal modal-proyecto"
        style={{
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >

        {/* HEADER - FIJO */}
        <div
          style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 20,
            flexShrink: 0,
          }}
        >
          <div>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 7, background: modoEditar ? 'rgba(234,179,8,0.12)' : 'rgba(99,102,241,0.12)' }}>
                {modoEditar ? <Pencil size={14} color="#ca8a04" /> : <PlusCircle size={14} color="#6366f1" />}
              </span>
              {modoEditar ? "Editar Proyecto" : "Nuevo Proyecto"}
            </h3>
            {modoEditar && (
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                {proyecto.codigo} · {proyecto.nombre}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", fontSize: 22,
              cursor: "pointer", color: "#94a3b8", lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* BODY - CON SCROLL */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <div style={{ paddingRight: "8px" }}>

            {/* Código */}
            <div className="form-group">
              <label>Código *</label>
              <input
                name="codigo"
                value={form.codigo}
                onChange={handleChange}
                placeholder="Ej: PRY-001"
                style={{ textTransform: "uppercase" }}
                disabled={modoEditar}
              />
              {modoEditar && (
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>
                  El código no puede modificarse después de la creación.
                </p>
              )}
            </div>

            {/* Nombre */}
            <div className="form-group">
              <label>Nombre del proyecto *</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre del proyecto"
              />
            </div>

            {/* Responsable */}
            <div className="form-group">
              <label>Responsable del proyecto</label>
              <select
                name="responsable"
                value={form.responsable}
                onChange={handleChange}
                disabled={loadingData}
              >
                <option value="">
                  {loadingData ? "Cargando..." : "Seleccione responsable (opcional)"}
                </option>
                {personas.map((p) => (
                  <option key={p._id} value={p._id}>
                    {`${p.nombres ?? ""} ${p.apellidos ?? ""}`.trim() || p.nombre || "Persona"}
                  </option>
                ))}
              </select>
            </div>

            {/* Zona */}
            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <MapPin size={13} /> Zona *
              </label>
              <select
                name="zona"
                value={form.zona}
                onChange={handleChange}
                disabled={loadingData}
              >
                <option value="">
                  {loadingData ? "Cargando..." : "— Seleccione una zona —"}
                </option>
                {zonas.map((z) => (
                  <option key={z._id} value={z._id}>
                    {z.nombre} {z.codigo ? `(${z.codigo})` : ""}
                  </option>
                ))}
              </select>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
                La zona determina los núcleos disponibles para los subproyectos.
              </p>
            </div>

            {/* Fechas */}
            <div className="modal-grid">
              <div className="form-group">
                <label>Fecha Inicio</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={form.fecha_inicio}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Fecha Fin Estimada</label>
                <input
                  type="date"
                  name="fecha_fin_estimada"
                  value={form.fecha_fin_estimada}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Tipo de contrato */}
            <div className="form-group">
              <label>Tipo de Contrato</label>
              <select name="tipo_contrato" value={form.tipo_contrato} onChange={handleChange}>
                <option value="FIJO_TODO_COSTO">Fijo todo costo</option>
                <option value="ADMINISTRACION">Administración</option>
                <option value="VARIABLE">Variable</option>
                <option value="CONTRATO_ESPECIAL">Contrato especial</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>

            {/* INTERVENCIONES */}
            <ActividadesIntervencion
              intervenciones={intervenciones}
              setIntervenciones={setIntervenciones}
            />

            {/* Descripción */}
            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción opcional..."
              />
            </div>

            {/* Avance */}
            <div className="form-group">
              <label>Avance: {form.avance}%</label>
              <input
                type="range"
                name="avance"
                min="0"
                max="100"
                value={form.avance}
                onChange={handleChange}
              />
            </div>

          </div>
        </div>

        {/* FOOTER - FIJO */}
        <div
          className="modal-buttons"
          style={{
            flexShrink: 0,
            marginTop: 20,
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: "#f1f5f9", color: "#475569", border: "none",
              padding: "12px 20px", borderRadius: 10, fontWeight: 700,
              cursor: "pointer", fontSize: 14,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: loading ? "#94a3b8" : "#1f8f57",
              color: "#fff", border: "none",
              padding: "12px 24px", borderRadius: 10, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", fontSize: 14,
              boxShadow: loading ? "none" : "0 4px 12px rgba(31,143,87,0.25)",
            }}
          >
            {loading ? "Guardando..." : modoEditar ? "Guardar Cambios" : "Crear Proyecto"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProyectoModal;