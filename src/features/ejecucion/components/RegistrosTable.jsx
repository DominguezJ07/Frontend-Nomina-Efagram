import { useState, useEffect } from 'react';
import { Eye, Pencil, Trash2, Plus, Search, ChevronDown, X } from 'lucide-react';
import NuevoRegistroModal from './NuevoRegistroModal';

const BASE_URL = 'https://backend-nomina-efagram.onrender.com/api/v1';
const getToken = () => localStorage.getItem('efagram_token') ?? '';

// ── Helpers ────────────────────────────────────────────────────────────────
const fmtPersona = (val) => {
  if (!val) return '-';
  if (typeof val === 'string') return val;
  if (val.nombreCompleto) return val.nombreCompleto;
  if (val.nombres) return `${val.nombres} ${val.apellidos || ''}`.trim();
  return '-';
};

const fmtCuadrilla = (val) => {
  if (!val) return '-';
  if (typeof val === 'string') return val;
  if (val.nombre) return val.nombre;
  return '-';
};

const fmtPAL = (val) => {
  if (!val) return '-';
  if (typeof val === 'string') return val;
  if (val.codigo) return val.codigo;
  return '-';
};

const toSearchStr = (val) => {
  if (!val) return '';
  if (typeof val === 'string') return val.toLowerCase();
  return (
    val.nombreCompleto ||
    val.nombre ||
    val.codigo ||
    `${val.nombres || ''} ${val.apellidos || ''}`.trim() ||
    ''
  ).toLowerCase();
};

const fmtFecha = (f) => (f ? String(f).slice(0, 10) : '-');

const getBadge = (estado) => {
  const e = (estado || '').toLowerCase();
  if (e.includes('aprobad'))   return <span className="badge-aprobado">⊙ APROBADO</span>;
  if (e.includes('pendiente')) return <span className="badge-pendiente-rd">⊙ PENDIENTE</span>;
  if (e.includes('rechazad'))  return <span className="badge-rechazado">⊙ RECHAZADO</span>;
  return <span className="badge-pendiente-rd">⊙ PENDIENTE</span>;
};

const getBadgeStyle = (estado) => {
  const e = (estado || '').toLowerCase();
  if (e.includes('aprobad'))   return { bg: '#dcfce7', color: '#166534', border: '#86efac' };
  if (e.includes('pendiente')) return { bg: '#fef9c3', color: '#854d0e', border: '#fde047' };
  if (e.includes('rechazad'))  return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
  return { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
};

// ── Sub-componentes del modal de detalle ──────────────────────────────────
function VrSection({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {title}
      </span>
    </div>
  );
}
function VrGrid({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
      {children}
    </div>
  );
}
function VrItem({ label, value, children }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, margin: '0 0 3px' }}>
        {label}
      </p>
      {children || (
        <p style={{ fontSize: 13, color: '#111827', fontWeight: 500, margin: 0 }}>{value || '-'}</p>
      )}
    </div>
  );
}
function VrDivider() {
  return <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '14px 0' }} />;
}
function VrEmpty({ children }) {
  return (
    <p style={{ fontSize: 12.5, color: '#9ca3af', fontStyle: 'italic', margin: '2px 0 0' }}>
      {children}
    </p>
  );
}

// ── VerRegistroModal ──────────────────────────────────────────────────────
function VerRegistroModal({ isOpen, registro, onClose }) {
  const [detail,  setDetail]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!isOpen || !registro) return;
    setDetail(null);
    setError(null);
    setLoading(true);

    const id = registro._id || registro.id;
    fetch(`${BASE_URL}/registros-diarios/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data) => setDetail(data.data))
      .catch((e)   => setError(e.message))
      .finally(()  => setLoading(false));
  }, [isOpen, registro]);

  if (!isOpen) return null;

  const d = detail || registro;
  const miembrosActivos =
    detail && detail.cuadrilla && detail.cuadrilla.miembros
      ? detail.cuadrilla.miembros.filter((m) => m.activo)
      : [];
  const badgeStyle = getBadgeStyle(d && d.estado);

  return (
    <div className="nrm-backdrop" onClick={onClose}>
      <div
        className="nrm-modal"
        style={{ maxWidth: 560 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="nrm-header">
          <div>
            <h3 className="nrm-title">Detalle del Registro</h3>
            <p style={{ fontFamily: 'monospace', fontWeight: 700, color: '#059669', fontSize: 13, margin: 0 }}>
              {(d && d.codigo) || '-'}
            </p>
          </div>
          <button className="nrm-close-btn" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="nrm-scroll-area" style={{ padding: '16px 20px', maxHeight: 520 }}>
          {loading && (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: 32 }}>
              Cargando detalles…
            </p>
          )}
          {error && !loading && (
            <div className="nrm-error">No se pudo cargar el detalle: {error}</div>
          )}

          {/* Info general */}
          <VrSection icon="📋" title="Información General" />
          <VrGrid>
            <VrItem label="Fecha"           value={fmtFecha(d && d.fecha)} />
            <VrItem label="Estado">
              <span style={{
                backgroundColor: badgeStyle.bg,
                color:           badgeStyle.color,
                border:          `1px solid ${badgeStyle.border}`,
                padding:         '3px 10px',
                borderRadius:    20,
                fontSize:        12,
                fontWeight:      600,
                display:         'inline-block',
              }}>
                {(d && d.estado) || '-'}
              </span>
            </VrItem>
            <VrItem label="Cant. Ejecutada"  value={(d && d.cantidad_ejecutada) || '-'} />
            <VrItem label="Horas Trabajadas" value={d && d.horas_trabajadas != null ? `${d.horas_trabajadas}h` : '-'} />
            <VrItem label="Hora Inicio"      value={(d && d.hora_inicio) || '-'} />
            <VrItem label="Hora Fin"         value={(d && d.hora_fin)    || '-'} />
          </VrGrid>

          <VrDivider />

          {/* PAL */}
          <VrSection icon="📌" title="PAL (Proyecto · Actividad · Lote)" />
          {d && d.proyecto_actividad_lote ? (
            <VrGrid>
              <VrItem
                label="Código"
                value={typeof d.proyecto_actividad_lote === 'object' ? d.proyecto_actividad_lote.codigo : d.proyecto_actividad_lote}
              />
              <VrItem
                label="Estado"
                value={typeof d.proyecto_actividad_lote === 'object' ? d.proyecto_actividad_lote.estado : '-'}
              />
              {typeof d.proyecto_actividad_lote === 'object' && d.proyecto_actividad_lote.actividad && (
                <VrItem
                  label="Actividad"
                  value={
                    typeof d.proyecto_actividad_lote.actividad === 'object'
                      ? d.proyecto_actividad_lote.actividad.nombre
                      : '-'
                  }
                />
              )}
              {typeof d.proyecto_actividad_lote === 'object' && d.proyecto_actividad_lote.meta_minima != null && (
                <VrItem
                  label="Avance"
                  value={`${d.proyecto_actividad_lote.cantidad_ejecutada} / ${d.proyecto_actividad_lote.meta_minima}`}
                />
              )}
            </VrGrid>
          ) : (
            <VrEmpty>Sin PAL asignado</VrEmpty>
          )}

          <VrDivider />

          {/* Cuadrilla */}
          <VrSection icon="👥" title="Cuadrilla" />
          {d && d.cuadrilla && typeof d.cuadrilla === 'object' ? (
            <>
              <VrGrid>
                <VrItem label="Nombre"     value={d.cuadrilla.nombre || '-'} />
                <VrItem label="Código"     value={d.cuadrilla.codigo || '-'} />
                {d.cuadrilla.supervisor && (
                  <VrItem label="Supervisor" value={fmtPersona(d.cuadrilla.supervisor)} />
                )}
              </VrGrid>

              <div style={{ marginTop: 14 }}>
                <p style={{ fontSize: 11.5, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  Miembros activos&nbsp;
                  <span style={{ color: '#059669' }}>({loading ? '…' : miembrosActivos.length})</span>
                </p>

                {!loading && miembrosActivos.length === 0 && (
                  <VrEmpty>Sin miembros registrados en esta cuadrilla</VrEmpty>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {miembrosActivos.map((m, i) => {
                    const p      = m.persona;
                    const nombre = fmtPersona(p);
                    const cargo  = (p && p.cargo) || 'Sin cargo';
                    return (
                      <div
                        key={i}
                        style={{
                          display:         'flex',
                          alignItems:      'center',
                          justifyContent:  'space-between',
                          padding:         '8px 12px',
                          backgroundColor: '#f9fafb',
                          borderRadius:    8,
                          border:          '1px solid #e5e7eb',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width:           32,
                            height:          32,
                            borderRadius:    '50%',
                            backgroundColor: '#d1fae5',
                            color:           '#065f46',
                            display:         'flex',
                            alignItems:      'center',
                            justifyContent:  'center',
                            fontSize:        13,
                            fontWeight:      700,
                            flexShrink:      0,
                          }}>
                            {nombre.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{nombre}</span>
                        </div>
                        <span style={{
                          fontSize:        11.5,
                          color:           '#374151',
                          backgroundColor: '#e5e7eb',
                          padding:         '2px 10px',
                          borderRadius:    12,
                          fontWeight:      500,
                          whiteSpace:      'nowrap',
                        }}>
                          {cargo}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <VrEmpty>Sin cuadrilla asignada</VrEmpty>
          )}

          {/* Observaciones */}
          {d && d.observaciones && (
            <>
              <VrDivider />
              <VrSection icon="📝" title="Observaciones" />
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>
                {d.observaciones}
              </p>
            </>
          )}

          {/* Auditoría */}
          {d && (d.registrado_por || d.editado) && (
            <>
              <VrDivider />
              <VrSection icon="🔍" title="Auditoría" />
              <VrGrid>
                {d.registrado_por && (
                  <VrItem label="Registrado por" value={fmtPersona(d.registrado_por)} />
                )}
                {d.editado && (
                  <>
                    <VrItem label="Editado por"    value={fmtPersona(d.editado_por)} />
                    <VrItem label="Fecha edición"  value={fmtFecha(d.fecha_edicion)} />
                    <VrItem label="Motivo edición" value={d.motivo_edicion || '-'} />
                  </>
                )}
              </VrGrid>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="nrm-footer">
          <button
            className="btn-modal-submit"
            type="button"
            onClick={onClose}
            style={{ minWidth: 120 }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── RegistrosTable ────────────────────────────────────────────────────────
export default function RegistrosTable({
  registros = [],
  search = '',
  setSearch,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [openCreate,   setOpenCreate]   = useState(false);
  const [editRegistro, setEditRegistro] = useState(null);
  const [verRegistro,  setVerRegistro]  = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');

  const getId = (r) => r._id || r.id;

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    if (onDelete) await onDelete(id);
  };

  const registrosFiltrados = registros.filter((r) => {
    const matchEstado = filtroEstado
      ? (r.estado || '').toLowerCase().includes(filtroEstado.toLowerCase())
      : true;
    const q = search.toLowerCase();
    const matchSearch = q
      ? (
          (r.codigo || '').toLowerCase().includes(q) ||
          toSearchStr(r.trabajador).includes(q) ||
          toSearchStr(r.cuadrilla).includes(q) ||
          toSearchStr(r.proyecto_actividad_lote).includes(q)
        )
      : true;
    return matchEstado && matchSearch;
  });

  const toEditValues = (r) => ({
    proyecto_actividad_lote:
      (r.proyecto_actividad_lote && (r.proyecto_actividad_lote._id || r.proyecto_actividad_lote)) || '',
    cuadrilla:
      (r.cuadrilla && (r.cuadrilla._id || r.cuadrilla)) || '',
    fecha:              r.fecha ? String(r.fecha).slice(0, 10) : '',
    cantidad_ejecutada: r.cantidad_ejecutada || '',
    horas_trabajadas:   r.horas_trabajadas   || '',
    hora_inicio:        r.hora_inicio         || '07:00',
    hora_fin:           r.hora_fin            || '17:00',
    observaciones:      r.observaciones       || '',
    estado:             r.estado              || 'PENDIENTE',
  });

  return (
    <div className="ejecucion-card">

      {/* Header */}
      <div className="ejecucion-card-header">
        <h2 className="ejecucion-card-title">Registros Diarios</h2>
        <button className="btn-primary" onClick={() => setOpenCreate(true)}>
          <Plus size={16} /> Nuevo Registro
        </button>
      </div>

      {/* Búsqueda + filtro */}
      <div className="ejecucion-search-bar">
        <div className="ejecucion-search-input">
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch && setSearch(e.target.value)}
            placeholder="Buscar por código, trabajador, cuadrilla o PAL..."
          />
        </div>
        <div className="ejecucion-select-wrap">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="ejecucion-select"
          >
            <option value="">Todos</option>
            <option value="APROBADO">Aprobado</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="RECHAZADO">Rechazado</option>
          </select>
          <ChevronDown size={14} className="ejecucion-select-arrow" />
        </div>
      </div>

      {/* Tabla */}
      <div className="ejecucion-table-scroll">
        <table className="ejecucion-table">
          <thead>
            <tr>
              <th style={{ width: '160px' }}>Código</th>
              <th style={{ width: '110px' }}>Fecha</th>
              <th>PAL</th>
              <th style={{ width: '150px' }}>Cuadrilla</th>
              <th style={{ width: '100px' }}>Cant. Ejec.</th>
              <th style={{ width: '80px'  }}>Horas</th>
              <th style={{ width: '165px' }}>Estado</th>
              {/* ── Acciones: aumentado a 150px para que no recorte los botones ── */}
              <th style={{ width: '150px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {registrosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={8} className="ejecucion-empty">
                  No hay registros para mostrar
                </td>
              </tr>
            ) : (
              registrosFiltrados.map((r) => {
                const id = getId(r);
                return (
                  <tr key={id}>
                    <td style={{ fontSize: 12.5, color: '#374151', fontWeight: 500 }}>
                      {r.codigo || '-'}
                    </td>
                    <td style={{ fontSize: 13, color: '#374151' }}>
                      {fmtFecha(r.fecha)}
                    </td>
                    <td style={{ fontSize: 13, color: '#374151', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {fmtPAL(r.proyecto_actividad_lote)}
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {fmtCuadrilla(r.cuadrilla)}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: 13 }}>
                      {r.cantidad_ejecutada != null ? r.cantidad_ejecutada : '-'}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: 13 }}>
                      {r.horas_trabajadas != null ? `${r.horas_trabajadas}h` : '-'}
                    </td>
                    <td>{getBadge(r.estado)}</td>
                    {/* ── Sin overflow/ellipsis en la celda de acciones ── */}
                    <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0 12px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          className="icon-btn"
                          type="button"
                          title="Ver detalle"
                          onClick={() => setVerRegistro(r)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="icon-btn"
                          type="button"
                          title="Editar"
                          onClick={() => setEditRegistro(r)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-btn danger"
                          type="button"
                          title="Eliminar"
                          onClick={() => handleDelete(id)}
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

      {/* Modal Ver */}
      <VerRegistroModal
        isOpen={!!verRegistro}
        registro={verRegistro}
        onClose={() => setVerRegistro(null)}
      />

      {/* Modal Crear */}
      <NuevoRegistroModal
        isOpen={openCreate}
        title="Nuevo Registro"
        initialValues={{}}
        onClose={() => setOpenCreate(false)}
        onSubmit={async (values) => {
          if (onAdd) await onAdd(values);
          setOpenCreate(false);
        }}
      />

      {/* Modal Editar */}
      <NuevoRegistroModal
        isOpen={!!editRegistro}
        title="Editar Registro"
        initialValues={editRegistro ? toEditValues(editRegistro) : {}}
        onClose={() => setEditRegistro(null)}
        onSubmit={async (values) => {
          if (onUpdate) await onUpdate(getId(editRegistro), values);
          setEditRegistro(null);
        }}
      />
    </div>
  );
}