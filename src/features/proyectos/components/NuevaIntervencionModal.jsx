import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getProcesos } from '../services/procesosService';

// ─────────────────────────────────────────────────────────────────────────────
// Este componente NO usa useEffect para poblar el formulario.
// El padre debe pasarle una `key` dinámica para que React lo desmonte/monte
// al cambiar, reiniciando el estado del formulario automáticamente.
// El único useEffect que queda es para cargar el catálogo de procesos (fetch),
// que sí es un efecto legítimo y no llama setState de forma problemática.
// ─────────────────────────────────────────────────────────────────────────────

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
  // Estado inicializado directamente desde props — sin useEffect de formulario
  const [codigo,      setCodigo]      = useState(initialValues?.codigo      ?? '');
  const [nombre,      setNombre]      = useState(initialValues?.nombre      ?? '');
  const [proceso,     setProceso]     = useState(resolveProcesoId(initialValues?.proceso));
  const [activo,      setActivo]      = useState(resolveActivo(initialValues?.activo ?? initialValues?.estado));
  const [descripcion, setDescripcion] = useState(initialValues?.descripcion ?? '');
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState(null);

  // Este useEffect es legítimo: fetch de datos externos, no modifica estado del form
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
    setError(null);

    const payload = {
      codigo:      String(codigo).trim(),
      nombre:      String(nombre).trim(),
      proceso,
      activo:      Boolean(activo),
      descripcion: String(descripcion).trim(),
    };

    if (!payload.codigo || !payload.nombre || !payload.proceso) {
      setError('Código, nombre y proceso son obligatorios');
      return;
    }

    try {
      setSaving(true);
      await onSubmit?.(payload);
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo guardar');
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
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: INT-001"
              autoFocus
              required
            />
          </label>

          <label className="field">
            <span>Nombre *</span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Establecimiento"
              required
            />
          </label>

          <label className="field">
            <span>Proceso *</span>
            <select value={proceso} onChange={(e) => setProceso(e.target.value)} required>
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
            <span>Descripción</span>
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

          {error && <div className="form-error">{error}</div>}
        </div>

        <div className="modal-actions">
          <button className="btn-modal-cancel" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-modal-submit" type="submit" disabled={saving}>
            {saving ? 'Guardando…' : isEdit ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}