import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Car, QrCode, Camera, CameraOff, CheckCircle, XCircle, Upload, RefreshCw } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import QrScanner from 'qr-scanner';

const VehiculoRegistro = () => {
  const [user, setUser] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef(null);
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
    console.log('📷 Iniciando escáner de QR...');
    setIsScanning(true);
    setMessage(null);

    try {
      // Limpiar instancia anterior si existe
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
          await html5QrCodeRef.current.clear();
        } catch (e) {
          console.log('Limpiando escáner anterior...');
        }
      }

      // Crear nueva instancia
      html5QrCodeRef.current = new Html5Qrcode("qr-reader-vehicle");

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
          console.log('✅ QR Detectado:', decodedText.substring(0, 50) + '...');
          await handleQRScan(decodedText);
        },
        () => {
          // Ignorar errores menores de escaneo continuo
        }
      );

      console.log('✅ Escáner iniciado correctamente');
    } catch (err) {
      console.error('❌ Error al iniciar cámara:', err);
      setMessage({ 
        type: 'error', 
        text: 'Error al acceder a la cámara. Verifica permisos o usa "Subir imagen".' 
      });
      setIsScanning(false);
    }
  };

  const stopQRScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
        console.log('✅ Escáner detenido');
      } catch (err) {
        console.warn('⚠️ Error al detener scanner:', err);
      } finally {
        setIsScanning(false);
      }
    }
  };

  const handleQRScan = async (token) => {
    await stopQRScanner();
    setIsLoading(true);
    setMessage({ type: 'info', text: 'Verificando código QR...' });

    try {
      const authToken = window.localStorage.getItem('access_token');
      
      console.log('🔍 Enviando token al servidor...');
      console.log('Token (primeros 100 chars):', token.substring(0, 100));
      
      const response = await fetch('http://localhost:3000/qrcode/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ token })
      });

      console.log('📡 Respuesta del servidor:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('✅ Usuario verificado:', data);
      
      setUserData(data);
      
      // Auto-rellenar formulario
      setVehicleForm({
        tipoVehiculo: data.vehiculo !== 'Ninguno' ? data.vehiculo : 'Carro',
        matricula: data.matricula || '',
        marca: '',
        modelo: '',
        color: '',
        observaciones: ''
      });
      
      setMessage({ 
        type: 'success', 
        text: `✅ Usuario identificado: ${data.nombre}` 
      });
    } catch (err) {
      console.error('❌ Error completo:', err);
      setMessage({ 
        type: 'error', 
        text: `Error: ${err.message}. Revisa la consola del navegador para más detalles.`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setMessage({ type: 'info', text: 'Leyendo QR desde imagen...' });

    try {
      console.log('📸 Procesando imagen:', file.name);
      const qrResult = await QrScanner.scanImage(file, {
        returnDetailedScanResult: false
      });
      
      console.log('✅ QR leído desde imagen:', qrResult.substring(0, 50) + '...');
      await handleQRScan(qrResult);
    } catch (err) {
      console.error('❌ Error al leer imagen:', err);
      setMessage({ 
        type: 'error', 
        text: 'No se pudo leer el QR de la imagen. Asegúrate de que sea clara y contenga un QR válido.' 
      });
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

    if (!vehicleForm.matricula.trim()) {
      setMessage({ type: 'error', text: 'La matrícula es obligatoria' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: 'info', text: 'Registrando vehículo...' });

    try {
      const token = window.localStorage.getItem('access_token');
      
      const payload = {
        idusuario: userData.idusuario,
        nombrePropietario: userData.nombre,
        documentoPropietario: userData.documento.toString(),
        tipoVehiculo: vehicleForm.tipoVehiculo,
        matricula: vehicleForm.matricula.toUpperCase().trim(),
        marca: vehicleForm.marca.trim(),
        modelo: vehicleForm.modelo.trim(),
        color: vehicleForm.color.trim(),
        registradoPor: user.username,
        observaciones: vehicleForm.observaciones.trim()
      };

      console.log('📝 Enviando datos del vehículo:', payload);

      const response = await fetch('http://localhost:3000/vehiculos/ingreso', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar vehículo');
      }

      const result = await response.json();
      console.log('✅ Vehículo registrado:', result);

      setMessage({ type: 'success', text: `✅ Vehículo ${vehicleForm.matricula} registrado exitosamente` });
      
      setTimeout(() => {
        resetForm();
      }, 3000);
    } catch (err) {
      console.error('❌ Error al registrar:', err);
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
    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#111827] text-[#F9FAFB]">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
            <Car className="text-[#3B82F6]" size={36} />
            Registro de Vehículos
          </h1>
          <p className="text-[#9CA3AF]">Escanea el QR del empleado para registrar su vehículo</p>
        </div>

        <div className="max-w-5xl mx-auto">
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 animate-fadeIn ${
              message.type === 'success'
                ? 'bg-[#34D399]/10 border border-[#34D399]/40 text-[#34D399]'
                : message.type === 'error'
                ? 'bg-[#F87171]/10 border border-[#F87171]/40 text-[#F87171]'
                : 'bg-[#3B82F6]/10 border border-[#3B82F6]/40 text-[#3B82F6]'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle size={24} className="flex-shrink-0" />
              ) : message.type === 'error' ? (
                <XCircle size={24} className="flex-shrink-0" />
              ) : (
                <RefreshCw size={24} className="flex-shrink-0 animate-spin" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Panel Escáner QR */}
            <div className="bg-[#1F2937] rounded-xl shadow-xl border border-[#374151] p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <QrCode size={24} className="text-[#3B82F6]" />
                Escanear QR del Empleado
              </h2>

              <div
                id="qr-reader-vehicle"
                className={`w-full rounded-lg overflow-hidden mb-4 ${
                  isScanning ? 'border-2 border-[#3B82F6]' : 'bg-[#111827] border border-[#374151]'
                }`}
                style={{ minHeight: isScanning ? 'auto' : '300px' }}
              >
                {!isScanning && (
                  <div className="flex flex-col items-center justify-center h-[300px] text-[#9CA3AF]">
                    <QrCode size={64} className="mb-4" />
                    <p className="text-center px-4 font-medium">Escáner de Código QR</p>
                    <p className="text-xs text-center px-4 mt-2 text-[#6B7280]">
                      El formulario se rellenará automáticamente
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={isScanning ? stopQRScanner : startQRScanner}
                  disabled={isLoading}
                  className={`w-full py-3 rounded-lg font-medium transition shadow-md flex items-center justify-center gap-2 ${
                    isScanning
                      ? 'bg-[#F87171] hover:bg-red-700 text-white'
                      : 'bg-[#3B82F6] hover:bg-blue-700 text-white'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : isScanning ? (
                    <>
                      <CameraOff size={20} />
                      <span>Detener Escáner</span>
                    </>
                  ) : (
                    <>
                      <Camera size={20} />
                      <span>Iniciar Escáner</span>
                    </>
                  )}
                </button>

                <div className="text-center">
                  <p className="text-sm text-[#9CA3AF] mb-2">O subir imagen del QR:</p>
                  <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-[#374151] hover:bg-[#4B5563] text-[#F9FAFB] rounded-lg transition">
                    <Upload size={18} />
                    <span>Seleccionar imagen</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                </div>
              </div>

              {userData && (
                <div className="mt-6 bg-[#111827] rounded-lg p-4 border border-[#34D399]/40">
                  <h3 className="font-semibold mb-3 text-[#34D399] flex items-center gap-2">
                    <CheckCircle size={18} />
                    Usuario Identificado
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong className="text-[#D1D5DB]">Nombre:</strong> {userData.nombre}</p>
                    <p><strong className="text-[#D1D5DB]">Documento:</strong> {userData.documento}</p>
                    <p><strong className="text-[#D1D5DB]">Cargo:</strong> {userData.cargo}</p>
                    {userData.vehiculo !== 'Ninguno' && (
                      <>
                        <p><strong className="text-[#D1D5DB]">Vehículo:</strong> {userData.vehiculo}</p>
                        {userData.matricula && (
                          <p><strong className="text-[#D1D5DB]">Matrícula:</strong> {userData.matricula}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Panel Formulario */}
            <div className="bg-[#1F2937] rounded-xl shadow-xl border border-[#374151] p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Car size={24} className="text-[#3B82F6]" />
                Datos del Vehículo
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
                    Tipo de Vehículo *
                  </label>
                  <select
                    name="tipoVehiculo"
                    value={vehicleForm.tipoVehiculo}
                    onChange={handleInputChange}
                    disabled={!userData || isLoading}
                    className="w-full px-4 py-2 bg-[#111827] text-[#F9FAFB] border border-[#374151] rounded-lg focus:ring-2 focus:ring-[#3B82F6] disabled:opacity-50"
                  >
                    <option value="Carro">🚗 Carro</option>
                    <option value="Moto">🏍️ Moto</option>
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
                    disabled={!userData || isLoading}
                    className="w-full px-4 py-2 bg-[#111827] text-[#F9FAFB] border border-[#374151] rounded-lg focus:ring-2 focus:ring-[#3B82F6] uppercase disabled:opacity-50"
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
                    disabled={!userData || isLoading}
                    className="w-full px-4 py-2 bg-[#111827] text-[#F9FAFB] border border-[#374151] rounded-lg focus:ring-2 focus:ring-[#3B82F6] disabled:opacity-50"
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
                    disabled={!userData || isLoading}
                    className="w-full px-4 py-2 bg-[#111827] text-[#F9FAFB] border border-[#374151] rounded-lg focus:ring-2 focus:ring-[#3B82F6] disabled:opacity-50"
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
                    disabled={!userData || isLoading}
                    className="w-full px-4 py-2 bg-[#111827] text-[#F9FAFB] border border-[#374151] rounded-lg focus:ring-2 focus:ring-[#3B82F6] disabled:opacity-50"
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
                    disabled={!userData || isLoading}
                    className="w-full px-4 py-2 bg-[#111827] text-[#F9FAFB] border border-[#374151] rounded-lg focus:ring-2 focus:ring-[#3B82F6] resize-none disabled:opacity-50"
                    rows="3"
                    placeholder="Notas adicionales..."
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!userData || isLoading || !vehicleForm.matricula.trim()}
                  className="w-full py-3 bg-[#34D399] hover:bg-green-600 text-white rounded-lg font-semibold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      <span>Registrar Ingreso</span>
                    </>
                  )}
                </button>

                {userData && (
                  <button
                    onClick={resetForm}
                    disabled={isLoading}
                    className="w-full py-2 bg-[#374151] hover:bg-[#4B5563] text-white rounded-lg transition disabled:opacity-50"
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