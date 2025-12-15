/* --- VehiculoRegistro con estilo del Admin --- */

import { useState, useEffect } from 'react';
import { Car, Search, CheckCircle, XCircle, RefreshCw, Edit2, Save } from 'lucide-react';
import Navbar from '../Components/common/Navbar';

const VehiculoRegistro = () => {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const registrarIngreso = async () => {
  if (!vehicleData) return showMessage('error', 'Debes buscar un vehículo primero');

  try {
    const token = window.localStorage.getItem('access_token');
    const user = JSON.parse(window.localStorage.getItem('user'));

    const response = await fetch("http://localhost:3000/vehiculos/ingreso", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
        body: JSON.stringify({
        matricula: vehicleForm.matricula,
        tipoVehiculo: vehicleForm.tipoVehiculo,
        idusuario: vehicleData.idusuario,
        nombrePropietario: vehicleData.nombrePropietario,
        documentoPropietario: String(vehicleData.documentoPropietario),
        registradoPor: user.username,
        observaciones: vehicleForm.observaciones || ""
      }),

    });

    if (!response.ok) throw new Error("No se pudo registrar el ingreso");

    showMessage("success", "Ingreso registrado correctamente");
  } catch (err) {
    showMessage("error", err.message);
  }
};


  const [vehicleForm, setVehicleForm] = useState({
    tipoVehiculo: 'Carro',
    matricula: ''
  });

  useEffect(() => {
    const currentUser = JSON.parse(window.localStorage.getItem('user') || '{}');
    setUser(currentUser);
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      showMessage('error', 'Ingresa una matrícula para buscar');
      return;
    }

    setIsSearching(true);
    setMessage({ type: 'info', text: 'Buscando vehículo...' });

    try {
      const token = window.localStorage.getItem('access_token');
      const matriculaBusqueda = searchTerm.trim().toUpperCase();

      const response = await fetch('http://localhost:3000/usuario', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error buscando usuarios');

      const usuarios = await response.json();
      const usuarioEncontrado = usuarios.find(
        (u) => u.matricula?.toUpperCase() === matriculaBusqueda
      );

      if (!usuarioEncontrado) {
        showMessage('error', 'No se encontró ningún vehículo con esa matrícula');
        setVehicleData(null);
        setIsSearching(false);
        return;
      }

      const vehicleInfo = {
        idusuario: usuarioEncontrado.idusuario,
        nombrePropietario: usuarioEncontrado.nombre,
        documentoPropietario: usuarioEncontrado.documento,
        cargo: usuarioEncontrado.cargo,
        tipoVehiculo: usuarioEncontrado.vehiculo || 'Carro',
        matricula: usuarioEncontrado.matricula || ''
      };

      setVehicleData(vehicleInfo);

      setVehicleForm({
        tipoVehiculo: vehicleInfo.tipoVehiculo,
        matricula: vehicleInfo.matricula
      });

      showMessage('success', `Vehículo encontrado: ${vehicleInfo.matricula}`);
    } catch (err) {
      showMessage('error', err.message);
      setVehicleData(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    setVehicleForm({ ...vehicleForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (!vehicleData) return showMessage('error', 'No hay datos para actualizar');

    const token = window.localStorage.getItem('access_token');

    setIsLoading(true);

    try {
      const payload = {
        vehiculo: vehicleForm.tipoVehiculo,
        matricula: vehicleForm.matricula.toUpperCase().trim()
      };

      const response = await fetch(
        `http://localhost:3000/usuarios/${vehicleData.idusuario}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) throw new Error('Error al actualizar');

      showMessage('success', 'Información actualizada exitosamente');
      setIsEditing(false);
      await handleSearch();
    } catch (err) {
      showMessage('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSearchTerm('');
    setVehicleData(null);
    setVehicleForm({
      tipoVehiculo: 'Carro',
      matricula: ''
    });
    setIsEditing(false);
  };

return (
  <div className="min-h-screen bg-[#111827] text-gray-100">
    <Navbar />

    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <Car className="text-blue-500" size={32} />
        Registro de Vehículos
      </h1>

      {/* --- Mensajes --- */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm md:text-base ${
            message.type === 'success'
              ? 'bg-green-900 text-green-200'
              : message.type === 'error'
              ? 'bg-red-900 text-red-200'
              : 'bg-blue-900 text-blue-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle size={22} />
          ) : message.type === 'error' ? (
            <XCircle size={22} />
          ) : (
            <RefreshCw size={22} className="animate-spin" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* --- Panel de búsqueda --- */}
      <div className="bg-[#1F2937] border border-[#374151] rounded-lg p-5 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2 text-gray-200">
          <Search size={20} className="text-blue-400" />
          Buscar Vehículo
        </h2>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            placeholder="Ingresa matrícula (ABC123)"
            className="flex-1 px-4 py-3 bg-[#111827] text-gray-200 border border-[#374151] rounded-lg focus:ring-2 focus:ring-blue-500 text-base uppercase"
          />

          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition flex items-center justify-center gap-2"
          >
            <Search size={20} />
            Buscar
          </button>
        </div>
      </div>

      {/* --- Información encontrada --- */}
      {vehicleData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Propietario */}
          <div className="bg-[#1F2937] border border-[#374151] rounded-lg p-5 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-200">
              Información del Propietario
            </h2>

            <div className="space-y-3 text-base">
              <div>
                <p className="text-gray-400 text-sm">Nombre</p>
                <p className="text-gray-100">{vehicleData.nombrePropietario}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Documento</p>
                <p className="text-gray-100 break-all">{vehicleData.documentoPropietario}</p>
              </div>

              {vehicleData.cargo && (
                <div>
                  <p className="text-gray-400 text-sm">Cargo</p>
                  <p className="text-gray-100">{vehicleData.cargo}</p>
                </div>
              )}
            </div>
          </div>

          {/* Datos del vehículo */}
          <div className="bg-[#1F2937] border border-[#374151] rounded-lg p-5 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-200">
                Datos del Vehículo
              </h2>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 flex items-center gap-2 text-sm"
                >
                  <Edit2 size={16} />
                  Editar
                </button>
              )}
            </div>

            {/* Tipo */}
            <label className="text-gray-300 text-sm">Tipo de Vehículo</label>
            <select
              name="tipoVehiculo"
              value={vehicleForm.tipoVehiculo}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full mt-1 mb-4 px-3 py-2 bg-[#111827] text-gray-200 border border-[#374151] rounded-lg"
            >
              <option value="Carro">Carro</option>
              <option value="Moto">Moto</option>
              <option value="Ninguno">Ninguno</option>
            </select>

            {/* Matrícula */}
            <label className="text-gray-300 text-sm">Matrícula</label>
            <input
              name="matricula"
              value={vehicleForm.matricula}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full mt-1 px-3 py-2 bg-[#111827] text-gray-200 border border-[#374151] rounded-lg uppercase"
            />

            {/* Botones */}
            {isEditing ? (
              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setVehicleForm({
                      tipoVehiculo: vehicleData.tipoVehiculo,
                      matricula: vehicleData.matricula,
                    });
                  }}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleUpdate}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Guardar
                </button>
              </div>
            ) : (
              <button
                onClick={registrarIngreso}
                className="w-full mt-5 py-3 bg-green-700 hover:bg-green-800 rounded-lg text-white"
              >
                Registrar Ingreso
              </button>
            )}

            <button
              onClick={resetForm}
              className="w-full mt-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              Nueva Búsqueda
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default VehiculoRegistro;
