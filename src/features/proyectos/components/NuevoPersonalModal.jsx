import { useEffect, useReducer, useState } from 'react';
import { X } from 'lucide-react';
import httpClient from '../../../core/api/httpClient';

const CARGOS = ['Operario', 'Supervisor', 'Auxiliar', 'Capataz', 'Jefe de Campo'];
const TIPOS_CONTRATO = ['INDEFINIDO', 'FIJO', 'OBRA_LABOR', 'APRENDIZ', 'TEMPORAL'];

const normalizeList = (axiosRes) => {
  const body = axiosRes?.data ?? axiosRes;
  if (Array.isArray(body))       return body;
  if (Array.isArray(body?.data)) return body.data;
  return [];
};

// ── Todo el estado del formulario + UI en un solo objeto ──────────────────
const INITIAL_STATE = {
  numDoc:          '',
  nombres:         '',
  segundoNombre:   '',
  apellidos:       '',
  segundoApellido: '',
  cargo:           '',
  tipoContrato: 'OBRA_LABOR',
  fechaIngreso: '',
  fincaId:      '',
  procesoId:    '',
  supervisorId: '',
  estado:       'ACTIVO',
  saving:       false,
  error:        null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      // Resetea el formulario completo de una sola vez, sin renders en cascada
      return { ...INITIAL_STATE, ...action.values };
    case 'SET_SAVING':
      return { ...state, saving: action.value };
    case 'SET_ERROR':
      return { ...state, error: action.value };
    default:
      return state;
  }
}

// ── Componente ────────────────────────────────────────────────────────────
export default function NuevoPersonalModal({
  isOpen,
  title = 'Nuevo Personal',
  initialValues,
  onClose,
  onSubmit,
}) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [displayFechaIngreso, setDisplayFechaIngreso] = useState('');

  const [fincas,       setFincas]       = useState([]);
  const [procesos,     setProcesos]     = useState([]);
  const [supervisores, setSupervisores] = useState([]);

  // Helper para inputs/selects
  const setField = (field) => (e) =>
    dispatch({ type: 'SET_FIELD', field, value: e.target.value });

  // Cargar selects al abrir
  useEffect(() => {
    if (!isOpen) return;
    Promise.all([
      httpClient.get('/fincas').catch(() => ({ data: [] })),
      httpClient.get('/procesos').catch(() => ({ data: [] })),
      httpClient.get('/personas').catch(() => ({ data: [] })),
    ]).then(([fRes, pRes, sRes]) => {
      setFincas(normalizeList(fRes?.data ?? fRes));
      setProcesos(normalizeList(pRes?.data ?? pRes));
      const todas = normalizeList(sRes?.data ?? sRes);
      setSupervisores(todas.filter(
        (p) => p?.cargo?.toLowerCase().includes('supervisor') && p?.estado === 'ACTIVO'
      ));
    });
  }, [isOpen]);

  // Rellenar al editar — UN solo dispatch, cero renders en cascada
  useEffect(() => {
    if (!isOpen) return;

    const f   = initialValues?.finca;
    const pr  = initialValues?.proceso;
    const sup = initialValues?.supervisor;

    dispatch({
      type: 'RESET',
      values: {
        numDoc:          initialValues?.num_doc        ?? '',
        nombres:         initialValues?.nombres          ?? '',
        segundoNombre:   initialValues?.segundo_nombre   ?? '',
        apellidos:       initialValues?.apellidos        ?? '',
        segundoApellido: initialValues?.segundo_apellido ?? '',
        cargo:        initialValues?.cargo         ?? '',
        tipoContrato: initialValues?.tipo_contrato ?? 'OBRA_LABOR',
        fechaIngreso: initialValues?.fecha_ingreso
          ? initialValues.fecha_ingreso.substring(0, 10)
          : '',
        fincaId:      typeof f   === 'string' ? f   : (f?._id   ?? f?.id   ?? ''),
        procesoId:    typeof pr  === 'string' ? pr  : (pr?._id  ?? pr?.id  ?? ''),
        supervisorId: typeof sup === 'string' ? sup : (sup?._id ?? sup?.id ?? ''),
        estado:       initialValues?.estado ?? 'ACTIVO',
        saving:       false,
        error:        null,
      },
    });
    if (initialValues?.fecha_ingreso) {
      const iso = initialValues.fecha_ingreso.substring(0, 10);
      const [y, m, d] = iso.split('-');
      setDisplayFechaIngreso(`${d}/${m}/${y}`);
    } else {
      setDisplayFechaIngreso('');
    }
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const isEdit = title.toLowerCase().includes('editar');

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'SET_ERROR', value: null });

    if (!state.numDoc.trim() || !state.nombres.trim() || !state.apellidos.trim()) {
      dispatch({ type: 'SET_ERROR', value: 'Cédula, primer nombre y primer apellido son obligatorios' });
      return;
    }

    const payload = {
      tipo_doc:         'CC',
      num_doc:          state.numDoc.trim(),
      nombres:          state.nombres.trim(),
      segundo_nombre:   state.segundoNombre.trim()   || undefined,
      apellidos:        state.apellidos.trim(),
      segundo_apellido: state.segundoApellido.trim() || undefined,
      cargo:            state.cargo,
      tipo_contrato: state.tipoContrato,
      fecha_ingreso: state.fechaIngreso  || undefined,
      finca:         state.fincaId       || undefined,
      proceso:       state.procesoId     || undefined,
      supervisor:    state.supervisorId  || undefined,
      estado:        state.estado,
    };

    try {
      dispatch({ type: 'SET_SAVING', value: true });
      await onSubmit?.(payload);
    } catch (err) {
      dispatch({ type: 'SET_ERROR', value: err?.response?.data?.message || 'No se pudo guardar' });
      dispatch({ type: 'SET_SAVING', value: false });
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{ position: 'relative', zIndex: 1, maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{title}</h3>
            <p className="modal-subtitle">Completa los datos del personal</p>
          </div>
          <button className="modal-close-btn" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>

          {/* Cédula */}
          <label className="field">
            <span>Cédula *</span>
            <input
              value={state.numDoc}
              onChange={setField('numDoc')}
              placeholder="Ej: 1061234567"
              autoFocus
            />
          </label>

          {/* Nombres y apellidos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label className="field">
              <span>Primer Nombre *</span>
              <input value={state.nombres} onChange={setField('nombres')} placeholder="Ej: Juan" />
            </label>
            <label className="field">
              <span>Segundo Nombre</span>
              <input value={state.segundoNombre} onChange={setField('segundoNombre')} placeholder="Ej: Carlos" />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label className="field">
              <span>Primer Apellido *</span>
              <input value={state.apellidos} onChange={setField('apellidos')} placeholder="Ej: Pérez" />
            </label>
            <label className="field">
              <span>Segundo Apellido</span>
              <input value={state.segundoApellido} onChange={setField('segundoApellido')} placeholder="Ej: Gómez" />
            </label>
          </div>

          {/* Cargo y tipo contrato */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label className="field">
              <span>Cargo</span>
              <select value={state.cargo} onChange={setField('cargo')}>
                <option value="">— Selecciona cargo —</option>
                {CARGOS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Tipo Contrato</span>
              <select value={state.tipoContrato} onChange={setField('tipoContrato')}>
                {TIPOS_CONTRATO.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
          </div>

          {/* Fecha ingreso y estado */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label className="field">
              <span>Fecha Ingreso</span>
              <input
                type="text"
                placeholder="DD/MM/AAAA"
                maxLength={10}
                style={{ letterSpacing: 1 }}
                value={displayFechaIngreso}
                onChange={e => {
                  const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 8);
                  let display = raw;
                  if (raw.length > 4) display = raw.slice(0,2) + '/' + raw.slice(2,4) + '/' + raw.slice(4);
                  else if (raw.length > 2) display = raw.slice(0,2) + '/' + raw.slice(2);
                  setDisplayFechaIngreso(display);
                  if (raw.length === 8) {
                    const d = parseInt(raw.slice(0,2), 10);
                    const m = parseInt(raw.slice(2,4), 10);
                    const y = parseInt(raw.slice(4,8), 10);
                    const fecha = new Date(y, m - 1, d);
                    const valida = fecha.getFullYear() === y && fecha.getMonth() === m - 1 && fecha.getDate() === d && m >= 1 && m <= 12;
                    if (valida) {
                      const dd = String(d).padStart(2,'0'), mm = String(m).padStart(2,'0'), yy = String(y);
                      dispatch({ type: 'SET_FIELD', field: 'fechaIngreso', value: `${yy}-${mm}-${dd}` });
                    } else {
                      dispatch({ type: 'SET_FIELD', field: 'fechaIngreso', value: '' });
                    }
                  } else {
                    dispatch({ type: 'SET_FIELD', field: 'fechaIngreso', value: '' });
                  }
                }}
              />
              {displayFechaIngreso.length === 10 && !state.fechaIngreso && (
                <small style={{ color: '#dc2626', fontSize: 11, marginTop: 2 }}>
                  Fecha inválida — verifica día, mes y año
                </small>
              )}
            </label>
            <label className="field">
              <span>Estado</span>
              <select value={state.estado} onChange={setField('estado')}>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
                <option value="SUSPENDIDO">Suspendido</option>
              </select>
            </label>
          </div>

          {/* Finca */}
          <label className="field">
            <span>Finca</span>
            <select value={state.fincaId} onChange={setField('fincaId')}>
              <option value="">— Sin finca asignada —</option>
              {fincas.map((f) => (
                <option key={f._id ?? f.id} value={f._id ?? f.id}>
                  {f.codigo ? `${f.codigo} – ` : ''}{f.nombre}
                </option>
              ))}
            </select>
          </label>

          {/* Proceso */}
          <label className="field">
            <span>Proceso</span>
            <select value={state.procesoId} onChange={setField('procesoId')}>
              <option value="">— Sin proceso asignado —</option>
              {procesos.map((p) => (
                <option key={p._id ?? p.id} value={p._id ?? p.id}>
                  {p.codigo ? `${p.codigo} – ` : ''}{p.nombre}
                </option>
              ))}
            </select>
          </label>

          {/* Supervisor */}
          <label className="field">
            <span>Supervisor</span>
            <select value={state.supervisorId} onChange={setField('supervisorId')}>
              <option value="">— Sin supervisor —</option>
              {supervisores.map((s) => (
                <option key={s._id ?? s.id} value={s._id ?? s.id}>
                  {s.nombres} {s.apellidos}
                </option>
              ))}
            </select>
          </label>

          {state.error && <div className="form-error">{state.error}</div>}

          <div className="modal-actions">
            <button className="btn-modal-cancel" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn-modal-submit" type="submit" disabled={state.saving}>
              {state.saving ? 'Guardando…' : isEdit ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}