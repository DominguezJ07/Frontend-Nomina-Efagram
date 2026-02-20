import { ClipboardList, CheckCircle, Clock, Timer } from 'lucide-react';

export default function EjecucionStats({ registros = [] }) {
  const total     = registros.length;
  const aprobados = registros.filter((r) => (r?.estado ?? '').toLowerCase().includes('aprobad')).length;
  const pendientes = registros.filter((r) => (r?.estado ?? '').toLowerCase().includes('pendiente')).length;
  const totalHoras = registros.reduce((acc, r) => acc + (Number(r?.horas) || 0), 0);

  return (
    <div className="ejecucion-stats">
      <div className="ejecucion-stat-card">
        <div className="ejecucion-stat-icon icon-green">
          <ClipboardList size={16} />
        </div>
        <div className="ejecucion-stat-text">
          <p>Total Registros</p>
          <h3>{total}</h3>
        </div>
      </div>

      <div className="ejecucion-stat-card">
        <div className="ejecucion-stat-icon icon-teal">
          <CheckCircle size={16} />
        </div>
        <div className="ejecucion-stat-text">
          <p>Aprobados</p>
          <h3>{aprobados}</h3>
        </div>
      </div>

      <div className="ejecucion-stat-card">
        <div className="ejecucion-stat-icon icon-blue">
          <Clock size={16} />
        </div>
        <div className="ejecucion-stat-text">
          <p>Pendientes</p>
          <h3>{pendientes}</h3>
        </div>
      </div>

      <div className="ejecucion-stat-card">
        <div className="ejecucion-stat-icon icon-orange">
          <Timer size={16} />
        </div>
        <div className="ejecucion-stat-text">
          <p>Total Horas</p>
          <h3>{totalHoras}</h3>
        </div>
      </div>
    </div>
  );
}