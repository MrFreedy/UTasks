import './Login.css';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/assets/logo.svg';
import api from '@/services/apiService';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrMsg('');
    setLoading(true);

    // localStorage.setItem('username', "mrfreedy");
    // localStorage.setItem('userId', "68bb1b4f4f7f28ba2c16cc94");
    // setLoading(false);
    // navigate('/');

    try {
      setLoading(true);

      const res = await api.login(username.trim(), password.trim());
      
      if (res.status === 200) {
        const user = res.data.user;

        localStorage.setItem('username', user.username);
        localStorage.setItem('userId', user.id);

        navigate('/');
      }

      } catch (error: any) {

          if (error.response) {
              switch (error.response.status) {
                  case 404:
                      setErrMsg("Utilisateur introuvable.");
                      break;
                  case 400:
                      setErrMsg("Mot de passe incorrect.");
                      break;
                  default:
                      setErrMsg("Erreur serveur. Veuillez réessayer.");
              }
          } else {
              setErrMsg("Erreur réseau. Serveur injoignable.");
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
            Connexion
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
                {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          <div className="flex justify-center mt-4">
            <a href="/signup" className="text-sm text-gray-600 hover:underline text-center">
              Pas de compte ? Créez-en un
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;