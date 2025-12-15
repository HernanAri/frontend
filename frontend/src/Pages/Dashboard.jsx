import { useState, useEffect } from 'react';
import Navbar from '../Components/common/Navbar';
import EmployeeCard from  '../Components/dashboard/EmployeeCard';
import RealTimeStats from '../Components/dashboard/RealTimeStats';
import { userAPI, sessionAPI } from '../api/endpoints';
import { Users, RefreshCw, AlertCircle } from 'lucide-react';

const DashboardMejorado = () => {
  const [employees, setEmployees] = useState([]);
  const [sessions, setSessions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allUsers = await userAPI.getAllUsers();
      setEmployees(allUsers);

      const sessionsData = {};
      for (const user of allUsers) {
        try {
          const userSessions = await sessionAPI.getUserSessions(user.idusuario);
          const activeSession = userSessions.find(s => s.estado === 'activa');

          if (activeSession) {
            sessionsData[user.idusuario] = activeSession;
          } else {
            const today = new Date().setHours(0, 0, 0, 0);
            const todaySessions = userSessions.filter(s => {
              const sessionDate = new Date(s.inicio).setHours(0, 0, 0, 0);
              return sessionDate === today && s.estado === 'finalizada';
            });

            if (todaySessions.length > 0) {
              sessionsData[user.idusuario] = todaySessions[0];
            }
          }
        } catch (err) {
          console.error(`Error loading sessions for user ${user.idusuario}:`, err);
        }
      }

      setSessions(sessionsData);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Error al cargar los datos. Intenta nuevamente.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const activeEmployees = employees.filter(emp => sessions[emp.idusuario]?.estado === 'activa');

  if (isLoading && employees.length === 0) {
    return (
      <div className="min-h-screen bg-[#111827]">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="animate-spin mx-auto text-[#3B82F6] mb-4" size={48} />
            <p className="text-[#9CA3AF]">Cargando datos del dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] text-[#F9FAFB]">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard de Gerencia</h1>
              <p className="text-[#9CA3AF]">
                Monitoreo en tiempo real de asistencia · Última actualización: {lastUpdate.toLocaleTimeString('es-CO')}
              </p>
            </div>

            <button
              onClick={loadData}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-md transition
                ${isLoading ? 'bg-[#374151] cursor-not-allowed' : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white'}`}
            >
              <RefreshCw className={isLoading ? 'animate-spin' : ''} size={20} />
              <span>{isLoading ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
          </div>

          {/* Stats Cards en Tiempo Real */}
          <RealTimeStats sessions={sessions} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#F87171] border border-[#374151] text-[#F9FAFB] px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {error}
          </div>
        )}

        {/* Employee List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Users className="mr-2" size={24} />
              Estado de Empleados ({employees.length})
            </h2>

            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#34D399] rounded-full mr-2"></div>
                <span className="text-[#9CA3AF]">Activos: {activeEmployees.length}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#D1D5DB] rounded-full mr-2"></div>
                <span className="text-[#9CA3AF]">Inactivos: {employees.length - activeEmployees.length}</span>
              </div>
            </div>
          </div>

          {employees.length === 0 ? (
            <div className="bg-[#1F2937] rounded-lg shadow-md p-8 text-center">
              <Users className="mx-auto text-[#9CA3AF] mb-4" size={48} />
              <p className="text-[#9CA3AF]">No hay empleados registrados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((employee) => (
                <EmployeeCard
                  key={employee.idusuario}
                  employee={employee}
                  session={sessions[employee.idusuario]}
                  className="bg-[#1F2937] text-[#F9FAFB] border border-[#374151]"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardMejorado;
