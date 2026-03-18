import { useEffect, useState } from 'react';
import {
  createSubproyecto, updateSubproyecto,
  getActividadesDisponibles, createAsignacion,
  getAsignaciones, cancelarAsignacion,
} from '../services/subproyectosService';
import { getClientes } from '../services/Clientesservice';
import { getPersonal } from '../services/personalService';
import httpClient from '../../../core/api/httpClient';
import {
  FolderGit2, User, MapPin, Package,
  Plus, PlusCircle, Pencil, Trash2, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle2, Lock, ClipboardList, Target
} from 'lucide-react';

const BarraProgreso = ({ asignado, total, label }) => {
  const pct = total > 0 ? Math.min(100, Math.round((asignado / total) * 100)) : 0;
  const color = pct >= 100 ? '#dc2626' : pct >= 75 ? '#e67e22' : '#1f8f57';
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 3 }}>
          <span>{label}</span>
          <span style={{ fontWeight: 700, color }}>{pct}%</span>
        </div>
      )}
      <div style={{ height: 7, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999, transition: 'width 0.3s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
        <span>Asignado: {asignado}</span>
        <span>Total: {total}</span>
        <span style={{ color: pct >= 100 ? '#dc2626' : '#1f8f57' }}>
          {pct >= 100 ? '🔒 Cerrada' : `Disponible: ${(total - asignado).toFixed(2)}`}
        </span>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
const SubproyectoModal = ({ isOpen, onClose, onSuccess, subproyecto = null, proyecto }) => {
  const modoEditar = !!subproyecto;

  const [form, setForm] = useState({
    codigo: '', nombre: '', supervisor: '', cliente: '',
    fecha_inicio: '', fecha_fin_estimada: '', observaciones: '',
  });

  const [nucleos,       setNucleos]       = useState([]);
  const [nucleosSel,    setNucleosSel]    = useState([]);
  const [clientes,      setClientes]      = useState([]);
  const [personas,      setPersonas]      = useState([]);
  const [actDisponibles, setActDisponibles] = useState([]);
  const [asignaciones,  setAsignaciones]  = useState([]); // las ya guardadas
  const [nuevasAsigs,   setNuevasAsigs]   = useState([]); // borrador pendiente
  const [loading,       setLoading]       = useState(false);
  const [loadData,      setLoadData]      = useState(false);
  const [tabActiva,     setTabActiva]     = useState('info'); // 'info' | 'actividades'

  useEffect(() => {
    if (!isOpen || !proyecto) return;

    const cargar = async () => {
      try {
        setLoadData(true);

        const [cRes, pRes, aRes] = await Promise.all([
          getClientes(),
          getPersonal(),
          getActividadesDisponibles(proyecto._id),
        ]);

        setClientes(cRes?.data?.data ?? []);
        setPersonas(pRes?.data?.data ?? []);
        setActDisponibles(aRes?.data?.data ?? []);

        // Cargar núcleos — si el proyecto tiene zona filtra por ella, si no trae todos
        const zonaId = proyecto.zona?._id ?? proyecto.zona ?? null;
        const nucleosParams = zonaId ? { zona: zonaId } : {};
        const nRes = await httpClient.get('/nucleos', { params: nucleosParams });
        setNucleos(nRes?.data?.data ?? []);

        if (modoEditar && subproyecto) {
          setForm({
            codigo:           subproyecto.codigo            ?? '',
            nombre:           subproyecto.nombre            ?? '',
            supervisor:       subproyecto.supervisor?._id   ?? subproyecto.supervisor ?? '',
            cliente:          subproyecto.cliente?._id      ?? subproyecto.cliente    ?? '',
            fecha_inicio:     subproyecto.fecha_inicio?.slice(0, 10)          ?? '',
            fecha_fin_estimada: subproyecto.fecha_fin_estimada?.slice(0, 10)  ?? '',
            observaciones:    subproyecto.observaciones     ?? '',
          });
          setNucleosSel(subproyecto.nucleos?.map(n => n._id ?? n) ?? []);

          // Cargar asignaciones existentes
          const asRes = await getAsignaciones({ subproyecto: subproyecto._id });
          setAsignaciones(asRes?.data?.data ?? []);
        } else {
          setForm({ codigo: '', nombre: '', supervisor: '', cliente: '', fecha_inicio: '', fecha_fin_estimada: '', observaciones: '' });
          setNucleosSel([]);
          setAsignaciones([]);
          setNuevasAsigs([]);
        }
      } catch (e) {
        console.error('Error cargando datos del subproyecto', e);
      } finally {
        setLoadData(false);
      }
    };
    cargar();
  }, [isOpen, proyecto, subproyecto, modoEditar]);

  const toggleNucleo = (id) => {
    setNucleosSel(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    );
  };

  // ── Agregar actividad al borrador ──
  const agregarActividad = (actProyecto) => {
    const yaEnBorrador = nuevasAsigs.some(a => a.actividad_proyecto_id === actProyecto._id);
    const yaAsignada   = asignaciones.some(a =>
      (a.actividad_proyecto?._id ?? a.actividad_proyecto) === actProyecto._id
    );
    if (yaEnBorrador || yaAsignada) return;

    setNuevasAsigs(prev => [...prev, {
      actividad_proyecto_id: actProyecto._id,
      nombre: actProyecto.actividad?.nombre ?? 'Actividad',
      intervencion: actProyecto.intervencion,
      cantidad_total: actProyecto.cantidad_total,
      cantidad_asignada_global: actProyecto.cantidad_asignada,
      unidad: actProyecto.actividad?.unidad_medida ?? actProyecto.unidad ?? '',
      cantidad: '',
    }]);
  };

  const actualizarCantidad = (idx, valor) => {
    setNuevasAsigs(prev => prev.map((a, i) => i === idx ? { ...a, cantidad: valor } : a));
  };

  const quitarBorrador = (idx) => {
    setNuevasAsigs(prev => prev.filter((_, i) => i !== idx));
  };

  // ── Cancelar asignación existente ──
  const handleCancelarAsignacion = async (asignacionId) => {
    if (!window.confirm('¿Cancelar esta asignación? La cantidad será devuelta al pool disponible.')) return;
    try {
      await cancelarAsignacion(asignacionId);
      setAsignaciones(prev => prev.filter(a => a._id !== asignacionId));
      // Recargar disponibles
      const aRes = await getActividadesDisponibles(proyecto._id);
      setActDisponibles(aRes?.data?.data ?? []);
      alert('Asignación cancelada correctamente');
    } catch (e) {
      alert(e?.response?.data?.message ?? 'Error cancelando asignación');
    }
  };

  const handleSubmit = async () => {
    if (!form.codigo.trim()) return alert('Código obligatorio');
    if (!form.nombre.trim()) return alert('Nombre obligatorio');
    if (nucleosSel.length === 0) return alert('Seleccione al menos un núcleo');

    try {
      setLoading(true);

      const payload = {
        ...form,
        codigo: form.codigo.trim().toUpperCase(),
        nombre: form.nombre.trim(),
        proyecto: proyecto._id,
        nucleos: nucleosSel,
      };

      let subId;
      if (modoEditar) {
        await updateSubproyecto(subproyecto._id, payload);
        subId = subproyecto._id;
        alert('Subproyecto actualizado correctamente');
      } else {
        const res = await createSubproyecto(payload);
        subId = res?.data?.data?._id;
        alert('Subproyecto creado correctamente');
      }

      // Guardar nuevas asignaciones
      if (subId && nuevasAsigs.length > 0) {
        for (const a of nuevasAsigs) {
          const cant = parseFloat(a.cantidad);
          if (!cant || cant <= 0) continue;
          try {
            await createAsignacion({
              subproyecto: subId,
              actividad_proyecto: a.actividad_proyecto_id,
              cantidad_asignada: cant,
            });
          } catch (e) {
            console.warn('No se pudo asignar:', a.nombre, e?.response?.data?.message);
          }
        }
      }

      onSuccess?.();
      onClose?.();
    } catch (e) {
      alert(e?.response?.data?.message ?? 'Error guardando subproyecto');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const INTERVENCION_COLOR = {
    mantenimiento:  { bg: '#f0faf4', border: '#1f8f57', color: '#1f8f57' },
    no_programadas: { bg: '#eff6ff', border: '#3b82f6', color: '#1d4ed8' },
    establecimiento:{ bg: '#fff5f5', border: '#ef4444', color: '#dc2626' },
  };

  const TIPO_EMOJI = {
    mantenimiento: '🔧',
    no_programadas: '⚡',
    establecimiento: '🌱',
  };

  const disponiblesPorIntervencion = actDisponibles.reduce((acc, a) => {
    const tipo = a.intervencion;
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(a);
    return acc;
  }, {});

  return (
    <div className="modal-overlay">
      <div
        className="modal"
        style={{
          width: 'min(760px, calc(100% - 24px))',
          background: '#fff',
          borderRadius: 18,
          border: '1px solid #e6e8ef',
          boxShadow: '0 24px 64px rgba(15,23,42,0.22)',
          maxHeight: '92vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Header ── */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FolderGit2 size={22} color="#6366f1" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 7, background: modoEditar ? 'rgba(234,179,8,0.12)' : 'rgba(31,143,87,0.12)' }}>
                {modoEditar ? <Pencil size={14} color="#ca8a04" /> : <PlusCircle size={14} color="#1f8f57" />}
              </span>
              {modoEditar ? 'Editar Subproyecto' : 'Nuevo Subproyecto'}
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>
              Proyecto: <strong>{proyecto?.nombre}</strong> ({proyecto?.codigo})
            </p>
          </div>
          <div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94a3b8' }}>×</button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e6e8ef' }}>
          <button
            onClick={() => setTabActiva('info')}
            style={{
              flex: 1, padding: '12px 20px', fontSize: 13, fontWeight: 700,
              background: tabActiva === 'info' ? '#fff' : '#f8fafc',
              color: tabActiva === 'info' ? '#1f8f57' : '#64748b',
              border: 'none', borderBottom: tabActiva === 'info' ? '2px solid #1f8f57' : '2px solid transparent',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <ClipboardList size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            Información General
          </button>
          <button
            onClick={() => setTabActiva('actividades')}
            disabled={!modoEditar}
            style={{
              flex: 1, padding: '12px 20px', fontSize: 13, fontWeight: 700,
              background: tabActiva === 'actividades' ? '#fff' : '#f8fafc',
              color: modoEditar ? (tabActiva === 'actividades' ? '#1f8f57' : '#64748b') : '#cbd5e1',
              border: 'none', borderBottom: tabActiva === 'actividades' ? '2px solid #1f8f57' : '2px solid transparent',
              cursor: modoEditar ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
            }}
          >
            <Target size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            Asignar Actividades {!modoEditar && '(guarda primero)'}
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loadData ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              Cargando datos...
            </div>
          ) : (
            <>
              {tabActiva === 'info' && (
                <>
                  {/* Código */}
                  <div className="form-group">
                    <label>Código *</label>
                    <input
                      type="text"
                      name="codigo"
                      value={form.codigo}
                      onChange={e => setForm(p => ({ ...p, codigo: e.target.value }))}
                      placeholder="Ej: SUB-001"
                      style={{ textTransform: 'uppercase' }}
                      disabled={modoEditar}
                    />
                    {modoEditar && (
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>
                        El código no puede modificarse después de la creación.
                      </p>
                    )}
                  </div>

                  {/* Nombre */}
                  <div className="form-group">
                    <label>Nombre del subproyecto *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={form.nombre}
                      onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                      placeholder="Nombre del subproyecto"
                    />
                  </div>

                  {/* Cliente */}
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={13} /> Cliente
                    </label>
                    <select
                      name="cliente"
                      value={form.cliente}
                      onChange={e => setForm(p => ({ ...p, cliente: e.target.value }))}
                    >
                      <option value="">— Seleccione cliente (opcional) —</option>
                      {clientes.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.nombre ?? c.razon_social}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Supervisor */}
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={13} /> Supervisor
                    </label>
                    <select
                      name="supervisor"
                      value={form.supervisor}
                      onChange={e => setForm(p => ({ ...p, supervisor: e.target.value }))}
                    >
                      <option value="">— Seleccione supervisor (opcional) —</option>
                      {personas.map(p => (
                        <option key={p._id} value={p._id}>
                          {`${p.nombres ?? ''} ${p.apellidos ?? ''}`.trim() || p.nombre || 'Persona'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fechas */}
                  <div className="modal-grid">
                    <div className="form-group">
                      <label>Fecha Inicio</label>
                      <input
                        type="date"
                        name="fecha_inicio"
                        value={form.fecha_inicio}
                        onChange={e => setForm(p => ({ ...p, fecha_inicio: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Fecha Fin Estimada</label>
                      <input
                        type="date"
                        name="fecha_fin_estimada"
                        value={form.fecha_fin_estimada}
                        onChange={e => setForm(p => ({ ...p, fecha_fin_estimada: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Núcleos */}
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={13} /> Núcleos *
                    </label>
                    <p style={{ margin: '0 0 8px', fontSize: 12, color: '#64748b' }}>
                      Selecciona uno o varios núcleos donde se ejecutará este subproyecto.
                    </p>
                    {nucleos.length === 0 ? (
                      <div style={{ padding: '12px 16px', background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 10, color: '#92400e', fontSize: 13 }}>
                        <AlertCircle size={14} style={{ display: 'inline', marginRight: 6 }} />
                        No hay núcleos disponibles. Asegúrate de que el proyecto tenga una zona asignada.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                        {nucleos.map(n => (
                          <div
                            key={n._id}
                            onClick={() => toggleNucleo(n._id)}
                            style={{
                              padding: '10px 14px',
                              border: `1.5px solid ${nucleosSel.includes(n._id) ? '#1f8f57' : '#e6e8ef'}`,
                              background: nucleosSel.includes(n._id) ? '#f0faf4' : '#fff',
                              borderRadius: 10,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            <div
                              style={{
                                width: 16, height: 16, borderRadius: 4,
                                border: `2px solid ${nucleosSel.includes(n._id) ? '#1f8f57' : '#cbd5e1'}`,
                                background: nucleosSel.includes(n._id) ? '#1f8f57' : '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {nucleosSel.includes(n._id) && (
                                <CheckCircle2 size={10} color="#fff" strokeWidth={3} />
                              )}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                              {n.nombre}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Observaciones */}
                  <div className="form-group">
                    <label>Observaciones</label>
                    <textarea
                      name="observaciones"
                      value={form.observaciones}
                      onChange={e => setForm(p => ({ ...p, observaciones: e.target.value }))}
                      placeholder="Observaciones opcionales..."
                      rows={3}
                    />
                  </div>
                </>
              )}

              {tabActiva === 'actividades' && modoEditar && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Actividades ya asignadas */}
                  {asignaciones.length > 0 && (
                    <div>
                      <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        ✅ Actividades asignadas
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {asignaciones.map(a => {
                          const ap = actDisponibles.find(x => (x._id === (a.actividad_proyecto?._id ?? a.actividad_proyecto)));
                          const col = INTERVENCION_COLOR[ap?.intervencion] ?? {};
                          return (
                            <div key={a._id} style={{ background: '#fff', border: `1.5px solid ${col.border}`, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                              <div>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                                  {TIPO_EMOJI[ap?.intervencion]} {ap?.actividad?.nombre}
                                </p>
                                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                                  Asignado: <strong>{a.cantidad_asignada} {ap?.actividad?.unidad_medida ?? ''}</strong>
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCancelarAsignacion(a._id)}
                                style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626', width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actividades disponibles del proyecto */}
                  {Object.entries(disponiblesPorIntervencion).map(([tipo, acts]) => {
                    const col = INTERVENCION_COLOR[tipo] ?? {};
                    return (
                      <div key={tipo}>
                        <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: col.color, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {TIPO_EMOJI[tipo]} {tipo.replace(/_/g, ' ').toUpperCase()}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {acts.map(a => {
                            const enBorrador = nuevasAsigs.some(n => n.actividad_proyecto_id === a._id);
                            const yaAsignada = asignaciones.some(as => (as.actividad_proyecto?._id ?? as.actividad_proyecto) === a._id && as.estado !== 'CANCELADA');
                            const cerrada = a.estado === 'CERRADA';

                            return (
                              <div key={a._id} style={{ background: cerrada ? '#f8fafc' : '#fff', border: `1.5px solid ${cerrada ? '#e2e8f0' : col.border}`, borderRadius: 12, padding: '12px 14px', opacity: cerrada ? 0.65 : 1 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                                  <div>
                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                                      {cerrada && <Lock size={13} color="#64748b" />}
                                      {a.actividad?.nombre}
                                    </p>
                                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                                      {a.actividad?.codigo} · {a.actividad?.unidad_medida}
                                    </p>
                                  </div>
                                  {!cerrada && !yaAsignada && !enBorrador && (
                                    <button
                                      type="button"
                                      onClick={() => agregarActividad(a)}
                                      style={{ background: col.bg, border: `1.5px solid ${col.border}`, color: col.color, borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}
                                    >
                                      <Plus size={12} /> Asignar
                                    </button>
                                  )}
                                  {(yaAsignada || enBorrador) && (
                                    <span style={{ fontSize: 11, background: '#f0faf4', color: '#1f8f57', padding: '3px 10px', borderRadius: 999, fontWeight: 700, flexShrink: 0 }}>
                                      ✅ Agregada
                                    </span>
                                  )}
                                  {cerrada && (
                                    <span style={{ fontSize: 11, background: '#fee2e2', color: '#dc2626', padding: '3px 10px', borderRadius: 999, fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <Lock size={10} /> Cerrada
                                    </span>
                                  )}
                                </div>
                                <BarraProgreso
                                  asignado={a.cantidad_asignada}
                                  total={a.cantidad_total}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Borrador de nuevas asignaciones */}
                  {nuevasAsigs.length > 0 && (
                    <div>
                      <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        📝 Por asignar (ingresa cantidades)
                      </p>
                      <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                        {/* Cabecera */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 32px', gap: 8, padding: '8px 14px', background: '#f8fafc', borderBottom: '1px solid #e6e8ef', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                          <span>Actividad</span>
                          <span>Cantidad a asignar</span>
                          <span></span>
                        </div>
                        {nuevasAsigs.map((a, i) => {
                          const disponible = a.cantidad_total - a.cantidad_asignada_global;
                          return (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 32px', gap: 8, padding: '10px 14px', borderBottom: i < nuevasAsigs.length - 1 ? '1px solid #f0f2f5' : 'none', alignItems: 'center' }}>
                              <div>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                                  {TIPO_EMOJI[a.intervencion]} {a.nombre}
                                </p>
                                <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>
                                  Disponible: {disponible.toFixed(2)} {a.unidad}
                                </p>
                              </div>
                              <input
                                type="number"
                                min="0.01"
                                max={disponible}
                                step="0.01"
                                placeholder={`Máx: ${disponible.toFixed(2)}`}
                                value={a.cantidad}
                                onChange={e => actualizarCantidad(i, e.target.value)}
                                style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #e6e8ef', borderRadius: 8, fontSize: 13 }}
                              />
                              <button type="button" onClick={() => quitarBorrador(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {actDisponibles.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '28px 20px', background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: 12, color: '#94a3b8' }}>
                      <p style={{ margin: '0 0 4px', fontSize: 20 }}>📦</p>
                      <p style={{ margin: 0, fontSize: 13 }}>No hay actividades disponibles en este proyecto.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f2f5', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} disabled={loading} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '11px 20px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ background: loading ? '#94a3b8' : '#1f8f57', color: '#fff', border: 'none', padding: '11px 24px', borderRadius: 10, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, boxShadow: loading ? 'none' : '0 4px 12px rgba(31,143,87,0.25)' }}
          >
            {loading ? 'Guardando...' : modoEditar ? 'Guardar Cambios' : 'Crear Subproyecto'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubproyectoModal;