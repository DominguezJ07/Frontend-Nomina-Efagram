import { Plus, Play, BarChart3, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="card-box">
      <h3>Acciones Rápidas</h3>

      <div
        className="quick-item"
        onClick={() => navigate("/programacion")}
        style={{ cursor: "pointer" }}
      >
        <Play size={18} />
        <span>Nuevo Registro</span>
      </div>

      <div
        className="quick-item"
        onClick={() => navigate("/reportes")}
        style={{ cursor: "pointer" }}
      >
        <BarChart3 size={18} />
        <span>Ver Reportes</span>
      </div>

      <div
        className="quick-item"
        onClick={() => navigate("/configuracion/catalogo-personal")}
        style={{ cursor: "pointer" }}
      >
        <Users size={18} />
        <span>Gestionar Personal</span>
      </div>
    </div>
  );
}