import { useEffect, useState, useCallback } from 'react';
import {
  FileText, MapPin, Layers, Wrench, Users,
  Search, X, Plus, UserMinus, Calendar
} from 'lucide-react';
import {
  getFincas,
  getLotesPorFinca,
  getActividadesCatalogo,
  getCuadrillas,
  createContrato,
  updateContrato,
  buscarPersonas,
  agregarTrabajadorCuadrilla,
  removerTrabajadorCuadrilla,
} from '../services/contratosService';

// ── helpers ──────────────────────────────────────────────────────
const normalizeList = (res) => {
  if (Array.isArray(res))           return res;
  if (Array.isArray(res?.data))     return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

const toDateInput = (iso) => (iso ? iso.slice(0, 10) : '');

const CAT_LABEL = {
  PREPARACION_TERRENO: 'Preparación', SIEMBRA: 'Siembra',
  MANTENIMIENTO: 'Mantenimiento',     CONTROL_MALEZA: 'Control maleza',
  FERTILIZACION: 'Fertilización',     PODAS: 'Podas',
  OTRO: 'Otro',
};

// ── Sub-componente: InfoRow para modo "ver" ───────────────────────
const InfoRow = ({ icon, label, children }) => {
  const Icon = icon;
  return (
    <div className="info-row">
      <div className="info-icon-wrap">
        <Icon size={15} color="#64748b" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="info-label">{label}</p>
        <div className="info-value">{children}</div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════
export default function ContratoModal({ isOpen, onClose, onSuccess, contrato = null, modo = 'crear' }) {
  // ── Catálogos ──
  const [fincas,      setFincas]      = useState([]);
  const [lotes,       setLotes]       = useState([]);
  const [actividades, setActividades] = useState([]);
  const [cuadrillas,  setCuadrillas]  = useState([]);

  // ── Formulario ──
  const [form, setForm] = useState({
    codigo: '', finca: '', lotes: [], actividades: [],
    cuadrilla: '', fecha_inicio: '', fecha_fin: '', observaciones: '', estado: 'ACTIVO',
  });

  // ── Cuadrilla activa seleccionada (objeto completo) ──
  const [cuadrillaActiva, setCuadrillaActiva] = useState(null);

  // ── Buscador de trabajadores ──
  const [busqueda,    setBusqueda]    = useState('');
  const [resultados,  setResultados]  = useState([]);
  const [buscando,    setBuscando]    = useState(false);
  const [agregando,   setAgregando]   = useState(null);  // personaId en curso

  // ── Control modal ──
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);

  // ── Cargar catálogos al abrir ──────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const [fRes, aRes, cRes] = await Promise.all([
          getFincas(), getActividadesCatalogo(), getCuadrillas(),
        ]);
        setFincas(normalizeList(fRes));
        setActividades(normalizeList(aRes).filter(a => a.activa));
        setCuadrillas(normalizeList(cRes));
      } catch (e) {
        console.error('Error cargando catálogos:', e);
      }
    })();
  }, [isOpen]);

  // ── Pre-llenar si es editar o ver ──────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (contrato && (modo === 'editar' || modo === 'ver')) {
      const fincaId  = contrato.finca?._id  ?? contrato.finca  ?? '';
      const cuaId    = contrato.cuadrilla?._id ?? contrato.cuadrilla ?? '';
      setForm({
        codigo:       contrato.codigo        ?? '',
        finca:        fincaId,
        lotes:        (contrato.lotes   ?? []).map(l => l._id ?? l),
        actividades:  (contrato.actividades ?? []).map(a => a._id ?? a),
        cuadrilla:    cuaId,
        fecha_inicio: toDateInput(contrato.fecha_inicio),
        fecha_fin:    toDateInput(contrato.fecha_fin),
        observaciones: contrato.observaciones ?? '',
        estado:        contrato.estado ?? 'ACTIVO',
      });
      // Cuadrilla activa para ver miembros
      if (contrato.cuadrilla && typeof contrato.cuadrilla === 'object') {
        setCuadrillaActiva(contrato.cuadrilla);
      }
      // Cargar lotes de esa finca
      if (fincaId) fetchLotes(fincaId);
    } else {
      resetForm();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, contrato, modo]);

  const resetForm = () => {
    setForm({ codigo:'', finca:'', lotes:[], actividades:[], cuadrilla:'',
              fecha_inicio:'', fecha_fin:'', observaciones:'', estado:'ACTIVO' });
    setLotes([]);
    setCuadrillaActiva(null);
    setResultados([]);
    setBusqueda('');
    setError(null);
  };

  // ── Cargar lotes al cambiar finca ──────────────────────────────
  const fetchLotes = useCallback(async (fincaId) => {
    if (!fincaId) { setLotes([]); return; }
    try {
      const res = await getLotesPorFinca(fincaId);
      setLotes(normalizeList(res).filter(l => l.activo));
    } catch (e) {
      console.error('Error lotes:', e);
    }
  }, []);

  const handleFincaChange = (fincaId) => {
    setForm(prev => ({ ...prev, finca: fincaId, lotes: [] }));
    fetchLotes(fincaId);
  };

  // ── Cuadrilla: sincroniza objeto activo ────────────────────────
  const handleCuadrillaChange = (cuaId) => {
    setForm(prev => ({ ...prev, cuadrilla: cuaId }));
    const obj = cuadrillas.find(c => (c._id ?? c.id) === cuaId) || null;
    setCuadrillaActiva(obj);
    setResultados([]);
    setBusqueda('');
  };

  // ── Toggle lote ────────────────────────────────────────────────
  const toggleLote = (id) => {
    setForm(prev => ({
      ...prev,
      lotes: prev.lotes.includes(id)
        ? prev.lotes.filter(l => l !== id)
        : [...prev.lotes, id],
    }));
  };

  // ── Toggle actividad ──────────────────────────────────────────
  const toggleActividad = (id) => {
    setForm(prev => ({
      ...prev,
      actividades: prev.actividades.includes(id)
        ? prev.actividades.filter(a => a !== id)
        : [...prev.actividades, id],
    }));
  };

  // ── Buscar trabajadores ────────────────────────────────────────
  const handleBuscar = async () => {
    if (!busqueda.trim()) return;
    try {
      setBuscando(true);
      const res = await buscarPersonas(busqueda.trim());
      const lista = normalizeList(res);
      // Excluir los que ya están en la cuadrilla
      const miembrosIds = getMiembrosActivos().map(m => m._id ?? m.id ?? m);
      setResultados(lista.filter(p => !miembrosIds.includes(p._id ?? p.id)));
    } catch (e) {
      console.error('Error buscando:', e);
    } finally {
      setBuscando(false);
    }
  };

  // ── Obtiene miembros activos de la cuadrilla activa ────────────
  const getMiembrosActivos = () => {
    if (!cuadrillaActiva) return [];
    return (cuadrillaActiva.miembros ?? [])
      .filter(m => m.activo)
      .map(m => m.persona ?? m);
  };

  // ── Agregar trabajador a cuadrilla ─────────────────────────────
  const handleAgregarTrabajador = async (persona) => {
    if (!cuadrillaActiva) return;
    const cuaId  = cuadrillaActiva._id ?? cuadrillaActiva.id;
    const perId  = persona._id ?? persona.id;
    try {
      setAgregando(perId);
      const res = await agregarTrabajadorCuadrilla(cuaId, perId);
      // Actualizar cuadrilla activa con respuesta del servidor
      const cuadrillaActualizada = res?.data ?? res;
      setCuadrillaActiva(cuadrillaActualizada);
      // Quitar del listado de resultados
      setResultados(prev => prev.filter(p => (p._id ?? p.id) !== perId));
    } catch (e) {
      alert(e?.response?.data?.message ?? 'No se pudo agregar el trabajador');
    } finally {
      setAgregando(null);
    }
  };

  // ── Remover trabajador de cuadrilla ────────────────────────────
  const handleRemoverTrabajador = async (persona) => {
    if (!cuadrillaActiva) return;
    const cuaId = cuadrillaActiva._id ?? cuadrillaActiva.id;
    const perId = persona._id ?? persona.id;
    if (!window.confirm(`¿Remover a ${persona.nombres} ${persona.apellidos} de la cuadrilla?`)) return;
    try {
      const res = await removerTrabajadorCuadrilla(cuaId, perId);
      setCuadrillaActiva(res?.data ?? res);
    } catch (e) {
      alert(e?.response?.data?.message ?? 'No se pudo remover el trabajador');
    }
  };

  // ── Guardar contrato ───────────────────────────────────────────
  const handleSave = async () => {
    setError(null);
    // Validación básica client-side
    if (!form.codigo.trim())         return setError('El código es obligatorio');
    if (!form.finca)                 return setError('Selecciona una finca');
    if (form.lotes.length === 0)     return setError('Selecciona al menos un lote');
    if (form.actividades.length === 0) return setError('Selecciona al menos una actividad');
    if (!form.cuadrilla)             return setError('Selecciona una cuadrilla');
    if (!form.fecha_inicio)          return setError('La fecha de inicio es obligatoria');

    try {
      setSaving(true);
      const payload = {
        codigo:        form.codigo.trim().toUpperCase(),
        finca:         form.finca,
        lotes:         form.lotes,
        actividades:   form.actividades,
        cuadrilla:     form.cuadrilla,
        fecha_inicio:  form.fecha_inicio,
        fecha_fin:     form.fecha_fin || null,
        observaciones: form.observaciones.trim(),
        estado:        form.estado,
      };

      if (modo === 'editar' && contrato) {
        await updateContrato(contrato._id ?? contrato.id, payload);
      } else {
        await createContrato(payload);
      }

      onSuccess?.();
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message ?? 'Error al guardar el contrato');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const miembrosActivos = getMiembrosActivos();
  const esVer = modo === 'ver';

  // ── MODO VER ────────────────────────────────────────────────────
  if (esVer) {
    const c = contrato;
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-contrato" onClick={e => e.stopPropagation()}>
          <div className="modal-contrato-header">
            <h3>📋 Detalle del Contrato</h3>
            <button className="modal-close-btn" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <InfoRow icon={FileText} label="Código">{c.codigo}</InfoRow>
            <InfoRow icon={MapPin} label="Finca">{c.finca?.nombre ?? '—'} <span style={{ color:'#94a3b8', fontSize:12 }}>({c.finca?.codigo})</span></InfoRow>
            <InfoRow icon={Layers} label="Lotes">
              <div className="chips-wrap">
                {(c.lotes ?? []).map(l => <span key={l._id ?? l} className="chip">{l.nombre ?? l.codigo ?? l}</span>)}
              </div>
            </InfoRow>
            <InfoRow icon={Wrench} label="Actividades">
              <div className="chips-wrap">
                {(c.actividades ?? []).map(a => <span key={a._id ?? a} className="chip">{a.nombre ?? a}</span>)}
              </div>
            </InfoRow>
            <InfoRow icon={Users} label={`Cuadrilla · ${miembrosActivos.length} miembros`}>
              <p style={{ margin: 0, fontWeight: 600 }}>{c.cuadrilla?.nombre ?? '—'}</p>
              {miembrosActivos.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {miembrosActivos.map(p => (
                    <span key={p._id ?? p} className="chip">
                      {p.nombres} {p.apellidos}
                    </span>
                  ))}
                </div>
              )}
            </InfoRow>
            <InfoRow icon={Calendar} label="Vigencia">
              {c.fecha_inicio ? new Date(c.fecha_inicio).toLocaleDateString('es-CO') : '—'}
              {c.fecha_fin ? ` → ${new Date(c.fecha_fin).toLocaleDateString('es-CO')}` : ''}
            </InfoRow>
          </div>
          <div className="modal-footer">
            <button className="btn-cancelar" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    );
  }

  // ── MODO CREAR / EDITAR ─────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-contrato" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-contrato-header">
          <h3>{modo === 'editar' ? '✏️ Editar Contrato' : '➕ Nuevo Contrato'}</h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {error && <div className="contratos-error">{error}</div>}

          {/* ── Sección 1: Datos básicos ── */}
          <div className="form-section">
            <p className="form-section-title">📋 Datos básicos</p>
            <div className="form-row">
              <div className="form-field">
                <label>Código *</label>
                <input
                  placeholder="Ej: CON-001"
                  value={form.codigo}
                  onChange={e => setForm(p => ({ ...p, codigo: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label>Estado</label>
                <select value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}>
                  <option value="ACTIVO">Activo</option>
                  <option value="BORRADOR">Borrador</option>
                  <option value="CERRADO">Cerrado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
              <div className="form-field">
                <label>Fecha inicio *</label>
                <input type="date" value={form.fecha_inicio}
                  onChange={e => setForm(p => ({ ...p, fecha_inicio: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>Fecha fin</label>
                <input type="date" value={form.fecha_fin}
                  onChange={e => setForm(p => ({ ...p, fecha_fin: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* ── Sección 2: Ubicación ── */}
          <div className="form-section">
            <p className="form-section-title">📍 Ubicación</p>
            <div className="form-field">
              <label>Finca *</label>
              <select value={form.finca} onChange={e => handleFincaChange(e.target.value)}>
                <option value="">— Selecciona una finca —</option>
                {fincas.map(f => (
                  <option key={f._id ?? f.id} value={f._id ?? f.id}>{f.nombre} ({f.codigo})</option>
                ))}
              </select>
            </div>

            {form.finca && (
              <div className="form-field">
                <label>Lotes * — {form.lotes.length} seleccionado(s)</label>
                {lotes.length === 0 ? (
                  <p style={{ margin:0, fontSize:13, color:'#94a3b8' }}>Esta finca no tiene lotes activos registrados.</p>
                ) : (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {lotes.map(l => {
                      const lid = l._id ?? l.id;
                      const sel = form.lotes.includes(lid);
                      return (
                        <label key={lid} className={`actividad-checkbox ${sel ? 'selected' : ''}`} style={{ minWidth: 'unset', padding:'7px 12px' }}>
                          <input type="checkbox" checked={sel} onChange={() => toggleLote(lid)} />
                          <span className="act-nombre">{l.nombre} <span className="act-cat">({l.codigo})</span></span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Sección 3: Actividades ── */}
          <div className="form-section">
            <p className="form-section-title">🔧 Actividades — {form.actividades.length} seleccionada(s)</p>
            <div className="actividades-grid">
              {actividades.map(a => {
                const aid = a._id ?? a.id;
                const sel = form.actividades.includes(aid);
                return (
                  <label key={aid} className={`actividad-checkbox ${sel ? 'selected' : ''}`}>
                    <input type="checkbox" checked={sel} onChange={() => toggleActividad(aid)} />
                    <div>
                      <p className="act-nombre">{a.nombre}</p>
                      <p className="act-cat">{CAT_LABEL[a.categoria] ?? a.categoria}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── Sección 4: Cuadrilla + Trabajadores ── */}
          <div className="form-section">
            <p className="form-section-title">👥 Cuadrilla y trabajadores</p>
            <div className="form-field">
              <label>Cuadrilla *</label>
              <select value={form.cuadrilla} onChange={e => handleCuadrillaChange(e.target.value)}>
                <option value="">— Selecciona una cuadrilla —</option>
                {cuadrillas.map(c => {
                  const cid = c._id ?? c.id;
                  const nMiembros = (c.miembros ?? []).filter(m => m.activo).length;
                  return (
                    <option key={cid} value={cid}>{c.nombre} · {nMiembros} miembro(s)</option>
                  );
                })}
              </select>
            </div>

            {/* Panel de trabajadores — solo si hay cuadrilla seleccionada */}
            {cuadrillaActiva && (
              <div className="trabajadores-panel">
                {/* Header del panel */}
                <div className="trabajadores-panel-header">
                  <span>👷 Trabajadores en la cuadrilla</span>
                  <span style={{ fontSize:12, color:'#64748b' }}>{miembrosActivos.length} activo(s)</span>
                </div>

                {/* Buscador */}
                <div className="trabajadores-buscador">
                  <input
                    placeholder="Buscar por cédula o nombre..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleBuscar()}
                  />
                  <button className="btn-buscar" onClick={handleBuscar} disabled={buscando}>
                    {buscando ? '...' : <><Search size={14} /> Buscar</>}
                  </button>
                </div>

                {/* Resultados de búsqueda */}
                {resultados.length > 0 && (
                  <div className="trabajadores-resultados">
                    {resultados.map(p => {
                      const pid = p._id ?? p.id;
                      return (
                        <div key={pid} className="trabajador-item">
                          <div className="trabajador-info">
                            <p className="trab-nombre">{p.nombres} {p.apellidos}</p>
                            <p className="trab-doc">{p.tipo_doc} {p.num_doc} {p.cargo ? `· ${p.cargo}` : ''}</p>
                          </div>
                          <button
                            className="btn-agregar-trab"
                            disabled={agregando === pid}
                            onClick={() => handleAgregarTrabajador(p)}
                          >
                            {agregando === pid ? '...' : <><Plus size={12} /> Agregar</>}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Miembros actuales */}
                {miembrosActivos.length > 0 ? (
                  <div className="trabajadores-actuales">
                    {miembrosActivos.map(p => {
                      const pid = p._id ?? p.id;
                      return (
                        <div key={pid} className="miembro-item">
                          <div>
                            <p className="miembro-nombre">{p.nombres} {p.apellidos}</p>
                            <p className="miembro-doc">{p.tipo_doc} {p.num_doc}</p>
                          </div>
                          <button className="btn-remover-trab" title="Remover de la cuadrilla"
                            onClick={() => handleRemoverTrabajador(p)}>
                            <UserMinus size={15} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="trabajadores-actuales-empty">La cuadrilla no tiene miembros activos aún.</p>
                )}
              </div>
            )}
          </div>

          {/* ── Sección 5: Observaciones ── */}
          <div className="form-section">
            <div className="form-field">
              <label>Observaciones</label>
              <textarea
                placeholder="Notas adicionales..."
                value={form.observaciones}
                onChange={e => setForm(p => ({ ...p, observaciones: e.target.value }))}
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onClose}>Cancelar</button>
          <button className="btn-guardar" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : modo === 'editar' ? 'Guardar cambios' : 'Crear contrato'}
          </button>
        </div>

      </div>
    </div>
  );
}