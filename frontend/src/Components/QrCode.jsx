import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import '../assets/styles/QrCode.css';

const QrCode = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const startScanner = () => {
    setIsScanning(true);
    setScanResult(null);
    setError(null);

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1,
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true,
    };

    scannerRef.current = new Html5QrcodeScanner('qr-reader', config, false);

    scannerRef.current.render(
      (decodedText) => {
        setScanResult(decodedText);
        stopScanner();
      },
      (err) => console.log('QR Scan Error:', err)
    );
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
        .then(() => setIsScanning(false))
        .catch((err) => {
          console.error('Error clearing scanner:', err);
          setError('No se pudo detener el escáner.');
          setIsScanning(false);
        });
    }
  };

  const resetState = () => {
    setScanResult(null);
    setError(null);
  };

  return (
    <section className="qr-container">
      <div className="qr-card">
        <h2 className="qr-title">
          <i className="bi bi-qr-code-scan"></i> Lector QR
        </h2>

        <div className={`qr-reader-container ${isScanning ? 'active' : ''}`}>
          {!isScanning && !scanResult && (
            <div className="qr-placeholder">
              <i className="bi bi-camera-video icon"></i>
              <p>Presiona "Iniciar" para escanear un código QR</p>
            </div>
          )}
          <div id="qr-reader" className="qr-box"></div>
        </div>

        {scanResult && (
          <div className="qr-message success">
            <i className="bi bi-check-circle-fill"></i>
            <div>
              <strong>QR Detectado:</strong>
              <div className="qr-content">{scanResult}</div>
            </div>
          </div>
        )}

        {error && (
          <div className="qr-message error">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        <div className="qr-actions">
          {!isScanning ? (
            <button className="btn primary" onClick={startScanner}>
              <i className="bi bi-play-fill"></i> Iniciar
            </button>
          ) : (
            <button className="btn danger" onClick={stopScanner}>
              <i className="bi bi-stop-fill"></i> Detener
            </button>
          )}

          {(scanResult || error) && (
            <button className="btn secondary" onClick={resetState}>
              <i className="bi bi-arrow-clockwise"></i> Limpiar
            </button>
          )}
        </div>

        <p className="qr-tip">
          <i className="bi bi-info-circle-fill"></i> Permite acceso a la cámara y apunta al código QR.
        </p>
      </div>
    </section>
  );
};

export default QrCode;
