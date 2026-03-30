import { useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { getProcesos } from '../services/procesosService';

function resolveProcesoId(proc) {
  if (!proc) return '';
  if (typeof proc === 'string') return proc;
  return proc._id ?? proc.id ?? '';
}

function resolveActivo(raw) {
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'number')  return raw === 1;
  if (typeof raw === 'string') {
    const v = raw.toLowerCase().trim();
    return v === 'activo' || v === 'activa' || v === 'active' || v === 'true' || v === '1';
  }
  return true;
}

export default function NuevaIntervencionModal({
  isOpen,
  title = 'Nueva Intervención',
  initialValues,
  onClose,
  onSubmit,
}) {
  const [codigo,      setCodigo]      = useState(initialValues?.codigo      ?? '');
  const [nombre,      setNombre]      = useState(initialValues?.nombre      ?? '');
  const [proceso,     setProceso]     = useState(resolveProcesoId(initialValues?.proceso));
  const [activo,      setActivo]      = useState(resolveActivo(initialValues?.activo ?? initialValues?.estado));
  const [descripcion, setDescripcion] = useState(initialValues?.descripcion ?? '');
  const [saving,      setSaving]      = useState(false);
  const [errors,      setErrors]      = useState([]);

  const [procesos, setProcesos] = useState([]);
  useEffect(() => {
    if (!isOpen) return;
    getProcesos()
      .then((res) => {
        let list = [];
        if (Array.isArray(res))                  list = res;
        else if (Array.isArray(res?.data))       list = res.data;
        else if (Array.isArray(res?.data?.data)) list = res.data.data;
        setProcesos(list.filter((p) => p.activo !== false));
      })
      .catch(() => setProcesos([]));
  }, [isOpen]);

  if (!isOpen) return null;

  const isEdit = title.toLowerCase().includes('editar');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const locales = [];
    if (!codigo.trim()) locales.push('El código es obligatorio.');
    if (!nombre.trim()) locales.push('El nombre de la intervención es obligatorio.');
    if (!proceso)       locales.push('Debes seleccionar un proceso.');
    if (locales.length > 0) { setErrors(locales); return; }

    const payload = {
      codigo:      String(codigo).trim().toUpperCase(),
      nombre:      nombre.trim(),
      proceso,
      activo:      Boolean(activo),
      descripcion: descripcion.trim() || undefined,
    };

    try {
      setSaving(true);
      await onSubmit?.(payload);
    } catch (err) {
      const backendErrors = err?.response?.data?.errors;
      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        const MENSAJES = {
          codigo:      'El código es obligatorio.',
          nombre:      'El nombre de la intervención es obligatorio.',
          proceso:     'Debes seleccionar un proceso.',
          activo:      'El estado es obligatorio.',
          descripcion: 'La descripción no es válida.',
        };
        setErrors(backendErrors.map(e => {
          const campo = e.path ?? e.param ?? e.field ?? '';
          return MENSAJES[campo] ?? e.msg ?? e.message ?? `Campo inválido: ${campo}`;
        }));
      } else {
        setErrors([err?.response?.data?.message || 'No se pudo guardar la intervención.']);
      }
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
      <form
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{title}</h3>
            <p className="modal-subtitle">Completa los datos de la intervención</p>
          </div>
          <button className="modal-close-btn" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">

          <label className="field">
            <span>Código *</span>
            <input
              value={codigo}
              onChange={(e) => { setCodigo(e.target.value.toUpperCase()); setErrors([]); }}
              placeholder="Ej: INT-001"
              autoFocus
            />
          </label>

          <label className="field">
            <span>Nombre *</span>
            <input
              value={nombre}
              onChange={(e) => { setNombre(e.target.value); setErrors([]); }}
              placeholder="Ej: Establecimiento"
            />
          </label>

          <label className="field">
            <span>Proceso *</span>
            <select value={proceso} onChange={(e) => { setProceso(e.target.value); setErrors([]); }}>
              <option value="">— Selecciona un proceso —</option>
              {procesos.map((p) => (
                <option key={p._id ?? p.id} value={p._id ?? p.id}>
                  {p.codigo} – {p.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Estado</span>
            <select
              value={activo ? 'true' : 'false'}
              onChange={(e) => setActivo(e.target.value === 'true')}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </label>

          <label className="field">
            <span>Descripción <span style={{ color: '#9ca3af', fontWeight: 400 }}>(opcional)</span></span>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción opcional"
              rows="4"
              style={{
                padding: '12px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                color: '#111827',
                background: '#fff',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </label>

        </div>

        <div className="modal-actions" style={{ flexDirection: 'column', gap: 10 }}>
          {errors.length > 0 && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 8, padding: '10px 14px',
              display: 'flex', alignItems: 'flex-start', gap: 8,
              width: '100%', boxSizing: 'border-box',
            }}>
              <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                {errors.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 13, color: '#dc2626', marginBottom: i < errors.length - 1 ? 4 : 0 }}>
                    <span style={{ flexShrink: 0 }}>•</span>
                    <span>{msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
            <button className="btn-modal-cancel" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn-modal-submit" type="submit" disabled={saving}>
              {saving ? 'Guardando…' : isEdit ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}