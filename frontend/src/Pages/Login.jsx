import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { LogIn, QrCode, User, AlertCircle, Camera, CameraOff } from 'lucide-react';

const Login = () => {
  const [loginMode, setLoginMode] = useState('form');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    return () => {
      stopQRScanner();
    };
  }, []);

  useEffect(() => {
    if (loginMode === 'qr' && isScanning) {
      startQRScanner();
    } else if (loginMode !== 'qr') {
      stopQRScanner();
    }
  }, [loginMode, isScanning]);

  const handleFormLogin = async () => {
    if (!username || !password) {
      setError('Por favor ingresa usuario y contraseña');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/autenticador/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) throw new Error('Credenciales inválidas');

      const data = await response.json();
      
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      const rol = data.user.rol.toLowerCase();
      redirectByRole(rol);

    } catch (err) {
      setError(err.message || 'Credenciales inválidas');
      setIsLoading(false);
    }
  };

  const startQRScanner = async () => {
    setError('');

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("qr-reader-login");
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          await handleQRLogin(decodedText);
        },
        () => {}
      );

    } catch (err) {
      console.error(err);
      setError('Error al iniciar la cámara. Verifica los permisos.');
      setIsScanning(false);
    }
  };

  const stopQRScanner = async () => {
    if (html5QrCodeRef.current?.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Scanner ya detenido');
      }
    }
  };

  const handleQRLogin = async (token) => {
    setIsLoading(true);
    setError('');

    try {
      const loginResponse = await fetch('http://localhost:3000/qrcode/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      if (!loginResponse.ok) throw new Error('QR inválido o expirado');

      const loginData = await loginResponse.json();
      
      localStorage.setItem('access_token', loginData.access_token);
      localStorage.setItem('user', JSON.stringify(loginData.user));

      if (loginData.user.rol.toLowerCase() === 'usuario') {
        try {
          await fetch(`http://localhost:3000/registro/entrada/${loginData.user.idusuario}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${loginData.access_token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (sessionErr) {
          console.error('Error al iniciar sesión automática:', sessionErr);
        }
      }

      const rol = loginData.user.rol.toLowerCase();
      redirectByRole(rol);

    } catch (err) {
      setError(err.message || 'Error al procesar el QR');
      setIsLoading(false);
      setIsScanning(false);
    }
  };

  const redirectByRole = (rol) => {
    if (rol === 'admin') window.location.href = '/admin';
    else if (rol === 'gerente') window.location.href = '/dashboard';
    else if (rol === 'vigilante') window.location.href = '/registro-vehiculo';
    else window.location.href = '/sesion-empleados';
  };

  const toggleScanner = () => {
    setIsScanning(!isScanning);
    setError('');
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
              setError('');
              stopQRScanner();
            }}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
              loginMode === 'form' ? 'bg-[#3B82F6] text-white' : 'bg-[#374151] text-[#9CA3AF]'
            }`}
          >
            <User size={18} />
            Usuario
          </button>

          <button
            onClick={() => {
              setLoginMode('qr');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
              loginMode === 'qr' ? 'bg-[#3B82F6] text-white' : 'bg-[#374151] text-[#9CA3AF]'
            }`}
          >
            <QrCode size={18} />
            QR
          </button>
        </div>

        {loginMode === 'form' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#D1D5DB] mb-2">Usuario</label>
              <input
                type="text"
                value={username}
                disabled={isLoading}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFormLogin()}
                className="w-full px-4 py-2 bg-[#111827] text-[#F9FAFB] border border-[#374151] rounded-lg focus:ring-2 focus:ring-[#3B82F6]"
                placeholder="Ingresa tu usuario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#D1D5DB] mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                disabled={isLoading}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFormLogin()}
                className="w-full px-4 py-2 bg-[#111827] text-[#F9FAFB] border border-[#374151] rounded-lg focus:ring-2 focus:ring-[#3B82F6]"
                placeholder="Ingresa tu contraseña"
              />
            </div>

            <button
              onClick={handleFormLogin}
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium transition ${
                isLoading
                  ? 'bg-[#374151] text-[#9CA3AF] cursor-not-allowed'
                  : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white'
              }`}
            >
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </div>
        )}

        {loginMode === 'qr' && (
          <div className="space-y-4">
            <div
              id="qr-reader-login"
              className={`w-full rounded-lg overflow-hidden mx-auto ${
                isScanning ? 'border-2 border-[#3B82F6]' : 'bg-[#111827] border border-[#374151]'
              }`}
              style={{ 
                minHeight: isScanning ? 'auto' : '300px',
                maxWidth: '300px'
              }}
            >
              {!isScanning && (
                <div className="flex flex-col items-center justify-center h-[300px] text-[#9CA3AF]">
                  <QrCode size={64} className="mb-4" />
                  <p className="text-center px-4">Escanea tu código QR personal</p>
                  <p className="text-xs text-center px-4 mt-2">
                    Los empleados iniciarán su jornada automáticamente
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={toggleScanner}
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition ${
                isScanning
                  ? 'bg-[#F87171] hover:bg-[#dc2626] text-white'
                  : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <Camera className="animate-pulse" size={20} />
                  <span>Procesando...</span>
                </>
              ) : isScanning ? (
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