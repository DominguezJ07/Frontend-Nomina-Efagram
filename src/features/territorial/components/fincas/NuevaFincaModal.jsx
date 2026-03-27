import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getNextFincaCode } from '../../services/fincas.service';

function resolveEstado(initialValues) {
  const raw = initialValues?.activa ?? initialValues?.estado;
  if (typeof raw === 'boolean') return raw;
  return true;
}

export default function NuevaFincaModal({
  isOpen,
  title = 'Nueva Finca',
  initialValues,
  nucleos = [],
  onClose,
  onSubmit,
}) {
  const isEdit = title.toLowerCase().includes('editar');

  const [codigo, setCodigo] = useState(initialValues?.codigo ?? '');
  const [nombre, setNombre] = useState(initialValues?.nombre ?? '');
  const [nucleo, setNucleo] = useState(initialValues?.nucleo ?? initialValues?.nucleoId ?? '');
  const [area, setArea] = useState(
    initialValues?.area ?? initialValues?.areaTotal ?? initialValues?.hectareas ?? ''
  );
  const [estado, setEstado] = useState(resolveEstado(initialValues));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    setCodigo(initialValues?.codigo ?? '');
    setNombre(initialValues?.nombre ?? '');
    setNucleo(initialValues?.nucleo ?? initialValues?.nucleoId ?? '');
    setArea(initialValues?.area ?? initialValues?.areaTotal ?? initialValues?.hectareas ?? '');
    setEstado(resolveEstado(initialValues));
    setSaving(false);
    setError(null);
  }, [isOpen, initialValues]);

  useEffect(() => {
    if (!isOpen) return;
    if (isEdit) return;

    if (!nucleo) {
      setCodigo('');
      return;
    }

    const loadNextCode = async () => {
      try {
        const res = await getNextFincaCode(nucleo);
        setCodigo(res?.data?.formatted ?? '');
      } catch (err) {
        console.error(err);
        setError('No se pudo calcular el código automático');
      }
    };

    loadNextCode();
  }, [isOpen, isEdit, nucleo]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = {
      nombre: String(nombre).trim(),
      activa: Boolean(estado),
    };

    if (nucleo) payload.nucleo = nucleo;
    if (area !== '') payload.area_total = parseFloat(area);
    if (isEdit) payload.codigo = String(codigo).trim();

    if (!payload.nombre || !payload.nucleo) {
      setError('Núcleo y nombre son obligatorios');
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
      <form
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{title}</h3>
            <p className="modal-subtitle">Completa los datos de la finca</p>
          </div>
          <button className="modal-close-btn" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <label className="field">
            <span>Código <span style={{ color: '#9ca3af', fontWeight: 400 }}>(automático)</span></span>
            <input
              value={codigo}
              readOnly
              placeholder={nucleo ? 'Auto' : 'Seleccione un núcleo'}
            />
          </label>

          <label className="field">
            <span>Nombre</span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: El Paraíso"
              autoFocus
            />
          </label>

          {nucleos.length > 0 && (
            <label className="field">
              <span>Núcleo</span>
              <select value={nucleo} onChange={(e) => setNucleo(e.target.value)}>
                <option value="">-- Seleccione un núcleo --</option>
                {nucleos.map((n) => {
                  const id = n?._id ?? n?.id;
                  return (
                    <option key={id} value={id}>
                      {n?.nombre ?? id}
                    </option>
                  );
                })}
              </select>
            </label>
          )}

          <label className="field">
            <span>Área (ha)</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Ej: 150.5"
            />
          </label>

          <label className="field">
            <span>Estado</span>
            <select
              value={estado ? 'true' : 'false'}
              onChange={(e) => setEstado(e.target.value === 'true')}
            >
              <option value="true">Activa</option>
              <option value="false">Inactiva</option>
            </select>
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