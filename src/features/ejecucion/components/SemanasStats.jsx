import { Clock, CheckCircle, TrendingUp, Timer } from 'lucide-react';

export default function SemanasStats({ semanas = [] }) {
  // CORRECCIÓN: el backend usa estado 'ABIERTA', no 'ACTIVA'
  const actual      = semanas.find((s) => s?.estado === 'ABIERTA');
  const cerradas    = semanas.filter((s) => s?.estado === 'CERRADA').length;
  const totalReg    = semanas.reduce((acc, s) => acc + (Number(s?.registros) || 0), 0);
  const cumplimientos = semanas
    .filter((s) => s?.cumplimiento != null)
    .map((s) => Number(s.cumplimiento));
  const promCumplimiento = cumplimientos.length
    ? Math.round(cumplimientos.reduce((a, b) => a + b, 0) / cumplimientos.length)
    : 0;

  return (
    <div className="ejecucion-stats">
      <div className="ejecucion-stat-card">
        <div className="ejecucion-stat-icon icon-teal">
          <Clock size={16} />
        </div>
        <div className="ejecucion-stat-text">
          <p>Semana Actual</p>
          <h3 style={{ fontSize: 18 }}>{actual?.codigo ?? actual?.semana ?? '-'}</h3>
        </div>
      </div>

      <div className="ejecucion-stat-card">
        <div className="ejecucion-stat-icon icon-green">
          <CheckCircle size={16} />
        </div>
        <div className="ejecucion-stat-text">
          <p>Cerradas</p>
          <h3>{cerradas}</h3>
        </div>
      </div>

      <div className="ejecucion-stat-card">
        <div className="ejecucion-stat-icon icon-blue">
          <TrendingUp size={16} />
        </div>
        <div className="ejecucion-stat-text">
          <p>Cumplimiento Prom.</p>
          <h3>{promCumplimiento}%</h3>
        </div>
      </div>

      <div className="ejecucion-stat-card">
        <div className="ejecucion-stat-icon icon-orange">
          <Timer size={16} />
        </div>
        <div className="ejecucion-stat-text">
          <p>Total Registros</p>
          <h3>{totalReg}</h3>
        </div>
      </div>
    </div>
  );
}