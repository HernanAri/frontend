import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import QRScanner from '../Components/qr/QRScanner';
import SessionStatus from '../Components/qr/SessionStatus';
import { qrAPI, sessionAPI } from '../api/endpoints';
import { CheckCircle, XCircle, RefreshCw, Upload } from 'lucide-react';
import QrScanner from 'qr-scanner';

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
      const verification = await qrAPI.verifyToken(qrData);
      if (!verification || !verification.idusuario) throw new Error('QR inválido');

      const sessions = await sessionAPI.getUserSessions(verification.idusuario);
      const activeSession = sessions.find((s) => s.estado === 'activa');

      if (activeSession) {
        const result = await sessionAPI.endSession(qrData);
        setCurrentSession(result.sesion);
        setUserName(result.usuario.nombre);
        setMessage({
          type: 'success',
          text: `Sesión finalizada. Trabajaste ${result.duracion.formato}`,
        });
      } else {
        const result = await sessionAPI.startSession(qrData);
        setCurrentSession(result.sesion);
        setUserName(result.usuario.nombre);
        setMessage({
          type: 'success',
          text: 'Sesión iniciada correctamente',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Error al procesar el QR',
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

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const qrResult = await QrScanner.scanImage(file);
      await handleScan(qrResult);
    } catch (err) {
      setMessage({ type: 'error', text: 'No se pudo leer el QR de la imagen.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] text-[#F9FAFB]">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2 text-[#F9FAFB]">Registro de Asistencia</h1>
            <p className="text-[#9CA3AF]">
              Escanea tu código QR para registrar entrada o salida o súbelo manualmente
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* === SCANNER PANEL === */}
            <div className="bg-[#1F2937] border border-[#374151] rounded-xl p-6 shadow-lg">
              <div className="relative">
                <QRScanner onScan={handleScan} isScanning={isScanning} />

                {/* Animación de carga elegante */}
                {isLoading && (
                  <div className="absolute inset-0 bg-[#111827]/80 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm transition">
                    <RefreshCw className="animate-spin text-[#3B82F6] mb-3" size={36} />
                    <p className="text-[#D1D5DB] font-medium">Procesando QR...</p>
                  </div>
                )}
              </div>

              <button
                onClick={toggleScanner}
                disabled={isLoading}
                className={`w-full mt-5 py-3 rounded-lg font-medium transition shadow-md ${
                  isScanning
                    ? 'bg-[#F87171] hover:bg-[#dc2626]'
                    : 'bg-[#3B82F6] hover:bg-[#2563EB]'
                } text-white disabled:bg-[#374151] disabled:text-[#9CA3AF] disabled:cursor-not-allowed`}
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

              {/* Subir imagen */}
              <div className="mt-6 text-center">
                <label className="block mb-2 text-[#D1D5DB] font-medium">
                  O subir imagen con QR:
                </label>
                <div className="flex items-center justify-center">
                  <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-[#374151] hover:bg-[#4B5563] text-[#F9FAFB] rounded-lg transition">
                    <Upload size={18} />
                    <span>Seleccionar imagen</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* === STATUS PANEL === */}
            <div className="bg-[#1F2937] border border-[#374151] rounded-xl p-6 shadow-lg">
              {message && (
                <div
                  className={`mb-6 p-4 rounded-lg flex items-start space-x-3 border ${
                    message.type === 'success'
                      ? 'bg-[#34D399]/10 border-[#34D399]/40 text-[#34D399]'
                      : 'bg-[#F87171]/10 border-[#F87171]/40 text-[#F87171]'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle size={24} className="flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={24} className="flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold">
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
