import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, QrCode } from 'lucide-react';

const QRScanner = ({ onScan, isScanning }) => {
  const [error, setError] = useState(null);
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
        html5QrCodeRef.current = new Html5Qrcode("qr-reader-scanner");
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false
      };

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          console.log('✅ QR Escaneado:', decodedText);
          await onScan(decodedText);
          await stopScanner();
        },
        () => {
          // Ignorar errores menores de escaneo
        }
      );
    } catch (err) {
      console.error('❌ Error al iniciar escáner:', err);
      setError('Error al acceder a la cámara. Verifica los permisos.');
    }
  };

  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current?.isScanning) {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      }
    } catch (err) {
      console.warn('Scanner ya detenido');
    }
  };

  return (
    <div className="w-full">
      <div 
        id="qr-reader-scanner" 
        className={`w-full rounded-lg overflow-hidden ${
          isScanning ? 'border-2 border-[#3B82F6]' : 'bg-[#111827] border border-[#374151]'
        }`}
        style={{ minHeight: isScanning ? 'auto' : '300px' }}
      >
        {!isScanning && (
          <div className="flex flex-col items-center justify-center h-[300px] text-[#9CA3AF]">
            <QrCode size={64} className="mb-4" />
            <p className="text-center px-4">Escáner de Código QR</p>
            <p className="text-xs text-center px-4 mt-2 text-[#6B7280]">
              Presiona el botón para activar la cámara
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-[#F87171]/10 border border-[#F87171]/40 text-[#F87171] text-sm">
          {error}
        </div>
      )}

      <p className="text-center text-xs mt-3 text-[#9CA3AF]">
        {isScanning 
          ? '📷 Apunta la cámara al código QR' 
          : '💡 Asegúrate de permitir el acceso a la cámara'}
      </p>
    </div>
  );
};

export default QRScanner;