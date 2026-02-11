import { useState } from 'react';
import Input from '../../../shared/ui/Input';
import Button from '../../../shared/ui/Button';
import useLogin from '../hooks/useLogin';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { submit, loading, error } = useLogin();

  const onSubmit = (e) => {
    e.preventDefault();
    submit(email, password);
  };

  return (
    <div className="auth-card">
      <h2>Iniciar Sesión</h2>
      <p className="sub">
        Ingresa tus credenciales para acceder al sistema
      </p>

      <form onSubmit={onSubmit}>
        <Input
          label="Correo Electrónico"
          type="email"
          placeholder="correo@efagram.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p style={{ color: '#ef4444', fontSize: 13 }}>
            {error}
          </p>
        )}

        <Button
          type="submit"
          text={loading ? 'Ingresando…' : 'Ingresar'}
          disabled={loading}
        />
      </form>
    </div>
  );
}
