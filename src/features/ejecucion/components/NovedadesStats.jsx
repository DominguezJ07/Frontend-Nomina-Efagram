import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function NovedadesStats({ novedades = [] }) {
  const total      = novedades.length;
  const pendientes = novedades.filter((n) => n?.estado === 'PENDIENTE').length;
  const aprobadas  = novedades.filter((n) => n?.estado === 'APROBADA').length;

  return (
    <div className="ejecucion-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
      <div className="ejecucion-stat-card">
        <div className="ejecucion-stat-icon icon-orange">
          <AlertTriangle size={16} />
        </div>
        <div className="ejecucion-stat-text">
          <p>Total Novedades</p>
          <h3>{total}</h3>
        </div>
      </div>

      <div className="ejecucion-stat-card">
        <div className="ejecucion-stat-icon icon-orange">
          <Clock size={16} />
        </div>
        <div className="ejecucion-stat-text">
          <p>Pendientes</p>
          <h3>{pendientes}</h3>
        </div>
      </div>

      <div className="ejecucion-stat-card">
        <div className="ejecucion-stat-icon icon-teal">
          <CheckCircle size={16} />
        </div>
        <div className="ejecucion-stat-text">
          <p>Aprobadas</p>
          <h3>{aprobadas}</h3>
        </div>
      </div>
    </div>
  );
}