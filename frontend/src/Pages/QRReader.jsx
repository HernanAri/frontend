import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import QRScanner from '../Components/qr/QRScanner';
import SessionStatus from '../Components/qr/SessionStatus';
import { qrAPI, sessionAPI } from '../api/endpoints';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const QRReader = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleScan = async (qrData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Verifica el token del QR
      const verification = await qrAPI.verifyToken(qrData);
      
      if (!verification || !verification.idusuario) {
        throw new Error('QR inválido');
      }

      // Verifica si hay una sesión activa
      const sessions = await sessionAPI.getUserSessions(verification.idusuario);
      const activeSession = sessions.find(s => s.estado === 'activa');

      if (activeSession) {
        // Finalizar sesión
        const result = await sessionAPI.endSession(qrData);
        setCurrentSession(result.sesion);
        setUserName(result.usuario.nombre);
        setMessage({
          type: 'success',
          text: `Sesión finalizada. Trabajaste ${result.duracion.formato}`
        });
      } else {
        // Iniciar sesión
        const result = await sessionAPI.startSession(qrData);
        setCurrentSession(result.sesion);
        setUserName(result.usuario.nombre);
        setMessage({
          type: 'success',
          text: 'Sesión iniciada correctamente'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Error al procesar el QR'
      });
    } finally {
      setIsLoading(false);
      setIsScanning(false);
    }
  };

  const toggleScanner = () => {
    setIsScanning(!isScanning);
    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Registro de Asistencia
            </h1>
            <p className="text-gray-600">
              Escanea tu código QR para registrar entrada o salida
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Scanner */}
            <div>
              <QRScanner onScan={handleScan} isScanning={isScanning} />
              
              <button
                onClick={toggleScanner}
                disabled={isLoading}
                className={`w-full mt-4 py-3 rounded-lg font-medium transition ${
                  isScanning
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } disabled:bg-gray-400 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <RefreshCw className="animate-spin mr-2" size={20} />
                    Procesando...
                  </span>
                ) : isScanning ? (
                  'Detener Escáner'
                ) : (
                  'Escanear QR'
                )}
              </button>
            </div>

            {/* Status */}
            <div>
              {message && (
                <div className={`mb-4 p-4 rounded-lg flex items-start space-x-3 ${
                  message.type === 'success' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle size={24} className="flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={24} className="flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">
                      {message.type === 'success' ? '¡Éxito!' : 'Error'}
                    </p>
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              )}

              <SessionStatus session={currentSession} userName={userName} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRReader;