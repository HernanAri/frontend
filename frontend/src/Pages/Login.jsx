import { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { LogIn, QrCode, User, AlertCircle, Camera, CameraOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axios.config';

const Login = () => {
  const [loginMode, setLoginMode] = useState('form');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState(null);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Limpiar el escáner cuando el componente se desmonte
    return () => {
      stopQRScanner();
    };
  }, []);

  const handleFormLogin = async () => {
    if (!username || !password) {
      setError('Por favor ingresa usuario y contraseña');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Usar el login del contexto de autenticación
      const data = await login(username, password);
      
      // Redirigir según el rol del usuario usando window.location.href
      const rol = data.user.rol.toLowerCase();
      
      if (rol === 'admin') {
        window.location.href = '/admin';
      } else if (rol === 'gerente') {
        window.location.href = '/dashboard';
      } else if (rol === 'vigilante') {
        window.location.href = '/registro-vehiculo';
      } else {
        window.location.href = '/sesion-empleados';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales inválidas');
      setIsLoading(false);
    }
  };

  const startQRScanner = async () => {
    setIsScanning(true);
    setError('');

    try {
      const scanner = new Html5Qrcode("qr-reader-login");
      setHtml5QrCode(scanner);
      
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        async (decodedText) => {
          await handleQRLogin(decodedText);
          scanner.stop();
          setIsScanning(false);
        },
        () => {}
      );
    } catch (err) {
      setError('Error al iniciar cámara');
      setIsScanning(false);
    }
  };

  const stopQRScanner = async () => {
    if (html5QrCode && html5QrCode.isScanning) {
      try {
        await html5QrCode.stop();
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const handleQRLogin = async (token) => {
    setIsLoading(true);
    setError('');

    try {
      // Limpiar cualquier sesión previa
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      delete axiosInstance.defaults.headers.common['Authorization'];

      const response = await axiosInstance.post('/qrcode/login', { token });

      const data = response.data;

      // Guardar tokens y usuario
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;

      // Los empleados que usan QR siempre van a su sesión personal
      window.location.href = '/sesion-empleados';
    } catch (err) {
      setError('QR inválido o expirado');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111827] p-4">
      <div className="bg-[#1F2937] p-8 rounded-lg shadow-2xl w-full max-w-md border border-[#374151]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#374151] rounded-full mb-4">
            <LogIn className="text-[#3B82F6]" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#F9FAFB]">CLOKIFY</h1>
          <p className="text-[#9CA3AF] mt-2">Sistema de Asistencia</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setLoginMode('form');
              stopQRScanner();
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
              loginMode === 'form'
                ? 'bg-[#3B82F6] text-white'
                : 'bg-[#374151] text-[#9CA3AF]'
            }`}
          >
            <User size={18} />
            <span>Usuario</span>
          </button>
          <button
            onClick={() => {
              setLoginMode('qr');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
              loginMode === 'qr'
                ? 'bg-[#3B82F6] text-white'
                : 'bg-[#374151] text-[#9CA3AF]'
            }`}
          >
            <QrCode size={18} />
            <span>QR</span>
          </button>
        </div>

        {loginMode === 'form' && (
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleFormLogin();
                    }
                  }}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-[#111827] text-[#F9FAFB] border border-[#374151] rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none disabled:opacity-50"
                  placeholder="Ingresa tu usuario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleFormLogin();
                    }
                  }}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-[#111827] text-[#F9FAFB] border border-[#374151] rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none disabled:opacity-50"
                  placeholder="Ingresa tu contraseña"
                />
              </div>

              <button
                type="button"
                onClick={handleFormLogin}
                disabled={isLoading}
                className={`w-full py-3 rounded-lg font-medium transition shadow-md ${
                  isLoading
                    ? 'bg-[#374151] cursor-not-allowed text-[#9CA3AF]'
                    : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white'
                }`}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>
        )}

        {loginMode === 'qr' && (
          <div className="space-y-4">
            <div 
              id="qr-reader-login"
              className={`w-full rounded-lg overflow-hidden ${
                isScanning ? 'border-2 border-[#3B82F6]' : 'bg-[#111827] border border-[#374151]'
              }`}
              style={{ minHeight: isScanning ? 'auto' : '250px' }}
            >
              {!isScanning && (
                <div className="flex flex-col items-center justify-center h-64 text-[#9CA3AF]">
                  <QrCode size={64} className="mb-4" />
                  <p className="text-center">Escanea tu código QR personal</p>
                </div>
              )}
            </div>

            <button
              onClick={isScanning ? stopQRScanner : startQRScanner}
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium transition shadow-md flex items-center justify-center gap-2 ${
                isScanning
                  ? 'bg-[#F87171] hover:bg-[#dc2626] text-white'
                  : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isScanning ? (
                <>
                  <CameraOff size={20} />
                  <span>Detener</span>
                </>
              ) : (
                <>
                  <Camera size={20} />
                  <span>Escanear QR</span>
                </>
              )}
            </button>

            <p className="text-xs text-center text-[#9CA3AF]">
              Usa tu código QR personal para acceso rápido
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center space-x-2 p-3 bg-[#F87171]/10 text-[#F87171] rounded-lg border border-[#F87171]/40">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;