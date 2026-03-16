import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../../../app/layouts/DashboardLayout";
import ActividadProyectoModal from "../components/ActividadProyectoModal";
import {
  getActividadesProyecto,
  deleteActividadProyecto,
} from "../services/subproyectosService";
import { getProyectos } from "../services/proyectosService";
import { Plus, Pencil, Trash2, Lock, Package } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────
const fmtMoney = (n) =>
  n > 0 ? "$ " + Number(n).toLocaleString("es-CO") : "—";

const INTERVENCION_COLOR = {
  mantenimiento:   { bg: "#f0faf4", border: "#1f8f57", color: "#1f8f57", light: "#e8f5ee" },
  no_programadas:  { bg: "#eff6ff", border: "#3b82f6", color: "#1d4ed8", light: "#dbeafe" },
  establecimiento: { bg: "#fff5f5", border: "#ef4444", color: "#dc2626", light: "#fee2e2" },
};
const TIPO_EMOJI  = { mantenimiento: "🔧", no_programadas: "⚡", establecimiento: "🌱" };
const TIPO_LABEL  = { mantenimiento: "Mantenimiento", no_programadas: "No programadas", establecimiento: "Establecimiento" };

const BarraProgreso = ({ asignado, total }) => {
  const pct   = total > 0 ? Math.min(100, Math.round((asignado / total) * 100)) : 0;
  const color = pct >= 100 ? "#dc2626" : pct >= 75 ? "#e67e22" : "#1f8f57";
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}>
        <span>{asignado} / {total}</span>
        <span style={{ fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: 6, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width 0.3s" }} />
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
const ActividadesProyectoPage = () => {
  const [searchParams]   = useSearchParams();
  const proyectoIdParam  = searchParams.get("proyecto");

  const [proyectos,      setProyectos]      = useState([]);
  const [proyectoSel,    setProyectoSel]    = useState(proyectoIdParam || "");
  const [proyectoObj,    setProyectoObj]    = useState(null);
  const [actividades,    setActividades]    = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [filtro,         setFiltro]         = useState("todas"); // todas | ABIERTA | CERRADA
  const [filtroTipo,     setFiltroTipo]     = useState("");
  const [modal,          setModal]          = useState({ open: false, act: null });

  // ── Cargar proyectos ──
  useEffect(() => {
    getProyectos()
      .then((res) => {
        const data = res?.data?.data ?? [];
        setProyectos(data);
        if (proyectoIdParam) setProyectoObj(data.find((p) => p._id === proyectoIdParam) ?? null);
      })
      .catch(console.error);
  }, [proyectoIdParam]);

  // ── Cargar actividades o resetear al cambiar selección ──
  useEffect(() => {
    const cargar = async () => {
      if (!proyectoSel) {
        await Promise.resolve();
        setActividades([]);
        setProyectoObj(null);
        return;
      }
      await Promise.resolve();
      setLoading(true);
      try {
        const res = await getActividadesProyecto({ proyecto: proyectoSel });
        setActividades(res?.data?.data ?? []);
        setProyectoObj(proyectos.find((p) => p._id === proyectoSel) ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [proyectoSel, proyectos]);

  const recargar = () => {
    if (!proyectoSel) return;
    setLoading(true);
    getActividadesProyecto({ proyecto: proyectoSel })
      .then((res) => setActividades(res?.data?.data ?? []))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta actividad del proyecto?")) return;
    try {
      await deleteActividadProyecto(id);
      setActividades((prev) => prev.filter((a) => a._id !== id));
    } catch (e) {
      alert(e?.response?.data?.message ?? "No se pudo eliminar");
    }
  };

  // ── Filtros ──
  const actividadesFiltradas = actividades.filter((a) => {
    if (filtro !== "todas" && a.estado !== filtro) return false;
    if (filtroTipo && a.intervencion !== filtroTipo) return false;
    return true;
  });

  // ── Stats ──
  const abiertas = actividades.filter((a) => a.estado === "ABIERTA").length;
  const cerradas = actividades.filter((a) => a.estado === "CERRADA").length;
  const valorTotal = actividades.reduce(
    (s, a) => s + (a.precio_unitario || 0) * (a.cantidad_total || 0), 0
  );

  // Agrupar por intervención para mostrar secciones
  const porIntervencion = actividadesFiltradas.reduce((acc, a) => {
    if (!acc[a.intervencion]) acc[a.intervencion] = [];
    acc[a.intervencion].push(a);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a" }}>
              📦 Actividades del Proyecto
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
              Define las actividades de cada proyecto con su cantidad total asignable
            </p>
          </div>
          {proyectoSel && (
            <button
              onClick={() => setModal({ open: true, act: null })}
              style={{
                background: "#1f8f57", color: "#fff", border: "none",
                padding: "11px 20px", borderRadius: 12, fontWeight: 700,
                fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                boxShadow: "0 4px 12px rgba(31,143,87,0.25)",
              }}
            >
              <Plus size={16} /> Nueva Actividad
            </button>
          )}
        </div>

        {/* ── Selector de proyecto ── */}
        <div style={{ background: "#fff", border: "1px solid #e6e8ef", borderRadius: 14, padding: "18px 20px" }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 8 }}>
            Selecciona un proyecto
          </label>
          <select
            value={proyectoSel}
            onChange={(e) => setProyectoSel(e.target.value)}
            style={{ width: "100%", maxWidth: 480, padding: "10px 14px", border: "1.5px solid #e6e8ef", borderRadius: 10, fontSize: 14, color: "#0f172a", outline: "none" }}
          >
            <option value="">— Seleccione proyecto —</option>
            {proyectos.map((p) => (
              <option key={p._id} value={p._id}>
                {p.codigo} · {p.nombre} {p.zona?.nombre ? `(${p.zona.nombre})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* ── Stats ── */}
        {proyectoSel && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {[
              { label: "Total actividades", value: actividades.length, color: "#3b82f6", bg: "#eff6ff" },
              { label: "Abiertas",          value: abiertas,            color: "#1f8f57", bg: "#f0faf4" },
              { label: "Cerradas (100%)",   value: cerradas,            color: "#dc2626", bg: "#fee2e2" },
              { label: "Valor total",       value: fmtMoney(valorTotal),color: "#7c3aed", bg: "#f5f3ff", big: true },
            ].map((s) => (
              <div key={s.label} style={{ background: s.bg, border: `1.5px solid ${s.color}33`, borderRadius: 12, padding: "14px 18px" }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.4px" }}>{s.label}</p>
                <p style={{ margin: "4px 0 0", fontSize: s.big ? 16 : 26, fontWeight: 900, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Filtros ── */}
        {proyectoSel && actividades.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Filtrar:</span>
            {[
              { key: "todas",   label: "Todas" },
              { key: "ABIERTA", label: "Abiertas" },
              { key: "CERRADA", label: "Cerradas" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFiltro(f.key)}
                style={{
                  padding: "5px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  background: filtro === f.key ? "#1f8f57" : "#f8fafc",
                  color: filtro === f.key ? "#fff" : "#475569",
                  border: filtro === f.key ? "none" : "1px solid #e2e8f0",
                }}
              >
                {f.label}
              </button>
            ))}
            <span style={{ margin: "0 4px", color: "#e2e8f0" }}>|</span>
            {["", "mantenimiento", "no_programadas", "establecimiento"].map((t) => (
              <button
                key={t || "todas-tipo"}
                onClick={() => setFiltroTipo(t)}
                style={{
                  padding: "5px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  background: filtroTipo === t ? (INTERVENCION_COLOR[t]?.bg ?? "#1f8f57") : "#f8fafc",
                  color: filtroTipo === t ? (INTERVENCION_COLOR[t]?.color ?? "#fff") : "#475569",
                  border: filtroTipo === t
                    ? `1.5px solid ${INTERVENCION_COLOR[t]?.border ?? "#1f8f57"}`
                    : "1px solid #e2e8f0",
                }}
              >
                {t ? `${TIPO_EMOJI[t]} ${TIPO_LABEL[t]}` : "Todos los tipos"}
              </button>
            ))}
          </div>
        )}

        {/* ── Estado vacío ── */}
        {!proyectoSel && (
          <div style={{ textAlign: "center", padding: "48px 20px", background: "#fff", border: "2px dashed #e2e8f0", borderRadius: 16, color: "#94a3b8" }}>
            <p style={{ margin: "0 0 6px", fontSize: 28 }}>📦</p>
            <p style={{ margin: 0, fontSize: 14 }}>Selecciona un proyecto para gestionar sus actividades</p>
          </div>
        )}

        {proyectoSel && loading && (
          <div style={{ textAlign: "center", padding: 32, color: "#64748b" }}>Cargando actividades...</div>
        )}

        {proyectoSel && !loading && actividades.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px", background: "#fff", border: "2px dashed #e2e8f0", borderRadius: 16, color: "#94a3b8" }}>
            <p style={{ margin: "0 0 6px", fontSize: 28 }}>📋</p>
            <p style={{ margin: 0, fontSize: 14 }}>Este proyecto no tiene actividades definidas aún</p>
            <button
              onClick={() => setModal({ open: true, act: null })}
              style={{ marginTop: 12, background: "#1f8f57", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14 }}
            >
              + Agregar primera actividad
            </button>
          </div>
        )}

        {/* ── Actividades agrupadas por intervención ── */}
        {proyectoSel && !loading && Object.entries(porIntervencion).map(([tipo, acts]) => {
          const col = INTERVENCION_COLOR[tipo] ?? {};
          const totalTipo = acts.reduce((s, a) => s + (a.precio_unitario || 0) * (a.cantidad_total || 0), 0);

          return (
            <div key={tipo}>
              {/* Cabecera de sección */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{TIPO_EMOJI[tipo]}</span>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: col.color }}>
                    {TIPO_LABEL[tipo]}
                  </h3>
                  <span style={{ background: col.bg, border: `1px solid ${col.border}`, color: col.color, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
                    {acts.length} actividad{acts.length !== 1 ? "es" : ""}
                  </span>
                </div>
                {totalTipo > 0 && (
                  <span style={{ fontSize: 14, fontWeight: 800, color: col.color }}>
                    {fmtMoney(totalTipo)}
                  </span>
                )}
              </div>

              {/* Tabla */}
              <div style={{ background: "#fff", border: "1px solid #e6e8ef", borderRadius: 14, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: col.bg, borderBottom: `2px solid ${col.border}33` }}>
                      {["Actividad", "Unidad", "Cantidad total", "Precio unit.", "Valor total", "Asignación", "Estado", ""].map((h) => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: col.color, textTransform: "uppercase", letterSpacing: "0.4px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {acts.map((a, i) => {
                      const cerrada = a.estado === "CERRADA";
                      return (

                        <tr
                          key={a._id}
                          style={{
                            borderBottom: i < acts.length - 1 ? "1px solid #f0f2f5" : "none",
                            background: cerrada ? "#fafafa" : "#fff",
                            opacity: cerrada ? 0.8 : 1,
                          }}
                        >
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              {cerrada && <Lock size={12} color="#dc2626" />}
                              <div>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                                  {a.actividad?.nombre ?? "—"}
                                </p>
                                <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>
                                  {a.actividad?.codigo}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px 14px", fontSize: 13, color: "#64748b" }}>
                            {a.actividad?.unidad_medida ?? a.unidad ?? "—"}
                          </td>
                          <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                            {a.cantidad_total}
                          </td>
                          <td style={{ padding: "12px 14px", fontSize: 13, color: "#0f172a" }}>
                            {fmtMoney(a.precio_unitario)}
                          </td>
                          <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: col.color }}>
                            {fmtMoney((a.precio_unitario || 0) * (a.cantidad_total || 0))}
                          </td>
                          <td style={{ padding: "12px 14px", minWidth: 140 }}>
                            <BarraProgreso asignado={a.cantidad_asignada} total={a.cantidad_total} />
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <span
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 4,
                                padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                                background: cerrada ? "#fee2e2" : "#f0faf4",
                                color: cerrada ? "#dc2626" : "#1f8f57",
                                border: cerrada ? "1px solid #fca5a5" : "1px solid #bbf7d0",
                              }}
                            >
                              {cerrada ? (
                                <>
                                  <Lock size={9} />
                                  Cerrada
                                </>
                              ) : (
                                "● Abierta"
                              )}
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                onClick={() => setModal({ open: true, act: a })}
                                style={{ background: "#f0faf4", border: "1px solid #bbf7d0", color: "#1f8f57", width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => handleDelete(a._id)}
                                disabled={a.cantidad_asignada > 0}
                                title={a.cantidad_asignada > 0 ? "No se puede eliminar: tiene cantidades asignadas" : "Eliminar"}
                                style={{
                                  background: a.cantidad_asignada > 0 ? "#f8fafc" : "#fee2e2",
                                  border: a.cantidad_asignada > 0 ? "1px solid #e2e8f0" : "1px solid #fca5a5",
                                  color: a.cantidad_asignada > 0 ? "#cbd5e1" : "#dc2626",
                                  width: 30, height: 30, borderRadius: 7,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  cursor: a.cantidad_asignada > 0 ? "not-allowed" : "pointer",
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <ActividadProyectoModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, act: null })}
        onSuccess={recargar}
        proyecto={proyectoObj}
        actividad={modal.act}
      />
    </DashboardLayout>
  );
};

export default ActividadesProyectoPage;