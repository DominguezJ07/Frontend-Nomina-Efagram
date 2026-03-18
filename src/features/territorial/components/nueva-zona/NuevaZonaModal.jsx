import { useEffect, useReducer } from 'react';
import { X } from 'lucide-react';

const INITIAL_STATE = {
  codigo: '',
  nombre: '',
  estado: true,
  saving: false,
  error:  null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return { ...INITIAL_STATE, ...action.values };
    case 'SET_SAVING':
      return { ...state, saving: action.value };
    case 'SET_ERROR':
      return { ...state, error: action.value };
    default:
      return state;
  }
}

export default function NuevaZonaModal({
  isOpen,
  title = 'Nueva Zona',
  initialValues,
  onClose,
  onSubmit,
}) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const setField = (field) => (e) =>
    dispatch({ type: 'SET_FIELD', field, value: e.target.value });

  // UN solo dispatch — sin renders en cascada
  useEffect(() => {
    if (!isOpen) return;
    const estadoValue = initialValues?.activa ?? initialValues?.estado;
    dispatch({
      type: 'RESET',
      values: {
        codigo: initialValues?.codigo ?? '',
        nombre: initialValues?.nombre ?? '',
        estado: typeof estadoValue === 'boolean' ? estadoValue : true,
        saving: false,
        error:  null,
      },
    });
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const isEdit = title.toLowerCase().includes('editar');

  // Solo 1 dígito (0-9)
  const handleCodigo = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 1);
    dispatch({ type: 'SET_FIELD', field: 'codigo', value: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'SET_ERROR', value: null });

    if (!state.codigo.trim() || !state.nombre.trim()) {
      dispatch({ type: 'SET_ERROR', value: 'Código y nombre son obligatorios' });
      return;
    }

    const payload = {
      codigo: Number(state.codigo),
      nombre: state.nombre.trim(),
      activa: Boolean(state.estado),
    };

    try {
      dispatch({ type: 'SET_SAVING', value: true });
      await onSubmit?.(payload);
    } catch (err) {
      console.error(err);
      dispatch({ type: 'SET_ERROR', value: err?.response?.data?.message || 'No se pudo guardar' });
      dispatch({ type: 'SET_SAVING', value: false });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{title}</h3>
            <p className="modal-subtitle">Completa los datos de la zona territorial</p>
          </div>
          <button className="modal-close-btn" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>

          {/* Código — 1 dígito */}
          <label className="field">
            <span>Código <span style={{ color: '#9ca3af', fontWeight: 400 }}>(1 dígito)</span></span>
            <input
              value={state.codigo}
              onChange={handleCodigo}
              placeholder="Ej: 1"
              inputMode="numeric"
              maxLength={1}
              autoFocus     
            />
          </label>

          <label className="field">
            <span>Nombre</span>
            <input
              value={state.nombre}
              onChange={setField('nombre')}
              placeholder="Ej: Zona Norte"
            />
          </label>

          <label className="field">
            <span>Estado</span>
            <select
              value={state.estado ? 'true' : 'false'}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'estado', value: e.target.value === 'true' })
              }
            >
              <option value="true">Activa</option>
              <option value="false">Inactiva</option>
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