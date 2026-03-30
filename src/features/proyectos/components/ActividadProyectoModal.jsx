import { useEffect, useMemo, useState } from "react";
import { createProyecto, updateProyecto } from "../services/proyectosService";
import { getPersonas } from "../services/personalService";
import { getZonas } from "../../territorial/services/zonas.service";
import ActividadesIntervencion from "./ActividadesIntervencion";
import {
  Folder,
  Calendar,
  User,
  Tag,
  TrendingUp,
  FileText,
  Pencil,
  MapPin,
  PlusCircle,
  AlertCircle,
} from "lucide-react";

const toDateInput = (iso) => (iso ? iso.slice(0, 10) : "");

const fmtFecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

const fmtMonto = (n) =>
  n != null ? "$ " + Number(n).toLocaleString("es-CO") : "—";

const ESTADO_LABEL = {
  ACTIVO: "Activo",
  PLANEADO: "Planeado",
  FINALIZADO: "Finalizado",
  SUSPENDIDO: "Suspendido",
  CERRADO: "Cerrado",
  EN_NEGOCIACION: "En negociación",
  CANCELADO: "Cancelado",
};

const ESTADO_COLOR = {
  ACTIVO: { bg: "rgba(31,143,87,0.1)", border: "rgba(31,143,87,0.3)", color: "#1f8f57" },
  PLANEADO: { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)", color: "#3b82f6" },
  CERRADO: { bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.3)", color: "#64748b" },
  CANCELADO: { bg: "rgba(220,38,38,0.1)", border: "rgba(220,38,38,0.3)", color: "#dc2626" },
  SUSPENDIDO: { bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.3)", color: "#ca8a04" },
  EN_NEGOCIACION: { bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.3)", color: "#7c3aed" },
};

const CONTRATO_LABEL = {
  FIJO_TODO_COSTO: "Fijo todo costo",
  ADMINISTRACION: "Administración",
  VARIABLE: "Variable",
  CONTRATO_ESPECIAL: "Contrato especial",
  OTRO: "Otro",
};

const getIntervencionStyle = (idx = 0) => {
  const palette = [
    { bg: "#f0faf4", border: "#1f8f57", color: "#1f8f57", emoji: "🌿" },
    { bg: "#eff6ff", border: "#3b82f6", color: "#1d4ed8", emoji: "💧" },
    { bg: "#fff5f5", border: "#ef4444", color: "#dc2626", emoji: "🌱" },
    { bg: "#fff7ed", border: "#f97316", color: "#ea580c", emoji: "🪵" },
    { bg: "#f5f3ff", border: "#8b5cf6", color: "#7c3aed", emoji: "🌾" },
    { bg: "#fdf4ff", border: "#d946ef", color: "#c026d3", emoji: "🍃" },
  ];
  return palette[idx % palette.length];
};

const ErrorBanner = ({ errors }) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div
      style={{
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: 8,
        padding: "12px 14px",
        marginBottom: 16,
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}>
        {errors.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 6,
              fontSize: 13,
              color: "#dc2626",
              marginBottom: i < errors.length - 1 ? 4 : 0,
            }}
          >
            <span style={{ flexShrink: 0 }}>•</span>
            <span>{msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProyectoModal = ({ isOpen, onClose, onSuccess, proyecto = null, modo = "crear" }) => {
  const modoEditar = modo === "editar";
  const modoVer = modo === "ver";

  const [personas, setPersonas] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [intervenciones, setIntervenciones] = useState([]);
  const [formErrors, setFormErrors] = useState([]);

  const initialForm = useMemo(
    () => ({
      codigo: "",
      nombre: "",
      responsable: "",
      zona: "",
      fecha_inicio: "",
      fecha_fin_estimada: "",
      tipo_contrato: "FIJO_TODO_COSTO",
      avance: 0,
      descripcion: "",
    }),
    []
  );

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!isOpen) return;

    setFormErrors([]);

    if ((modoEditar || modoVer) && proyecto) {
      setForm({
        codigo: proyecto.codigo ?? "",
        nombre: proyecto.nombre ?? "",
        responsable: proyecto.responsable?._id ?? proyecto.responsable ?? "",
        zona: proyecto.zona?._id ?? proyecto.zona ?? "",
        fecha_inicio: toDateInput(proyecto.fecha_inicio),
        fecha_fin_estimada: toDateInput(proyecto.fecha_fin_estimada),
        tipo_contrato: proyecto.tipo_contrato ?? "FIJO_TODO_COSTO",
        avance: proyecto.avance ?? 0,
        descripcion: proyecto.descripcion ?? "",
      });

      const bloquesMigrados = [];
      const api = proyecto.actividades_por_intervencion ?? {};

      Object.entries(api).forEach(([intervencionKey, acts], index) => {
        if (!Array.isArray(acts) || acts.length === 0) return;

        bloquesMigrados.push({
          _uid: `migrado-${intervencionKey}-${index}`,
          intervencion_id: intervencionKey,
          intervencion_nombre:
            acts?.[0]?.intervencion_nombre ||
            acts?.[0]?.intervencion?.nombre ||
            intervencionKey,
          cliente_id: proyecto.cliente?._id ?? proyecto.cliente ?? "",
          supervisor_id: "",
          actividades: acts.map((act) => ({
            catalogo_id:
              act.actividad?._id ??
              act.actividad_id ??
              act.catalogo_id ??
              act._id ??
              "",
            nombre: act.nombre ?? "",
            unidad: act.unidad ?? "",
            precio_unitario: act.precio_unitario ?? "",
            cantidad: act.cantidad ?? act.cantidad_total ?? "",
          })),
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
    setFormErrors([]);
    setForm((prev) => ({
      ...prev,
      [name]: name === "avance" ? Number(value) : value,
    }));
  };

  const buildPayload = () => {
    const actividadesPorIntervencion = {};
    let clienteId = "";

    intervenciones.forEach((bloque) => {
      if (!clienteId && bloque.cliente_id) clienteId = bloque.cliente_id;

      const key = bloque.intervencion_id ?? "sin_intervencion";
      if (!actividadesPorIntervencion[key]) {
        actividadesPorIntervencion[key] = [];
      }

      bloque.actividades.forEach((act) => {
        actividadesPorIntervencion[key].push({
          actividad_id: act.catalogo_id || undefined,
          nombre: act.nombre,
          precio_unitario: Number(act.precio_unitario) || 0,
          cantidad: Number(act.cantidad) || 0,
          unidad: act.unidad || "UNIDAD",
          estado: "Pendiente",
          supervisor_id: bloque.supervisor_id || undefined,
          cliente_id_bloque: bloque.cliente_id || undefined,
          intervencion_nombre: bloque.intervencion_nombre || undefined,
        });
      });
    });

    return {
      ...form,
      codigo: form.codigo.trim().toUpperCase(),
      nombre: form.nombre.trim(),
      zona: form.zona || undefined,
      cliente: clienteId || undefined,
      actividades_por_intervencion: actividadesPorIntervencion,
    };
  };

  const handleSubmit = async () => {
    setFormErrors([]);

    const errores = [];

    if (!form.codigo.trim()) errores.push("El código del proyecto es obligatorio (ej: PRY-001).");
    if (!form.nombre.trim()) errores.push("El nombre del proyecto es obligatorio.");
    if (!form.zona) errores.push("Debes seleccionar una zona.");
    if (intervenciones.length === 0) errores.push("Debes agregar al menos una intervención al proyecto.");

    const algTieneCliente = intervenciones.some((b) => b.cliente_id);
    if (intervenciones.length > 0 && !algTieneCliente) {
      errores.push("Al menos una intervención debe tener un cliente asignado.");
    }

    if (errores.length > 0) {
      setFormErrors(errores);
      return;
    }

    try {
      setLoading(true);

      const payload = buildPayload();

      if (!payload.cliente) {
        setFormErrors(["Debes asignar un cliente en al menos una intervención."]);
        setLoading(false);
        return;
      }

      let proyectoId;

      if (modoEditar) {
        await updateProyecto(proyecto._id, payload);
        proyectoId = proyecto._id;
      } else {
        const res = await createProyecto(payload);
        proyectoId = res?.data?.data?._id;
      }

      if (proyectoId) {
        for (const bloque of intervenciones) {
          for (const act of bloque.actividades) {
            if (!act.catalogo_id) continue;

            try {
              await import("../services/subproyectosService").then(
                ({ createActividadProyecto }) =>
                  createActividadProyecto({
                    proyecto: proyectoId,
                    actividad: act.catalogo_id,
                    intervencion: bloque.intervencion_id,
                    cliente: bloque.cliente_id || undefined,
                    supervisor: bloque.supervisor_id || undefined,
                    precio_unitario: Number(act.precio_unitario) || 0,
                    cantidad_total: Number(act.cantidad) || 1,
                    unidad: act.unidad || "UNIDAD",
                  })
              );
            } catch (e) {
              console.error("ERROR actividad:", act.nombre, JSON.stringify(e?.response?.data));
            }
          }
        }
      }

      onSuccess?.();
      onClose?.();
    } catch (err) {
      const backendErrors = err?.response?.data?.errors;

      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        const MENSAJES = {
          codigo: "El código del proyecto es obligatorio.",
          nombre: "El nombre del proyecto es obligatorio.",
          zona: "Debes seleccionar una zona.",
          responsable: "Debes seleccionar un responsable.",
          fecha_inicio: "La fecha de inicio no es válida.",
          fecha_fin_estimada: "La fecha fin estimada no es válida.",
          tipo_contrato: "El tipo de contrato es obligatorio.",
          cliente: "Debes asignar un cliente en al menos una intervención.",
        };

        const mensajes = backendErrors.map((e) => {
          const campo = e.path ?? e.param ?? e.field ?? "";
          return MENSAJES[campo] ?? e.msg ?? e.message ?? `Campo inválido: ${campo}`;
        });

        setFormErrors(mensajes);
      } else {
        const msg =
          err?.response?.data?.message ??
          err?.message ??
          "Error guardando el proyecto.";
        setFormErrors([msg]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (modoVer && proyecto) {
    const estado = proyecto.estado?.toUpperCase();
    const estadoStyle =
      ESTADO_COLOR[estado] ?? { bg: "#f8fafc", border: "#e6e8ef", color: "#475569" };

    const avance = proyecto.avance ?? 0;
    const apiInter = proyecto.actividades_por_intervencion ?? {};
    const interEntries = Object.entries(apiInter).filter(
      ([, arr]) => Array.isArray(arr) && arr.length > 0
    );

    const presupuesto = proyecto.presupuesto_por_intervencion ?? {};
    const totalPresupuesto = Object.values(presupuesto).reduce(
      (acc, p) => acc + (p?.monto_presupuestado ?? 0),
      0
    );

    const clienteNombre =
      proyecto.cliente?.nombre ?? proyecto.cliente?.razon_social ?? "Sin cliente";

    const responsableNombre = proyecto.responsable
      ? (`${proyecto.responsable.nombres ?? ""} ${proyecto.responsable.apellidos ?? ""}`.trim() || "—")
      : "—";

    return (
      <div className="modal-overlay">
        <div
          style={{
            width: "min(760px, calc(100vw - 24px))",
            background: "#fff",
            border: "1px solid #e6e8ef",
            borderRadius: 18,
            boxShadow: "0 24px 64px rgba(15,23,42,0.22)",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
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
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#e8f5ee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
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
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    border: `1.5px solid ${estadoStyle.border}`,
                    background: estadoStyle.bg,
                    color: estadoStyle.color,
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
                background: "#f8fafc",
                border: "1px solid #e6e8ef",
                borderRadius: 8,
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                fontSize: 18,
                color: "#64748b",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

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
            <div
              style={{
                background: "#f8fafc",
                borderRadius: 12,
                padding: "16px 20px",
                border: "1px solid #e6e8ef",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <TrendingUp size={16} color="#1f8f57" />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                    Avance del proyecto
                  </span>
                </div>

                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color:
                      avance >= 80 ? "#1f8f57" : avance >= 40 ? "#e67e22" : "#0f172a",
                  }}
                >
                  {avance}%
                </span>
              </div>

              <div
                style={{
                  width: "100%",
                  height: 10,
                  background: "#e2e8f0",
                  borderRadius: 999,
                  overflow: "hidden",
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

            <div>
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Información general
              </p>

              <div style={{ display: "grid", gap: 6 }}>
                <div><strong>Cliente:</strong> {clienteNombre}</div>
                <div><strong>Responsable:</strong> {responsableNombre}</div>
                <div><strong>Zona:</strong> {proyecto.zona?.nombre ?? proyecto.zona ?? "Sin zona"}</div>
                <div><strong>Tipo de contrato:</strong> {CONTRATO_LABEL[proyecto.tipo_contrato] ?? proyecto.tipo_contrato ?? "—"}</div>
                <div><strong>Fecha de inicio:</strong> {fmtFecha(proyecto.fecha_inicio)}</div>
                <div><strong>Fecha fin estimada:</strong> {fmtFecha(proyecto.fecha_fin_estimada)}</div>
                {proyecto.fecha_fin_real && (
                  <div><strong>Fecha fin real:</strong> {fmtFecha(proyecto.fecha_fin_real)}</div>
                )}
                {proyecto.descripcion && (
                  <div><strong>Descripción:</strong> {proyecto.descripcion}</div>
                )}
              </div>
            </div>

            {interEntries.length > 0 ? (
              <div>
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Intervenciones
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {interEntries.map(([key, acts], idx) => {
                    const col = getIntervencionStyle(idx);
                    const pres = presupuesto[key];

                    return (
                      <div
                        key={key}
                        style={{
                          background: col.bg,
                          border: `1.5px solid ${col.border}`,
                          borderRadius: 12,
                          padding: "14px 16px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 10,
                            gap: 12,
                            flexWrap: "wrap",
                          }}
                        >
                          <span style={{ fontSize: 14, fontWeight: 700, color: col.color }}>
                            {col.emoji} {acts?.[0]?.intervencion_nombre || acts?.[0]?.intervencion?.nombre || key}
                          </span>

                          <span style={{ fontSize: 13, color: col.color, fontWeight: 600 }}>
                            {acts.length} actividad{acts.length !== 1 ? "es" : ""}
                            {pres?.monto_presupuestado ? ` · ${fmtMonto(pres.monto_presupuestado)}` : ""}
                          </span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {acts.map((act, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                background: "#fff",
                                borderRadius: 8,
                                padding: "8px 12px",
                                fontSize: 13,
                                gap: 12,
                                flexWrap: "wrap",
                              }}
                            >
                              <span style={{ color: "#0f172a", fontWeight: 500, flex: 1 }}>
                                {act.nombre}
                              </span>

                              <div
                                style={{
                                  display: "flex",
                                  gap: 12,
                                  color: "#64748b",
                                  flexWrap: "wrap",
                                  justifyContent: "flex-end",
                                }}
                              >
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
                      marginTop: 12,
                      padding: "12px 16px",
                      background: "#f0faf4",
                      borderRadius: 10,
                      border: "1px solid rgba(31,143,87,0.2)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
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
            ) : (
              <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 14, margin: 0 }}>
                Este proyecto no tiene intervenciones registradas.
              </p>
            )}
          </div>

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
                background: "#f1f5f9",
                color: "#475569",
                border: "none",
                padding: "10px 18px",
                borderRadius: 10,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Cerrar
            </button>

            <button
              onClick={() => onSuccess?.("editar")}
              style={{
                background: "#1f8f57",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: 10,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
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

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: 12,
      }}
    >
      <div
        style={{
          width: "min(980px, calc(100vw - 24px))",
          background: "#fff",
          border: "1px solid #e6e8ef",
          borderRadius: 18,
          boxShadow: "0 24px 64px rgba(15,23,42,0.22)",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid #f0f2f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 22,
                color: "#0f172a",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: modoEditar
                    ? "rgba(234,179,8,0.12)"
                    : "rgba(99,102,241,0.12)",
                }}
              >
                {modoEditar ? (
                  <Pencil size={14} color="#ca8a04" />
                ) : (
                  <PlusCircle size={14} color="#6366f1" />
                )}
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
              background: "none",
              border: "none",
              fontSize: 22,
              cursor: "pointer",
              color: "#94a3b8",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "20px 24px 8px",
          }}
        >
          <ErrorBanner errors={formErrors} />

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

          <div className="form-group">
            <label>Nombre del proyecto *</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre del proyecto"
            />
          </div>

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
                  {`${p.nombres ?? ""} ${p.apellidos ?? ""}`.trim() ||
                    p.nombre ||
                    "Persona"}
                </option>
              ))}
            </select>
          </div>

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

          <div className="form-group">
            <label>Tipo de Contrato</label>
            <select
              name="tipo_contrato"
              value={form.tipo_contrato}
              onChange={handleChange}
            >
              <option value="FIJO_TODO_COSTO">Fijo todo costo</option>
              <option value="ADMINISTRACION">Administración</option>
              <option value="VARIABLE">Variable</option>
              <option value="CONTRATO_ESPECIAL">Contrato especial</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          <ActividadesIntervencion
            intervenciones={intervenciones}
            setIntervenciones={setIntervenciones}
          />

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripción opcional..."
            />
          </div>

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

        <div
          style={{
            flexShrink: 0,
            padding: "16px 24px 20px",
            borderTop: "1px solid #f0f2f5",
            background: "#fff",
          }}
        >
          <ErrorBanner errors={formErrors} />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={onClose}
              disabled={loading}
              style={{
                background: "#f1f5f9",
                color: "#475569",
                border: "none",
                padding: "12px 20px",
                borderRadius: 10,
                fontWeight: 700,
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
                background: loading ? "#94a3b8" : "#1f8f57",
                color: "#fff",
                border: "none",
                padding: "12px 24px",
                borderRadius: 10,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 14,
                boxShadow: loading ? "none" : "0 4px 12px rgba(31,143,87,0.25)",
              }}
            >
              {loading ? "Guardando..." : modoEditar ? "Guardar Cambios" : "Crear Proyecto"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProyectoModal;