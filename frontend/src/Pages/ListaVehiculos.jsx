import { useState, useEffect } from 'react';
import { Car, TrendingUp, Calendar, Search, RefreshCw, CheckCircle, ArrowLeftRight } from 'lucide-react';
import Navbar from '../Components/common/Navbar';

const VehiculosLista = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('dentro');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const token = window.localStorage.getItem('access_token');
      const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
      const endpoint = filter === 'dentro' 
        ? 'http://localhost:3000/vehiculos/dentro'
        : 'http://localhost:3000/vehiculos/todos';

      const [vehiculosRes, statsRes] = await Promise.all([
        fetch(endpoint, { headers }),
        fetch('http://localhost:3000/vehiculos/estadisticas', { headers })
      ]);

      if (vehiculosRes.ok && statsRes.ok) {
        setVehiculos(await vehiculosRes.json());
        setEstadisticas(await statsRes.json());
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalida = async (matricula) => {
    if (!window.confirm(`¿Registrar salida del vehículo ${matricula}?`)) return;

    try {
      const token = window.localStorage.getItem('access_token');
      const user = JSON.parse(window.localStorage.getItem('user'));
      
      const response = await fetch('http://localhost:3000/vehiculos/salida', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          matricula,
          registradoPor: user.username
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Salida registrada correctamente' });
        loadData();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al registrar salida' });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredVehiculos = vehiculos.filter(v =>
    v.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.nombrePropietario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.marca?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#111827] text-[#F9FAFB]">
        <Navbar />
      <nav className="bg-[#1F2937] border-b border-[#374151] shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Car className="text-[#3B82F6]" size={32} />
            <h1 className="text-xl font-bold">Control de Vehículos</h1>
          </div>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-[#3B82F6] hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
          >
            <RefreshCw className={isLoading ? 'animate-spin' : ''} size={18} />
            <span>Actualizar</span>
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            message.type === 'success'
              ? 'bg-[#34D399]/10 border border-[#34D399]/40 text-[#34D399]'
              : 'bg-[#F87171]/10 border border-[#F87171]/40 text-[#F87171]'
          }`}>
            <CheckCircle size={24} />
            <span>{message.text}</span>
          </div>
        )}

        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#1F2937] p-6 rounded-lg shadow-lg border border-[#374151]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-[#9CA3AF]">Total Registrados</h3>
                <Car className="text-[#3B82F6]" size={24} />
              </div>
              <p className="text-3xl font-bold">{estadisticas.total}</p>
            </div>

            <div className="bg-[#1F2937] p-6 rounded-lg shadow-lg border border-[#374151]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-[#9CA3AF]">Dentro</h3>
                <TrendingUp className="text-[#34D399]" size={24} />
              </div>
              <p className="text-3xl font-bold text-[#34D399]">{estadisticas.dentro}</p>
            </div>

            <div className="bg-[#1F2937] p-6 rounded-lg shadow-lg border border-[#374151]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-[#9CA3AF]">Fuera</h3>
                <ArrowLeftRight className="text-[#9CA3AF]" size={24} />
              </div>
              <p className="text-3xl font-bold">{estadisticas.fuera}</p>
            </div>

            <div className="bg-[#1F2937] p-6 rounded-lg shadow-lg border border-[#374151]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-[#9CA3AF]">Ingresos Hoy</h3>
                <Calendar className="text-[#3B82F6]" size={24} />
              </div>
              <p className="text-3xl font-bold">{estadisticas.ingresoHoy}</p>
            </div>
          </div>
        )}

        <div className="bg-[#1F2937] rounded-lg shadow-md p-4 mb-6 border border-[#374151]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF]" size={20} />
              <input
                type="text"
                placeholder="Buscar por matrícula, propietario o marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#111827] border border-[#374151] rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-[#111827] border border-[#374151] rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#3B82F6]"
            >
              <option value="dentro">Solo dentro</option>
              <option value="todos">Todos</option>
            </select>
          </div>
        </div>

        <div className="bg-[#1F2937] rounded-lg shadow-md overflow-hidden border border-[#374151]">
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="animate-spin mx-auto text-[#3B82F6] mb-4" size={48} />
              <p className="text-[#9CA3AF]">Cargando vehículos...</p>
            </div>
          ) : filteredVehiculos.length === 0 ? (
            <div className="p-8 text-center">
              <Car className="mx-auto text-[#9CA3AF] mb-4" size={48} />
              <p className="text-[#9CA3AF]">No hay vehículos registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-[#F9FAFB]">
                <thead className="bg-[#374151] text-[#F9FAFB]">
                  <tr>
                    <th className="px-6 py-3 text-left">Matrícula</th>
                    <th className="px-6 py-3 text-left">Tipo</th>
                    <th className="px-6 py-3 text-left">Propietario</th>
                    <th className="px-6 py-3 text-left">Marca/Modelo</th>
                    <th className="px-6 py-3 text-left">Ingreso</th>
                    <th className="px-6 py-3 text-left">Estado</th>
                    <th className="px-6 py-3 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehiculos.map((vehiculo) => (
                    <tr key={vehiculo.idvehiculo} className="hover:bg-[#2D3748] border-b border-[#374151]">
                      <td className="px-6 py-4 font-bold text-[#3B82F6]">
                        {vehiculo.matricula}
                      </td>
                      <td className="px-6 py-4">{vehiculo.tipoVehiculo}</td>
                      <td className="px-6 py-4">{vehiculo.nombrePropietario}</td>
                      <td className="px-6 py-4">
                        {vehiculo.marca || '-'} {vehiculo.modelo || ''}
                      </td>
                      <td className="px-6 py-4">{formatDate(vehiculo.horaIngreso)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          vehiculo.estado === 'dentro'
                            ? 'bg-[#34D399]/20 text-[#34D399]'
                            : 'bg-[#9CA3AF]/20 text-[#9CA3AF]'
                        }`}>
                          {vehiculo.estado === 'dentro' ? '● Dentro' : '○ Fuera'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {vehiculo.estado === 'dentro' && (
                          <button
                            onClick={() => handleSalida(vehiculo.matricula)}
                            className="px-3 py-1 bg-[#F87171] hover:bg-red-700 text-white rounded text-xs font-medium transition"
                          >
                            Registrar Salida
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehiculosLista;