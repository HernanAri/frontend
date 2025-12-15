import { useState, useEffect } from 'react';
import Navbar from '../Components/common/Navbar';
import { userAPI, sessionAPI } from '../api/endpoints';
import { Clock, Calendar, TrendingUp, Download, Filter, Search, RefreshCw, User } from 'lucide-react';

const Gestion = () => {
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('today');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [filterPeriod]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const allUsers = await userAPI.getAllUsers();
      setUsers(allUsers);

      const sessionsData = {};
      
      for (const user of allUsers) {
        try {
          const userSessions = await sessionAPI.getUserSessions(user.idusuario);
          const sessionsArray = Array.isArray(userSessions) ? userSessions : [];
          const filteredSessions = filterSessionsByPeriod(sessionsArray);
          sessionsData[user.idusuario] = filteredSessions;
        } catch (err) {
          console.error(`Error loading sessions for user ${user.idusuario}:`, err);
          sessionsData[user.idusuario] = [];
        }
      }

      setSessions(sessionsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterSessionsByPeriod = (userSessions) => {
    if (!Array.isArray(userSessions) || userSessions.length === 0) {
      return [];
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return userSessions.filter(session => {
      if (!session || !session.inicio) return false;
      
      const sessionDate = new Date(session.inicio);
      
      switch (filterPeriod) {
        case 'today':
          return sessionDate >= today;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return sessionDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return sessionDate >= monthAgo;
        case 'all':
          return true;
        default:
          return sessionDate >= today;
      }
    });
  };

  const calculateTotalHours = (userSessions) => {
    if (!userSessions || !Array.isArray(userSessions) || userSessions.length === 0) {
      return 0;
    }
    
    return userSessions.reduce((total, session) => {
      if (!session) return total;
      
      if (session.estado === 'finalizada' && session.duracion) {
        const duration = parseDuration(session.duracion);
        return total + duration;
      }
      return total;
    }, 0);
  };

  const parseDuration = (duration) => {
    if (!duration) return 0;
    
    try {
      const parts = duration.split(':');
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      const seconds = parseInt(parts[2]) || 0;
      
      return hours + (minutes / 60) + (seconds / 3600);
    } catch (e) {
      return 0;
    }
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const headers = ['Nombre,Usuario,Total Horas,Sesiones,Periodo'];
    const rows = filteredUsers.map(user => {
      const userSessions = sessions[user.idusuario] || [];
      const totalHours = calculateTotalHours(userSessions);
      return `${user.nombre},${user.username},${totalHours.toFixed(2)},${userSessions.length},${filterPeriod}`;
    });
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-tiempos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredUsers = users.filter(user =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.documento?.toString().includes(searchTerm)
  );

  const totalHoursAllUsers = filteredUsers.reduce((sum, user) => {
    return sum + calculateTotalHours(sessions[user.idusuario] || []);
  }, 0);

  const averageHoursPerUser = filteredUsers.length > 0 
    ? totalHoursAllUsers / filteredUsers.length 
    : 0;

  return (
    <div className="min-h-screen bg-[#111827] text-[#F9FAFB]">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Gestión de Tiempos
              </h1>
              <p className="text-[#9CA3AF]">
                Visualiza y analiza los tiempos laborados · Última actualización: {lastUpdate.toLocaleTimeString('es-CO')}
              </p>
            </div>
            
            <button
              onClick={loadData}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition shadow-md ${
                isLoading 
                  ? 'bg-[#374151] cursor-not-allowed text-[#9CA3AF]' 
                  : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white'
              }`}
            >
              <RefreshCw className={isLoading ? 'animate-spin' : ''} size={20} />
              <span>{isLoading ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#1F2937] p-6 rounded-lg shadow-md border border-[#374151]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#9CA3AF] mb-1">Total Horas</p>
                  <p className="text-2xl font-bold">
                    {formatHours(totalHoursAllUsers)}
                  </p>
                </div>
                <Clock className="text-[#3B82F6]" size={32} />
              </div>
            </div>
            
            <div className="bg-[#1F2937] p-6 rounded-lg shadow-md border border-[#374151]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#9CA3AF] mb-1">Promedio por Usuario</p>
                  <p className="text-2xl font-bold">
                    {formatHours(averageHoursPerUser)}
                  </p>
                </div>
                <TrendingUp className="text-[#34D399]" size={32} />
              </div>
            </div>
            
            <div className="bg-[#1F2937] p-6 rounded-lg shadow-md border border-[#374151]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#9CA3AF] mb-1">Empleados Activos</p>
                  <p className="text-2xl font-bold">
                    {filteredUsers.length}
                  </p>
                </div>
                <Calendar className="text-[#A78BFA]" size={32} />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#F87171]/10 border border-[#F87171]/40 text-[#F87171] px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="mr-2" size={20} />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="text-[#F87171] hover:text-[#dc2626] font-medium"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Filters and Actions */}
        <div className="bg-[#1F2937] rounded-lg shadow-md p-4 mb-6 border border-[#374151]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF]" size={20} />
              <input
                type="text"
                placeholder="Buscar empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#111827] border border-[#374151] rounded-lg text-[#F9FAFB] placeholder-[#6B7280] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Filter size={20} className="text-[#9CA3AF]" />
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-4 py-2 bg-[#111827] border border-[#374151] rounded-lg text-[#F9FAFB] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              >
                <option value="today">Hoy</option>
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
                <option value="all">Todo</option>
              </select>

              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 bg-[#34D399] text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                <Download size={20} />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-[#1F2937] rounded-lg shadow-md p-8 text-center border border-[#374151]">
              <RefreshCw className="animate-spin mx-auto text-[#3B82F6] mb-4" size={48} />
              <p className="text-[#9CA3AF]">Cargando datos...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-[#1F2937] rounded-lg shadow-md p-8 text-center border border-[#374151]">
              <User className="mx-auto text-[#9CA3AF] mb-4" size={48} />
              <p className="text-[#9CA3AF]">No se encontraron empleados</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const userSessions = sessions[user.idusuario] || [];
              const totalHours = calculateTotalHours(userSessions);
              const completedSessions = userSessions.filter(s => s.estado === 'finalizada');

              return (
                <div key={user.idusuario} className="bg-[#1F2937] rounded-lg shadow-md overflow-hidden border border-[#374151]">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[#3B82F6]/20 rounded-full flex items-center justify-center">
                          <span className="text-[#3B82F6] font-bold text-lg">
                            {user.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {user.nombre}
                          </h3>
                          <p className="text-sm text-[#9CA3AF]">@{user.username} · {user.cargo || 'Sin cargo'}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#3B82F6]">
                          {formatHours(totalHours)}
                        </p>
                        <p className="text-sm text-[#9CA3AF]">
                          {completedSessions.length} sesiones
                        </p>
                      </div>
                    </div>

                    {/* Sessions Detail */}
                    {completedSessions.length > 0 && (
                      <div className="mt-4 border-t border-[#374151] pt-4">
                        <h4 className="text-sm font-medium text-[#D1D5DB] mb-3">
                          Historial de Sesiones
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {completedSessions.map((session, idx) => (
                            <div
                              key={session.idsesion || idx}
                              className="flex items-center justify-between p-3 bg-[#111827] rounded-lg border border-[#374151]"
                            >
                              <div className="flex items-center space-x-3">
                                <Calendar size={16} className="text-[#9CA3AF]" />
                                <div>
                                  <p className="text-sm font-medium">
                                    {formatDate(session.inicio)}
                                  </p>
                                  <p className="text-xs text-[#9CA3AF]">
                                    {formatTime(session.inicio)} - {session.fin ? formatTime(session.fin) : 'En curso'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold">
                                  {session.duracion || 'N/A'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {completedSessions.length === 0 && (
                      <div className="mt-4 text-center py-4 bg-[#111827] rounded-lg border border-[#374151]">
                        <p className="text-sm text-[#9CA3AF]">
                          No hay sesiones en este periodo
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Gestion;