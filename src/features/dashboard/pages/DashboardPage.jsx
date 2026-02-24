import DashboardLayout from '../../../app/layouts/DashboardLayout';
import '../dashboard.css';
import StatCard from '../components/StatCard';
import QuickActions from '../components/QuickActions';
import ActivityList from '../components/ActivityList';
import { Users, Folder, CalendarDays, MapPin } from "lucide-react";


export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="dashboard-grid">
                <div className="stats-row">
                    <StatCard
                        title="Personal Activo"
                        value="148"
                        change="+12"
                        icon={Users}
                    />

                    <StatCard
                        title="Proyectos en Curso"
                        value="23"
                        change="+3"
                        icon={Folder}
                    />

                    <StatCard
                        title="Semanas Registradas"
                        value="47"
                        change="+1"
                        icon={CalendarDays}
                    />

                    <StatCard
                        title="Zonas Territoriales"
                        value="12"
                        icon={MapPin}
                    />
                </div>


                <div className="dashboard-columns">
                    <QuickActions />
                    <ActivityList />
                </div>
            </div>
        </DashboardLayout>
    );
}