export default function ActivityList() {
  return (
    <div className="card-box">
      <h3>Actividad Reciente</h3>

      <div className="activity-item">
        <span>Registro diario completado</span>
        <span>Hace 2 horas</span>
      </div>

      <div className="activity-item">
        <span>Nueva cuadrilla asignada</span>
        <span>Hace 3 horas</span>
      </div>

      <div className="activity-item">
        <span>Reporte semanal generado</span>
        <span>Hace 5 horas</span>
      </div>

      <div className="activity-item">
        <span>Actividad catálogo actualizada</span>
        <span>Hace 1 día</span>
      </div>

      <div className="activity-item">
        <span>Nuevo lote registrado</span>
        <span>Hace 1 día</span>
      </div>
    </div>
  );
}
