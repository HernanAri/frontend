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
    <div className="w-full max-w-md mx-auto" style={{ backgroundColor: '#111827' }}>
      <div 
        className="rounded-lg shadow-lg p-6" 
        style={{ backgroundColor: '#1F2937' }}
      >
        <div className="flex items-center justify-center mb-4">
          {isScanning ? (
            <Camera className="text-[#34D399]" size={32} />
          ) : (
            <CameraOff className="text-[#9CA3AF]" size={32} />
          )}
        </div>
        
        <div 
          id="qr-reader" 
          className="w-full"
          style={{ 
            border: '2px solid #374151', 
            borderRadius: '8px',
            backgroundColor: '#1F2937'
          }}
        ></div>

        {error && (
          <div 
            className="mt-4 p-3 rounded" 
            style={{ backgroundColor: '#F87171', color: '#F9FAFB' }}
          >
            {error}
          </div>
        )}

        <p 
          className="text-center text-sm mt-4" 
          style={{ color: '#9CA3AF' }}
        >
          {isScanning 
            ? 'Apunta la cámara al código QR' 
            : 'Presiona "Escanear" para iniciar'}
        </p>
      </div>
    </div>
  );
};

export default QRScanner;
