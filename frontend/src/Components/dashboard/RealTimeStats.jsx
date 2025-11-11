import { useEffect, useState } from 'react';
import { Clock, TrendingUp, Calendar } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

const RealTimeStats = ({ sessions }) => {
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    const calculateTotalTime = () => {
      let total = 0;
      
      Object.values(sessions).forEach(session => {
        if (session.estado === 'activa') {
          const duration = Math.floor((new Date() - new Date(session.inicio)) / 1000);
          total += duration;
        } else if (session.duracion) {
          total += session.duracion;
        }
      });
      
      setTotalTime(total);
    };

    calculateTotalTime();
    const interval = setInterval(calculateTotalTime, 1000);
    
    return () => clearInterval(interval);
  }, [sessions]);

  const activeSessions = Object.values(sessions).filter(s => s.estado === 'activa').length;
  const completedSessions = Object.values(sessions).filter(s => s.estado === 'finalizada').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium opacity-90">Tiempo Total Hoy</h3>
          <Clock className="opacity-75" size={24} />
        </div>
        <p className="text-3xl font-bold">{formatDuration(totalTime)}</p>
        <p className="text-xs opacity-75 mt-1">Acumulado del día</p>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium opacity-90">Sesiones Activas</h3>
          <TrendingUp className="opacity-75" size={24} />
        </div>
        <p className="text-3xl font-bold">{activeSessions}</p>
        <p className="text-xs opacity-75 mt-1">Empleados trabajando ahora</p>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium opacity-90">Sesiones Completadas</h3>
          <Calendar className="opacity-75" size={24} />
        </div>
        <p className="text-3xl font-bold">{completedSessions}</p>
        <p className="text-xs opacity-75 mt-1">Finalizadas hoy</p>
      </div>
    </div>
  );
};

export default RealTimeStats;