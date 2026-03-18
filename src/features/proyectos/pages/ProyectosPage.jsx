import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProyectos, deleteProyecto } from "../services/proyectosService";
import "../../../assets/styles/proyectos.css";
import ProyectoModal from "../components/ProyectoModal";
import DashboardLayout from "../../../app/layouts/DashboardLayout";
import { Eye, Pencil, Trash2, Folder, GitBranch, MapPin, TrendingUp, Search, PlusCircle, Users } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────
const fmtFecha = (iso) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : "—";

const fmtMonto = (n) =>
  n != null ? "$ " + Number(n).toLocaleString("es-CO") : null;

const ESTADO_LABEL = {
  ACTIVO:"Activo", PLANEADO:"Planeado", FINALIZADO:"Finalizado",
  SUSPENDIDO:"Suspendido", CERRADO:"Cerrado",
  EN_NEGOCIACION:"En negociación", CANCELADO:"Cancelado",
};

const INTERVENCION_LABEL = {
  establecimiento:"Establecimiento", mantenimiento:"Mantenimiento", no_programadas:"No programadas",
};

// ── Componente principal ──────────────────────────────────
const ProyectosPage = () => {
  const navigate = useNavigate();
  const [proyectos,   setProyectos]   = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [busqueda,    setBusqueda]    = useState("");
  const [deletingId,  setDeletingId]  = useState(null);

  // modalState = { open: bool, modo: "crear"|"editar"|"ver", proyecto: obj|null }
  const [modalState, setModalState] = useState({ open:false, modo:"crear", proyecto:null });

  const abrirCrear  = ()  => setModalState({ open:true, modo:"crear",  proyecto:null });
  const abrirVer    = (p) => setModalState({ open:true, modo:"ver",    proyecto:p });
  const abrirEditar = (p) => setModalState({ open:true, modo:"editar", proyecto:p });
  const cerrarModal = ()  => setModalState(prev => ({ ...prev, open:false }));

  // ── Cargar proyectos ──
  const cargarProyectos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProyectos();
      setProyectos(response?.data?.success ? response.data.data : []);
    } catch (err) {
      console.error("Error cargando proyectos:", err);
      setError("No se pudieron cargar los proyectos.");
    } finally {
      setLoading(false);
    }
  };

  // ── Eliminar proyecto ──
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este proyecto?")) return;
    try {
      setDeletingId(id);
      await deleteProyecto(id);
      await cargarProyectos();
    } catch (err) {
      alert(err?.response?.data?.message || err?.response?.data?.error || "No se pudo eliminar el proyecto");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => { cargarProyectos(); }, []);

  // ── Stats derivadas ──
  const activos = proyectos.filter(p => p.estado?.toUpperCase() === "ACTIVO").length;
  const totalLotes = proyectos.reduce((acc, p) => acc + (p.lotes?.length ?? p.cantidad_lotes ?? 0), 0);
  const avancePromedio = proyectos.length > 0
    ? Math.round(proyectos.reduce((acc, p) => acc + (p.avance ?? 0), 0) / proyectos.length)
    : 0;

  // ── Filtro búsqueda ──
  const proyectosFiltrados = proyectos.filter(p => {
    const q = busqueda.toLowerCase();
    return (
      p.nombre?.toLowerCase().includes(q) ||
      p.cliente?.nombre?.toLowerCase().includes(q) ||
      p.codigo?.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className="proyectos-container">

        {/* ── STATS ── */}
        <div className="proy-stats-row">
          <div className="proy-stat-card">
            <div className="proy-stat-icon proy-stat-icon--green"><Folder size={22} /></div>
            <div>
              <p className="proy-stat-label">Proyectos Activos</p>
              <p className="proy-stat-value">{activos}</p>
            </div>
          </div>
          <div className="proy-stat-card">
            <div className="proy-stat-icon proy-stat-icon--blue"><MapPin size={22} /></div>
            <div>
              <p className="proy-stat-label">Total Lotes</p>
              <p className="proy-stat-value">{totalLotes}</p>
            </div>
          </div>
          <div className="proy-stat-card">
            <div className="proy-stat-icon proy-stat-icon--orange"><TrendingUp size={22} /></div>
            <div>
              <p className="proy-stat-label">Avance Promedio</p>
              <p className="proy-stat-value">{avancePromedio}%</p>
            </div>
          </div>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="proy-toolbar">
          <div className="proy-search-wrapper">
            <Search size={15} className="proy-search-icon" style={{ color:'#94a3b8' }} />
            <input
              className="proy-search-input"
              type="text"
              placeholder="Buscar proyecto o cliente..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <button className="btn-crear" onClick={abrirCrear} style={{ display:'flex', alignItems:'center', gap:7 }}>
            <PlusCircle size={16} /> Nuevo Proyecto
          </button>
        </div>

        {/* ── ESTADOS ── */}
        {loading  && <p className="proy-msg">Cargando proyectos...</p>}
        {error    && <p className="proy-msg proy-msg--error">{error}</p>}
        {!loading && proyectosFiltrados.length === 0 && (
          <p className="proy-msg">No hay proyectos registrados.</p>
        )}

        {/* ── GRID DE CARDS ── */}
        <div className="proy-cards-grid">
          {proyectosFiltrados.map(proyecto => {
            const estado  = proyecto.estado?.toUpperCase();
            const avance  = proyecto.avance ?? 0;

            const intervenciones = Object.entries(proyecto.actividades_por_intervencion ?? {})
              .filter(([, arr]) => Array.isArray(arr) && arr.length > 0);

            const presupuesto = proyecto.presupuesto_por_intervencion ?? {};

            return (
              <div key={proyecto._id} className="proy-card">

                {/* Cabecera */}
                <div className="proy-card-header">
                  <div className="proy-card-icon-wrap">
                    <Folder size={20} color="#1f8f57" />
                  </div>
                  <div className="proy-card-title-block">
                    <h3 className="proy-card-nombre">{proyecto.nombre}</h3>
                    <p className="proy-card-cliente">
                      {proyecto.cliente?.nombre ?? proyecto.cliente?.razon_social ?? "Sin cliente"}
                    </p>
                  </div>
                  <span className={`proy-estado-chip proy-estado-chip--${estado?.toLowerCase()}`}>
                    {ESTADO_LABEL[estado] ?? proyecto.estado}
                  </span>
                </div>

                {/* Barra de avance */}
                <div className="proy-avance-row">
                  <span className="proy-avance-label">Avance</span>
                  <span className="proy-avance-pct">{avance}%</span>
                </div>
                <div className="proy-avance-bar-bg">
                  <div className="proy-avance-bar-fill" style={{ width:`${avance}%` }} />
                </div>

                {/* Chips de intervenciones */}
                {intervenciones.length > 0 && (
                  <div className="proy-intervenciones">
                    {intervenciones.map(([tipo, acts]) => {
                      const monto = presupuesto[tipo]?.monto_presupuestado;
                      return (
                        <span key={tipo} className="proy-interv-chip">
                          🌿 {INTERVENCION_LABEL[tipo] ?? tipo}&nbsp;
                          <strong>{acts.length}</strong>
                          {fmtMonto(monto) && <>&nbsp;{fmtMonto(monto)}</>}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Valor total */}
                {proyecto.valor_total != null && (
                  <p className="proy-valor-total">
                    Valor total: <strong>{fmtMonto(proyecto.valor_total)}</strong>
                  </p>
                )}

                {/* Cuadrillas y lotes */}
                <div className="proy-meta-row">
                  {proyecto.cuadrillas != null && (
                    <span className="proy-meta-item" style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                      <Users size={12} /> {proyecto.cuadrillas} cuadrilla{proyecto.cuadrillas !== 1 ? "s" : ""}
                    </span>
                  )}
                  {(proyecto.lotes?.length ?? proyecto.cantidad_lotes) ? (
                    <span className="proy-meta-item" style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                      <MapPin size={12} /> {proyecto.lotes?.length ?? proyecto.cantidad_lotes} lote
                      {(proyecto.lotes?.length ?? proyecto.cantidad_lotes) !== 1 ? "s" : ""}
                    </span>
                  ) : null}
                </div>

                {/* Footer */}
                <div className="proy-card-footer">
                  <span className="proy-fechas">
                    {fmtFecha(proyecto.fecha_inicio)} — {fmtFecha(proyecto.fecha_fin_estimada)}
                  </span>
                  <div className="proy-acciones">

                    {/* IR A SUBPROYECTOS */}
                    <button
                      className="proy-btn-accion"
                      title="Subproyectos"
                      onClick={() => navigate(`/proyectos/subproyectos?proyecto=${proyecto._id}`)}
                      style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d" }}
                    >
                      <GitBranch size={15} />
                    </button>

                    {/* VER DETALLE */}
                    <button
                      className="proy-btn-accion proy-btn-accion--view"
                      title="Ver detalle"
                      onClick={() => abrirVer(proyecto)}
                    >
                      <Eye size={16} />
                    </button>

                    {/* EDITAR */}
                    <button
                      className="proy-btn-accion proy-btn-accion--edit"
                      title="Editar"
                      onClick={() => abrirEditar(proyecto)}
                    >
                      <Pencil size={16} />
                    </button>

                    {/* ELIMINAR */}
                    <button
                      className="proy-btn-accion proy-btn-accion--delete"
                      title="Eliminar"
                      onClick={() => handleDelete(proyecto._id)}
                      disabled={deletingId === proyecto._id}
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── MODAL ÚNICO (maneja crear / editar / ver) ── */}
        <ProyectoModal
          isOpen={modalState.open}
          modo={modalState.modo}
          proyecto={modalState.proyecto}
          onClose={cerrarModal}
          onSuccess={(accion) => {
            if (accion === "editar") {
              setModalState(prev => ({ ...prev, modo:"editar" }));
            } else {
              cerrarModal();
              cargarProyectos();
            }
          }}
        />

      </div>
    </DashboardLayout>
  );
};

export default ProyectosPage;