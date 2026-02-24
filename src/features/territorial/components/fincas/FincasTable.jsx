import { useState } from 'react';
import { Eye, Pencil, Trash2, Plus, Search, Trees, X, ChevronDown } from 'lucide-react';
import NuevaFincaModal from './NuevaFincaModal';

// ── Modal de detalle ───────────────────────────────────────────────────────
function FincaDetalleModal({ isOpen, finca, onClose }) {
  if (!isOpen || !finca) return null;

  let isActive = false;
  const raw = finca?.activa ?? finca?.estado;
  if (typeof raw === 'boolean') isActive = raw;
  else if (typeof raw === 'string') {
    const v = raw.toLowerCase().trim();
    isActive = v === 'activa' || v === 'activo' || v === 'active' || v === 'true' || v === '1';
  } else if (typeof raw === 'number') isActive = raw === 1;

  const area = finca?.area ?? finca?.areaTotal ?? finca?.hectareas;

  return (
    <>
      <div className="zdm-overlay" onClick={onClose} />
      <div className="zdm-panel" role="dialog" aria-modal="true">
        <button className="zdm-close" onClick={onClose} aria-label="Cerrar"><X size={15} /></button>

        <div className="zdm-header">
          <h2 className="zdm-title">Detalle de Finca</h2>
          <p className="zdm-subtitle">Información de la finca territorial</p>
        </div>

        <div className="zdm-name-card">
          <div className="zdm-pin-wrap" style={{ background: '#f0faf4', borderColor: '#16a34a', color: '#16a34a' }}>
            <Trees size={20} />
          </div>
          <div className="zdm-name-info">
            <span className="zdm-name">{finca?.nombre ?? '-'}</span>
            <span className="zdm-code">{finca?.codigo ?? '-'}</span>
          </div>
        </div>

        {finca?.nucleo && (
          <div className="zdm-estado-box" style={{ marginBottom: 8 }}>
            <span className="zdm-estado-label">Núcleo</span>
            <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
              {typeof finca.nucleo === 'object' ? (finca.nucleo?.nombre ?? '-') : finca.nucleo}
            </span>
          </div>
        )}

        {area !== undefined && area !== null && (
          <div className="zdm-estado-box" style={{ marginBottom: 8 }}>
            <span className="zdm-estado-label">Área</span>
            <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{area} ha</span>
          </div>
        )}

        <div className="zdm-estado-box">
          <span className="zdm-estado-label">Estado</span>
          <span className={isActive ? 'zdm-badge active' : 'zdm-badge inactive'}>
            {isActive ? '⊙ Activa' : '⊗ Inactiva'}
          </span>
        </div>
      </div>
    </>
  );
}

// ── Tabla principal ────────────────────────────────────────────────────────
export default function FincasTable({ fincas = [], nucleos = [], search = '', setSearch, onAdd, onUpdate, onDelete }) {
  const [openCreate, setOpenCreate]     = useState(false);
  const [editFinca, setEditFinca]       = useState(null);
  const [detalleFinca, setDetalleFinca] = useState(null);
  const [nucleoFiltro, setNucleoFiltro] = useState('');

  const getId = (f) => f?._id ?? f?.id;

  const handleDelete = async (id) => {
    const ok = window.confirm('¿Eliminar esta finca?');
    if (!ok) return;
    await onDelete?.(id);
  };

  const resolveNucleoNombre = (f) => {
    if (!f?.nucleo) return '-';
    if (typeof f.nucleo === 'object') return f.nucleo?.nombre ?? '-';
    const found = nucleos.find((n) => (n?._id ?? n?.id) === f.nucleo);
    return found?.nombre ?? f.nucleo;
  };

  const resolveNucleoId = (f) => {
    if (!f?.nucleo) return '';
    if (typeof f.nucleo === 'object') return f.nucleo?._id ?? f.nucleo?.id ?? '';
    return f.nucleo;
  };

  const fincasFiltradas = nucleoFiltro
    ? fincas.filter((f) => resolveNucleoId(f) === nucleoFiltro)
    : fincas;

  const getArea = (f) => f?.area ?? f?.areaTotal ?? f?.hectareas;

  const resolveEstado = (f) => {
    const raw = f?.activa ?? f?.estado;
    if (typeof raw === 'boolean') return raw;
    if (typeof raw === 'string') {
      const v = raw.toLowerCase().trim();
      return v === 'activa' || v === 'activo' || v === 'active' || v === 'true' || v === '1';
    }
    if (typeof raw === 'number') return raw === 1;
    return false;
  };

  return (
    <div className="zonas-card">

      {/* HEADER */}
      <div className="zonas-card-header">
        <h2 className="zonas-card-title">Gestión de Fincas</h2>
        <button className="btn-primary" onClick={() => setOpenCreate(true)}>
          <Plus size={16} />
          Nueva Finca
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA + FILTRO */}
      <div className="fincas-search-bar">
        <div className="fincas-search-input">
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch?.(e.target.value)}
            placeholder="Buscar por codigo o nombre..."
          />
        </div>
        <div className="fincas-select-wrap">
          <select
            value={nucleoFiltro}
            onChange={(e) => setNucleoFiltro(e.target.value)}
            className="fincas-select"
          >
            <option value="">Todos los nucleos</option>
            {nucleos.map((n) => {
              const id = n?._id ?? n?.id;
              return <option key={id} value={id}>{n?.nombre ?? id}</option>;
            })}
          </select>
          <ChevronDown size={14} className="fincas-select-arrow" />
        </div>
      </div>

      {/* TABLA */}
      <div className="zonas-table-scroll">
        <table className="zonas-table-grid fincas-table">
          <thead>
            <tr>
              <th style={{ width: '110px' }}>Codigo</th>
              <th style={{ width: '180px' }}>Nombre</th>
              <th style={{ width: '160px' }}>Nucleo</th>
              <th style={{ width: '110px' }}>Area Total</th>
              <th style={{ width: '130px' }}>Estado</th>
              <th style={{ width: '140px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {fincasFiltradas.length === 0 ? (
              <tr><td colSpan={6} className="zonas-empty">No hay fincas para mostrar</td></tr>
            ) : (
              fincasFiltradas.map((f) => {
                const id = getId(f);
                const isActive = resolveEstado(f);
                const area = getArea(f);

                return (
                  <tr key={id}>
                    <td>
                      <span className="finca-codigo-badge">{f?.codigo ?? '-'}</span>
                    </td>
                    <td>
                      <div className="zona-name-cell">
                        <span className="finca-tree-icon"><Trees size={14} /></span>
                        {f?.nombre ?? '-'}
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: '#374151' }}>
                      {resolveNucleoNombre(f)}
                    </td>
                    <td style={{ fontSize: 13, color: '#374151' }}>
                      {area !== undefined && area !== null ? `${area} ha` : '-'}
                    </td>
                    <td>
                      <span className={isActive ? 'finca-badge-activa' : 'finca-badge-inactiva'}>
                        {isActive ? '⊙ Activa' : '⊗ Inactiva'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0 16px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button className="icon-btn" type="button" title="Ver detalle" onClick={() => setDetalleFinca(f)}>
                          <Eye size={16} />
                        </button>
                        <button className="icon-btn" type="button" title="Editar" onClick={() => setEditFinca(f)}>
                          <Pencil size={16} />
                        </button>
                        <button className="icon-btn danger" type="button" title="Eliminar" onClick={() => handleDelete(id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <FincaDetalleModal isOpen={!!detalleFinca} finca={detalleFinca} onClose={() => setDetalleFinca(null)} />

      <NuevaFincaModal
        isOpen={openCreate}
        title="Nueva Finca"
        initialValues={{ codigo: '', nombre: '', nucleo: '', area: '', estado: true }}
        nucleos={nucleos}
        onClose={() => setOpenCreate(false)}
        onSubmit={async (values) => { await onAdd?.(values); setOpenCreate(false); }}
      />

      <NuevaFincaModal
        isOpen={!!editFinca}
        title="Editar Finca"
        initialValues={{
          codigo: editFinca?.codigo ?? '',
          nombre: editFinca?.nombre ?? '',
          nucleo: typeof editFinca?.nucleo === 'object'
            ? (editFinca?.nucleo?._id ?? editFinca?.nucleo?.id ?? '')
            : (editFinca?.nucleo ?? ''),
          area: getArea(editFinca) ?? '',
          activa: typeof editFinca?.activa === 'boolean' ? editFinca.activa : true,
        }}
        nucleos={nucleos}
        onClose={() => setEditFinca(null)}
        onSubmit={async (values) => { const id = getId(editFinca); await onUpdate?.(id, values); setEditFinca(null); }}
      />
    </div>
  );
}