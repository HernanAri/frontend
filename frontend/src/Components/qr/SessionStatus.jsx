import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDuration, formatTime } from '../../utils/formatters';

const SessionStatus = ({ session, userName }) => {
  if (!session) {
    return (
      <div className="bg-[#1F2937] text-[#9CA3AF] rounded-lg p-6 text-center border border-[#374151]">
        <XCircle className="mx-auto text-[#9CA3AF] mb-2" size={48} />
        <p>Sin sesión activa</p>
      </div>
    );
  }

  const isActive = session.estado === 'activa';
  const currentDuration = isActive
    ? Math.floor((new Date() - new Date(session.inicio)) / 1000)
    : session.duracion;

  return (
    <div
      className={`rounded-lg p-6 border ${
        isActive
          ? 'bg-[#1F2937] border-[#34D399]'
          : 'bg-[#1F2937] border-[#3B82F6]'
      } text-[#F9FAFB]`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{userName}</h3>
        {isActive ? (
          <span className="flex items-center text-[#34D399]">
            <Clock className="mr-1 animate-pulse" size={20} />
            <span className="font-medium">En turno</span>
          </span>
        ) : (
          <span className="flex items-center text-[#3B82F6]">
            <CheckCircle className="mr-1" size={20} />
            <span className="font-medium">Finalizado</span>
          </span>
        )}
      </div>

      <div className="space-y-3 text-[#9CA3AF]">
        <div className="flex justify-between">
          <span>Entrada:</span>
          <span className="font-medium text-[#F9FAFB]">{formatTime(session.inicio)}</span>
        </div>

        {!isActive && session.fin && (
          <div className="flex justify-between">
            <span>Salida:</span>
            <span className="font-medium text-[#F9FAFB]">{formatTime(session.fin)}</span>
          </div>
        )}

        <div className="flex justify-between border-t border-[#374151] pt-3">
          <span>Tiempo trabajado:</span>
          <span className="font-bold text-lg text-[#F9FAFB]">
            {formatDuration(currentDuration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SessionStatus;
