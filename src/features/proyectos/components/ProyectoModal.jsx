import { useEffect, useMemo, useState } from "react";
import { createProyecto, updateProyecto } from "../services/proyectosService";
import { getPersonas } from "../services/personalService";
import { getZonas } from "../../territorial/services/zonas.service";
import ActividadesIntervencion from "./ActividadesIntervencion";
import "../../../assets/styles/proyectos.css";
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
  ACTIVO: {
    bg: "rgba(31,143,87,0.1)",
    border: "rgba(31,143,87,0.3)",
    color: "#1f8f57",
  },
  PLANEADO: {
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.3)",
    color: "#3b82f6",
  },
  CERRADO: {
    bg: "rgba(100,116,139,0.1)",
    border: "rgba(100,116,139,0.3)",
    color: "#64748b",
  },
  CANCELADO: {
    bg: "rgba(220,38,38,0.1)",
    border: "rgba(220,38,38,0.3)",
    color: "#dc2626",
  },
  SUSPENDIDO: {
    bg: "rgba(234,179,8,0.1)",
    border: "rgba(234,179,8,0.3)",
    color: "#ca8a04",
  },
  EN_NEGOCIACION: {
    bg: "rgba(168,85,247,0.1)",
    border: "rgba(168,85,247,0.3)",
    color: "#7c3aed",
  },
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

const InfoRow = ({ icon, label, value }) => {
  const Icon = icon;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 0",
        borderBottom: "1px solid #f0f2f5",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        <Icon size={15} color="#64748b" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 11,
            color: "#94a3b8",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.4px",
            marginBottom: 2,
          }}
        >
          {label}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: "#0f172a",
            fontWeight: 500,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
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
      <AlertCircle
        size={16}
        color="#dc2626"
        style={{ flexShrink: 0, marginTop: 1 }}
      />
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

const ProyectoModal = ({
  isOpen,
  onClose,
  onSuccess,
  proyecto = null,
  modo = "crear",
}) => {
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
  const [displayFechas, setDisplayFechas] = useState({ fecha_inicio: '', fecha_fin_estimada: '' });

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
      const toDisplay = (iso) => {
        if (!iso) return '';
        const [y, m, d] = iso.slice(0, 10).split('-');
        return `${d}/${m}/${y}`;
      };
      setDisplayFechas({
        fecha_inicio: toDisplay(proyecto.fecha_inicio),
        fecha_fin_estimada: toDisplay(proyecto.fecha_fin_estimada),
      });

      const bloquesMigrados = [];
      const api = proyecto.actividades_por_intervencion ?? {};

      Object.entries(api).forEach(([intervencionKey, acts], index) => {
        if (!Array.isArray(acts) || acts.length === 0) return;

        const bloque = {
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
        };

        bloquesMigrados.push(bloque);
      });

      setIntervenciones(bloquesMigrados);
    } else {
      setForm(initialForm);
      setDisplayFechas({ fecha_inicio: '', fecha_fin_estimada: '' });
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
      if (!clienteId && bloque.cliente_id) {
        clienteId = bloque.cliente_id;
      }

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

    if (!form.codigo.trim()) {
      errores.push("El código del proyecto es obligatorio (ej: PRY-001).");
    }

    if (!form.nombre.trim()) {
      errores.push("El nombre del proyecto es obligatorio.");
    }

    if (!form.zona) {
      errores.push("Debes seleccionar una zona.");
    }

    if (intervenciones.length === 0) {
      errores.push("Debes agregar al menos una intervención al proyecto.");
    }

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
              console.error(
                "ERROR actividad:",
                act.nombre,
                JSON.stringify(e?.response?.data)
              );
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
      ESTADO_COLOR[estado] ?? {
        bg: "#f8fafc",
        border: "#e6e8ef",
        color: "#475569",
      };

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
      proyecto.cliente?.nombre ??
      proyecto.cliente?.razon_social ??
      "Sin cliente";

    const responsableNombre = proyecto.responsable
      ? (`${proyecto.responsable.nombres ?? ""} ${proyecto.responsable.apellidos ?? ""
        }`.trim() || "—")
      : "—";

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
          className="modal"
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
          {/* HEADER */}
          <div
            style={{
              padding: "20px 24px 16px",
              borderBottom: "1px solid #f0f2f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3 style={{ margin: 0 }}>
              {modoEditar ? "Editar Proyecto" : "Nuevo Proyecto"}
            </h3>

            <button onClick={onClose}>×</button>
          </div>

          {/* BODY */}
          <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>

            {/* ✅ SOLO UNA VEZ */}
            <ErrorBanner errors={formErrors} />

            <div className="form-group">
              <label>Código *</label>
              <input
                name="codigo"
                value={form.codigo}
                onChange={handleChange}
                disabled={modoEditar}
              />
            </div>

            <div className="form-group">
              <label>Nombre *</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Responsable</label>
              <select
                name="responsable"
                value={form.responsable}
                onChange={handleChange}
              >
                <option value="">Seleccione</option>
                {personas.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.nombres} {p.apellidos}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Zona *</label>
              <select
                name="zona"
                value={form.zona}
                onChange={handleChange}
              >
                <option value="">Seleccione</option>
                {zonas.map((z) => (
                  <option key={z._id} value={z._id}>
                    {z.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ FECHAS (solo tu versión personalizada) */}
            <div className="modal-grid">
              <div className="form-group">
                <label>Fecha Inicio</label>
                <input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={displayFechas.fecha_inicio}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "").slice(0, 8);
                    let display = raw;

                    if (raw.length > 4)
                      display =
                        raw.slice(0, 2) +
                        "/" +
                        raw.slice(2, 4) +
                        "/" +
                        raw.slice(4);
                    else if (raw.length > 2)
                      display = raw.slice(0, 2) + "/" + raw.slice(2);

                    setDisplayFechas((p) => ({
                      ...p,
                      fecha_inicio: display,
                    }));

                    if (raw.length === 8) {
                      const d = raw.slice(0, 2);
                      const m = raw.slice(2, 4);
                      const y = raw.slice(4, 8);

                      setForm((p) => ({
                        ...p,
                        fecha_inicio: `${y}-${m}-${d}`,
                      }));
                    }
                  }}
                />
              </div>

              <div className="form-group">
                <label>Fecha Fin Estimada</label>
                <input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={displayFechas.fecha_fin_estimada}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "").slice(0, 8);
                    let display = raw;

                    if (raw.length > 4)
                      display =
                        raw.slice(0, 2) +
                        "/" +
                        raw.slice(2, 4) +
                        "/" +
                        raw.slice(4);
                    else if (raw.length > 2)
                      display = raw.slice(0, 2) + "/" + raw.slice(2);

                    setDisplayFechas((p) => ({
                      ...p,
                      fecha_fin_estimada: display,
                    }));

                    if (raw.length === 8) {
                      const d = raw.slice(0, 2);
                      const m = raw.slice(2, 4);
                      const y = raw.slice(4, 8);

                      setForm((p) => ({
                        ...p,
                        fecha_fin_estimada: `${y}-${m}-${d}`,
                      }));
                    }
                  }}
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
                <option value="FIJO_TODO_COSTO">Fijo</option>
                <option value="ADMINISTRACION">Administración</option>
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

          {/* FOOTER */}
          <div
            style={{
              padding: 20,
              borderTop: "1px solid #eee",
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            <button onClick={onClose}>Cancelar</button>

            <button onClick={handleSubmit} disabled={loading}>
              {loading
                ? "Guardando..."
                : modoEditar
                  ? "Guardar Cambios"
                  : "Crear Proyecto"}
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default ProyectoModal;