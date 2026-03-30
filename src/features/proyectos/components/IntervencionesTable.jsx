import { useState } from 'react';
import { Eye, Pencil, Trash2, Plus, Search, Activity, X } from 'lucide-react';
import NuevaIntervencionModal from './NuevaIntervencionModal';

function IntervencionDetalleModal({ isOpen, intervencion, onClose }) {
  if (!isOpen || !intervencion) return null;

  const isActive = Boolean(intervencion?.activo);

  return (
    <>
      <div className="zdm-overlay" onClick={onClose} />
      <div className="zdm-panel" role="dialog" aria-modal="true">
        <button className="zdm-close" onClick={onClose} aria-label="Cerrar">
          <X size={15} />
        </button>
        <div className="zdm-header">
          <h2 className="zdm-title">Detalle de Intervención</h2>
          <p className="zdm-subtitle">Información de la intervención</p>
        </div>
        <div className="zdm-name-card">
          <div className="zdm-pin-wrap">
            <Activity size={20} />
          </div>
          <div className="zdm-name-info">
            <span className="zdm-name">{intervencion?.nombre ?? '-'}</span>
            <span className="zdm-code">{intervencion?.codigo ?? '-'}</span>
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <div className="zdm-estado-box" style={{ marginBottom: '10px' }}>
            <span className="zdm-estado-label">Proceso</span>
            <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
              {intervencion?.proceso?.nombre
                ? `${intervencion.proceso.codigo} – ${intervencion.proceso.nombre}`
                : '-'}
            </span>
          </div>
        </div>

        <div className="zdm-estado-box">
          <span className="zdm-estado-label">Estado</span>
          <span className={isActive ? 'zdm-badge active' : 'zdm-badge inactive'}>
            {isActive ? '⊙ Activo' : '⊗ Inactivo'}
          </span>
        </div>

        {intervencion?.descripcion && (
          <div className="zdm-estado-box" style={{ marginTop: '10px' }}>
            <span className="zdm-estado-label">Descripción</span>
            <span style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
              {intervencion.descripcion}
            </span>
          </div>
        )}
      </div>
    </>
  );
}

export default function IntervencionesTable({
  intervenciones = [],
  search = '',
  setSearch,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [openCreate,          setOpenCreate]          = useState(false);
  const [editIntervencion,    setEditIntervencion]    = useState(null);
  const [detalleIntervencion, setDetalleIntervencion] = useState(null);

  const getId = (i) => i?._id ?? i?.id;

  return (
    <div className="zonas-card">
      {/* HEADER */}
      <div className="zonas-card-header">
        <h2 className="zonas-card-title">Catálogo de Intervenciones</h2>
      </div>

      {/* BARRA DE BÚSQUEDA + BOTÓN */}
      <div style={{ display: 'flex', gap: '12px', padding: '0 0 16px 0', alignItems: 'center' }}>
        <div className="zonas-search" style={{ flex: 1 }}>
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch?.(e.target.value)}
            placeholder="Buscar intervención..."
          />
        </div>
        <button className="btn-primary" onClick={() => setOpenCreate(true)}>
          <Plus size={16} />
          Nueva Intervención
        </button>
      </div>

      {/* TABLA */}
      <div className="zonas-table-scroll">
        <table className="zonas-table-grid">
          <thead>
            <tr>
              <th style={{ width: '140px' }}>Código</th>
              <th style={{ width: '220px' }}>Nombre</th>
              <th style={{ width: '220px' }}>Proceso</th>
              <th style={{ width: '140px' }}>Estado</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {intervenciones.length === 0 ? (
              <tr>
                <td colSpan={5} className="zonas-empty">
                  No hay intervenciones para mostrar
                </td>
              </tr>
            ) : (
              intervenciones.map((i) => {
                const id       = getId(i);
                const isActive = Boolean(i?.activo);

                return (
                  <tr key={id}>
                    <td>
                      <span className="finca-codigo-badge">{i?.codigo ?? '-'}</span>
                    </td>
                    <td>
                      <div className="zona-name-cell">
                        <span className="zona-pin-icon">
                          <Activity size={13} />
                        </span>
                        {i?.nombre ?? '-'}
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: '#6b7280' }}>
                      {i?.proceso?.nombre ?? '-'}
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
                          onClick={() => setDetalleIntervencion(i)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="icon-btn"
                          type="button"
                          title="Editar"
                          onClick={() => setEditIntervencion(i)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-btn icon-btn--danger"
                          type="button"
                          title="Eliminar"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar la intervención "${i?.nombre}"?`)) {
                              onDelete?.(id);
                            }
                          }}
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

      <IntervencionDetalleModal
        isOpen={!!detalleIntervencion}
        intervencion={detalleIntervencion}
        onClose={() => setDetalleIntervencion(null)}
      />

      <NuevaIntervencionModal
        key={openCreate ? 'create' : 'create-closed'}
        isOpen={openCreate}
        title="Nueva intervención"
        initialValues={{ codigo: '', nombre: '', proceso: '', activo: true, descripcion: '' }}
        onClose={() => setOpenCreate(false)}
        onSubmit={async (values) => {
          await onAdd?.(values);
          setOpenCreate(false);
        }}
      />

      <NuevaIntervencionModal
        key={editIntervencion ? (editIntervencion._id ?? editIntervencion.id ?? 'edit') : 'edit-closed'}
        isOpen={!!editIntervencion}
        title="Editar intervención"
        initialValues={{
          codigo:      editIntervencion?.codigo      ?? '',
          nombre:      editIntervencion?.nombre      ?? '',
          proceso:     editIntervencion?.proceso     ?? '',
          activo:      editIntervencion?.activo      ?? true,
          descripcion: editIntervencion?.descripcion ?? '',
        }}
        onClose={() => setEditIntervencion(null)}
        onSubmit={async (values) => {
          await onUpdate?.(getId(editIntervencion), values);
          setEditIntervencion(null);
        }}
      />
    </div>
  );
}