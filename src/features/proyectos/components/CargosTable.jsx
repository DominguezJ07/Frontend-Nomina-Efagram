import { useState } from 'react';
import { Eye, Pencil, Plus, Search, Briefcase, X, Trash2 } from 'lucide-react';
import NuevoCargoModal from './NuevoCargoModal';

function CargoDetalleModal({ isOpen, cargo, onClose }) {
  if (!isOpen || !cargo) return null;

  let isActive = false;
  const raw = cargo?.estado;
  if (typeof cargo?.activo === 'boolean') isActive = cargo.activo;
  else if (typeof raw === 'boolean') isActive = raw;
  else if (typeof raw === 'string') {
    const v = raw.toLowerCase().trim();
    isActive = v === 'activo' || v === 'active' || v === 'true' || v === '1';
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900 }}>
      <div className="zdm-overlay" style={{ pointerEvents: 'none' }} />
      <div className="zdm-panel" role="dialog" aria-modal="true">
        <button className="zdm-close" onClick={onClose} aria-label="Cerrar">
          <X size={15} />
        </button>
        <div className="zdm-header">
          <h2 className="zdm-title">Detalle de Cargo</h2>
          <p className="zdm-subtitle">Información del cargo</p>
        </div>
        <div className="zdm-name-card">
          <div className="zdm-pin-wrap">
            <Briefcase size={20} />
          </div>
          <div className="zdm-name-info">
            <span className="zdm-name">{cargo?.nombre ?? '-'}</span>
            <span className="zdm-code">{cargo?.codigo ?? '-'}</span>
          </div>
        </div>

        <div className="zdm-estado-box">
          <span className="zdm-estado-label">Estado</span>
          <span className={isActive ? 'zdm-badge active' : 'zdm-badge inactive'}>
            {isActive ? '⊙ Activo' : '⊗ Inactivo'}
          </span>
        </div>

        {cargo?.descripcion && (
          <div className="zdm-estado-box" style={{ marginTop: '10px' }}>
            <span className="zdm-estado-label">Descripción</span>
            <span style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
              {cargo.descripcion}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CargosTable({
  cargos = [],
  search = '',
  setSearch,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [openCreate, setOpenCreate]   = useState(false);
  const [editCargo,  setEditCargo]    = useState(null);
  const [detalleCargo, setDetalleCargo] = useState(null);

  const getId = (c) => c?._id ?? c?.id;

  const handleDelete = async (cargo) => {
    if (window.confirm(`¿Estás seguro de eliminar el cargo "${cargo?.nombre}"?`)) {
      await onDelete?.(getId(cargo));
    }
  };

  return (
    <div className="zonas-card">
      {/* HEADER */}
      <div className="zonas-card-header">
        <h2 className="zonas-card-title">Catálogo de Cargos</h2>
      </div>

      {/* BARRA BÚSQUEDA + BOTÓN */}
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
          Nuevo Cargo
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
            {cargos.length === 0 ? (
              <tr>
                <td colSpan={5} className="zonas-empty">
                  No hay cargos para mostrar
                </td>
              </tr>
            ) : (
              cargos.map((c) => {
                const id = getId(c);

                let isActive = false;
                if (c?.activo !== undefined) {
                  isActive = Boolean(c.activo);
                } else if (c?.estado !== undefined && c?.estado !== null) {
                  if (typeof c.estado === 'boolean') isActive = c.estado;
                  else if (typeof c.estado === 'string') {
                    const est = c.estado.toLowerCase().trim();
                    isActive = est === 'activo' || est === 'active' || est === 'true' || est === '1';
                  } else if (typeof c.estado === 'number') isActive = c.estado === 1;
                }

                return (
                  <tr key={id}>
                    <td>
                      <span className="finca-codigo-badge">{c?.codigo ?? '-'}</span>
                    </td>
                    <td>
                      <div className="zona-name-cell">
                        <span className="zona-pin-icon">
                          <Briefcase size={13} />
                        </span>
                        {c?.nombre ?? '-'}
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: '#6b7280' }}>
                      {c?.descripcion ?? '-'}
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
                          onClick={() => setDetalleCargo(c)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="icon-btn"
                          type="button"
                          title="Editar"
                          onClick={() => setEditCargo(c)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-btn danger"
                          type="button"
                          title="Eliminar"
                          onClick={() => handleDelete(c)}
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

      <CargoDetalleModal
        isOpen={!!detalleCargo}
        cargo={detalleCargo}
        onClose={() => setDetalleCargo(null)}
      />

      <NuevoCargoModal
        isOpen={openCreate}
        title="Nuevo cargo"
        initialValues={{ codigo: '', nombre: '', descripcion: '', estado: true }}
        onClose={() => setOpenCreate(false)}
        onSubmit={async (values) => {
          await onAdd?.(values);
          setOpenCreate(false);
        }}
      />

      <NuevoCargoModal
        isOpen={!!editCargo}
        title="Editar cargo"
        initialValues={{
          codigo:      editCargo?.codigo      ?? '',
          nombre:      editCargo?.nombre      ?? '',
          descripcion: editCargo?.descripcion ?? '',
          estado: typeof editCargo?.activo === 'boolean'
            ? editCargo.activo
            : typeof editCargo?.estado === 'boolean'
              ? editCargo.estado
              : editCargo?.estado === 'Activo' || editCargo?.estado === 'activo',
        }}
        onClose={() => setEditCargo(null)}
        onSubmit={async (values) => {
          await onUpdate?.(getId(editCargo), values);
          setEditCargo(null);
        }}
      />
    </div>
  );
}