import { useState } from 'react';
import { Briefcase, Eye, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import NuevoCargoModal from './NuevoCargoModal';

function CargoDetalleModal({ isOpen, cargo, onClose }) {
  if (!isOpen || !cargo) return null;
  const isActive = cargo?.activo !== false;

  return (
    <>
      <div className="zdm-overlay" onClick={onClose} />
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
            <span className="zdm-code">Código: {cargo?.codigo ?? '-'}</span>
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

export default function CargosTable({
  cargos = [],
  search = '',
  setSearch,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [openCreate,   setOpenCreate]   = useState(false);
  const [editCargo,    setEditCargo]    = useState(null);
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

      {/* BÚSQUEDA + BOTÓN */}
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
              <th style={{ width: '120px' }}>Código</th>
              <th>Nombre</th>
              <th style={{ width: '120px' }}>Estado</th>
              <th style={{ width: '140px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargos.length === 0 ? (
              <tr>
                <td colSpan={4} className="zonas-empty">
                  No hay cargos para mostrar
                </td>
              </tr>
            ) : (
              cargos.map((c) => {
                const id = getId(c);
                const isActive = c?.activo !== false;

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

      {/* Modal crear */}
      <NuevoCargoModal
        isOpen={openCreate}
        title="Nuevo Cargo"
        initialValues={{ codigo: '', nombre: '', activo: true }}
        onClose={() => setOpenCreate(false)}
        onSubmit={async (values) => {
          await onAdd?.(values);
          setOpenCreate(false);
        }}
      />

      {/* Modal editar */}
      <NuevoCargoModal
        isOpen={!!editCargo}
        title="Editar Cargo"
        initialValues={{
          codigo: editCargo?.codigo ?? '',
          nombre: editCargo?.nombre ?? '',
          activo: editCargo?.activo !== false,
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