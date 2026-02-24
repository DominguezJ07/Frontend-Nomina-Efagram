import { useState } from 'react';
import { AlertTriangle, Pencil, X, CheckCircle, Plus } from 'lucide-react';
import NuevaNovedadModal from './NuevaNovedadModal';

const fmt = (val) => {
  if (!val) return '';
  if (typeof val === 'object') {
    if (val.nombreCompleto) return val.nombreCompleto;
    if (val.nombres) return `${val.nombres} ${val.apellidos ?? ''}`.trim();
    if (val.nombre)  return val.nombre;
    return '';
  }
  return String(val);
};

// CORRECCIÓN: claves sincronizadas con TIPOS_NOVEDAD del backend.
// 'ACCIDENTE' → 'ACCIDENTE_TRABAJO', 'FALTA' → 'AUSENCIA'
const TipoBadge = ({ tipo }) => {
  const colores = {
    PERMISO:           { bg: '#fef3c7', border: '#f59e0b', color: '#92400e' },
    INCAPACIDAD:       { bg: '#fef2f2', border: '#fca5a5', color: '#dc2626' },
    ACCIDENTE_TRABAJO: { bg: '#fef2f2', border: '#f87171', color: '#b91c1c' },
    AUSENCIA:          { bg: '#f0f7ff', border: '#93c5fd', color: '#1d4ed8' },
    LLUVIA:            { bg: '#eff6ff', border: '#93c5fd', color: '#1e40af' },
    INSUMOS:           { bg: '#f0fdf4', border: '#86efac', color: '#166534' },
    HERRAMIENTAS:      { bg: '#fdf4ff', border: '#d8b4fe', color: '#7e22ce' },
    SUSPENSION:        { bg: '#fff7ed', border: '#fdba74', color: '#9a3412' },
    VACACIONES:        { bg: '#ecfdf5', border: '#6ee7b7', color: '#065f46' },
    LICENCIA:          { bg: '#f5f3ff', border: '#c4b5fd', color: '#5b21b6' },
    OTRO:              { bg: '#f3f4f6', border: '#d1d5db', color: '#6b7280' },
  };
  const c = colores[tipo] ?? colores['OTRO'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600,
    }}>
      {tipo ? tipo.replace('_', ' ') : 'OTRO'}
    </span>
  );
};

const EstadoBadge = ({ estado }) => {
  if (estado === 'APROBADA')  return <span className="nov-badge-resuelta">Aprobada</span>;
  if (estado === 'RECHAZADA') return <span className="nov-badge-alta">Rechazada</span>;
  return <span className="nov-badge-pendiente">Pendiente</span>;
};

export default function NovedadesList({ novedades = [], onAdd, onUpdate, onDelete }) {
  const [openCreate,  setOpenCreate]  = useState(false);
  const [editNovedad, setEditNovedad] = useState(null);

  const getId = (n) => n?._id ?? n?.id;

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta novedad?')) return;
    await onDelete?.(id);
  };

  const handleAprobar = async (n) => {
    await onUpdate?.(getId(n), { estado: 'APROBADA', aprobado: true });
  };

  const toEditValues = (n) => ({
    fecha:               n?.fecha ? String(n.fecha).slice(0, 10) : '',
    trabajador:          n?.trabajador?._id ?? n?.trabajador ?? '',
    tipo:                n?.tipo ?? 'PERMISO',
    descripcion:         n?.descripcion ?? '',
    dias:                n?.dias ?? '',
    afecta_nomina:       n?.afecta_nomina ?? false,
    requiere_aprobacion: n?.requiere_aprobacion ?? false,
    estado:              n?.estado ?? 'PENDIENTE',
  });

  return (
    <div className="ejecucion-card">

      {/* HEADER */}
      <div className="ejecucion-card-header">
        <h2 className="ejecucion-card-title">Registro de Novedades</h2>
        <button className="btn-primary" onClick={() => setOpenCreate(true)}>
          <Plus size={16} />
          Nueva Novedad
        </button>
      </div>

      {/* LISTA CON SCROLL */}
      <div className="nov-list-scroll">
        {novedades.length === 0 ? (
          <div className="ejecucion-empty">No hay novedades para mostrar</div>
        ) : (
          novedades.map((n) => {
            const id       = getId(n);
            const aprobada = n?.estado === 'APROBADA';
            return (
              <div key={id} className={`nov-item ${aprobada ? 'nov-item-resuelta' : ''}`}>

                <div className="nov-item-left">
                  <AlertTriangle
                    size={18}
                    className={aprobada ? 'nov-icon-resuelta' : 'nov-icon-pendiente'}
                  />
                </div>

                <div className="nov-item-body">
                  <div className="nov-item-header">
                    <span className={`nov-titulo ${aprobada ? 'nov-titulo-resuelta' : ''}`}>
                      {n?.codigo ?? n?.tipo ?? '-'}
                    </span>
                    <TipoBadge tipo={n?.tipo ?? 'OTRO'} />
                    <EstadoBadge estado={n?.estado} />
                    {n?.afecta_nomina && (
                      <span className="nov-badge-media">Afecta nómina</span>
                    )}
                  </div>
                  <p className="nov-descripcion">{n?.descripcion ?? ''}</p>
                  <div className="nov-meta">
                    {fmt(n?.trabajador) && <span>{fmt(n.trabajador)}</span>}
                    {n?.dias  != null   && <span>{n.dias} día(s)</span>}
                    {n?.fecha           && <span>{String(n.fecha).slice(0, 10)}</span>}
                  </div>
                </div>

                <div className="nov-item-actions">
                  <button
                    className="icon-btn"
                    type="button"
                    title="Aprobar"
                    disabled={aprobada}
                    style={{ opacity: aprobada ? 0.3 : 1 }}
                    onClick={() => handleAprobar(n)}
                  >
                    <CheckCircle size={16} />
                  </button>
                  <button
                    className="icon-btn"
                    type="button"
                    title="Editar"
                    onClick={() => setEditNovedad(n)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="icon-btn danger"
                    type="button"
                    title="Eliminar"
                    onClick={() => handleDelete(id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODALES */}
      <NuevaNovedadModal
        isOpen={openCreate}
        title="Nueva Novedad"
        initialValues={{}}
        onClose={() => setOpenCreate(false)}
        onSubmit={async (values) => { await onAdd?.(values); setOpenCreate(false); }}
      />
      <NuevaNovedadModal
        isOpen={!!editNovedad}
        title="Editar Novedad"
        initialValues={editNovedad ? toEditValues(editNovedad) : {}}
        onClose={() => setEditNovedad(null)}
        onSubmit={async (values) => { await onUpdate?.(getId(editNovedad), values); setEditNovedad(null); }}
      />
    </div>
  );
}