import { useEffect, useReducer } from 'react';
import { X } from 'lucide-react';

const INITIAL_STATE = {
  codigo:  '',
  nombre:  '',
  activo:  true,
  saving:  false,
  error:   null,
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

export default function NuevoCargoModal({
  isOpen,
  title = 'Nuevo Cargo',
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
    const activoValue = initialValues?.activo ?? initialValues?.estado;
    dispatch({
      type: 'RESET',
      values: {
        codigo: initialValues?.codigo ?? '',
        nombre: initialValues?.nombre ?? '',
        activo: typeof activoValue === 'boolean' ? activoValue : true,
        saving: false,
        error:  null,
      },
    });
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const isEdit = title.toLowerCase().includes('editar');

  // Solo dígitos en el código
  const handleCodigo = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    dispatch({ type: 'SET_FIELD', field: 'codigo', value: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'SET_ERROR', value: null });

    if (!state.codigo.toString().trim() || !state.nombre.trim()) {
      dispatch({ type: 'SET_ERROR', value: 'Código y nombre son obligatorios' });
      return;
    }

    const payload = {
      codigo: Number(state.codigo),
      nombre: state.nombre.trim(),
      activo: Boolean(state.activo),
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
            <p className="modal-subtitle">Completa los datos del cargo</p>
          </div>
          <button className="modal-close-btn" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>

          {/* Código — solo números */}
          <label className="field">
            <span>Código *</span>
            <input
              value={state.codigo}
              onChange={handleCodigo}
              placeholder="Ej: 1"
              inputMode="numeric"
              autoFocus
            />
          </label>

          {/* Nombre */}
          <label className="field">
            <span>Nombre *</span>
            <input
              value={state.nombre}
              onChange={setField('nombre')}
              placeholder="Ej: Operario"
            />
          </label>

          {/* Estado */}
          <label className="field">
            <span>Estado</span>
            <select
              value={state.activo ? 'true' : 'false'}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'activo', value: e.target.value === 'true' })
              }
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
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