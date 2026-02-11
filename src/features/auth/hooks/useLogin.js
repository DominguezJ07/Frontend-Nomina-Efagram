import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/useAuth';


export default function useLogin() {
  const { login } = useAuth(); 
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      await login({ email, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Credenciales incorrectas'
      );
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}
