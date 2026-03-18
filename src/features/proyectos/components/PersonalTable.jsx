import { useState } from 'react';
import { Eye, Pencil, Trash2, Plus, Search, User, X } from 'lucide-react';
import NuevoPersonalModal from './NuevoPersonalModal';

function PersonalDetalleModal({ isOpen, persona, onClose }) {
  if (!isOpen || !persona) return null;

  const isActive = persona?.estado === 'ACTIVO';
  const nombreCompleto = `${persona?.nombres ?? ''} ${persona?.apellidos ?? ''}`.trim();

  return (
    <>
      <div className="zdm-overlay" />
      <div className="zdm-panel" role="dialog" aria-modal="true">
        <button className="zdm-close" onClick={onClose} aria-label="Cerrar">
          <X size={15} />
        </button>
        <div className="zdm-header">
          <h2 className="zdm-title">Detalle de Personal</h2>
          <p className="zdm-subtitle">Información del empleado</p>
        </div>

        <div className="zdm-name-card">
          <div className="zdm-pin-wrap">
            <User size={20} />
          </div>
          <div className="zdm-name-info">
            <span className="zdm-name">{nombreCompleto || '-'}</span>
            <span className="zdm-code">{persona?.num_doc ?? '-'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
          <div className="zdm-estado-box">
            <span className="zdm-estado-label">Cargo</span>
            <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
              {persona?.cargo ?? '-'}
            </span>
          </div>
          <div className="zdm-estado-box">
            <span className="zdm-estado-label">Finca</span>
            <span style={{ fontSize: '14px', color: '#374151' }}>
              {persona?.finca?.nombre ?? '-'}
            </span>
          </div>
          <div className="zdm-estado-box">
            <span className="zdm-estado-label">Proceso</span>
            <span style={{ fontSize: '14px', color: '#374151' }}>
              {persona?.proceso?.nombre ?? '-'}
            </span>
          </div>
          <div className="zdm-estado-box">
            <span className="zdm-estado-label">Supervisor</span>
            <span style={{ fontSize: '14px', color: '#374151' }}>
              {persona?.supervisor
                ? `${persona.supervisor.nombres ?? ''} ${persona.supervisor.apellidos ?? ''}`.trim()
                : 'N/A'}
            </span>
          </div>
          {persona?.telefono && (
            <div className="zdm-estado-box">
              <span className="zdm-estado-label">Teléfono</span>
              <span style={{ fontSize: '14px', color: '#374151' }}>{persona.telefono}</span>
            </div>
          )}
          {persona?.email && (
            <div className="zdm-estado-box">
              <span className="zdm-estado-label">Email</span>
              <span style={{ fontSize: '14px', color: '#374151' }}>{persona.email}</span>
            </div>
          )}
          <div className="zdm-estado-box">
            <span className="zdm-estado-label">Tipo Contrato</span>
            <span style={{ fontSize: '14px', color: '#374151' }}>
              {persona?.tipo_contrato ?? '-'}
            </span>
          </div>
        </div>

        <div className="zdm-estado-box">
          <span className="zdm-estado-label">Estado</span>
          <span className={isActive ? 'zdm-badge active' : 'zdm-badge inactive'}>
            {isActive ? '⊙ Activo' : '⊗ Inactivo'}
          </span>
        </div>
      </div>
    </>
  );
}

export default function PersonalTable({
  personal = [],
  search = '',
  setSearch,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [openCreate,     setOpenCreate]     = useState(false);
  const [editPersona,    setEditPersona]    = useState(null);
  const [detallePersona, setDetallePersona] = useState(null);

  const getId = (p) => p?._id ?? p?.id;

  const supervisorLabel = (p) => {
    const sup = p?.supervisor;
    if (!sup) return 'N/A';
    if (typeof sup === 'string') return 'N/A';
    return `${sup.nombres ?? ''} ${sup.apellidos ?? ''}`.trim() || 'N/A';
  };

  return (
    <div className="zonas-card">
      {/* HEADER */}
      <div className="zonas-card-header">
        <h2 className="zonas-card-title">Catálogo de Personal</h2>
      </div>

      {/* BARRA DE BÚSQUEDA + BOTÓN */}
      <div style={{ display: 'flex', gap: '12px', padding: '0 0 16px 0', alignItems: 'center' }}>
        <div className="zonas-search" style={{ flex: 1 }}>
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch?.(e.target.value)}
            placeholder="Buscar por cédula, nombre o cargo..."
          />
        </div>
        <button className="btn-primary" onClick={() => setOpenCreate(true)}>
          <Plus size={16} />
          Nuevo Personal
        </button>
      </div>

      {/* TABLA */}
      <div className="zonas-table-scroll">
        <table className="zonas-table-grid">
          <thead>
            <tr>
              <th>Cedula</th>
              <th>Nombre</th>
              <th>Cargo</th>
              <th>Finca</th>
              <th>Proceso</th>
              <th>Supervisor</th>
              <th>Estado</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {personal.length === 0 ? (
              <tr>
                <td colSpan={8} className="zonas-empty">
                  No hay personal para mostrar
                </td>
              </tr>
            ) : (
              personal.map((p) => {
                const id       = getId(p);
                const isActive = p?.estado === 'ACTIVO';
                const nombre   = `${p?.nombres ?? ''} ${p?.apellidos ?? ''}`.trim();

                return (
                  <tr key={id}>
                    <td style={{ fontSize: '13px', color: '#374151' }}>
                      {p?.num_doc ?? '-'}
                    </td>
                    <td>
                      <div className="zona-name-cell">
                        <span className="zona-pin-icon">
                          <User size={13} />
                        </span>
                        {nombre || '-'}
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: '#374151' }}>
                      {p?.cargo ?? '-'}
                    </td>
                    <td style={{ fontSize: '13px', color: '#6b7280' }}>
                      {p?.finca?.nombre ?? '-'}
                    </td>
                    <td style={{ fontSize: '13px', color: '#6b7280' }}>
                      {p?.proceso?.nombre ?? '-'}
                    </td>
                    <td style={{ fontSize: '13px', color: '#6b7280' }}>
                      {supervisorLabel(p)}
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
                          onClick={() => setDetallePersona(p)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="icon-btn"
                          type="button"
                          title="Editar"
                          onClick={() => setEditPersona(p)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-btn"
                          type="button"
                          title="Retirar"
                          style={{ color: '#ef4444' }}
                          onClick={() => onDelete?.(id)}
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

      {/* MODALES */}
      <PersonalDetalleModal
        isOpen={!!detallePersona}
        persona={detallePersona}
        onClose={() => setDetallePersona(null)}
      />

      <NuevoPersonalModal
        isOpen={openCreate}
        title="Nuevo Personal"
        initialValues={{}}
        onClose={() => setOpenCreate(false)}
        onSubmit={async (values) => {
          await onAdd?.(values);
          setOpenCreate(false);
        }}
      />

      <NuevoPersonalModal
        isOpen={!!editPersona}
        title="Editar Personal"
        initialValues={editPersona}
        onClose={() => setEditPersona(null)}
        onSubmit={async (values) => {
          await onUpdate?.(getId(editPersona), values);
          setEditPersona(null);
        }}
      />
    </div>
  );
}