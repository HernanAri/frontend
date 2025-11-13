import { useEffect, useState } from 'react';
import { Clock, TrendingUp, Calendar } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

const RealTimeStats = ({ sessions }) => {
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    const calculateTotalTime = () => {
      let total = 0;
      Object.values(sessions).forEach((session) => {
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
      <div className="bg-[#1F2937] p-6 rounded-lg shadow-lg border border-[#374151] text-[#F9FAFB]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-[#9CA3AF]">Tiempo Total Hoy</h3>
          <Clock className="text-[#3B82F6]" size={24} />
        </div>
        <p className="text-3xl font-bold">{formatDuration(totalTime)}</p>
      </div>

      <div className="bg-[#1F2937] p-6 rounded-lg shadow-lg border border-[#374151] text-[#F9FAFB]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-[#9CA3AF]">Sesiones Activas</h3>
          <TrendingUp className="text-[#34D399]" size={24} />
        </div>
        <p className="text-3xl font-bold">{activeSessions}</p>
      </div>

      <div className="bg-[#1F2937] p-6 rounded-lg shadow-lg border border-[#374151] text-[#F9FAFB]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-[#9CA3AF]">Sesiones Completadas</h3>
          <Calendar className="text-[#3B82F6]" size={24} />
        </div>
        <p className="text-3xl font-bold">{completedSessions}</p>
      </div>
    </div>
  );
};

export default RealTimeStats;
