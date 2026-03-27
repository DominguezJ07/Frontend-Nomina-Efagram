import { useEffect, useReducer } from 'react';
import { X } from 'lucide-react';
import { getNextNucleoCode } from '../../services/nucleos.service';

const INITIAL_STATE = {
  codigo: '',
  nombre: '',
  zona: '',
  estado: true,
  saving: false,
  error: null,
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

export default function NuevoNucleoModal({
  isOpen,
  title = 'Nuevo Núcleo',
  initialValues,
  zonas = [],
  onClose,
  onSubmit,
}) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const isEdit = title.toLowerCase().includes('editar');

  const setField = (field) => (e) =>
    dispatch({ type: 'SET_FIELD', field, value: e.target.value });

  useEffect(() => {
    if (!isOpen) return;

    const estadoValue = initialValues?.activo ?? initialValues?.activa ?? initialValues?.estado;

    dispatch({
      type: 'RESET',
      values: {
        codigo: initialValues?.codigo ?? '',
        nombre: initialValues?.nombre ?? '',
        zona: initialValues?.zona ?? initialValues?.zonaId ?? '',
        estado: typeof estadoValue === 'boolean' ? estadoValue : true,
        saving: false,
        error: null,
      },
    });
  }, [isOpen, initialValues]);

  useEffect(() => {
    if (!isOpen) return;
    if (isEdit) return;

    if (!state.zona) {
      dispatch({ type: 'SET_FIELD', field: 'codigo', value: '' });
      return;
    }

    const loadNextCode = async () => {
      try {
        const res = await getNextNucleoCode(state.zona);
        dispatch({
          type: 'SET_FIELD',
          field: 'codigo',
          value: res?.data?.formatted ?? '',
        });
      } catch (err) {
        console.error(err);
        dispatch({ type: 'SET_ERROR', value: 'No se pudo calcular el código automático' });
      }
    };

    loadNextCode();
  }, [isOpen, isEdit, state.zona]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'SET_ERROR', value: null });

    if (!state.nombre.trim() || !state.zona) {
      dispatch({ type: 'SET_ERROR', value: 'Zona y nombre son obligatorios' });
      return;
    }

    const payload = {
      nombre: state.nombre.trim(),
      zona: state.zona,
      activo: Boolean(state.estado),
    };

    if (isEdit) {
      payload.codigo = String(state.codigo).trim();
    }

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
    <div className="modal-backdrop">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{title}</h3>
            <p className="modal-subtitle">Completa los datos del núcleo territorial</p>
          </div>
          <button className="modal-close-btn" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <label className="field">
            <span>Código <span style={{ color: '#9ca3af', fontWeight: 400 }}>(automático)</span></span>
            <input
              value={state.codigo}
              readOnly
              placeholder={state.zona ? 'Auto' : 'Seleccione una zona'}
            />
          </label>

          <label className="field">
            <span>Nombre</span>
            <input
              value={state.nombre}
              onChange={setField('nombre')}
              placeholder="Ej: Núcleo Norte 1"
              autoFocus
            />
          </label>

          {zonas.length > 0 && (
            <label className="field">
              <span>Zona</span>
              <select value={state.zona} onChange={setField('zona')}>
                <option value="">-- Seleccione una zona --</option>
                {zonas.map((z) => {
                  const id = z?._id ?? z?.id;
                  return (
                    <option key={id} value={id}>
                      {z?.nombre ?? id}
                    </option>
                  );
                })}
              </select>
            </label>
          )}

          <label className="field">
            <span>Estado</span>
            <select
              value={state.estado ? 'true' : 'false'}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'estado', value: e.target.value === 'true' })
              }
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </label>

          {state.error && <div className="form-error">{state.error}</div>}

          <div className="modal-actions">
            <button className="btn-modal-cancel" type="button" onClick={onClose}>Cancelar</button>
            <button className="btn-modal-submit" type="submit" disabled={state.saving}>
              {state.saving ? 'Guardando…' : isEdit ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}