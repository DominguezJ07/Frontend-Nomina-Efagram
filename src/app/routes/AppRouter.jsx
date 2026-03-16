import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../../features/auth/pages/LoginPage';
import DashboardPage from '../../features/dashboard/pages/DashboardPage';
import PrivateRoute from './PrivateRoute';

// Ejecución
import NovedadesPage from '../../features/ejecucion/pages/NovedadesPage';
import CalendarioPage from '../../features/ejecucion/pages/CalendarioPage';
import SemanasOperativasPage from '../../features/ejecucion/pages/SemanasOperativasPage';

// Proyectos
import ProyectosPage from '../../features/proyectos/pages/ProyectosPage';
import ClientesPage from '../../features/proyectos/pages/ClientesPage';
import CatalogoActividadesPage from '../../features/proyectos/pages/CatalogoActividadesPage';
import CatalogoPersonalPage from "../../features/proyectos/pages/CatalogoPersonalPage";

// Configuración → Ubicación (antes Territorial)
import ZonasPage from '../../features/territorial/pages/ZonasPage';
import NucleosPage from '../../features/territorial/pages/NucleosPage';
import FincasPage from '../../features/territorial/pages/FincasPage';

import CatalogoIntervencionesPage from "../../features/proyectos/pages/CatalogoIntervencionesPage";
import CatalogoProcesosPage from "../../features/proyectos/pages/CatalogoProcesosPage";
import SubproyectosPage from "../../features/proyectos/pages/SubproyectosPage";

// Contratos (AHORA DENTRO DE PROYECTOS)
import ContratosPage from '../../features/contratos/pages/ContratosPage';

// Programación
import ProgramacionPage from '../../features/programacion/pages/ProgramacionPage';

// Reportes
import ReportesPage from '../../features/reportes/pages/ReportesPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />

      <Route path="/ejecucion/novedades" element={<PrivateRoute><NovedadesPage /></PrivateRoute>} />
      <Route path="/ejecucion/calendario" element={<PrivateRoute><CalendarioPage /></PrivateRoute>} />
      <Route path="/ejecucion/semanas-operativas" element={<PrivateRoute><SemanasOperativasPage /></PrivateRoute>} />

      {/* ─── PROYECTOS CON SUBMENÚ ─── */}
      <Route path="/proyectos" element={<PrivateRoute><ProyectosPage /></PrivateRoute>} />
      <Route path="/proyectos/subproyectos" element={<PrivateRoute><SubproyectosPage /></PrivateRoute>} />
      <Route path="/proyectos/contratos" element={<PrivateRoute><ContratosPage /></PrivateRoute>} />

      {/* ─── REPORTES ─── */}
      <Route path="/reportes" element={<PrivateRoute><ReportesPage /></PrivateRoute>} />

      {/* ─── PROGRAMACIÓN ─── */}
      <Route path="/programacion" element={<PrivateRoute><ProgramacionPage /></PrivateRoute>} />

      <Route path="/configuracion/catalogo-clientes" element={<PrivateRoute><ClientesPage /></PrivateRoute>} />
      <Route path="/configuracion/catalogo-actividades" element={<PrivateRoute><CatalogoActividadesPage /></PrivateRoute>} />
      <Route path="/configuracion/catalogo-intervenciones" element={<PrivateRoute><CatalogoIntervencionesPage /></PrivateRoute>} />
      <Route path="/configuracion/catalogo-personal" element={<PrivateRoute><CatalogoPersonalPage /></PrivateRoute>} />
      <Route path="/configuracion/catalogo-procesos" element={<PrivateRoute><CatalogoProcesosPage /></PrivateRoute>} />
      <Route path="/configuracion/ubicacion/zonas" element={<PrivateRoute><ZonasPage /></PrivateRoute>} />
      <Route path="/configuracion/ubicacion/nucleos" element={<PrivateRoute><NucleosPage /></PrivateRoute>} />
      <Route path="/configuracion/ubicacion/fincas" element={<PrivateRoute><FincasPage /></PrivateRoute>} />

      {/* ─── REDIRECCIONES PARA COMPATIBILIDAD ─── */}
      <Route path="/clientes" element={<Navigate to="/configuracion/catalogo-clientes" replace />} />
      <Route path="/catalogo-actividades" element={<Navigate to="/configuracion/catalogo-actividades" replace />} />
      <Route path="/territorial/zonas" element={<Navigate to="/configuracion/ubicacion/zonas" replace />} />
      <Route path="/territorial/nucleos" element={<Navigate to="/configuracion/ubicacion/nucleos" replace />} />
      <Route path="/territorial/fincas" element={<Navigate to="/configuracion/ubicacion/fincas" replace />} />
      <Route path="/contratos" element={<Navigate to="/proyectos/contratos" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}