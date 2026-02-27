import { useEffect, useMemo, useState } from 'react';
import { FilePlus, Eye, Pencil, Trash2, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import DashboardLayout from '../../../app/layouts/DashboardLayout';
import ContratoModal from '../components/ContratoModal';
import { getContratos, cancelarContrato } from '../services/contratosService';
import '../../../assets/styles/contratos.css';

// ── helpers ──────────────────────────────────────────────────────
const normalizeList = (res) => {
  if (Array.isArray(res))             return res;
  if (Array.isArray(res?.data))       return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

const fmtFecha = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' }) : '—';

const ESTADO_LABEL = { ACTIVO:'Activo', BORRADOR:'Borrador', CERRADO:'Cerrado', CANCELADO:'Cancelado' };

// ── Stats card ────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, bg }) => {
  const Icon = icon;
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
export default function ContratosPage() {
  const [contratos,  setContratos]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [busqueda,   setBusqueda]   = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // modal: { open, modo: 'crear'|'editar'|'ver', contrato: obj|null }
  const [modal, setModal] = useState({ open: false, modo: 'crear', contrato: null });

  const abrirCrear  = ()  => setModal({ open: true, modo: 'crear',  contrato: null });
  const abrirVer    = (c) => setModal({ open: true, modo: 'ver',    contrato: c });
  const abrirEditar = (c) => setModal({ open: true, modo: 'editar', contrato: c });
  const cerrarModal = ()  => setModal(prev => ({ ...prev, open: false }));

  // ── Cargar contratos ──────────────────────────────────────────
  const cargar = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getContratos();
      setContratos(normalizeList(res));
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar los contratos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  // ── Cancelar contrato ────────────────────────────────────────
  const handleCancelar = async (c) => {
    if (!window.confirm(`¿Cancelar el contrato "${c.codigo}"? Esta acción no se puede revertir.`)) return;
    try {
      setDeletingId(c._id ?? c.id);
      await cancelarContrato(c._id ?? c.id);
      await cargar();
    } catch (e) {
      alert(e?.response?.data?.message ?? 'No se pudo cancelar el contrato');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Filtro de búsqueda local ──────────────────────────────────
  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return contratos;
    return contratos.filter(c => {
      const cod   = (c.codigo ?? '').toLowerCase();
      const finca = (c.finca?.nombre ?? '').toLowerCase();
      const cuad  = (c.cuadrilla?.nombre ?? '').toLowerCase();
      return cod.includes(q) || finca.includes(q) || cuad.includes(q);
    });
  }, [contratos, busqueda]);

  // ── Stats derivadas ───────────────────────────────────────────
  const activos    = contratos.filter(c => c.estado === 'ACTIVO').length;
  const borradores = contratos.filter(c => c.estado === 'BORRADOR').length;
  const cerrados   = contratos.filter(c => c.estado === 'CERRADO' || c.estado === 'CANCELADO').length;

  // ── Chips helper (muestra máx. 2 + "+N") ─────────────────────
  const Chips = ({ items, getLabel }) => {
    const MAX = 2;
    const visible = items.slice(0, MAX);
    const extra   = items.length - MAX;
    return (
      <div className="chips-wrap">
        {visible.map((it, i) => (
          <span key={i} className="chip">{getLabel(it)}</span>
        ))}
        {extra > 0 && <span className="chip chip-more">+{extra}</span>}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="contratos-container">

        {/* Header */}
        <div className="contratos-header">
          <div>
            <h2>📋 Contratos</h2>
            <p>Gestión de contratos operativos por finca y cuadrilla</p>
          </div>
        </div>

        {/* Stats */}
        <div className="contratos-stats">
          <StatCard icon={FileText}    label="Total"     value={contratos.length} color="#3b82f6" bg="rgba(59,130,246,0.1)" />
          <StatCard icon={CheckCircle} label="Activos"   value={activos}          color="#1f8f57" bg="rgba(31,143,87,0.1)"  />
          <StatCard icon={Clock}       label="Borradores" value={borradores}      color="#ca8a04" bg="rgba(234,179,8,0.1)"  />
          <StatCard icon={XCircle}     label="Cerrados"  value={cerrados}         color="#64748b" bg="rgba(100,116,139,0.1)" />
        </div>

        {/* Toolbar */}
        <div className="contratos-toolbar">
          <input
            className="contratos-search"
            placeholder="Buscar por código, finca o cuadrilla..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <button className="btn-crear-contrato" onClick={abrirCrear}>
            <FilePlus size={16} /> Nuevo contrato
          </button>
        </div>

        {/* Error */}
        {error && <div className="contratos-error">{error}</div>}

        {/* Tabla */}
        {loading ? (
          <div className="contratos-empty">
            <div className="empty-icon">⏳</div>
            <h3>Cargando contratos...</h3>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="contratos-empty">
            <div className="empty-icon">📋</div>
            <h3>{busqueda ? 'Sin resultados' : 'No hay contratos aún'}</h3>
            <p>{busqueda ? `Ningún contrato coincide con "${busqueda}"` : 'Crea el primero usando el botón de arriba.'}</p>
          </div>
        ) : (
          <div className="contratos-table-wrap">
            <table className="contratos-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Finca</th>
                  <th>Lotes</th>
                  <th>Actividades</th>
                  <th>Cuadrilla</th>
                  <th>Fecha inicio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(c => {
                  const cid = c._id ?? c.id;
                  return (
                    <tr key={cid}>
                      <td><strong>{c.codigo}</strong></td>
                      <td>{c.finca?.nombre ?? '—'}</td>
                      <td>
                        <Chips
                          items={c.lotes ?? []}
                          getLabel={l => l.nombre ?? l.codigo ?? '?'}
                        />
                      </td>
                      <td>
                        <Chips
                          items={c.actividades ?? []}
                          getLabel={a => a.nombre ?? '?'}
                        />
                      </td>
                      <td>
                        {c.cuadrilla?.nombre ?? '—'}
                        {c.cuadrilla && (
                          <span style={{ fontSize:11, color:'#94a3b8', marginLeft:4 }}>
                            · {(c.cuadrilla.miembros ?? []).filter(m => m.activo).length}👷
                          </span>
                        )}
                      </td>
                      <td>{fmtFecha(c.fecha_inicio)}</td>
                      <td>
                        <span className={`badge-estado badge-${c.estado}`}>
                          {ESTADO_LABEL[c.estado] ?? c.estado}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="btn-icon" title="Ver detalle" onClick={() => abrirVer(c)}>
                            <Eye size={15} color="#3b82f6" />
                          </button>
                          {c.estado !== 'CANCELADO' && c.estado !== 'CERRADO' && (
                            <button className="btn-icon" title="Editar" onClick={() => abrirEditar(c)}>
                              <Pencil size={15} color="#64748b" />
                            </button>
                          )}
                          {c.estado !== 'CANCELADO' && (
                            <button
                              className="btn-icon btn-danger"
                              title="Cancelar contrato"
                              disabled={deletingId === cid}
                              onClick={() => handleCancelar(c)}
                            >
                              <Trash2 size={15} color="#dc2626" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <ContratoModal
        isOpen={modal.open}
        modo={modal.modo}
        contrato={modal.contrato}
        onClose={cerrarModal}
        onSuccess={cargar}
      />
    </DashboardLayout>
  );
}