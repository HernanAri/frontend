import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff } from 'lucide-react';

const QRScanner = ({ onScan, isScanning }) => {
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    if (isScanning) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isScanning]);

  const startScanner = async () => {
    try {
      setError(null);
      
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("qr-reader");
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
        },
        (errorMessage) => {
          // Ignorar errores de escaneo continuo
        }
      );
    } catch (err) {
      setError('Error al iniciar la cámara. Asegúrate de dar permisos.');
      console.error('Error starting scanner:', err);
    }
  };

  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current?.isScanning) {
        await html5QrCodeRef.current.stop();
      }
    } catch (err) {
      console.error('Error stopping scanner:', err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center mb-4">
          {isScanning ? (
            <Camera className="text-green-600" size={32} />
          ) : (
            <CameraOff className="text-gray-400" size={32} />
          )}
        </div>
        
        <div 
          id="qr-reader" 
          className="w-full"
          style={{ border: '2px solid #4F46E5', borderRadius: '8px' }}
        ></div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <p className="text-center text-gray-600 text-sm mt-4">
          {isScanning 
            ? 'Apunta la cámara al código QR' 
            : 'Presiona "Escanear" para iniciar'}
        </p>
      </div>
    </div>
  );
};

export default QRScanner;