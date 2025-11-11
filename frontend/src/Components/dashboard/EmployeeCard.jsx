import { Clock, User } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';
import { useEffect, useState } from 'react';

const EmployeeCard = ({ employee, session }) => {
  const [currentDuration, setCurrentDuration] = useState(0);

  useEffect(() => {
    if (session?.estado === 'activa') {
      const interval = setInterval(() => {
        const duration = Math.floor((new Date() - new Date(session.inicio)) / 1000);
        setCurrentDuration(duration);
      }, 1000);

      return () => clearInterval(interval);
    } else if (session?.duracion) {
      setCurrentDuration(session.duracion);
    }
  }, [session]);

  const isActive = session?.estado === 'activa';

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${
      isActive ? 'border-green-500' : 'border-gray-300'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${
            isActive ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <User className={isActive ? 'text-green-600' : 'text-gray-400'} size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{employee.nombre}</h3>
            <p className="text-sm text-gray-500">{employee.cargo}</p>
            <p className="text-xs text-gray-400">ID: {employee.idusuario}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
            isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {isActive ? '● En turno' : '○ Fuera de turno'}
          </div>
        </div>
      </div>

      {session && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center">
              <Clock size={16} className="mr-1" />
              Tiempo trabajado hoy:
            </span>
            <span className="font-bold text-lg">
              {formatDuration(currentDuration)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeCard;