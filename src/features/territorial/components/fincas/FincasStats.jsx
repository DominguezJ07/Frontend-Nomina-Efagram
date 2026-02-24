import { Trees, CheckCircle, XCircle, Ruler } from 'lucide-react';

export default function FincasStats({ fincas = [] }) {
  const total = fincas.length;

  const isActive = (f) => {
    const raw = f?.activa ?? f?.estado;
    if (typeof raw === 'boolean') return raw;
    if (typeof raw === 'string') {
      const v = raw.toLowerCase().trim();
      return v === 'activa' || v === 'activo' || v === 'active' || v === 'true' || v === '1';
    }
    if (typeof raw === 'number') return raw === 1;
    return false;
  };

  const activas   = fincas.filter((f) => isActive(f)).length;
  const inactivas = fincas.filter((f) => !isActive(f)).length;

  const areaTotal = fincas.reduce((acc, f) => {
    const val = parseFloat(f?.area ?? f?.areaTotal ?? f?.hectareas ?? 0);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <div className="territorial-stats fincas-stats-4">
      <div className="territorial-stat-card">
        <div className="territorial-stat-icon icon-green">
          <Trees size={16} />
        </div>
        <div className="territorial-stat-text">
          <p>Total Fincas</p>
          <h3>{total}</h3>
        </div>
      </div>

      <div className="territorial-stat-card">
        <div className="territorial-stat-icon icon-teal">
          <CheckCircle size={16} />
        </div>
        <div className="territorial-stat-text">
          <p>Activas</p>
          <h3>{activas}</h3>
        </div>
      </div>

      <div className="territorial-stat-card">
        <div className="territorial-stat-icon icon-red">
          <XCircle size={16} />
        </div>
        <div className="territorial-stat-text">
          <p>Inactivas</p>
          <h3>{inactivas}</h3>
        </div>
      </div>

      <div className="territorial-stat-card">
        <div className="territorial-stat-icon icon-blue">
          <Ruler size={16} />
        </div>
        <div className="territorial-stat-text">
          <p>Area Total</p>
          <h3>{areaTotal.toLocaleString('es-CO')} ha</h3>
        </div>
      </div>
    </div>
  );
}