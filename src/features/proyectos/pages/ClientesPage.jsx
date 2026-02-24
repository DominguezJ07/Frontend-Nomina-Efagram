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
        }}>
          <span style={{
            fontSize: 16, fontWeight: 800,
            color: cliente.activo ? "#1f8f57" : "#94a3b8",
            lineHeight: 1,
          }}>
            {iniciales(cliente.razon_social)}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0,
            fontSize: 15, fontWeight: 700, color: "#0f172a",
            lineHeight: 1.3,
            wordBreak: "break-word",
          }}>
            {cliente.razon_social}
          </p>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
            NIT: {cliente.nit}
          </p>
        </div>

        <span style={{
          flexShrink: 0,
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "4px 11px",
          borderRadius: 999,
          fontSize: 12, fontWeight: 700,
          border: `1.5px solid ${cliente.activo ? "rgba(31,143,87,0.35)" : "rgba(220,38,38,0.3)"}`,
          background: cliente.activo ? "rgba(31,143,87,0.08)" : "rgba(220,38,38,0.08)",
          color: cliente.activo ? "#1f8f57" : "#dc2626",
        }}>
          {cliente.activo ? "Activo" : "Inactivo"}
        </span>
      </div>

      {/* ── DATOS DE CONTACTO ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        {cliente.telefono && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Phone size={13} color="#94a3b8" strokeWidth={2} />
            <span style={{ fontSize: 13, color: "#475569" }}>{cliente.telefono}</span>
          </div>
        )}
        {cliente.email && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Mail size={13} color="#94a3b8" strokeWidth={2} />
            <span style={{ fontSize: 13, color: "#475569", wordBreak: "break-all" }}>
              {cliente.email}
            </span>
          </div>
        )}
        {!cliente.telefono && !cliente.email && (
          <span style={{ fontSize: 13, color: "#cbd5e1" }}>Sin datos de contacto</span>
        )}
      </div>

      {/* ── SEPARADOR ── */}
      <div style={{ borderTop: "1px solid #f0f2f5", marginBottom: 12 }} />

      {/* ── PIE: proyectos + acciones ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
          {cantProyectos} proyecto{cantProyectos !== 1 ? "s" : ""}
        </span>

        <div style={{ display: "flex", gap: 6 }}>
          <button
            title="Ver detalle"
            onClick={() => onVer(cliente)}
            className="proy-btn-accion proy-btn-accion--view"
          >
            <Eye size={16} />
          </button>
          <button
            title="Editar"
            onClick={() => onEditar(cliente)}
            className="proy-btn-accion proy-btn-accion--edit"
          >
            <Pencil size={16} />
          </button>
          <button
            title={cliente.activo ? "Desactivar cliente" : "Cliente ya inactivo"}
            onClick={() => onEliminar(cliente)}
            disabled={eliminando === cliente._id || !cliente.activo}
            className="proy-btn-accion proy-btn-accion--delete"
            style={{ opacity: (!cliente.activo || eliminando === cliente._id) ? 0.4 : 1 }}
          >
            {eliminando === cliente._id
              ? <span style={{ fontSize: 11 }}>...</span>
              : <Trash2 size={16} />
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// MODAL VER DETALLE
// ══════════════════════════════════════════════════════════
const ClienteDetailModal = ({ cliente, onClose, onEdit }) => {
  if (!cliente) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(520px, calc(100% - 24px))", background: "#fff",
        border: "1px solid #e6e8ef", borderRadius: 18,
        boxShadow: "0 24px 64px rgba(15,23,42,0.2)",
        maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{ padding: "22px 24px 16px", borderBottom: "1px solid #f0f2f5", display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: cliente.activo ? "#e8f5ee" : "#fce4ec", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: cliente.activo ? "#1f8f57" : "#dc2626" }}>
              {iniciales(cliente.razon_social)}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0f172a" }}>{cliente.razon_social}</h2>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: cliente.activo ? "rgba(31,143,87,0.1)" : "rgba(220,38,38,0.1)", border: `1.5px solid ${cliente.activo ? "rgba(31,143,87,0.3)" : "rgba(220,38,38,0.3)"}`, color: cliente.activo ? "#1f8f57" : "#dc2626" }}>
                {cliente.activo ? <><CheckCircle size={11} /> Activo</> : <><XCircle size={11} /> Inactivo</>}
              </span>
            </div>
            {cliente.nombre_comercial && <p style={{ margin: "3px 0 0", fontSize: 13, color: "#64748b" }}>{cliente.nombre_comercial}</p>}
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>
              <strong>{cliente.codigo}</strong> · NIT: {cliente.nit}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "#f8fafc", border: "1px solid #e6e8ef", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, fontSize: 18, color: "#64748b" }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: "12px 24px 20px" }}>
          {[
            { label: "Teléfono",  value: cliente.telefono,  Icon: Phone },
            { label: "Email",     value: cliente.email,     Icon: Mail  },
            { label: "Dirección", value: cliente.direccion              },
            { label: "Ciudad",    value: cliente.ciudad                 },
          ].map(({ label, value, Icon }) => value ? (
            <div key={label} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: "1px solid #f0f2f5", alignItems: "center" }}>
              {Icon && <Icon size={14} color="#94a3b8" />}
              <div>
                <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>{label}</p>
                <p style={{ margin: "1px 0 0", fontSize: 14, color: "#0f172a" }}>{value}</p>
              </div>
            </div>
          ) : null)}

          {(cliente.contacto_nombre || cliente.contacto_telefono || cliente.contacto_email) && (
            <>
              <p style={{ margin: "16px 0 6px", fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Contacto principal</p>
              {cliente.contacto_nombre   && <p style={{ margin: "4px 0", fontSize: 14, color: "#0f172a" }}>{cliente.contacto_nombre}</p>}
              {cliente.contacto_telefono && <p style={{ margin: "4px 0", fontSize: 14, color: "#475569" }}>{cliente.contacto_telefono}</p>}
              {cliente.contacto_email    && <p style={{ margin: "4px 0", fontSize: 14, color: "#475569" }}>{cliente.contacto_email}</p>}
            </>
          )}
          {cliente.observaciones && (
            <>
              <p style={{ margin: "16px 0 4px", fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Observaciones</p>
              <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 }}>{cliente.observaciones}</p>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid #f0f2f5", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ background: "#f1f5f9", color: "#475569", border: "none", padding: "10px 18px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Cerrar</button>
          <button onClick={() => onEdit?.(cliente)} style={{ background: "#1f8f57", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(31,143,87,0.25)" }}>
            <Pencil size={15} /> Editar cliente
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════
const ClientesPage = () => {
  const [clientes,     setClientes]     = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [busqueda,     setBusqueda]     = useState("");
  const [filtroActivo, setFiltroActivo] = useState("todos");
  const [deletingId,   setDeletingId]   = useState(null);

  // ── Notificación inline (reemplaza alert) ─────────────
  const [toast, setToast] = useState(null); // { tipo: "error"|"ok", msg }
  const mostrarToast = (tipo, msg) => {
    setToast({ tipo, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const [modal, setModal] = useState({ open: false, tipo: "crear", cliente: null });

  const abrirCrear  = ()  => setModal({ open: true, tipo: "crear",  cliente: null });
  const abrirVer    = (c) => setModal({ open: true, tipo: "ver",    cliente: c    });
  const abrirEditar = (c) => setModal({ open: true, tipo: "editar", cliente: c    });
  const cerrarModal = ()  => setModal(prev => ({ ...prev, open: false }));

  // ── Cargar clientes ───────────────────────────────────
  const cargarClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getClientes();
      setClientes(res?.data?.data ?? res?.data ?? []);
    } catch (err) {
      console.error("Error cargando clientes:", err);
      setError("No se pudieron cargar los clientes.");
    } finally {
      setLoading(false);
    }
  };

  // ── Eliminar / Desactivar ─────────────────────────────
  const handleDelete = async (cliente) => {
    if (!window.confirm(`¿Seguro que deseas desactivar a "${cliente.razon_social}"?`)) return;

    try {
      setDeletingId(cliente._id);
      await deleteCliente(cliente._id);
      await cargarClientes();
      mostrarToast("ok", `"${cliente.razon_social}" fue desactivado correctamente.`);
    } catch (err) {
      console.error("Error eliminando cliente:", err?.response ?? err);

      const status = err?.response?.status;
      let msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        err?.message ||
        "No se pudo desactivar el cliente.";

      if (status === 403) {
        msg = "No tienes permisos para desactivar clientes. Contacta al administrador.";
      } else if (status === 404) {
        msg = "El cliente no fue encontrado. Recarga la página e intenta de nuevo.";
      }

      mostrarToast("error", msg);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => { cargarClientes(); }, []);

  const totalActivos   = clientes.filter(c => c.activo).length;
  const totalInactivos = clientes.filter(c => !c.activo).length;

  const clientesFiltrados = clientes.filter(c => {
    const q = busqueda.toLowerCase();
    const match =
      c.razon_social?.toLowerCase().includes(q) ||
      c.nombre_comercial?.toLowerCase().includes(q) ||
      c.nit?.toLowerCase().includes(q) ||
      c.codigo?.toLowerCase().includes(q) ||
      c.ciudad?.toLowerCase().includes(q);

    const estado =
      filtroActivo === "activos"   ? c.activo :
      filtroActivo === "inactivos" ? !c.activo : true;

    return match && estado;
  });

  return (
    <DashboardLayout>
      <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" }}>

        {/* ── TOAST NOTIFICACIÓN ── */}
        {toast && (
          <div style={{
            position: "fixed", top: 20, right: 24, zIndex: 9999,
            background: toast.tipo === "ok" ? "#e8f5ee" : "#fef2f2",
            border: `1.5px solid ${toast.tipo === "ok" ? "rgba(31,143,87,0.4)" : "#fecaca"}`,
            color: toast.tipo === "ok" ? "#1f8f57" : "#dc2626",
            padding: "12px 18px",
            borderRadius: 12,
            fontSize: 14, fontWeight: 600,
            boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
            maxWidth: 380,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span>{toast.tipo === "ok" ? "✓" : "✕"}</span>
            <span>{toast.msg}</span>
            <button
              onClick={() => setToast(null)}
              style={{ background: "none", border: "none", cursor: "pointer", marginLeft: "auto", fontSize: 16, color: "inherit", opacity: 0.6 }}
            >×</button>
          </div>
        )}

        {/* ── STATS ── */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { icon: Building2,   label: "Total Clientes", value: clientes.length, color: "#1f8f57", bg: "#e8f5ee" },
            { icon: CheckCircle, label: "Activos",         value: totalActivos,    color: "#1f8f57", bg: "#e8f5ee" },
            { icon: XCircle,     label: "Inactivos",       value: totalInactivos,  color: "#dc2626", bg: "#fce4ec" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", border: "1px solid #e6e8ef", borderRadius: 14, padding: "18px 24px", flex: 1, minWidth: 150, boxShadow: "0 2px 8px rgba(15,23,42,0.05)" }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={20} color={stat.color} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: "#8a94a6", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>{stat.label}</p>
                  <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── TOOLBAR ── */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 220, position: "relative", display: "flex", alignItems: "center" }}>
            <span style={{ position: "absolute", left: 14, fontSize: 15, pointerEvents: "none" }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombre, NIT, código o ciudad..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ width: "100%", padding: "11px 14px 11px 40px", border: "1.5px solid #d6dbe6", borderRadius: 10, fontSize: 14, color: "#0f172a", background: "#fff", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {[
              { key: "todos",     label: "Todos"     },
              { key: "activos",   label: "Activos"   },
              { key: "inactivos", label: "Inactivos" },
            ].map(f => (
              <button key={f.key} onClick={() => setFiltroActivo(f.key)} style={{ padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${filtroActivo === f.key ? "#1f8f57" : "#e2e8f0"}`, background: filtroActivo === f.key ? "#1f8f57" : "#fff", color: filtroActivo === f.key ? "#fff" : "#475569", transition: "all 0.15s ease" }}>
                {f.label}
              </button>
            ))}
          </div>

          <button onClick={abrirCrear} style={{ background: "#1f8f57", color: "#fff", border: "none", padding: "11px 18px", borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 14, boxShadow: "0 4px 12px rgba(31,143,87,0.25)", whiteSpace: "nowrap" }}>
            + &nbsp;Nuevo Cliente
          </button>
        </div>

        {/* ── ESTADOS ── */}
        {loading && <p style={{ color: "#64748b", fontSize: 14 }}>Cargando clientes...</p>}
        {error   && <p style={{ color: "#dc2626", fontSize: 14 }}>{error}</p>}
        {!loading && clientesFiltrados.length === 0 && !error && (
          <p style={{ color: "#64748b", fontSize: 14 }}>No hay clientes que coincidan con la búsqueda.</p>
        )}

        {/* ── GRID DE CARDS ── */}
        {!loading && clientesFiltrados.length > 0 && (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
              gap: 18,
            }}>
              {clientesFiltrados.map(cliente => (
                <ClienteCard
                  key={cliente._id}
                  cliente={cliente}
                  onVer={abrirVer}
                  onEditar={abrirEditar}
                  onEliminar={handleDelete}
                  eliminando={deletingId}
                />
              ))}
            </div>

            <p style={{ marginTop: 18, fontSize: 13, color: "#94a3b8", textAlign: "right" }}>
              Mostrando <strong style={{ color: "#475569" }}>{clientesFiltrados.length}</strong> de <strong style={{ color: "#475569" }}>{clientes.length}</strong> clientes
            </p>
          </>
        )}

        {/* ── MODAL VER ── */}
        {modal.open && modal.tipo === "ver" && (
          <ClienteDetailModal
            cliente={modal.cliente}
            onClose={cerrarModal}
            onEdit={(c) => setModal({ open: true, tipo: "editar", cliente: c })}
          />
        )}

        {/* ── MODAL CREAR / EDITAR ── */}
        <ClienteModal
          isOpen={modal.open && (modal.tipo === "crear" || modal.tipo === "editar")}
          cliente={modal.tipo === "editar" ? modal.cliente : null}
          onClose={cerrarModal}
          onSuccess={() => {
            const accion = modal.tipo === "editar" ? "actualizado" : "creado";
            cerrarModal();
            cargarClientes();
            mostrarToast("ok", `Cliente ${accion} correctamente.`);
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default ClientesPage;