import { useState } from 'react';
import { Eye, Pencil, Plus, Search, Settings, X, Trash2 } from 'lucide-react';
import NuevoProcesoModal from './NuevoProcesoModal';

function ProcesoDetalleModal({ isOpen, proceso, onClose }) {
  if (!isOpen || !proceso) return null;

  let isActive = false;
  const raw = proceso?.estado;
  if (typeof raw === 'boolean') isActive = raw;
  else if (typeof raw === 'string') {
    const v = raw.toLowerCase().trim();
    isActive = v === 'activo' || v === 'active' || v === 'true' || v === '1';
  } else if (typeof raw === 'number') isActive = raw === 1;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900 }}>
      <div className="zdm-overlay" style={{ pointerEvents: 'none' }} />
      <div className="zdm-panel" role="dialog" aria-modal="true">
        <button className="zdm-close" onClick={onClose} aria-label="Cerrar">
          <X size={15} />
        </button>
        <div className="zdm-header">
          <h2 className="zdm-title">Detalle de Proceso</h2>
          <p className="zdm-subtitle">Información del proceso</p>
        </div>
        <div className="zdm-name-card">
          <div className="zdm-pin-wrap">
            <Settings size={20} />
          </div>
          <div className="zdm-name-info">
            <span className="zdm-name">{proceso?.nombre ?? '-'}</span>
            <span className="zdm-code">{proceso?.codigo ?? '-'}</span>
          </div>
        </div>

        <div className="zdm-estado-box">
          <span className="zdm-estado-label">Estado</span>
          <span className={isActive ? 'zdm-badge active' : 'zdm-badge inactive'}>
            {isActive ? '⊙ Activo' : '⊗ Inactivo'}
          </span>
        </div>

        {proceso?.descripcion && (
          <div className="zdm-estado-box" style={{ marginTop: '10px' }}>
            <span className="zdm-estado-label">Descripción</span>
            <span style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
              {proceso.descripcion}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProcesosTable({
  procesos = [],
  search = '',
  setSearch,
  onAdd,
  onUpdate,
  onDelete
}) {
  const [openCreate,    setOpenCreate]    = useState(false);
  const [editProceso,   setEditProceso]   = useState(null);
  const [detalleProceso,setDetalleProceso]= useState(null);

  const getId = (p) => p?._id ?? p?.id;

  const handleDelete = async (proceso) => {
    if (window.confirm(`¿Estás seguro de eliminar el proceso "${proceso?.nombre}"?`)) {
      await onDelete?.(getId(proceso));
    }
  };

  return (
    <div className="zonas-card">
      {/* HEADER */}
      <div className="zonas-card-header">
        <h2 className="zonas-card-title">Catálogo de Procesos</h2>
      </div>

      {/* BARRA DE BÚSQUEDA + BOTÓN */}
      <div style={{ display: 'flex', gap: '12px', padding: '0 0 16px 0', alignItems: 'center' }}>
        <div className="zonas-search" style={{ flex: 1 }}>
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch?.(e.target.value)}
            placeholder="Buscar por código o nombre..."
          />
        </div>
        <button className="btn-primary" onClick={() => setOpenCreate(true)}>
          <Plus size={16} />
          Nuevo Proceso
        </button>
      </div>

      {/* TABLA */}
      <div className="zonas-table-scroll">
        <table className="zonas-table-grid">
          <thead>
            <tr>
              <th style={{ width: '140px' }}>Código</th>
              <th style={{ width: '200px' }}>Nombre</th>
              <th style={{ width: '300px' }}>Descripción</th>
              <th style={{ width: '120px' }}>Estado</th>
              <th style={{ width: '140px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {procesos.length === 0 ? (
              <tr>
                <td colSpan={5} className="zonas-empty">
                  No hay procesos para mostrar
                </td>
              </tr>
            ) : (
              procesos.map((p) => {
                const id = getId(p);

                let isActive = false;
                if (p?.activo !== undefined) {
                  isActive = Boolean(p.activo);
                } else if (p?.estado !== undefined && p?.estado !== null) {
                  if (typeof p.estado === 'boolean') isActive = p.estado;
                  else if (typeof p.estado === 'string') {
                    const est = p.estado.toLowerCase().trim();
                    isActive = est === 'activo' || est === 'active' || est === 'true' || est === '1';
                  } else if (typeof p.estado === 'number') isActive = p.estado === 1;
                }

                return (
                  <tr key={id}>
                    <td>
                      <span className="finca-codigo-badge">{p?.codigo ?? '-'}</span>
                    </td>
                    <td>
                      <div className="zona-name-cell">
                        <span className="zona-pin-icon">
                          <Settings size={13} />
                        </span>
                        {p?.nombre ?? '-'}
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: '#6b7280' }}>
                      {p?.descripcion ?? '-'}
                    </td>
                    <td>
                      <span className={isActive ? 'badge-active' : 'badge-inactive'}>
                        {isActive ? '⊙ Activo' : '⊗ Inactivo'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0 16px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          className="icon-btn"
                          type="button"
                          title="Ver detalle"
                          onClick={() => setDetalleProceso(p)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="icon-btn"
                          type="button"
                          title="Editar"
                          onClick={() => setEditProceso(p)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-btn danger"
                          type="button"
                          title="Eliminar"
                          onClick={() => handleDelete(p)}
                        >
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

      <ProcesoDetalleModal
        isOpen={!!detalleProceso}
        proceso={detalleProceso}
        onClose={() => setDetalleProceso(null)}
      />

      <NuevoProcesoModal
        isOpen={openCreate}
        title="Nuevo proceso"
        initialValues={{ codigo: '', nombre: '', descripcion: '', estado: true }}
        onClose={() => setOpenCreate(false)}
        onSubmit={async (values) => {
          await onAdd?.(values);
          setOpenCreate(false);
        }}
      />

      <NuevoProcesoModal
        isOpen={!!editProceso}
        title="Editar proceso"
        initialValues={{
          codigo:      editProceso?.codigo      ?? '',
          nombre:      editProceso?.nombre      ?? '',
          descripcion: editProceso?.descripcion ?? '',
          estado: typeof editProceso?.activo === 'boolean'
            ? editProceso.activo
            : typeof editProceso?.estado === 'boolean'
              ? editProceso.estado
              : editProceso?.estado === 'Activo' || editProceso?.estado === 'activo',
        }}
        onClose={() => setEditProceso(null)}
        onSubmit={async (values) => {
          await onUpdate?.(getId(editProceso), values);
          setEditProceso(null);
        }}
      />
    </div>
  );
}