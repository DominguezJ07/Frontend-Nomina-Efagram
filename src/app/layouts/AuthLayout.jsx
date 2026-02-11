import '../../assets/styles/auth.css';

export default function AuthLayout({ left, right }) {
  return (
    <div className="auth-layout">
      <aside className="auth-left">{left}</aside>
      <main className="auth-right">{right}</main>
    </div>
  );
}
