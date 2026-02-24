import { Layers, CheckCircle, XCircle } from 'lucide-react';

export default function NucleosStats({ nucleos = [] }) {
  const total = nucleos.length;

  const isActive = (n) => {
    const raw = n?.activo ?? n?.activa ?? n?.estado;
    if (typeof raw === 'boolean') return raw;
    if (typeof raw === 'string') {
      const v = raw.toLowerCase().trim();
      return v === 'activo' || v === 'activa' || v === 'active' || v === 'true' || v === '1';
    }
    if (typeof raw === 'number') return raw === 1;
    return false;
  };

  const activos   = nucleos.filter((n) => isActive(n)).length;
  const inactivos = nucleos.filter((n) => !isActive(n)).length;

  return (
    <div className="territorial-stats">
      <div className="territorial-stat-card">
        <div className="territorial-stat-icon icon-blue">
          <Layers size={16} />
        </div>
        <div className="territorial-stat-text">
          <p>Total Núcleos</p>
          <h3>{total}</h3>
        </div>
      </div>

      <div className="territorial-stat-card">
        <div className="territorial-stat-icon icon-green">
          <CheckCircle size={16} />
        </div>
        <div className="territorial-stat-text">
          <p>Activos</p>
          <h3>{activos}</h3>
        </div>
      </div>

      <div className="territorial-stat-card">
        <div className="territorial-stat-icon icon-red">
          <XCircle size={16} />
        </div>
        <div className="territorial-stat-text">
          <p>Inactivos</p>
          <h3>{inactivos}</h3>
        </div>
      </div>
    </div>
  );
}