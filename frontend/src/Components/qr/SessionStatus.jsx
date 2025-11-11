import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDuration, formatTime } from '../../utils/formatters';

const SessionStatus = ({ session, userName }) => {
  if (!session) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 text-center">
        <XCircle className="mx-auto text-gray-400 mb-2" size={48} />
        <p className="text-gray-600">Sin sesión activa</p>
      </div>
    );
  }

  const isActive = session.estado === 'activa';
  const currentDuration = isActive
    ? Math.floor((new Date() - new Date(session.inicio)) / 1000)
    : session.duracion;

  return (
    <div className={`rounded-lg p-6 ${isActive ? 'bg-green-50' : 'bg-blue-50'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{userName}</h3>
        {isActive ? (
          <span className="flex items-center text-green-600">
            <Clock className="mr-1 animate-pulse" size={20} />
            <span className="font-medium">En turno</span>
          </span>
        ) : (
          <span className="flex items-center text-blue-600">
            <CheckCircle className="mr-1" size={20} />
            <span className="font-medium">Finalizado</span>
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Entrada:</span>
          <span className="font-medium">{formatTime(session.inicio)}</span>
        </div>
        
        {!isActive && session.fin && (
          <div className="flex justify-between">
            <span className="text-gray-600">Salida:</span>
            <span className="font-medium">{formatTime(session.fin)}</span>
          </div>
        )}
        
        <div className="flex justify-between border-t pt-3">
          <span className="text-gray-600">Tiempo trabajado:</span>
          <span className="font-bold text-lg">
            {formatDuration(currentDuration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SessionStatus;