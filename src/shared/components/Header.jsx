import './header.css';
import { useAuth } from "../../app/providers/useAuth";


export default function Header() {
  const { user } = useAuth();

  return (
    <header className="dashboard-header">
      <h2>Dashboard</h2>
      <div>
        Bienvenido(a), <strong>{user?.username || 'Usuario'}</strong>
      </div>
    </header>
  );
}
