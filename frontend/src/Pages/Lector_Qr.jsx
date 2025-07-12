import React from 'react';
import QrCode from '../Components/QrCode';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

function LectorQR() {
  const handleScan = (data) => {
    console.log('QR escaneado:', data);
    alert(`Código QR: ${data}`);
  };

  return (
    <div>
      <Navbar />
      <QrCode onScanSuccess={handleScan} />
      <Footer />
    </div>
  );
}

export default LectorQR;
