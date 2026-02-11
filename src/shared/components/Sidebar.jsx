import './sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">E</div>
        <div>
          <strong>EFAGRAM S.A.S</strong>
          <p>Sistema de Gestión</p>
        </div>
      </div>

      <nav className="sidebar-menu">
        <p className="menu-title">General</p>
        <div className="menu-item active">Dashboard</div>

        <p className="menu-title">Módulos</p>
        <div className="menu-item">Reportes</div>
        <div className="menu-item">Territorial</div>
        <div className="menu-item">Ejecución</div>
        <div className="menu-item">Proyectos</div>
        <div className="menu-item">Personal / Nómina</div>
        <div className="menu-item">Actividades</div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-avatar">J</div>
        <div>
          <strong>Julianavida1309</strong>
          <p>Administrador</p>
        </div>
      </div>
    </aside>
  );
}
