import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1';
const getToken = () => localStorage.getItem('efagram_token') ?? '';

const fetchJSON = async (url) => {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  const data = await res.json();
  return data.data ?? [];
};

// CORRECCIÓN: sincronizado con TIPOS_NOVEDAD de constants.js en el backend.
// Los valores 'ACCIDENTE' y 'FALTA' no existen en el enum → el backend los rechaza.
// Valores correctos: LLUVIA, INSUMOS, HERRAMIENTAS, PERMISO, AUSENCIA,
//                   INCAPACIDAD, ACCIDENTE_TRABAJO, SUSPENSION, VACACIONES, LICENCIA, OTRO
const TIPOS = [
  'PERMISO',
  'AUSENCIA',           // antes era 'FALTA'
  'INCAPACIDAD',
  'ACCIDENTE_TRABAJO',  // antes era 'ACCIDENTE'
  'LLUVIA',
  'INSUMOS',
  'HERRAMIENTAS',
  'SUSPENSION',
  'VACACIONES',
  'LICENCIA',
  'OTRO',
];

export default function NuevaNovedadModal({
  isOpen, title = 'Nueva Novedad', initialValues = {}, onClose, onSubmit,
}) {
  const [fecha, setFecha] = useState('');
  const [trabajador, setTrabajador] = useState('');
  const [tipo, setTipo] = useState('PERMISO');
  const [descripcion, setDescripcion] = useState('');
  const [dias, setDias] = useState('');
  const [afecta_nomina, setAfectaNomina] = useState(false);
  const [requiere_aprobacion, setRequiereAprobacion] = useState(false);
  const [estado, setEstado] = useState('PENDIENTE');

  const [trabajadores, setTrabajadores] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setFecha(initialValues?.fecha ? String(initialValues.fecha).slice(0, 10) : '');
    setTrabajador(initialValues?.trabajador?._id ?? initialValues?.trabajador ?? '');
    setTipo(initialValues?.tipo ?? 'PERMISO');
    setDescripcion(initialValues?.descripcion ?? '');
    setDias(String(initialValues?.dias ?? ''));
    setAfectaNomina(initialValues?.afecta_nomina ?? false);
    setRequiereAprobacion(initialValues?.requiere_aprobacion ?? false);
    setEstado(initialValues?.estado ?? 'PENDIENTE');
    setError(null);
    setSaving(false);

    setLoadingData(true);
    fetchJSON(`${BASE_URL}/personas`)
      .then((ts) => setTrabajadores(ts.filter((p) => p.estado === 'ACTIVO')))
      .catch((e) => console.error(e))
      .finally(() => setLoadingData(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const isEdit = title.toLowerCase().includes('editar');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!fecha) return setError('La fecha es obligatoria');
    if (!trabajador) return setError('El trabajador es obligatorio');
    if (!descripcion.trim()) return setError('La descripción es obligatoria');

    const payload = {
      fecha,
      trabajador,
      tipo,
      descripcion: descripcion.trim(),
      afecta_nomina,
      requiere_aprobacion,
      estado,
      ...(dias && { dias: Number(dias) }),
    };

    try {
      setSaving(true);
      await onSubmit?.(payload);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'No se pudo guardar');
      setSaving(false);
    }
  };

  const busy = saving || loadingData;

  return (
    <div className="nrm-backdrop">
      <div className="nrm-modal" role="dialog" aria-modal="true">

        <div className="nrm-header">
          <div>
            <h3 className="nrm-title">{title}</h3>
            <p className="nrm-subtitle">Completa los datos de la novedad</p>
          </div>
          <button className="nrm-close-btn" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="nrm-form" onSubmit={handleSubmit}>
          <div className="nrm-scroll-area">

            <div className="nrm-field">
              <label className="nrm-label">Fecha <span className="nrm-req">*</span></label>
              <input className="nrm-input" type="date" value={fecha}
                onChange={(e) => setFecha(e.target.value)} required autoFocus />
            </div>

            <div className="nrm-field">
              <label className="nrm-label">Trabajador <span className="nrm-req">*</span></label>
              <select className="nrm-select" value={trabajador}
                onChange={(e) => setTrabajador(e.target.value)} required disabled={loadingData}>
                <option value="">{loadingData ? 'Cargando...' : '-- Selecciona un trabajador --'}</option>
                {trabajadores.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.nombreCompleto ?? `${t.nombres ?? ''} ${t.apellidos ?? ''}`.trim()}
                  </option>
                ))}
              </select>
            </div>

            <div className="nrm-row">
              <div className="nrm-field">
                <label className="nrm-label">Tipo</label>
                {/* CORRECCIÓN: opciones sincronizadas con el enum del backend */}
                <select className="nrm-select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  {TIPOS.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="nrm-field">
                <label className="nrm-label">Días <span className="nrm-opt">(opcional)</span></label>
                <input className="nrm-input" type="number" min="0" step="0.5"
                  value={dias} onChange={(e) => setDias(e.target.value)} placeholder="Ej: 0.5" />
              </div>
            </div>

            <div className="nrm-field">
              <label className="nrm-label">Descripción <span className="nrm-req">*</span></label>
              <textarea className="nrm-textarea" value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe la novedad..." rows={3} />
            </div>

            <div className="nrm-field">
              <label className="nrm-label">Estado</label>
              <select className="nrm-select" value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="PENDIENTE">Pendiente</option>
                <option value="APROBADA">Aprobada</option>
                <option value="RECHAZADA">Rechazada</option>
              </select>
            </div>

            <div className="nrm-field">
              <label className="nrm-label">Opciones</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#374151', cursor: 'pointer' }}>
                  <input type="checkbox" checked={afecta_nomina}
                    onChange={(e) => setAfectaNomina(e.target.checked)} />
                  Afecta nómina
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#374151', cursor: 'pointer' }}>
                  <input type="checkbox" checked={requiere_aprobacion}
                    onChange={(e) => setRequiereAprobacion(e.target.checked)} />
                  Requiere aprobación
                </label>
              </div>
            </div>

            {error && <div className="nrm-error">{error}</div>}
          </div>

          <div className="nrm-footer">
            <button className="btn-modal-cancel" type="button" onClick={onClose}>Cancelar</button>
            <button className="btn-modal-submit" type="submit" disabled={busy}>
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear novedad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}