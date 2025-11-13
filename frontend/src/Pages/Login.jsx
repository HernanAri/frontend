import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/qr-reader');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111827]">
      <div className="bg-[#1F2937] p-8 rounded-lg shadow-2xl w-full max-w-md border border-[#374151]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#374151] rounded-full mb-4">
            <LogIn className="text-[#3B82F6]" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#F9FAFB]">Sistema de Asistencia</h1>
          <p className="text-[#9CA3AF] mt-2">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-[#D1D5DB] mb-2"
            >
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-[#111827] text-[#F9FAFB] border border-[#374151] rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
              placeholder="Ingresa tu usuario"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#D1D5DB] mb-2"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-[#111827] text-[#F9FAFB] border border-[#374151] rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-[#F87171]/10 text-[#F87171] rounded-lg border border-[#F87171]/40">
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-medium transition shadow-md ${
              isLoading
                ? 'bg-[#374151] cursor-not-allowed text-[#9CA3AF]'
                : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white'
            }`}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
