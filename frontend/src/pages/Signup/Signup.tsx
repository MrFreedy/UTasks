import './Signup.css';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/assets/logo.svg';
import api from '@/services/apiService';
import type { ApiResponse } from '@/components/layout/types';

function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrMsg('');
    setLoading(true);

    

    try {
      const res = await api.post<ApiResponse<{ id: string; username: string }>>(
          '/users',
          {
              username: username.trim(),
              password: password.trim()
          }
      );

      if (res?.success && res.data) {
          localStorage.setItem('username', res.data.username);
          localStorage.setItem('userId', res.data.id);
          navigate('/');
      } else {
          setErrMsg('Impossible de créer le compte. Veuillez réessayer.');
      }

    } catch (error: any) {
        if (error.response?.data?.error) {
            setErrMsg(error.response.data.error);
        } else {
            setErrMsg('Erreur serveur. Veuillez réessayer.');
        }
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl text-gray-900 font-bold mb-4 text-center">
            UTasks
          </h1>
          <img src={Logo} alt="Logo" className="mx-auto mb-4 w-32" />
          <h2 className="text-2xl text-gray-900 mb-4 text-center">
            Créer un compte
          </h2>

          <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              className="p-2 border rounded"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Mot de passe"
              className="p-2 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {errMsg && (
              <p className="text-red-600 text-sm" role="alert">
                {errMsg}
              </p>
            )}

            <button
              type="submit"
              className="login-button bg-blue-500 hover:bg-blue-600"
            >
                {loading ? 'Création...' : 'Créer un compte'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
