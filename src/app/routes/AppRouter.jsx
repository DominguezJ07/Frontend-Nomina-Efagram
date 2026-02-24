import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../../features/auth/pages/LoginPage';
import DashboardPage from '../../features/dashboard/pages/DashboardPage';
import PrivateRoute from './PrivateRoute';
import ZonasPage   from '../../features/territorial/pages/ZonasPage';
import NucleosPage from '../../features/territorial/pages/NucleosPage';
import FincasPage  from '../../features/territorial/pages/FincasPage';
import RegistroDiarioPage    from '../../features/ejecucion/pages/RegistroDiarioPage';
import NovedadesPage         from '../../features/ejecucion/pages/NovedadesPage';
import CalendarioPage        from '../../features/ejecucion/pages/CalendarioPage';
import SemanasOperativasPage from '../../features/ejecucion/pages/SemanasOperativasPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/territorial/zonas"   element={<PrivateRoute><ZonasPage /></PrivateRoute>} />
      <Route path="/territorial/nucleos" element={<PrivateRoute><NucleosPage /></PrivateRoute>} />
      <Route path="/territorial/fincas"  element={<PrivateRoute><FincasPage /></PrivateRoute>} />
      <Route path="/ejecucion/registros-diarios"   element={<PrivateRoute><RegistroDiarioPage /></PrivateRoute>} />
      <Route path="/ejecucion/novedades"           element={<PrivateRoute><NovedadesPage /></PrivateRoute>} />
      <Route path="/ejecucion/calendario"          element={<PrivateRoute><CalendarioPage /></PrivateRoute>} />
      <Route path="/ejecucion/semanas-operativas" element={<PrivateRoute><SemanasOperativasPage /></PrivateRoute>} />      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}