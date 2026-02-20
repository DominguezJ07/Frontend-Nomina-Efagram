import { useEffect, useState } from "react";
import { getClientes, deleteCliente } from "../services/clientesService";
import ClienteModal from "../components/ClienteModal";
import DashboardLayout from "../../../app/layouts/DashboardLayout";
import "../../../assets/styles/proyectos.css";
import {
  Users, Building2, Eye, Pencil, Trash2,
  Phone, Mail, MapPin, X, CheckCircle, XCircle,
} from "lucide-react";

// ══════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════
const iniciales = (str = "") =>
  str.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

// ── Sub-componente definido FUERA de cualquier componente ──
// ⚠️ Definirlo dentro causaría: "Cannot create components during render"
const InfoItem = ({ icon, label, value }) => {
  const Icon = icon;
  if (!value) return null;
  return (
    <div style={{ display:"flex", gap:10, padding:"9px 0", borderBottom:"1px solid #f0f2f5", alignItems:"flex-start" }}>
      <div style={{ width:30, height:30, borderRadius:8, background:"#f8fafc", border:"1px solid #e6e8ef", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Icon size={14} color="#64748b" />
      </div>
      <div>
        <p style={{ margin:0, fontSize:11, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.4px" }}>{label}</p>
        <p style={{ margin:"2px 0 0", fontSize:14, color:"#0f172a", fontWeight:500 }}>{value}</p>
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
      <div onClick={e => e.stopPropagation()} style={{ width:"min(560px, calc(100% - 24px))", background:"#fff", border:"1px solid #e6e8ef", borderRadius:18, boxShadow:"0 24px 64px rgba(15,23,42,0.2)", maxHeight:"90vh", overflowY:"auto", display:"flex", flexDirection:"column" }}>

        {/* HEADER */}
        <div style={{ padding:"22px 24px 16px", borderBottom:"1px solid #f0f2f5", display:"flex", gap:14, alignItems:"flex-start" }}>
          <div style={{ width:52, height:52, borderRadius:14, background: cliente.activo ? "#e8f5ee":"#fce4ec", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ fontSize:20, fontWeight:900, color: cliente.activo ? "#1f8f57":"#dc2626" }}>
              {iniciales(cliente.razon_social)}
            </span>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:"#0f172a" }}>{cliente.razon_social}</h2>
              <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:999, fontSize:12, fontWeight:700, background: cliente.activo ? "rgba(31,143,87,0.1)":"rgba(220,38,38,0.1)", border:`1.5px solid ${cliente.activo ? "rgba(31,143,87,0.3)":"rgba(220,38,38,0.3)"}`, color: cliente.activo ? "#1f8f57":"#dc2626" }}>
                {cliente.activo ? <><CheckCircle size={11} /> Activo</> : <><XCircle size={11} /> Inactivo</>}
              </span>
            </div>
            {cliente.nombre_comercial && (
              <p style={{ margin:"3px 0 0", fontSize:13, color:"#64748b" }}>{cliente.nombre_comercial}</p>
            )}
            <p style={{ margin:"2px 0 0", fontSize:12, color:"#94a3b8" }}>
              <strong>{cliente.codigo}</strong> · NIT: {cliente.nit}
            </p>
          </div>
          <button onClick={onClose} style={{ background:"#f8fafc", border:"1px solid #e6e8ef", borderRadius:8, width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
            <X size={16} color="#64748b" />
          </button>
        </div>

        {/* BODY */}
        <div style={{ padding:"10px 24px 20px" }}>

          {/* Empresa */}
          <p style={{ margin:"14px 0 6px", fontSize:12, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px" }}>Información empresa</p>
          <InfoItem icon={Phone}     label="Teléfono"  value={cliente.telefono} />
          <InfoItem icon={Mail}      label="Email"     value={cliente.email} />
          <InfoItem icon={MapPin}    label="Dirección" value={cliente.direccion} />
          <InfoItem icon={Building2} label="Ciudad"    value={cliente.ciudad} />

          {/* Contacto principal */}
          {(cliente.contacto_nombre || cliente.contacto_telefono || cliente.contacto_email) && (
            <>
              <p style={{ margin:"18px 0 6px", fontSize:12, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px" }}>Contacto principal</p>
              <InfoItem icon={Users} label="Nombre"   value={cliente.contacto_nombre} />
              <InfoItem icon={Phone} label="Teléfono" value={cliente.contacto_telefono} />
              <InfoItem icon={Mail}  label="Email"    value={cliente.contacto_email} />
            </>
          )}

          {/* Observaciones */}
          {cliente.observaciones && (
            <>
              <p style={{ margin:"18px 0 6px", fontSize:12, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px" }}>Observaciones</p>
              <p style={{ margin:0, fontSize:14, color:"#475569", lineHeight:1.6 }}>{cliente.observaciones}</p>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ padding:"14px 24px", borderTop:"1px solid #f0f2f5", display:"flex", justifyContent:"flex-end", gap:10 }}>
          <button onClick={onClose} style={{ background:"#f1f5f9", color:"#475569", border:"none", padding:"10px 18px", borderRadius:10, fontWeight:700, cursor:"pointer", fontSize:14 }}>
            Cerrar
          </button>
          <button onClick={() => onEdit?.(cliente)} style={{ background:"#1f8f57", color:"#fff", border:"none", padding:"10px 20px", borderRadius:10, fontWeight:700, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", gap:8, boxShadow:"0 4px 12px rgba(31,143,87,0.25)" }}>
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

  const [modal, setModal] = useState({ open:false, tipo:"crear", cliente:null });

  const abrirCrear  = ()  => setModal({ open:true, tipo:"crear",  cliente:null });
  const abrirVer    = (c) => setModal({ open:true, tipo:"ver",    cliente:c });
  const abrirEditar = (c) => setModal({ open:true, tipo:"editar", cliente:c });
  const cerrarModal = ()  => setModal(prev => ({ ...prev, open:false }));

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

  const handleDelete = async (cliente) => {
    const accion = cliente.activo ? "desactivar" : "eliminar";
    if (!window.confirm(`¿Seguro que deseas ${accion} a "${cliente.razon_social}"?`)) return;
    try {
      setDeletingId(cliente._id);
      await deleteCliente(cliente._id);
      await cargarClientes();
    } catch (err) {
      alert(err?.response?.data?.message ?? `No se pudo ${accion} el cliente`);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => { cargarClientes(); }, []);

  const totalActivos   = clientes.filter(c => c.activo).length;
  const totalInactivos = clientes.filter(c => !c.activo).length;

  const clientesFiltrados = clientes.filter(c => {
    const q = busqueda.toLowerCase();
    const coincideBusqueda =
      c.razon_social?.toLowerCase().includes(q) ||
      c.nombre_comercial?.toLowerCase().includes(q) ||
      c.nit?.toLowerCase().includes(q) ||
      c.codigo?.toLowerCase().includes(q) ||
      c.ciudad?.toLowerCase().includes(q);

    const coincideEstado =
      filtroActivo === "todos"     ? true :
      filtroActivo === "activos"   ? c.activo :
      filtroActivo === "inactivos" ? !c.activo : true;

    return coincideBusqueda && coincideEstado;
  });

  return (
    <DashboardLayout>
      <div style={{ padding:"0", fontFamily:"system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" }}>

        {/* ── STATS ── */}
        <div style={{ display:"flex", gap:16, marginBottom:24, flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:16, background:"#fff", border:"1px solid #e6e8ef", borderRadius:14, padding:"18px 24px", flex:1, minWidth:160, boxShadow:"0 2px 8px rgba(15,23,42,0.05)" }}>
            <div style={{ width:48, height:48, borderRadius:12, background:"#e8f5ee", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Building2 size={22} color="#1f8f57" />
            </div>
            <div>
              <p style={{ margin:0, fontSize:12, color:"#8a94a6", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.4px" }}>Total Clientes</p>
              <p style={{ margin:0, fontSize:28, fontWeight:800, color:"#0f172a", lineHeight:1.1 }}>{clientes.length}</p>
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:16, background:"#fff", border:"1px solid #e6e8ef", borderRadius:14, padding:"18px 24px", flex:1, minWidth:160, boxShadow:"0 2px 8px rgba(15,23,42,0.05)" }}>
            <div style={{ width:48, height:48, borderRadius:12, background:"#e8f5ee", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <CheckCircle size={22} color="#1f8f57" />
            </div>
            <div>
              <p style={{ margin:0, fontSize:12, color:"#8a94a6", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.4px" }}>Activos</p>
              <p style={{ margin:0, fontSize:28, fontWeight:800, color:"#1f8f57", lineHeight:1.1 }}>{totalActivos}</p>
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:16, background:"#fff", border:"1px solid #e6e8ef", borderRadius:14, padding:"18px 24px", flex:1, minWidth:160, boxShadow:"0 2px 8px rgba(15,23,42,0.05)" }}>
            <div style={{ width:48, height:48, borderRadius:12, background:"#fce4ec", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <XCircle size={22} color="#dc2626" />
            </div>
            <div>
              <p style={{ margin:0, fontSize:12, color:"#8a94a6", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.4px" }}>Inactivos</p>
              <p style={{ margin:0, fontSize:28, fontWeight:800, color:"#dc2626", lineHeight:1.1 }}>{totalInactivos}</p>
            </div>
          </div>
        </div>

        {/* ── TOOLBAR ── */}
        <div style={{ display:"flex", gap:12, marginBottom:24, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ flex:1, minWidth:220, position:"relative", display:"flex", alignItems:"center" }}>
            <span style={{ position:"absolute", left:14, fontSize:16, pointerEvents:"none" }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombre, NIT, código o ciudad..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ width:"100%", padding:"11px 14px 11px 42px", border:"1.5px solid #d6dbe6", borderRadius:10, fontSize:14, color:"#0f172a", background:"#fff", outline:"none", boxSizing:"border-box" }}
            />
          </div>

          <div style={{ display:"flex", gap:6 }}>
            {[
              { key:"todos",     label:"Todos" },
              { key:"activos",   label:"Activos" },
              { key:"inactivos", label:"Inactivos" },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFiltroActivo(f.key)}
                style={{
                  padding:"9px 16px", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer",
                  border:`1.5px solid ${filtroActivo === f.key ? "#1f8f57" : "#e2e8f0"}`,
                  background: filtroActivo === f.key ? "#1f8f57" : "#fff",
                  color: filtroActivo === f.key ? "#fff" : "#475569",
                  transition:"all 0.15s ease",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={abrirCrear}
            style={{ background:"#1f8f57", color:"#fff", border:"none", padding:"11px 18px", borderRadius:12, fontWeight:700, cursor:"pointer", fontSize:14, boxShadow:"0 4px 12px rgba(31,143,87,0.25)", whiteSpace:"nowrap" }}
          >
            + &nbsp;Nuevo Cliente
          </button>
        </div>

        {/* ── ESTADOS ── */}
        {loading && <p style={{ color:"#64748b", fontSize:14 }}>Cargando clientes...</p>}
        {error   && <p style={{ color:"#dc2626", fontSize:14 }}>{error}</p>}
        {!loading && clientesFiltrados.length === 0 && !error && (
          <p style={{ color:"#64748b", fontSize:14 }}>No hay clientes que coincidan con la búsqueda.</p>
        )}

        {/* ── TABLA ── */}
        {!loading && clientesFiltrados.length > 0 && (
          <div style={{ background:"#fff", border:"1px solid #e6e8ef", borderRadius:16, overflow:"hidden", boxShadow:"0 2px 10px rgba(15,23,42,0.05)" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#f8fafc", borderBottom:"1px solid #e6e8ef" }}>
                  {["Cliente", "NIT", "Ciudad", "Contacto", "Estado", "Acciones"].map(h => (
                    <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.4px", whiteSpace:"nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((cliente, idx) => (
                  <tr
                    key={cliente._id}
                    style={{ borderBottom: idx < clientesFiltrados.length - 1 ? "1px solid #f0f2f5" : "none", transition:"background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {/* Cliente */}
                    <td style={{ padding:"14px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ width:38, height:38, borderRadius:10, background: cliente.activo ? "#e8f5ee":"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <span style={{ fontSize:14, fontWeight:800, color: cliente.activo ? "#1f8f57":"#94a3b8" }}>
                            {iniciales(cliente.razon_social)}
                          </span>
                        </div>
                        <div>
                          <p style={{ margin:0, fontSize:14, fontWeight:700, color:"#0f172a" }}>{cliente.razon_social}</p>
                          {cliente.nombre_comercial && (
                            <p style={{ margin:0, fontSize:12, color:"#64748b" }}>{cliente.nombre_comercial}</p>
                          )}
                          <p style={{ margin:0, fontSize:11, color:"#94a3b8" }}>{cliente.codigo}</p>
                        </div>
                      </div>
                    </td>

                    {/* NIT */}
                    <td style={{ padding:"14px 16px", fontSize:14, color:"#475569" }}>{cliente.nit}</td>

                    {/* Ciudad */}
                    <td style={{ padding:"14px 16px", fontSize:14, color:"#475569" }}>{cliente.ciudad || "—"}</td>

                    {/* Contacto */}
                    <td style={{ padding:"14px 16px" }}>
                      <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                        {cliente.telefono && (
                          <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:13, color:"#475569" }}>
                            <Phone size={12} color="#94a3b8" /> {cliente.telefono}
                          </span>
                        )}
                        {cliente.email && (
                          <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:13, color:"#475569" }}>
                            <Mail size={12} color="#94a3b8" /> {cliente.email}
                          </span>
                        )}
                        {!cliente.telefono && !cliente.email && <span style={{ fontSize:13, color:"#94a3b8" }}>—</span>}
                      </div>
                    </td>

                    {/* Estado */}
                    <td style={{ padding:"14px 16px" }}>
                      <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:999, fontSize:12, fontWeight:700, background: cliente.activo ? "rgba(31,143,87,0.1)":"rgba(220,38,38,0.1)", border:`1.5px solid ${cliente.activo ? "rgba(31,143,87,0.3)":"rgba(220,38,38,0.3)"}`, color: cliente.activo ? "#1f8f57":"#dc2626" }}>
                        {cliente.activo ? <><CheckCircle size={11} /> Activo</> : <><XCircle size={11} /> Inactivo</>}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td style={{ padding:"14px 16px" }}>
                      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                        <button
                          title="Ver detalle"
                          onClick={() => abrirVer(cliente)}
                          className="proy-btn-accion proy-btn-accion--view"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          title="Editar"
                          onClick={() => abrirEditar(cliente)}
                          className="proy-btn-accion proy-btn-accion--edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          title={cliente.activo ? "Desactivar" : "Ya inactivo"}
                          onClick={() => handleDelete(cliente)}
                          disabled={deletingId === cliente._id || !cliente.activo}
                          className="proy-btn-accion proy-btn-accion--delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ padding:"12px 16px", borderTop:"1px solid #f0f2f5", background:"#f8fafc" }}>
              <p style={{ margin:0, fontSize:13, color:"#94a3b8" }}>
                Mostrando <strong style={{ color:"#475569" }}>{clientesFiltrados.length}</strong> de <strong style={{ color:"#475569" }}>{clientes.length}</strong> clientes
              </p>
            </div>
          </div>
        )}

        {/* ── MODAL VER ── */}
        {modal.open && modal.tipo === "ver" && (
          <ClienteDetailModal
            cliente={modal.cliente}
            onClose={cerrarModal}
            onEdit={(c) => setModal({ open:true, tipo:"editar", cliente:c })}
          />
        )}

        {/* ── MODAL CREAR / EDITAR ── */}
        <ClienteModal
          isOpen={modal.open && (modal.tipo === "crear" || modal.tipo === "editar")}
          cliente={modal.tipo === "editar" ? modal.cliente : null}
          onClose={cerrarModal}
          onSuccess={() => {
            cerrarModal();
            cargarClientes();
          }}
        />

      </div>
    </DashboardLayout>
  );
};

export default ClientesPage;