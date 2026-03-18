import { useEffect, useState, useCallback } from 'react';
import {
  FileText, MapPin, Layers, Wrench, Users,
  Search, X, Plus, PlusCircle, Pencil, Calendar, GitBranch, DollarSign,
  AlertCircle, UserCheck, UserX, ChevronDown, ChevronUp, Trash2,
  ClipboardList, Settings2, UsersRound, FolderOpen, LayoutList,
} from 'lucide-react';
import {
  getFincas,
  getSubproyectos,
  getActividadesDisponiblesSubproyecto,
  createContrato,
  updateContrato,
} from '../services/contratosService';
import httpClient from '../../../core/api/httpClient';

// ── helpers ───────────────────────────────────────────────────────
const normalizeList = (res) => {
  if (Array.isArray(res))             return res;
  if (Array.isArray(res?.data))       return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};
const toDateInput = (iso) => (iso ? iso.slice(0, 10) : '');
const fmt = (n) => Number(n).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Cuadrilla vacía base ──────────────────────────────────────────
const nuevaCuadrillaVacia = (idx) => ({
  _key:      Date.now() + idx,
  nombre:    '',
  codigo:    '',
  supervisor: null,
  miembros:  [],
  expandida: true,
});

// ── Barra progreso ────────────────────────────────────────────────
const BarraCantidad = ({ disponible, total }) => {
  const totalNum = Number(total) || 0;
  const dispNum = Number(disponible) || 0;
  const pct   = totalNum > 0 ? Math.min(100, Math.round(((totalNum - dispNum) / totalNum) * 100)) : 0;
  const color = dispNum <= 0 ? '#dc2626' : dispNum / totalNum < 0.2 ? '#e67e22' : '#1f8f57';
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ height: 5, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
        <span>Comprometido: {fmt(totalNum - dispNum)}</span>
        <span style={{ color }}>Disponible: {fmt(dispNum)}</span>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, children }) => {
  const Icon = icon;
  return (
    <div className="info-row">
      <div className="info-icon-wrap"><Icon size={15} color="#64748b" /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="info-label">{label}</p>
        <div className="info-value">{children}</div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
export default function ContratoModal({ isOpen, onClose, onSuccess, contrato = null, modo = 'crear' }) {

  const [fincas,       setFincas]       = useState([]);
  const [subproyectos, setSubproyectos] = useState([]);

  const [form, setForm] = useState({
    codigo: '', subproyecto: '', finca: '',
    fecha_inicio: '', fecha_fin: '', observaciones: '', estado: 'ACTIVO',
  });

  const [actividadesDisponibles, setActividadesDisponibles] = useState([]);
  const [loadingActividades,     setLoadingActividades]     = useState(false);
  const [actividadesSel,         setActividadesSel]         = useState([]);

  // ✅ NUEVO: lotes embebidos del contrato
  const [lotes,     setLotes]     = useState([]);
  const [nuevoLote, setNuevoLote] = useState('');

  // ── Lista de cuadrillas a crear ──
  const [cuadrillas, setCuadrillas] = useState([nuevaCuadrillaVacia(0)]);

  // ── Cuadrillas existentes (modo editar) ──
  const [cuadrillasExistentes, setCuadrillasExistentes] = useState([]);

  // ── Personas ──
  const [todasPersonas,   setTodasPersonas]   = useState([]);
  const [loadingPersonas, setLoadingPersonas] = useState(false);

  const [busquedas, setBusquedas] = useState({});

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);
  const [tab,    setTab]    = useState('datos');

  // ── Cargar catálogos ──────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const [fRes, sRes] = await Promise.all([getFincas(), getSubproyectos()]);
        setFincas(normalizeList(fRes));
        setSubproyectos(normalizeList(sRes));
      } catch (e) { console.error(e); }
    })();
  }, [isOpen]);

  // ── Cargar personas al abrir tab cuadrilla ────────────────────
  const cargarPersonas = useCallback(async () => {
    if (todasPersonas.length > 0) return;
    try {
      setLoadingPersonas(true);
      const res = await httpClient.get('/personas', { params: { estado: 'ACTIVO' } });
      setTodasPersonas(normalizeList(res?.data));
    } catch (e) { console.error(e); }
    finally { setLoadingPersonas(false); }
  }, [todasPersonas.length]);

  useEffect(() => {
    if (tab === 'cuadrilla') cargarPersonas();
  }, [tab, cargarPersonas]);

  // ── Pre-llenar en editar/ver ──────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (contrato && (modo === 'editar' || modo === 'ver')) {
      const fincaId = contrato.finca?._id  ?? contrato.finca  ?? '';
      const subId   = contrato.subproyecto?._id ?? contrato.subproyecto ?? '';

      setForm({
        codigo:        contrato.codigo ?? '',
        subproyecto:   subId,
        finca:         fincaId,
        fecha_inicio:  toDateInput(contrato.fecha_inicio),
        fecha_fin:     toDateInput(contrato.fecha_fin),
        observaciones: contrato.observaciones ?? '',
        estado:        contrato.estado ?? 'ACTIVO',
      });

      // ✅ Cargar lotes embebidos existentes
      setLotes(
        Array.isArray(contrato.lotes)
          ? contrato.lotes.map((l) => ({ nombre: l.nombre, _id: l._id }))
          : []
      );

      setActividadesSel((contrato.actividades ?? []).map(a => ({
        asignacion_id:      a.asignacion_subproyecto?._id ?? a.asignacion_subproyecto ?? null,
        actividad_id:       a.actividad?._id ?? a.actividad ?? '',
        nombre:             a.actividad?.nombre ?? '—',
        unidad:             a.actividad?.unidad_medida ?? '',
        cantidad_disponible: null,
        cantidad:           String(a.cantidad ?? ''),
        precio_unitario:    String(a.precio_unitario ?? ''),
      })));

      setCuadrillasExistentes(contrato.cuadrillas ?? []);

      if (subId) cargarActividadesDisponibles(subId, contrato._id ?? contrato.id);
    } else {
      resetForm();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, contrato, modo]);

  const resetForm = () => {
    setForm({ codigo:'', subproyecto:'', finca:'',
              fecha_inicio:'', fecha_fin:'', observaciones:'', estado:'ACTIVO' });
    setLotes([]);
    setNuevoLote('');
    setActividadesDisponibles([]);
    setActividadesSel([]);
    setCuadrillas([nuevaCuadrillaVacia(0)]);
    setCuadrillasExistentes([]);
    setBusquedas({});
    setTodasPersonas([]);
    setError(null);
    setTab('datos');
  };

  const cargarActividadesDisponibles = async (subId, excludeId = null) => {
    if (!subId) { setActividadesDisponibles([]); return; }
    try {
      setLoadingActividades(true);
      const res = await getActividadesDisponiblesSubproyecto(subId, excludeId);
      setActividadesDisponibles(normalizeList(res));
    } catch { setActividadesDisponibles([]); }
    finally { setLoadingActividades(false); }
  };

  const handleSubproyectoChange = (subId) => {
    setForm(p => ({ ...p, subproyecto: subId }));
    setActividadesSel([]);
    cargarActividadesDisponibles(subId, contrato?._id ?? contrato?.id ?? null);
  };

  // ✅ NUEVO: agregar lote a la lista
  const handleAgregarLote = () => {
    const nombre = nuevoLote.trim();
    if (!nombre) return;
    setLotes((prev) => [...prev, { nombre }]);
    setNuevoLote('');
  };

  // ✅ NUEVO: eliminar lote por índice
  const handleEliminarLote = (idx) => {
    setLotes((prev) => prev.filter((_, i) => i !== idx));
  };

  // ✅ NUEVO: agregar lote con Enter
  const handleLoteKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAgregarLote();
    }
  };

  // ── Actividades ───────────────────────────────────────────────
  const agregarActividad = (disp) => {
    if (!disp || typeof disp !== 'object') return;
    const actId = disp.actividad?._id ?? '';
    if (!actId || actividadesSel.some(a => a.actividad_id === actId)) return;
    const nueva = {
      asignacion_id:      disp.asignacion_id || '',
      actividad_id:       actId,
      nombre:             disp.actividad?.nombre || '—',
      unidad:             disp.unidad || '',
      cantidad_disponible: Number(disp.cantidad_disponible) || 0,
      cantidad:           '',
      precio_unitario:    String(disp.precio_unitario_referencia || ''),
    };
    setActividadesSel(prev => [...prev, nueva]);
  };
  const quitarActividad = (idx) => setActividadesSel(p => p.filter((_, i) => i !== idx));
  const actualizarCampoActividad = (idx, campo, valor) =>
    setActividadesSel(p => p.map((a, i) => i === idx ? { ...a, [campo]: valor } : a));
  const errorCantidad = (item) => {
    const cant = Number(item.cantidad);
    if (!item.cantidad || cant <= 0) return 'Requerida';
    if (item.cantidad_disponible !== null && cant > item.cantidad_disponible) return `Máx: ${fmt(item.cantidad_disponible)}`;
    return null;
  };

  // ── Helpers cuadrillas ────────────────────────────────────────
  const actualizarCuadrilla = (idx, campo, valor) =>
    setCuadrillas(prev => prev.map((c, i) => i === idx ? { ...c, [campo]: valor } : c));

  const agregarNuevaCuadrilla = () =>
    setCuadrillas(prev => [...prev, nuevaCuadrillaVacia(prev.length)]);

  const eliminarCuadrilla = (idx) => {
    if (cuadrillas.length === 1) return;
    setCuadrillas(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleExpandida = (idx) =>
    actualizarCuadrilla(idx, 'expandida', !cuadrillas[idx].expandida);

  const seleccionarSupervisor = (cuadrillaIdx, persona) => {
    const pid = persona._id ?? persona.id;
    setCuadrillas(prev => prev.map((c, i) => {
      if (i !== cuadrillaIdx) return c;
      return { ...c, supervisor: persona, miembros: c.miembros.filter(m => (m._id ?? m.id) !== pid) };
    }));
  };

  const quitarSupervisor = (cuadrillaIdx) =>
    actualizarCuadrilla(cuadrillaIdx, 'supervisor', null);

  const agregarMiembro = (cuadrillaIdx, persona) => {
    setCuadrillas(prev => prev.map((c, i) => {
      if (i !== cuadrillaIdx) return c;
      const pid = persona._id ?? persona.id;
      if (c.miembros.some(m => (m._id ?? m.id) === pid)) return c;
      return { ...c, miembros: [...c.miembros, persona] };
    }));
  };

  const quitarMiembro = (cuadrillaIdx, pid) =>
    setCuadrillas(prev => prev.map((c, i) =>
      i !== cuadrillaIdx ? c : { ...c, miembros: c.miembros.filter(m => (m._id ?? m.id) !== pid) }
    ));

  const getPersonasDisponibles = (cuadrillaIdx) => {
    const busqueda = (busquedas[cuadrillaIdx] ?? '').trim().toLowerCase();
    const todosOcupados = new Set();
    cuadrillas.forEach(c => {
      if (c.supervisor) todosOcupados.add(c.supervisor._id ?? c.supervisor.id);
      c.miembros.forEach(m => todosOcupados.add(m._id ?? m.id));
    });
    return todasPersonas.filter(p => {
      const pid = p._id ?? p.id;
      if (todosOcupados.has(pid)) return false;
      if (!busqueda) return true;
      const nombre = `${p.nombres ?? ''} ${p.apellidos ?? ''}`.toLowerCase();
      const doc    = (p.num_doc ?? '').toLowerCase();
      return nombre.includes(busqueda) || doc.includes(busqueda);
    });
  };

  // ── Guardar ───────────────────────────────────────────────────
  const handleSave = async () => {
    setError(null);

    if (!form.codigo.trim())         return setError('El código del contrato es obligatorio');
    if (!form.subproyecto)           return setError('Selecciona un subproyecto');
    if (!form.finca)                 return setError('Selecciona una finca');
    if (lotes.length === 0)          return setError('Agrega al menos un lote'); // ✅
    if (actividadesSel.length === 0) return setError('Agrega al menos una actividad');
    if (!form.fecha_inicio)          return setError('La fecha de inicio es obligatoria');

    for (const a of actividadesSel) {
      const err = errorCantidad(a);
      if (err && err !== 'Requerida') return setError(`${a.nombre}: ${err}`);
      if (!a.cantidad || Number(a.cantidad) <= 0) return setError(`Ingresa una cantidad válida para "${a.nombre}"`);
      if (a.precio_unitario === '' || Number(a.precio_unitario) < 0) return setError(`Ingresa un precio válido para "${a.nombre}"`);
    }

    let cuadrillaIds = (contrato?.cuadrillas ?? []).map(c => c._id ?? c);

    if (modo === 'crear') {
      for (let i = 0; i < cuadrillas.length; i++) {
        const c = cuadrillas[i];
        if (!c.nombre.trim()) return setError(`Cuadrilla ${i + 1}: el nombre es obligatorio`);
        if (!c.codigo.trim()) return setError(`Cuadrilla ${i + 1}: el código es obligatorio`);
        if (!c.supervisor)    return setError(`Cuadrilla ${i + 1}: debes seleccionar un supervisor`);
        if (c.miembros.length === 0) return setError(`Cuadrilla ${i + 1}: agrega al menos un trabajador`);
      }

      try {
        setSaving(true);
        const resultados = await Promise.all(
          cuadrillas.map(c =>
            httpClient.post('/cuadrillas', {
              codigo:    c.codigo.trim().toUpperCase(),
              nombre:    c.nombre.trim(),
              supervisor: c.supervisor._id ?? c.supervisor.id,
              miembros:  c.miembros.map(m => m._id ?? m.id),
            })
          )
        );
        cuadrillaIds = resultados.map(r => r?.data?.data?._id ?? r?.data?._id);
        if (cuadrillaIds.some(id => !id)) throw new Error('No se pudo obtener el ID de una cuadrilla creada');
      } catch (e) {
        setError(e?.response?.data?.message ?? e?.message ?? 'Error al crear las cuadrillas');
        setSaving(false);
        return;
      }
    }

    try {
      const payload = {
        codigo:       form.codigo.trim().toUpperCase(),
        subproyecto:  form.subproyecto,
        finca:        form.finca,
        lotes:        lotes.map((l) => ({ nombre: l.nombre })), // ✅ solo nombre, el backend genera el código
        actividades:  actividadesSel.map(a => ({
          actividad:       a.actividad_id,
          cantidad:        Number(a.cantidad),
          precio_unitario: Number(a.precio_unitario),
        })),
        cuadrillas:    cuadrillaIds,
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
      setError(e?.response?.data?.message ?? e?.message ?? 'Error al guardar el contrato');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const esVer    = modo === 'ver';
  const valorTotal = actividadesSel.reduce((s, a) => s + (Number(a.cantidad)||0) * (Number(a.precio_unitario)||0), 0);

  // ══ MODO VER ══════════════════════════════════════════════════
  if (esVer) {
    const c = contrato;
    const lotesContrato = Array.isArray(c.lotes) ? c.lotes : [];
    return (
      <div className="modal-overlay">
        <div className="modal-contrato" onClick={e => e.stopPropagation()}>
          <div className="modal-contrato-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.12)' }}>
                <FileText size={17} color="#3b82f6" />
              </span>
              Detalle del Contrato
            </h3>
            <button className="modal-close-btn" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <InfoRow icon={FileText}  label="Código">{c.codigo}</InfoRow>
            <InfoRow icon={GitBranch} label="Subproyecto">
              {c.subproyecto?.nombre ?? '—'} <span style={{ color:'#94a3b8', fontSize:12 }}>({c.subproyecto?.codigo})</span>
            </InfoRow>
            <InfoRow icon={MapPin} label="Finca">
              {c.finca?.nombre ?? '—'} <span style={{ color:'#94a3b8', fontSize:12 }}>({c.finca?.codigo})</span>
            </InfoRow>

            {/* ✅ NUEVO: Lotes embebidos en modo ver */}
            <InfoRow icon={Layers} label={`Lotes (${lotesContrato.length})`}>
              {lotesContrato.length === 0 ? (
                <span style={{ color: '#94a3b8', fontSize: 13 }}>Sin lotes registrados</span>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {lotesContrato.map((l) => (
                    <span
                      key={l._id ?? l.codigo}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '4px 10px', borderRadius: 8,
                        background: '#f0faf4', border: '1px solid rgba(31,143,87,0.25)',
                        fontSize: 12, fontWeight: 600, color: '#1f8f57',
                      }}
                    >
                      <span style={{ color: '#94a3b8', fontWeight: 500 }}>#{l.codigo}</span>
                      {l.nombre}
                    </span>
                  ))}
                </div>
              )}
            </InfoRow>

            <InfoRow icon={Wrench} label="Actividades">
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {(c.actividades ?? []).map((a, i) => (
                  <div key={i} style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, padding:'8px 12px' }}>
                    <p style={{ margin:0, fontWeight:700, fontSize:13 }}>{a.actividad?.nombre ?? '—'}</p>
                    <p style={{ margin:'2px 0 0', fontSize:12, color:'#64748b' }}>
                      Cant: <strong>{fmt(a.cantidad)}</strong> · Precio: <strong>${fmt(a.precio_unitario)}</strong> · Total: <strong>${fmt((a.cantidad??0)*(a.precio_unitario??0))}</strong>
                    </p>
                  </div>
                ))}
                <p style={{ margin:'4px 0 0', fontSize:13, fontWeight:700, color:'#1f8f57', textAlign:'right' }}>
                  Valor total: ${fmt((c.actividades??[]).reduce((s,a)=>s+(a.cantidad??0)*(a.precio_unitario??0),0))}
                </p>
              </div>
            </InfoRow>
            <InfoRow icon={Users} label={`Cuadrillas (${(c.cuadrillas??[]).length})`}>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {(c.cuadrillas ?? []).map((cua, i) => {
                  const miembros = (cua.miembros ?? []).filter(m => m.activo).map(m => m.persona ?? m);
                  return (
                    <div key={cua._id ?? i} style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, padding:'8px 12px' }}>
                      <p style={{ margin:0, fontWeight:700, fontSize:13 }}>{cua.nombre} <span style={{ color:'#94a3b8', fontSize:11 }}>({cua.codigo})</span></p>
                      <div style={{ marginTop:6, display:'flex', flexWrap:'wrap', gap:4 }}>
                        {miembros.map((p, idx) => <span key={`miembro-${p._id || idx}`} className="chip">{p.nombres} {p.apellidos}</span>)}
                      </div>
                    </div>
                  );
                })}
              </div>
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

  // ══ MODO CREAR / EDITAR ════════════════════════════════════════
  const totalMiembros = cuadrillas.reduce((s, c) => s + c.miembros.length, 0);
  const TABS = [
    { key: 'datos',       label: 'datos',       icon: ClipboardList,  texto: 'Datos' },
    { key: 'actividades', label: 'actividades',  icon: Settings2,      texto: `Actividades${actividadesSel.length > 0 ? ` (${actividadesSel.length})` : ''}` },
    { key: 'cuadrilla',   label: 'cuadrilla',    icon: UsersRound,     texto: `Cuadrillas${modo === 'crear' && totalMiembros > 0 ? ` (${cuadrillas.length})` : ''}` },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-contrato" onClick={e => e.stopPropagation()} style={{ maxWidth: 860, width: '100%' }}>

        <div className="modal-contrato-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 7, background: modo === 'editar' ? 'rgba(234,179,8,0.12)' : 'rgba(31,143,87,0.12)' }}>
              {modo === 'editar' ? <Pencil size={14} color="#ca8a04" /> : <PlusCircle size={14} color="#1f8f57" />}
            </span>
            {modo === 'editar' ? 'Editar Contrato' : 'Nuevo Contrato'}
          </h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:'1px solid #e6e8ef', padding:'0 24px' }}>
          {TABS.map(t => {
            const TabIcon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding:'11px 18px', border:'none', background:'none', cursor:'pointer',
                fontSize:13, fontWeight: tab === t.key ? 700 : 500,
                color: tab === t.key ? '#1f8f57' : '#64748b',
                borderBottom: tab === t.key ? '2.5px solid #1f8f57' : '2.5px solid transparent',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <TabIcon size={14} />
                {t.texto}
              </button>
            );
          })}
        </div>

        <div className="modal-body">
          {error && <div className="contratos-error" style={{ marginBottom:12 }}>{error}</div>}

          {/* ══ TAB DATOS ══════════════════════════════════════════ */}
          {tab === 'datos' && (
            <>
              <div className="form-section">
                <p className="form-section-title" style={{ display:'flex', alignItems:'center', gap:7 }}><FolderOpen size={14} color="#6366f1" /> Subproyecto *</p>
                <div className="form-field">
                  <select value={form.subproyecto} onChange={e => handleSubproyectoChange(e.target.value)}>
                    <option value="">— Selecciona un subproyecto —</option>
                    {subproyectos.map(s => (
                      <option key={s._id??s.id} value={s._id??s.id}>{s.codigo} · {s.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-section">
                <p className="form-section-title" style={{ display:'flex', alignItems:'center', gap:7 }}><LayoutList size={14} color="#3b82f6" /> Datos básicos</p>
                <div className="form-row">
                  <div className="form-field">
                    <label>Código *</label>
                    <input placeholder="Ej: CON-001" value={form.codigo}
                      onChange={e => setForm(p => ({ ...p, codigo: e.target.value }))} />
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

              <div className="form-section">
                <p className="form-section-title" style={{ display:'flex', alignItems:'center', gap:7 }}><MapPin size={14} color="#e67e22" /> Ubicación</p>
                <div className="form-field">
                  <label>Finca *</label>
                  <select value={form.finca} onChange={e => setForm(p => ({ ...p, finca: e.target.value }))}>
                    <option value="">— Selecciona una finca —</option>
                    {fincas.map(f => <option key={f._id??f.id} value={f._id??f.id}>{f.nombre} ({f.codigo})</option>)}
                  </select>
                </div>

                {/* ✅ NUEVO: Sección de lotes embebidos */}
                <div className="form-field" style={{ marginTop: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Layers size={13} /> Lotes * — {lotes.length} definido(s)
                  </label>

                  {/* Input + botón agregar */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={nuevoLote}
                      onChange={(e) => setNuevoLote(e.target.value)}
                      onKeyDown={handleLoteKeyDown}
                      placeholder="Nombre del lote, ej: Lote Norte"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={handleAgregarLote}
                      disabled={!nuevoLote.trim()}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '0 16px', borderRadius: 8, border: 'none',
                        background: nuevoLote.trim() ? '#1f8f57' : '#e2e8f0',
                        color: nuevoLote.trim() ? '#fff' : '#94a3b8',
                        fontWeight: 700, fontSize: 13,
                        cursor: nuevoLote.trim() ? 'pointer' : 'not-allowed',
                        whiteSpace: 'nowrap', height: 38,
                      }}
                    >
                      <Plus size={15} /> Agregar
                    </button>
                  </div>

                  <p style={{ margin: '4px 0 8px', fontSize: 12, color: '#94a3b8' }}>
                    Presiona Enter o el botón para agregar. El código se genera automáticamente.
                  </p>

                  {/* Lista de lotes agregados */}
                  {lotes.length > 0 && (
                    <div
                      style={{
                        display: 'flex', flexDirection: 'column', gap: 6,
                        padding: '10px 12px',
                        background: '#f8fafc', borderRadius: 10,
                        border: '1px solid #e6e8ef',
                      }}
                    >
                      {lotes.map((lote, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '8px 10px', borderRadius: 8,
                            background: '#fff', border: '1px solid #e6e8ef',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              style={{
                                width: 24, height: 24, borderRadius: 6,
                                background: '#e8f5ee', color: '#1f8f57',
                                fontSize: 11, fontWeight: 800,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {idx + 1}
                            </span>
                            <span style={{ fontSize: 14, color: '#0f172a', fontWeight: 500 }}>
                              {lote.nombre}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleEliminarLote(idx)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: '#ef4444', padding: '4px',
                              display: 'flex', alignItems: 'center', borderRadius: 6,
                            }}
                            title="Eliminar lote"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-section">
                <div className="form-field">
                  <label>Observaciones</label>
                  <textarea placeholder="Notas adicionales..." value={form.observaciones}
                    onChange={e => setForm(p => ({ ...p, observaciones: e.target.value }))} />
                </div>
              </div>
            </>
          )}

          {/* ══ TAB ACTIVIDADES ════════════════════════════════════ */}
          {tab === 'actividades' && (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {!form.subproyecto ? (
                <div style={{ textAlign:'center', padding:'32px 20px', background:'#f8fafc', border:'2px dashed #e2e8f0', borderRadius:12, color:'#94a3b8' }}>
                  <p style={{ margin:0, fontSize:22 }}>📂</p>
                  <p style={{ margin:'6px 0 0', fontSize:13 }}>Selecciona primero un subproyecto en la pestaña "Datos"</p>
                </div>
              ) : loadingActividades ? (
                <div style={{ textAlign:'center', padding:32, color:'#64748b' }}>Cargando actividades...</div>
              ) : (
                <>
                  <div>
                    <p style={{ margin:'0 0 10px', fontSize:13, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.4px' }}>
                      Actividades disponibles
                    </p>
                    {actividadesDisponibles.length === 0 ? (
                      <div style={{ padding:16, background:'#fef9c3', border:'1px solid #fde68a', borderRadius:10, fontSize:13, color:'#92400e', display:'flex', alignItems:'center', gap:8 }}>
                        <AlertCircle size={15} /> Sin actividades disponibles en este subproyecto.
                      </div>
                    ) : (
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {actividadesDisponibles.map(disp => {
                          const actId     = disp.actividad?._id ?? '';
                          const yaAgregada = actividadesSel.some(a => a.actividad_id === actId);
                          const sinDisp    = disp.cantidad_disponible <= 0;
                          return (
                            <div key={disp.asignacion_id} style={{
                              background: sinDisp ? '#f8fafc' : '#fff',
                              border: `1.5px solid ${sinDisp ? '#e2e8f0' : yaAgregada ? '#1f8f57' : '#e2e8f0'}`,
                              borderRadius:10, padding:'12px 14px', opacity: sinDisp ? 0.65 : 1,
                            }}>
                              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
                                <div style={{ flex:1 }}>
                                  <p style={{ margin:0, fontSize:13, fontWeight:700 }}>{disp.actividad?.nombre ?? '—'}</p>
                                  <p style={{ margin:'2px 0 4px', fontSize:12, color:'#64748b' }}>
                                    {disp.actividad?.codigo} · {disp.unidad} · Precio ref: <strong>${fmt(disp.precio_unitario_referencia)}</strong>
                                  </p>
                                  <BarraCantidad disponible={disp.cantidad_disponible} total={typeof disp.cantidad_asignada_subproyecto === 'number' ? disp.cantidad_asignada_subproyecto : (disp.cantidad_asignada_subproyecto?.cantidad || 0)} />
                                </div>
                                <div style={{ flexShrink:0 }}>
                                  {yaAgregada
                                    ? <span style={{ fontSize:11, background:'#f0faf4', color:'#1f8f57', padding:'3px 10px', borderRadius:999, fontWeight:700 }}>✅ Agregada</span>
                                    : sinDisp
                                      ? <span style={{ fontSize:11, background:'#fee2e2', color:'#dc2626', padding:'3px 10px', borderRadius:999, fontWeight:700 }}>Sin disponible</span>
                                      : (
                                        <button onClick={() => agregarActividad(disp)} style={{ background:'#f0faf4', border:'1.5px solid #1f8f57', color:'#1f8f57', padding:'5px 12px', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                                          <Plus size={12} /> Agregar
                                        </button>
                                      )
                                  }
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {actividadesSel.length > 0 && (
                    <div>
                      <p style={{ margin:'0 0 10px', fontSize:13, fontWeight:700, color:'#0f172a', textTransform:'uppercase', letterSpacing:'0.4px' }}>
                        📝 Cantidades y precios
                      </p>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 150px 150px 90px 32px', gap:8, padding:'8px 14px', background:'#f8fafc', borderRadius:'10px 10px 0 0', border:'1px solid #e2e8f0', borderBottom:'none', fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase' }}>
                        <span>Actividad</span><span>Cantidad</span><span>Precio unitario</span><span>Total</span><span></span>
                      </div>
                      <div style={{ border:'1px solid #e2e8f0', borderRadius:'0 0 10px 10px', overflow:'hidden' }}>
                        {actividadesSel.map((a, i) => {
                          const errCant = errorCantidad(a);
                          const total   = (Number(a.cantidad)||0) * (Number(a.precio_unitario)||0);
                          return (
                            <div key={i} style={{
                              display:'grid', gridTemplateColumns:'1fr 150px 150px 90px 32px',
                              gap:8, padding:'10px 14px', alignItems:'center',
                              borderBottom: i < actividadesSel.length - 1 ? '1px solid #f0f2f5' : 'none',
                              background: errCant && errCant !== 'Requerida' ? '#fff5f5' : '#fff',
                            }}>
                              <div>
                                <p style={{ margin:0, fontSize:13, fontWeight:600 }}>{a.nombre}</p>
                                <p style={{ margin:0, fontSize:11, color:'#94a3b8' }}>
                                  {a.cantidad_disponible !== null ? `Disponible: ${fmt(a.cantidad_disponible)} ${a.unidad}` : a.unidad}
                                </p>
                              </div>
                              <div>
                                <input type="number" min="0.01" step="0.01"
                                  placeholder={a.cantidad_disponible !== null ? `Máx ${fmt(a.cantidad_disponible)}` : '0'}
                                  value={a.cantidad}
                                  onChange={e => actualizarCampoActividad(i, 'cantidad', e.target.value)}
                                  style={{ width:'100%', padding:'7px 10px', fontSize:13, border:`1.5px solid ${errCant && errCant !== 'Requerida' ? '#dc2626' : '#e6e8ef'}`, borderRadius:8 }}
                                />
                                {errCant && errCant !== 'Requerida' && (
                                  <p style={{ margin:'2px 0 0', fontSize:10, color:'#dc2626' }}>{errCant}</p>
                                )}
                              </div>
                              <div style={{ position:'relative' }}>
                                <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', fontSize:12, color:'#94a3b8' }}>$</span>
                                <input type="number" min="0" step="0.01" placeholder="0.00"
                                  value={a.precio_unitario}
                                  onChange={e => actualizarCampoActividad(i, 'precio_unitario', e.target.value)}
                                  style={{ width:'100%', padding:'7px 10px 7px 20px', fontSize:13, border:'1.5px solid #e6e8ef', borderRadius:8 }}
                                />
                              </div>
                              <p style={{ margin:0, fontSize:12, fontWeight:700, color:'#1f8f57', textAlign:'right' }}>${fmt(total)}</p>
                              <button onClick={() => quitarActividad(i)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <X size={15} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display:'flex', justifyContent:'flex-end', marginTop:10 }}>
                        <div style={{ background:'#f0faf4', border:'1.5px solid #1f8f57', borderRadius:10, padding:'8px 18px', display:'flex', alignItems:'center', gap:8 }}>
                          <DollarSign size={15} color="#1f8f57" />
                          <span style={{ fontSize:13, fontWeight:700, color:'#1f8f57' }}>Valor total: ${fmt(valorTotal)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ══ TAB CUADRILLAS ═════════════════════════════════════ */}
          {tab === 'cuadrilla' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

              {modo === 'editar' && cuadrillasExistentes.length > 0 && (
                <div style={{ background:'#f0faf4', border:'1.5px solid #1f8f57', borderRadius:12, padding:'14px 16px' }}>
                  <p style={{ margin:'0 0 8px', fontSize:13, fontWeight:700, color:'#1f8f57' }}>✅ Cuadrillas asignadas actualmente</p>
                  {cuadrillasExistentes.map((cua, i) => (
                    <div key={cua._id ?? i} style={{ marginTop: i > 0 ? 6 : 0 }}>
                      <p style={{ margin:0, fontSize:13, fontWeight:700 }}>{cua.nombre ?? `Cuadrilla ${i+1}`}</p>
                      <p style={{ margin:0, fontSize:12, color:'#64748b' }}>
                        {(cua.miembros ?? []).filter(m => m.activo).length} miembro(s)
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {modo === 'crear' && (
                <>
                  {cuadrillas.map((cua, cuaIdx) => {
                    const personasDisp = getPersonasDisponibles(cuaIdx);
                    const busqueda     = busquedas[cuaIdx] ?? '';
                    return (
                      <div key={cua._key} style={{ border:'1.5px solid #e2e8f0', borderRadius:14, overflow:'hidden' }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'#f8fafc', borderBottom: cua.expandida ? '1px solid #e2e8f0' : 'none', cursor:'pointer' }}
                          onClick={() => toggleExpandida(cuaIdx)}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:30, height:30, borderRadius:8, background:'rgba(99,102,241,0.1)' }}>
                              <UsersRound size={15} color="#6366f1" />
                            </span>
                            <div>
                              <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#0f172a' }}>
                                {cua.nombre.trim() || `Cuadrilla ${cuaIdx + 1}`}
                              </p>
                              <p style={{ margin:0, fontSize:11, color:'#94a3b8' }}>
                                {cua.supervisor ? `Supervisor: ${cua.supervisor.nombres} ${cua.supervisor.apellidos}` : 'Sin supervisor'} · {cua.miembros.length} miembro(s)
                              </p>
                            </div>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            {cuadrillas.length > 1 && (
                              <button
                                onClick={e => { e.stopPropagation(); eliminarCuadrilla(cuaIdx); }}
                                style={{ background:'#fee2e2', border:'none', color:'#dc2626', width:28, height:28, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                            {cua.expandida ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                          </div>
                        </div>

                        {cua.expandida && (
                          <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:14 }}>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                              <div className="form-field" style={{ margin:0 }}>
                                <label>Nombre *</label>
                                <input placeholder="Ej: Cuadrilla Norte"
                                  value={cua.nombre}
                                  style={{ background:'#fff', color:'#0f172a' }}
                                  onChange={e => actualizarCuadrilla(cuaIdx, 'nombre', e.target.value)} />
                              </div>
                              <div className="form-field" style={{ margin:0 }}>
                                <label>Código *</label>
                                <input placeholder="Ej: CUA-001"
                                  value={cua.codigo}
                                  style={{ background:'#fff', color:'#0f172a' }}
                                  onChange={e => actualizarCuadrilla(cuaIdx, 'codigo', e.target.value.toUpperCase())} />
                              </div>
                            </div>

                            {cua.supervisor && (
                              <div style={{ background:'#eff6ff', border:'1.5px solid #3b82f6', borderRadius:10, padding:'10px 14px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                                <div>
                                  <p style={{ margin:0, fontSize:11, fontWeight:700, color:'#1d4ed8', textTransform:'uppercase' }}>⭐ Supervisor</p>
                                  <p style={{ margin:'2px 0 0', fontSize:13, fontWeight:700 }}>{cua.supervisor.nombres} {cua.supervisor.apellidos}</p>
                                  <p style={{ margin:0, fontSize:11, color:'#64748b' }}>{cua.supervisor.tipo_doc} {cua.supervisor.num_doc}</p>
                                </div>
                                <button onClick={() => quitarSupervisor(cuaIdx)} style={{ background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.3)', color:'#dc2626', width:30, height:30, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                                  <X size={13} />
                                </button>
                              </div>
                            )}

                            {cua.miembros.length > 0 && (
                              <div>
                                <p style={{ margin:'0 0 6px', fontSize:12, fontWeight:700, color:'#475569', textTransform:'uppercase' }}>
                                  Trabajadores ({cua.miembros.length})
                                </p>
                                <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                                  {cua.miembros.map(p => {
                                    const pid = p._id ?? p.id;
                                    return (
                                      <div key={pid} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, padding:'7px 12px' }}>
                                        <div>
                                          <p style={{ margin:0, fontSize:13, fontWeight:600 }}>{p.nombres} {p.apellidos}</p>
                                          <p style={{ margin:0, fontSize:11, color:'#94a3b8' }}>{p.tipo_doc} {p.num_doc}{p.cargo ? ` · ${p.cargo}` : ''}</p>
                                        </div>
                                        <button onClick={() => quitarMiembro(cuaIdx, pid)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444' }}>
                                          <UserX size={15} />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            <div>
                              <p style={{ margin:'0 0 8px', fontSize:12, fontWeight:700, color:'#475569', textTransform:'uppercase' }}>
                                Agregar personas
                              </p>
                              <div style={{ position:'relative', marginBottom:10 }}>
                                <Search size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
                                <input
                                  placeholder="Buscar por nombre o cédula..."
                                  value={busqueda}
                                  onChange={e => setBusquedas(prev => ({ ...prev, [cuaIdx]: e.target.value }))}
                                  style={{ width:'100%', padding:'8px 12px 8px 34px', border:'1.5px solid #e6e8ef', borderRadius:9, fontSize:13, outline:'none', boxSizing:'border-box', background:'#fff', color:'#0f172a' }}
                                />
                              </div>
                              {loadingPersonas ? (
                                <div style={{ textAlign:'center', padding:20, color:'#64748b', fontSize:13 }}>Cargando personas...</div>
                              ) : personasDisp.length === 0 ? (
                                <div style={{ textAlign:'center', padding:16, color:'#94a3b8', fontSize:13 }}>
                                  {busqueda ? 'Sin resultados' : 'Todas las personas ya fueron asignadas'}
                                </div>
                              ) : (
                                <div style={{ display:'flex', flexDirection:'column', gap:5, maxHeight:240, overflowY:'auto' }}>
                                  {personasDisp.map(p => {
                                    const pid = p._id ?? p.id;
                                    return (
                                      <div key={pid} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'9px 12px' }}>
                                        <div>
                                          <p style={{ margin:0, fontSize:13, fontWeight:600 }}>{p.nombres} {p.apellidos}</p>
                                          <p style={{ margin:0, fontSize:11, color:'#94a3b8' }}>{p.tipo_doc} {p.num_doc}{p.cargo ? ` · ${p.cargo}` : ''}</p>
                                        </div>
                                        <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                                          <button onClick={() => seleccionarSupervisor(cuaIdx, p)}
                                            style={{ background:'#eff6ff', border:'1.5px solid #3b82f6', color:'#1d4ed8', padding:'5px 10px', borderRadius:7, fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                                            <UserCheck size={12} /> Supervisor
                                          </button>
                                          <button onClick={() => agregarMiembro(cuaIdx, p)}
                                            style={{ background:'#f0faf4', border:'1.5px solid #1f8f57', color:'#1f8f57', padding:'5px 10px', borderRadius:7, fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                                            <Plus size={12} /> Agregar
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <button onClick={agregarNuevaCuadrilla} style={{
                    display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                    padding:'12px', border:'2px dashed #1f8f57', borderRadius:12,
                    background:'transparent', color:'#1f8f57', fontSize:13, fontWeight:700,
                    cursor:'pointer', width:'100%',
                  }}>
                    <Plus size={16} /> Agregar otra cuadrilla
                  </button>
                </>
              )}
            </div>
          )}
        </div>

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