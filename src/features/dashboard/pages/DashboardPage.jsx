import DashboardLayout from '../../../app/layouts/DashboardLayout';
import '../dashboard.css';
import StatCard from '../components/StatCard';
import QuickActions from '../components/QuickActions';
import ActivityList from '../components/ActivityList';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="dashboard-grid">

        {/* Estadísticas */}
        <div className="stats-row">
          <StatCard title="Personal Activo" value="148" change="+12" />
          <StatCard title="Proyectos en Curso" value="23" change="+3" />
          <StatCard title="Semanas Registradas" value="47" change="+1" />
          <StatCard title="Zonas Territoriales" value="12" change="" />
        </div>

        {/* Columnas inferiores */}
        <div className="dashboard-columns">
          <QuickActions />
          <ActivityList />
        </div>

      </div>
    </DashboardLayout>
  );
}
