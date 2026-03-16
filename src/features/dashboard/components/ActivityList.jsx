import { Play, Users, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ActivityList() {
  const navigate = useNavigate();

  return (
    <div className="card-box">
      <h3>Actividad Reciente</h3>

      <div
        className="activity-item"
        onClick={() => navigate("/programacion")}
        style={{ cursor: "pointer" }}
        title="Ver módulo de Programación"
      >
        <div className="activity-left">
          <div className="activity-icon">
            <Play size={16} />
          </div>
          <span>Registro diario completado</span>
        </div>
        <span>Hace 2 horas</span>
      </div>

      <div
        className="activity-item"
        onClick={() => navigate("/reportes")}
        style={{ cursor: "pointer" }}
        title="Ver módulo de Reportes"
      >
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