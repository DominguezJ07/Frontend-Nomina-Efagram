import { useEffect, useState } from "react";
import {
  getActividades,
  deleteActividad
} from "../services/actividadesService";
import ActividadModal from "../components/ActividadModal";
import "../../../assets/styles/actividades.css";
import DashboardLayout from "../../../app/layouts/DashboardLayout";

const getBadgeCategoria = (categoria = "") => {
  const map = {
    PREPARACION_TERRENO: "badge-preparacion",
    SIEMBRA: "badge-siembra",
    MANTENIMIENTO: "badge-mantenimiento",
    CONTROL_MALEZA: "badge-control",
    FERTILIZACION: "badge-fertilizacion",
    PODAS: "badge-podas",
    OTRO: "badge-default"
  };

  return map[categoria] || "badge-default";
};

const CatalogoActividadesPage = () => {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroEstado, setFiltroEstado] = useState("activas");

  const [modalOpen, setModalOpen] = useState(false);

  // =============================
  // CARGAR DESDE BACKEND
  // =============================
  const cargarActividades = async () => {
    try {
      setLoading(true);

      const params = {};

      if (filtroEstado === "activas") params.activa = true;
      if (filtroEstado === "inactivas") params.activa = false;

      if (filtroCategoria !== "Todas") {
        params.categoria = filtroCategoria;
      }

      const res = await getActividades(params);

      setActividades(res?.data?.data || []);
    } catch (error) {
      console.error("Error cargando actividades", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarActividades();
  }, [filtroEstado, filtroCategoria]);

  // =============================
  // FILTRO LOCAL (BÚSQUEDA)
  // =============================
  const actividadesFiltradas = actividades.filter((a) =>
    a.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const categorias = [
    "Todas",
    ...new Set(actividades.map((a) => a.categoria).filter(Boolean))
  ];

  // =============================
  // ELIMINAR (DESACTIVAR)
  // =============================
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas desactivar esta actividad?")) return;

    try {
      await deleteActividad(id);
      cargarActividades();
    } catch (error) {
      console.error("Error eliminando actividad", error);
    }
  };

  // =============================
  // UI
  // =============================
  return (
    <DashboardLayout>
      <div className="catalogo-wrapper">

        {/* ---------- STATS ---------- */}
        <div className="catalogo-stats">
          <div className="stat-card">
            <div className="stat-card-icon">📋</div>
            <div className="stat-card-info">
              <span className="stat-card-label">TOTAL ACTIVIDADES</span>
              <span className="stat-card-value">{actividades.length}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon">🏷️</div>
            <div className="stat-card-info">
              <span className="stat-card-label">CATEGORÍAS</span>
              <span className="stat-card-value">
                {new Set(actividades.map(a => a.categoria)).size}
              </span>
            </div>
          </div>
        </div>

        {/* ---------- PANEL ---------- */}
        <div className="catalogo-panel">

          {/* HEADER */}
          <div className="catalogo-panel-header">
            <h2 className="catalogo-panel-title">
              Catálogo de Actividades
            </h2>

            <button
              className="btn-nueva-actividad"
              onClick={() => setModalOpen(true)}
            >
              + Nueva Actividad
            </button>
          </div>

          {/* TOOLBAR */}
          <div className="catalogo-toolbar">

            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Buscar por código o nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="activas">Activas</option>
              <option value="inactivas">Inactivas</option>
              <option value="todas">Todas</option>
            </select>
          </div>

          {/* TABLA */}
          {loading ? (
            <div className="catalogo-loading">
              Cargando actividades...
            </div>
          ) : (
            <table className="tabla-actividades">
              <thead>
                <tr>
                  <th>CÓDIGO</th>
                  <th>NOMBRE</th>
                  <th>CATEGORÍA</th>
                  <th>UNIDAD</th>
                  <th>RENDIMIENTO</th>
                  <th>ESTADO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>

              <tbody>
                {actividadesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="tabla-empty">
                      No se encontraron actividades
                    </td>
                  </tr>
                ) : (
                  actividadesFiltradas.map((a) => (
                    <tr key={a._id}>
                      <td>{a.codigo}</td>
                      <td>{a.nombre}</td>
                      <td>
                        <span className={`badge-categoria ${getBadgeCategoria(a.categoria)}`}>
                          {a.categoria}
                        </span>
                      </td>
                      <td>{a.unidad_medida}</td>
                      <td>{a.rendimiento_diario_estimado ?? "—"}</td>
                      <td>
                        <span className={`badge-estado ${a.activa ? "badge-activa" : "badge-inactiva"}`}>
                          {a.activa ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td>
                        <div className="acciones-cell">
                          <button className="btn-accion editar">
                            ✏️
                          </button>
                          <button
                            className="btn-accion eliminar"
                            onClick={() => handleEliminar(a._id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* MODAL */}
        <ActividadModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={cargarActividades}
        />
      </div>
    </DashboardLayout>
  );
};

export default CatalogoActividadesPage;