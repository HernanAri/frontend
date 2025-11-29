import { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Car, QrCode, Camera, CameraOff, CheckCircle, XCircle, Truck } from 'lucide-react';
import Navbar from '../components/common/Navbar';

const VehiculoRegistro = () => {
  const [user, setUser] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState(null);
  const [message, setMessage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({
    tipoVehiculo: 'Carro',
    matricula: '',
    marca: '',
    modelo: '',
    color: '',
    observaciones: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const currentUser = JSON.parse(window.localStorage.getItem('user') || '{}');
    setUser(currentUser);
    
    return () => {
      stopQRScanner();
    };
  }, []);

  const startQRScanner = async () => {
    setIsScanning(true);
    setMessage(null);

    try {
      const scanner = new Html5Qrcode("qr-reader-vehicle");
      setHtml5QrCode(scanner);
      
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        async (decodedText) => {
          await handleQRScan(decodedText);
          scanner.stop();
          setIsScanning(false);
        },
        () => {}
      );
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al iniciar cámara' });
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

  const handleQRScan = async (token) => {
    setIsLoading(true);
    try {
      const authToken = window.localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/qrcode/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) throw new Error('QR inválido');

      const data = await response.json();
      
      const userResponse = await fetch(`http://localhost:3000/usuario/${data.idusuario}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (userResponse.ok) {
        const fullUserData = await userResponse.json();
        setUserData(fullUserData);
        setVehicleForm(prev => ({
          ...prev,
          tipoVehiculo: fullUserData.vehiculo || 'Carro',
          matricula: fullUserData.matricula || ''
        }));
        setMessage({ type: 'success', text: `Usuario encontrado: ${fullUserData.nombre}` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al verificar QR' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setVehicleForm({
      ...vehicleForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (!userData) {
      setMessage({ type: 'error', text: 'Debes escanear un QR primero' });
      return;
    }

    if (!vehicleForm.matricula) {
      setMessage({ type: 'error', text: 'La matrícula es obligatoria' });
      return;
    }

    setIsLoading(true);
    try {
      const token = window.localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/vehiculos/ingreso', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          idusuario: userData.idusuario,
          nombrePropietario: userData.nombre,
          documentoPropietario: userData.documento.toString(),
          tipoVehiculo: vehicleForm.tipoVehiculo,
          matricula: vehicleForm.matricula,
          marca: vehicleForm.marca,
          modelo: vehicleForm.modelo,
          color: vehicleForm.color,
          registradoPor: user.username,
          observaciones: vehicleForm.observaciones
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar vehículo');
      }

      setMessage({ type: 'success', text: 'Vehículo registrado exitosamente' });
      resetForm();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUserData(null);
    setVehicleForm({
      tipoVehiculo: 'Carro',
      matricula: '',
      marca: '',
      modelo: '',
      color: '',
      observaciones: ''
    });
  };

  return (
    <div className="min-h-screen bg-[#111827] text-[#F9FAFB]">
        <Navbar />
      <nav className="bg-[#1F2937] border-b border-[#374151] shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Car className="text-[#3B82F6]" size={32} />
            <h1 className="text-xl font-bold">Registro de Vehículos</h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
              message.type === 'success'
                ? 'bg-[#34D399]/10 border border-[#34D399]/40 text-[#34D399]'
                : 'bg-[#F87171]/10 border border-[#F87171]/40 text-[#F87171]'
            }`}>
              {message.type === 'success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
              <span>{message.text}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#1F2937] rounded-xl shadow-xl border border-[#374151] p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <QrCode size={24} className="text-[#3B82F6]" />
                Escanear QR del Usuario
              </h2>

              <div
                id="qr-reader-vehicle"
                className={`w-full rounded-lg overflow-hidden mb-4 ${
                  isScanning ? 'border-2 border-[#3B82F6]' : 'bg-[#111827] border border-[#374151]'
                }`}
                style={{ minHeight: isScanning ? 'auto' : '250px' }}
              >
                {!isScanning && (
                  <div className="flex flex-col items-center justify-center h-64 text-[#9CA3AF]">
                    <QrCode size={64} className="mb-4" />
                    <p>Escanea el QR del empleado</p>
                  </div>
                )}
              </div>

              <button
                onClick={isScanning ? stopQRScanner : startQRScanner}
                disabled={isLoading}
                className={`w-full py-3 rounded-lg font-medium transition shadow-md flex items-center justify-center gap-2 ${
                  isScanning
                    ? 'bg-[#F87171] hover:bg-red-700 text-white'
                    : 'bg-[#3B82F6] hover:bg-blue-700 text-white'
                } ${isLoading ? 'opacity-50' : ''}`}
              >
                {isScanning ? (
                  <>
                    <CameraOff size={20} />
                    <span>Detener</span>
                  </>
                ) : (
                  <>
                    <Camera size={20} />
                    <span>Escanear</span>
                  </>
                )}
              </button>

              {userData && (
                <div className="mt-6 bg-[#111827] rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-[#34D399]">Usuario Identificado:</h3>
                  <p><strong>Nombre:</strong> {userData.nombre}</p>
                  <p><strong>Documento:</strong> {userData.documento}</p>
                  <p><strong>Cargo:</strong> {userData.cargo}</p>
                </div>
              )}
            </div>

            <div className="bg-[#1F2937] rounded-xl shadow-xl border border-[#374151] p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Car size={24} className="text-[#3B82F6]" />
                Datos del Vehículo
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
                    Tipo de Vehículo
                  </label>
                  <select
                    name="tipoVehiculo"
                    value={vehicleForm.tipoVehiculo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#111827] text-[#F9FAFB] border border-[#374151] rounded-lg focus:ring-2 focus:ring-[#3B82F6]"
                  >
                    <option value="Carro">Carro</option>
                    <option value="Moto">Moto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
                    Matrícula *
                  </label>
                  <input
                    type="text"
                    name="matricula"
                    value={vehicleForm.matricula}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#111827] text-[#F9FAFB] border border-[#374151] rounded-lg focus:ring-2 focus:ring-[#3B82F6] uppercase"
                    placeholder="ABC123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
                    Marca
                  </label>
                  <input
                    type="text"
                    name="marca"
                    value={vehicleForm.marca}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#111827] text-[#F9FAFB] border border-[#374151] rounded-lg focus:ring-2 focus:ring-[#3B82F6]"
                    placeholder="Toyota"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
                    Modelo
                  </label>
                  <input
                    type="text"
                    name="modelo"
                    value={vehicleForm.modelo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#111827] text-[#F9FAFB] border border-[#374151] rounded-lg focus:ring-2 focus:ring-[#3B82F6]"
                    placeholder="Corolla 2020"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={vehicleForm.color}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#111827] text-[#F9FAFB] border border-[#374151] rounded-lg focus:ring-2 focus:ring-[#3B82F6]"
                    placeholder="Negro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
                    Observaciones
                  </label>
                  <textarea
                    name="observaciones"
                    value={vehicleForm.observaciones}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#111827] text-[#F9FAFB] border border-[#374151] rounded-lg focus:ring-2 focus:ring-[#3B82F6] resize-none"
                    rows="3"
                    placeholder="Notas adicionales..."
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!userData || isLoading}
                  className="w-full py-3 bg-[#34D399] hover:bg-green-600 text-white rounded-lg font-semibold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  <span>{isLoading ? 'Registrando...' : 'Registrar Ingreso'}</span>
                </button>

                {userData && (
                  <button
                    onClick={resetForm}
                    className="w-full py-2 bg-[#374151] hover:bg-[#4B5563] text-white rounded-lg transition"
                  >
                    Limpiar Formulario
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiculoRegistro;