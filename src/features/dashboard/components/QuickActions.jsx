import { Plus, Play, BarChart3, Users } from "lucide-react";

export default function QuickActions() {
  return (
    <div className="card-box">
      <h3>Acciones Rápidas</h3>

      <div className="quick-item">
        <Plus size={18} />
        <span>Agregar Actividad</span>
      </div>

      <div className="quick-item">
        <Play size={18} />
        <span>Nuevo Registro</span>
      </div>

      <div className="quick-item">
        <BarChart3 size={18} />
        <span>Ver Reportes</span>
      </div>

      <div className="quick-item">
        <Users size={18} />
        <span>Gestionar Personal</span>
      </div>
    </div>
  );
}
