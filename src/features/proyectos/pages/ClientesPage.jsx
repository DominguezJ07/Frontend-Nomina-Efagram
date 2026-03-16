import { useEffect, useState } from "react";
import { getClientes, deleteCliente } from "../services/Clientesservice";
import ClienteModal from "../components/Clientemodal";
import DashboardLayout from "../../../app/layouts/DashboardLayout";
import "../../../assets/styles/proyectos.css";
import {
  Users, Building2, Eye, Pencil, Trash2,
  Phone, Mail, CheckCircle, XCircle,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────
const iniciales = (str = "") =>
  str.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

// ══════════════════════════════════════════════════════════
// CARD DE CLIENTE
// ══════════════════════════════════════════════════════════
const ClienteCard = ({ cliente, onVer, onEditar, onEliminar, eliminando }) => {
  const cantProyectos = cliente.proyectos?.length ?? cliente.cantidad_proyectos ?? 0;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e6e8ef",
        borderRadius: 16,
        padding: "20px 20px 16px",
        boxShadow: "0 2px 10px rgba(15,23,42,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        transition: "box-shadow 0.18s ease, transform 0.18s ease",
        cursor: "default",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 8px 28px rgba(15,23,42,0.12)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 2px 10px rgba(15,23,42,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* ── FILA SUPERIOR: avatar + nombre + badge ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
        <div style={{
          width: 50, height: 50, flexShrink: 0,
          borderRadius: "50%",
          background: cliente.activo ? "#e8f5ee" : "#f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 800, color: cliente.activo ? "#1f8f57" : "#64748b",
        }}>
          {iniciales(cliente.razon_social)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0f172a" }}>{cliente.razon_social}</h2>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: cliente.activo ? "rgba(31,143,87,0.1)" : "rgba(220,38,38,0.1)", border: `1.5px solid ${cliente.activo ? "rgba(31,143,87,0.3)" : "rgba(220,38,38,0.3)"}`, color: cliente.activo ? "#1f8f57" : "#dc2626" }}>
              {cliente.activo ? (
                <>
                  <CheckCircle size={11} />
                  Activo
                </>
              ) : (
                <>
                  <XCircle size={11} />
                  Inactivo
                </>
              )}
            </span>
          </div>
          {cliente.nombre_comercial && <p style={{ margin: "3px 0 0", fontSize: 13, color: "#64748b" }}>{cliente.nombre_comercial}</p>}
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>
            <strong>{cliente.codigo}</strong> · NIT: {cliente.nit}
          </p>
        </div>
        <button onClick={onVer} style={{ background: "#f8fafc", border: "1px solid #e6e8ef", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, fontSize: 18, color: "#64748b" }}>×</button>
      </div>

      {/* ── FILA INFERIOR: contacto + botones ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, paddingTop: 12, borderTop: "1px solid #f3f4f6" }}>
        {cliente.email && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
            <Mail size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
            <a href={`mailto:${cliente.email}`} style={{ fontSize: 12, color: "#1f8f57", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {cliente.email}
            </a>
          </div>
        )}
        {cliente.telefono && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
            <Phone size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
            <a href={`tel:${cliente.telefono}`} style={{ fontSize: 12, color: "#1f8f57", textDecoration: "none" }}>
              {cliente.telefono}
            </a>
          </div>
        )}
        {!cliente.email && !cliente.telefono && (
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Sin contacto</p>
        )}
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button onClick={() => onEditar(cliente)} style={{ background: "#f0faf4", border: "1px solid #bbf7d0", borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#1f8f57" }} title="Editar">
            <Pencil size={13} />
          </button>
          <button
            onClick={() => { if (window.confirm("¿Eliminar este cliente?")) onEliminar(cliente._id); }}
            disabled={eliminando}
            style={{ background: eliminando ? "#f1f5f9" : "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: eliminando ? "not-allowed" : "pointer", color: "#dc2626", opacity: eliminando ? 0.6 : 1 }}
            title="Eliminar"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* ── PROYECTOS ── */}
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #f3f4f6" }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3px" }}>
          📊 Proyectos: <span style={{ color: "#1f8f57" }}>{cantProyectos}</span>
        </p>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// PÁGINA CLIENTES
// ══════════════════════════════════════════════════════════
export default function ClientesPage() {
  const [clientes,    setClientes]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [clienteSel,  setClienteSel]  = useState(null);
  const [eliminando,  setEliminando]  = useState(null);
  const [searchTerm,  setSearchTerm]  = useState("");

  // ── Cargar clientes ────────────────────────────────────────
  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const res = await getClientes();
      setClientes(Array.isArray(res?.data) ? res.data : []);
      setError(null);
    } catch (err) {
      setError(err?.message || "Error al cargar clientes");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Filtro búsqueda ────────────────────────────────────────
  const clientesFiltrados = clientes.filter(c =>
    (c.razon_social?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (c.codigo?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (c.nit?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  // ── Abrir modal ────────────────────────────────────────
  const handleVerCliente = (cliente) => {
    setClienteSel(cliente);
    setModalOpen(true);
  };

  // ── Cerrar modal ────────────────────────────────────────
  const handleCerrarModal = () => {
    setModalOpen(false);
    setClienteSel(null);
    cargarClientes();
  };

  // ── Editar ────────────────────────────────────────
  const handleEditar = (cliente) => {
    setClienteSel(cliente);
    setModalOpen(true);
  };

  // ── Eliminar ────────────────────────────────────────
  const handleEliminar = async (id) => {
    try {
      setEliminando(id);
      await deleteCliente(id);
      setClientes(prev => prev.filter(c => c._id !== id));
      setError(null);
    } catch (err) {
      setError(err?.message || "Error al eliminar");
    } finally {
      setEliminando(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-container">
        {/* ── HEADER ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">👥 Clientes</h1>
            <p className="page-subtitle">Gestiona todos los clientes de tu empresa</p>
          </div>
          <button
            onClick={() => { setClienteSel(null); setModalOpen(true); }}
            className="btn btn-primary btn-lg"
          >
            <Users size={18} /> Nuevo Cliente
          </button>
        </div>

        {/* ── ALERTA ── */}
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* ── BÚSQUEDA ── */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            placeholder="🔍 Buscar por razón social, código o NIT..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: "100%", padding: "12px 16px",
              border: "1.5px solid #e2e8f0", borderRadius: 10,
              fontSize: 14, fontFamily: "inherit",
              outline: "none",
            }}
          />
        </div>

        {/* ── GRID ── */}
        {loading ? (
          <div className="loading">Cargando clientes...</div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="empty-state">
            <Building2 size={48} />
            <h3>No hay clientes</h3>
            <p>Crea tu primer cliente para comenzar</p>
          </div>
        ) : (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16,
          }}>
            {clientesFiltrados.map(cliente => (
              <ClienteCard
                key={cliente._id}
                cliente={cliente}
                onVer={() => handleVerCliente(cliente)}
                onEditar={handleEditar}
                onEliminar={handleEliminar}
                eliminando={eliminando === cliente._id}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {modalOpen && (
        <ClienteModal
          isOpen={modalOpen}
          onClose={handleCerrarModal}
          cliente={clienteSel}
        />
      )}
    </DashboardLayout>
  );
}