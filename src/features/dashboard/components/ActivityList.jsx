import { Play, Users, CalendarDays, Folder, MapPin } from "lucide-react";

export default function ActivityList() {
  return (
    <div className="card-box">
      <h3>Actividad Reciente</h3>

      <div className="activity-item">
        <div className="activity-left">
          <div className="activity-icon">
            <Play size={16} />
          </div>
          <span>Registro diario completado</span>
        </div>
        <span>Hace 2 horas</span>
      </div>

      <div className="activity-item">
        <div className="activity-left">
          <div className="activity-icon">
            <Users size={16} />
          </div>
          <span>Nueva cuadrilla asignada</span>
        </div>
        <span>Hace 3 horas</span>
      </div>

      <div className="activity-item">
        <div className="activity-left">
          <div className="activity-icon">
            <CalendarDays size={16} />
          </div>
          <span>Reporte semanal generado</span>
        </div>
        <span>Hace 5 horas</span>
      </div>
    </div>
  );
}
