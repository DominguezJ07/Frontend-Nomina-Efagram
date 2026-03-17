import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import httpClient from '../../../core/api/httpClient';

const CARGOS = ['Operario', 'Supervisor', 'Auxiliar', 'Capataz', 'Jefe de Campo'];
const TIPOS_CONTRATO = ['INDEFINIDO', 'FIJO', 'OBRA_LABOR', 'APRENDIZ', 'TEMPORAL'];

// axios envuelve en .data, el backend envuelve en { success, data: [...] }
const normalizeList = (axiosRes) => {
  const body = axiosRes?.data ?? axiosRes;          // desenvuelve axios
  if (Array.isArray(body))            return body;
  if (Array.isArray(body?.data))      return body.data;   // { success, data: [] }
  return [];
};

export default function NuevoPersonalModal({
  isOpen,
  title = 'Nuevo Personal',
  initialValues,
  onClose,
  onSubmit,
}) {
  // Datos personales
  const [numDoc,       setNumDoc]       = useState('');
  const [nombres,      setNombres]      = useState('');
  const [apellidos,    setApellidos]    = useState('');
  const [telefono,     setTelefono]     = useState('');
  const [email,        setEmail]        = useState('');

  // Datos laborales
  const [cargo,        setCargo]        = useState('');
  const [tipoContrato, setTipoContrato] = useState('OBRA_LABOR');
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [fincaId,      setFincaId]      = useState('');
  const [procesoId,    setProcesoId]    = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const [estado,       setEstado]       = useState('ACTIVO');

  // Listas para selects
  const [fincas,       setFincas]       = useState([]);
  const [procesos,     setProcesos]     = useState([]);
  const [supervisores, setSupervisores] = useState([]);

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

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
      // Supervisores: personas con cargo Supervisor
      const todasPersonas = normalizeList(sRes?.data ?? sRes);
      setSupervisores(todasPersonas.filter(
        (p) => p?.cargo?.toLowerCase().includes('supervisor') && p?.estado === 'ACTIVO'
      ));
    });
  }, [isOpen]);

  // Rellenar al editar
  useEffect(() => {
    if (!isOpen) return;

    setNumDoc(initialValues?.num_doc ?? '');
    setNombres(initialValues?.nombres ?? '');
    setApellidos(initialValues?.apellidos ?? '');
    setTelefono(initialValues?.telefono ?? '');
    setEmail(initialValues?.email ?? '');
    setCargo(initialValues?.cargo ?? '');
    setTipoContrato(initialValues?.tipo_contrato ?? 'OBRA_LABOR');
    setFechaIngreso(
      initialValues?.fecha_ingreso
        ? initialValues.fecha_ingreso.substring(0, 10)
        : ''
    );
    // finca puede ser objeto poblado o string id
    const f = initialValues?.finca;
    setFincaId(typeof f === 'string' ? f : (f?._id ?? f?.id ?? ''));
    const pr = initialValues?.proceso;
    setProcesoId(typeof pr === 'string' ? pr : (pr?._id ?? pr?.id ?? ''));
    const sup = initialValues?.supervisor;
    setSupervisorId(typeof sup === 'string' ? sup : (sup?._id ?? sup?.id ?? ''));
    setEstado(initialValues?.estado ?? 'ACTIVO');

    setError(null);
    setSaving(false);
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const isEdit = title.toLowerCase().includes('editar');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!numDoc.trim() || !nombres.trim() || !apellidos.trim() || !cargo) {
      setError('Documento, nombres, apellidos y cargo son obligatorios');
      return;
    }

    const payload = {
      tipo_doc:      'CC',
      num_doc:       numDoc.trim(),
      nombres:       nombres.trim(),
      apellidos:     apellidos.trim(),
      telefono:      telefono.trim() || undefined,
      email:         email.trim() || undefined,
      cargo,
      tipo_contrato: tipoContrato,
      fecha_ingreso: fechaIngreso || undefined,
      finca:         fincaId     || undefined,
      proceso:       procesoId   || undefined,
      supervisor:    supervisorId|| undefined,
      estado,
    };

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

          {/* Número de documento */}
          <label className="field">
            <span>Cédula *</span>
            <input
              value={numDoc}
              onChange={(e) => setNumDoc(e.target.value)}
              placeholder="Ej: 1061234567"
              autoFocus
            />
          </label>

          {/* Nombres y apellidos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label className="field">
              <span>Nombres *</span>
              <input value={nombres} onChange={(e) => setNombres(e.target.value)} placeholder="Ej: Juan Carlos" />
            </label>
            <label className="field">
              <span>Apellidos *</span>
              <input value={apellidos} onChange={(e) => setApellidos(e.target.value)} placeholder="Ej: Pérez Gómez" />
            </label>
          </div>

          {/* Teléfono y email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label className="field">
              <span>Teléfono</span>
              <input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ej: 3201234567" />
            </label>
            <label className="field">
              <span>Email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" type="email" />
            </label>
          </div>

          {/* Cargo y tipo contrato */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label className="field">
              <span>Cargo *</span>
              <select value={cargo} onChange={(e) => setCargo(e.target.value)}>
                <option value="">— Selecciona cargo —</option>
                {CARGOS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Tipo Contrato</span>
              <select value={tipoContrato} onChange={(e) => setTipoContrato(e.target.value)}>
                {TIPOS_CONTRATO.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
          </div>

          {/* Fecha ingreso y estado */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label className="field">
              <span>Fecha Ingreso</span>
              <input type="date" value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} />
            </label>
            <label className="field">
              <span>Estado</span>
              <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
                <option value="SUSPENDIDO">Suspendido</option>
              </select>
            </label>
          </div>

          {/* Finca */}
          <label className="field">
            <span>Finca</span>
            <select value={fincaId} onChange={(e) => setFincaId(e.target.value)}>
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
            <select value={procesoId} onChange={(e) => setProcesoId(e.target.value)}>
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
            <select value={supervisorId} onChange={(e) => setSupervisorId(e.target.value)}>
              <option value="">— Sin supervisor —</option>
              {supervisores.map((s) => (
                <option key={s._id ?? s.id} value={s._id ?? s.id}>
                  {s.nombres} {s.apellidos}
                </option>
              ))}
            </select>
          </label>

          {error && <div className="form-error">{error}</div>}

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
    </div>
  );
}