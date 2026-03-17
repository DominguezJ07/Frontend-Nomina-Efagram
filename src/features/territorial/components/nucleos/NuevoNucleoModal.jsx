import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function NuevoNucleoModal({
  isOpen,
  title = 'Nuevo Núcleo',
  initialValues,
  zonas = [],
  onClose,
  onSubmit,
}) {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [zona, setZona]     = useState('');
  const [estado, setEstado] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setCodigo(initialValues?.codigo ?? '');
    setNombre(initialValues?.nombre ?? '');
    setZona(initialValues?.zona ?? initialValues?.zonaId ?? '');
    const estadoValue = initialValues?.activo ?? initialValues?.activa ?? initialValues?.estado;
    setEstado(typeof estadoValue === 'boolean' ? estadoValue : true);
    setError(null);
    setSaving(false);
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const isEdit = title.toLowerCase().includes('editar');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = {
      codigo: String(codigo).trim(),
      nombre: String(nombre).trim(),
      activo: Boolean(estado),
    };
    if (zona) payload.zona = zona;

    if (!payload.codigo || !payload.nombre) {
      setError('Código y nombre son obligatorios');
      return;
    }

    try {
      setSaving(true);
      await onSubmit?.(payload);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'No se pudo guardar');
      setSaving(false);
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
            <span>Código</span>
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: NC-001"
              autoFocus
            />
          </label>

          <label className="field">
            <span>Nombre</span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Núcleo Norte 1"
            />
          </label>

          {zonas.length > 0 && (
            <label className="field">
              <span>Zona</span>
              <select value={zona} onChange={(e) => setZona(e.target.value)}>
                <option value="">-- Sin zona --</option>
                {zonas.map((z) => {
                  const id = z?._id ?? z?.id;
                  return <option key={id} value={id}>{z?.nombre ?? id}</option>;
                })}
              </select>
            </label>
          )}

          <label className="field">
            <span>Estado</span>
            <select
              value={estado ? 'true' : 'false'}
              onChange={(e) => setEstado(e.target.value === 'true')}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </label>

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button className="btn-modal-cancel" type="button" onClick={onClose}>Cancelar</button>
            <button className="btn-modal-submit" type="submit" disabled={saving}>
              {saving ? 'Guardando…' : isEdit ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}