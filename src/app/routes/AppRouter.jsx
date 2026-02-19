import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../../features/auth/pages/LoginPage';
import DashboardPage from '../../features/dashboard/pages/DashboardPage';
import PrivateRoute from './PrivateRoute';
import ZonasPage from "../../features/territorial/pages/ZonasPage";
import ProyectosPage from "../../features/proyectos/pages/ProyectosPage";
import ClientesPage from "../../features/proyectos/pages/ClientesPage";
import CatalogoActividadesPage from "../../features/proyectos/pages/CatalogoActividadesPage";
import PreciosPage from "../../features/proyectos/pages/PreciosPage";

export default function AppRouter() {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas protegidas */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/territorial/zonas"
        element={
          <PrivateRoute>
            <ZonasPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/proyectos"
        element={
          <PrivateRoute>
            <ProyectosPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/clientes"
        element={
          <PrivateRoute>
            <ClientesPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/catalogo-actividades"
        element={
          <PrivateRoute>
            <CatalogoActividadesPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/precios"
        element={
          <PrivateRoute>
            <PreciosPage />
          </PrivateRoute>
        }
      />

      {/* Ruta wildcard al final */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}