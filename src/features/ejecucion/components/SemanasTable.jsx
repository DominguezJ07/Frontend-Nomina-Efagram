import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import NuevaSemanaModal from './NuevaSemanaModal';

// CORRECCIÓN: el enum del backend es ABIERTA | CERRADA | BLOQUEADA (no ACTIVA)
const EstadoBadge = ({ estado }) => {
  if (estado === 'ABIERTA')
    return <span className="sem-badge-activa">Abierta</span>;
  if (estado === 'BLOQUEADA')
    return (
      <span className="sem-badge-cerrada" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#f59e0b' }}>
        Bloqueada
      </span>
    );
  return <span className="sem-badge-cerrada">Cerrada</span>;
};

const CumplimientoColor = ({ valor }) => {
  if (valor == null) return <span style={{ color: '#9ca3af' }}>-</span>;
  const n = Number(valor);
  const color = n >= 85 ? '#16a34a' : n >= 70 ? '#d97706' : '#dc2626';
  return <span style={{ color, fontWeight: 700 }}>{n}%</span>;
};

const fmtPeriodo = (s) => {
  const ini = s?.fecha_inicio ? String(s.fecha_inicio).slice(0, 10) : null;
  const fin = s?.fecha_fin    ? String(s.fecha_fin).slice(0, 10)    : null;
  if (ini && fin) return `${ini} - ${fin}`;
  if (ini)        return ini;
  return '-';
};

export default function SemanasTable({ semanas = [], onAdd, onUpdate, onDelete }) {
  const [openCreate, setOpenCreate] = useState(false);
  const [editSemana, setEditSemana] = useState(null);

  const getId = (s) => s?._id ?? s?.id;

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta semana operativa?')) return;
    await onDelete?.(id);
  };

  const toEditValues = (s) => ({
    codigo:        s?.codigo ?? s?.semana ?? '',
    fecha_inicio:  s?.fecha_inicio ? String(s.fecha_inicio).slice(0, 10) : '',
    fecha_fin:     s?.fecha_fin    ? String(s.fecha_fin).slice(0, 10)    : '',
    estado:        s?.estado       ?? 'ABIERTA',  // CORRECCIÓN: era 'ACTIVA'
    registros:     s?.registros    ?? '',
    cumplimiento:  s?.cumplimiento ?? '',
    observaciones: s?.observaciones ?? '',
  });

  return (
    <div className="ejecucion-card">

      <div className="ejecucion-card-header">
        <h2 className="ejecucion-card-title">Semanas Operativas</h2>
        <button className="btn-primary" onClick={() => setOpenCreate(true)}>
          <Plus size={16} />
          Nueva Semana
        </button>
      </div>

      <div className="ejecucion-table-scroll">
        <table className="ejecucion-table">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>Semana</th>
              <th style={{ width: '220px' }}>Periodo</th>
              <th style={{ width: '120px' }}>Estado</th>
              <th style={{ width: '100px', textAlign: 'center' }}>Registros</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Cumplimiento</th>
              <th>Observaciones</th>
              <th style={{ width: '110px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {semanas.length === 0 ? (
              <tr><td colSpan={7} className="ejecucion-empty">No hay semanas para mostrar</td></tr>
            ) : (
              semanas.map((s) => {
                const id = getId(s);
                return (
                  <tr key={id}>
                    <td style={{ fontWeight: 600, fontSize: 13.5 }}>
                      {s?.codigo ?? s?.semana ?? '-'}
                    </td>
                    <td style={{ fontSize: 13, color: '#6b7280' }}>
                      {fmtPeriodo(s)}
                    </td>
                    <td>
                      <EstadoBadge estado={s?.estado} />
                    </td>
                    <td style={{ textAlign: 'center', fontSize: 13.5 }}>
                      {s?.registros ?? '-'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <CumplimientoColor valor={s?.cumplimiento} />
                    </td>
                    <td style={{ fontSize: 13, color: '#6b7280' }}>
                      {s?.observaciones ?? '-'}
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0 16px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button className="icon-btn" type="button" title="Editar"
                          onClick={() => setEditSemana(s)}>
                          <Pencil size={16} />
                        </button>
                        <button className="icon-btn danger" type="button" title="Eliminar"
                          onClick={() => handleDelete(id)}>
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

      <NuevaSemanaModal
        isOpen={openCreate}
        title="Nueva Semana"
        initialValues={{}}
        onClose={() => setOpenCreate(false)}
        onSubmit={async (values) => { await onAdd?.(values); setOpenCreate(false); }}
      />

      <NuevaSemanaModal
        isOpen={!!editSemana}
        title="Editar Semana"
        initialValues={editSemana ? toEditValues(editSemana) : {}}
        onClose={() => setEditSemana(null)}
        onSubmit={async (values) => { await onUpdate?.(getId(editSemana), values); setEditSemana(null); }}
      />
    </div>
  );
}