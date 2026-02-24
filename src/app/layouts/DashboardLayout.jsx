import Sidebar from '../../shared/components/Sidebar';
import Header from '../../shared/components/Header';

import './dashboard.css';

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Header />

        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
}