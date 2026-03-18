import { Briefcase, CheckCircle, XCircle } from 'lucide-react';

export default function CargosStats({ cargos = [] }) {
  const total    = cargos.length;
  const activos  = cargos.filter((c) => c?.activo !== false).length;
  const inactivos = total - activos;

  return (
    <div className="territorial-stats">

      <div className="territorial-stat-card">
        <div className="territorial-stat-icon icon-green">
          <Briefcase size={16} />
        </div>
        <div className="territorial-stat-text">
          <p>Total Cargos</p>
          <h3>{total}</h3>
        </div>
      </div>

      <div className="territorial-stat-card">
        <div className="territorial-stat-icon icon-blue">
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