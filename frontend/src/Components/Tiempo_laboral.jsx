import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Play, Pause, User, Users, TrendingUp, Award } from 'lucide-react';
import '../assets/styles/Tiempo_laboral.css'; 

// Componente individual de empleado mejorado
const EmployeeTimeCard = ({ 
  employee, 
  onToggleTime,
  onViewDetails 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatHours = (seconds) => (seconds / 3600).toFixed(1);
  
  const dailyProgress = Math.min((employee.dailySeconds / (8 * 3600)) * 100, 100);
  const monthlyProgress = Math.min((employee.monthlySeconds / (160 * 3600)) * 100, 100);
  
  const getStatusColor = () => {
    if (employee.isActive) return 'status-active';
    return 'status-pause';
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'progress-excellent';
    if (progress >= 75) return 'progress-good';
    if (progress >= 50) return 'progress-fair';
    return 'progress-poor';
  };

  return (
    <div className="employee-card">
      {/* Header */}
      <div className="employee-header">
        <div className="employee-info">
          <div className="employee-avatar">
            <div className="avatar-container">
              {employee.photo ? (
                <img 
                  src={employee.photo} 
                  alt={employee.name}
                  className="avatar-image"
                />
              ) : (
                <User className="avatar-icon" />
              )}
            </div>
            <div className={`status-indicator ${getStatusColor()}`}></div>
          </div>
          <div className="employee-details">
            <h3 className="employee-name">{employee.name}</h3>
            <p className="employee-meta">ID: {employee.id} • {employee.department}</p>
          </div>
        </div>
        <div className="employee-status">
          <div className="status-label">Estado</div>
          <div className="status-text">
            {employee.isActive ? 'Trabajando' : 'En pausa'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="employee-content">
        {/* Tiempo diario */}
        <div className="time-section">
          <div className="time-header">
            <div className="time-label">
              <Clock className="time-icon daily-icon" />
              <span className="time-text">Tiempo de hoy</span>
            </div>
            <div className="time-value large">
              {formatTime(employee.dailySeconds)}
            </div>
          </div>
          <div className="progress-container">
            <div 
              className={`progress-bar ${getProgressColor(dailyProgress)}`}
              style={{ width: `${dailyProgress}%` }}
            ></div>
          </div>
          <div className="progress-info">
            <span>{formatHours(employee.dailySeconds)}h trabajadas</span>
            <span>Meta: 8h ({dailyProgress.toFixed(0)}%)</span>
          </div>
        </div>

        {/* Tiempo mensual */}
        <div className="time-section">
          <div className="time-header">
            <div className="time-label">
              <Calendar className="time-icon monthly-icon" />
              <span className="time-text">Tiempo del mes</span>
            </div>
            <div className="time-value medium">
              {formatTime(employee.monthlySeconds)}
            </div>
          </div>
          <div className="progress-container">
            <div 
              className={`progress-bar ${getProgressColor(monthlyProgress)}`}
              style={{ width: `${monthlyProgress}%` }}
            ></div>
          </div>
          <div className="progress-info">
            <span>{formatHours(employee.monthlySeconds)}h acumuladas</span>
            <span>Meta: 160h ({monthlyProgress.toFixed(0)}%)</span>
          </div>
        </div>

        {/* Información de sesión */}
        {employee.isActive && employee.sessionStart && (
          <div className="session-info">
            <div className="session-content">
              <div className="session-indicator"></div>
              <span className="session-text">
                Sesión iniciada: {employee.sessionStart.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}
              </span>
            </div>
          </div>
        )}

        {/* Estadísticas rápidas */}
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value days">{employee.weeklyDays || 5}</div>
            <div className="stat-label">Días semana</div>
          </div>
          <div className="stat-item">
            <div className="stat-value efficiency">{employee.efficiency || 98}%</div>
            <div className="stat-label">Eficiencia</div>
          </div>
          <div className="stat-item">
            <div className="stat-value punctuality">{employee.punctuality || 95}%</div>
            <div className="stat-label">Puntualidad</div>
          </div>
        </div>
      </div>

      {/* Footer con acciones */}
      <div className="employee-footer">
        <div className="action-buttons">
          <button
            onClick={() => onToggleTime(employee.id)}
            className={`action-btn primary ${employee.isActive ? 'pause-btn' : 'start-btn'}`}
          >
            {employee.isActive ? <Pause className="btn-icon" /> : <Play className="btn-icon" />}
            <span>{employee.isActive ? 'Pausar' : 'Iniciar'}</span>
          </button>
          <button
            onClick={() => onViewDetails(employee.id)}
            className="action-btn secondary"
          >
            <TrendingUp className="btn-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente principal del dashboard
const ProfessionalTimeTracker = () => {
  // Estado inicial con datos de ejemplo
  const [employees, setEmployees] = useState([
    {
      id: 'EMP001',
      name: 'Ana García López',
      department: 'Desarrollo',
      photo: null,
      isActive: true,
      dailySeconds: 6 * 3600 + 45 * 60,
      monthlySeconds: 85 * 3600,
      sessionStart: new Date(Date.now() - 2 * 3600 * 1000),
      efficiency: 98,
      punctuality: 95,
      weeklyDays: 5
    },
    {
      id: 'EMP002',
      name: 'Carlos Rodríguez',
      department: 'Marketing',
      photo: null,
      isActive: false,
      dailySeconds: 4 * 3600 + 30 * 60,
      monthlySeconds: 72 * 3600,
      sessionStart: null,
      efficiency: 92,
      punctuality: 88,
      weeklyDays: 5
    },
    {
      id: 'EMP003',
      name: 'María Fernández',
      department: 'Ventas',
      photo: null,
      isActive: true,
      dailySeconds: 7 * 3600 + 15 * 60,
      monthlySeconds: 95 * 3600,
      sessionStart: new Date(Date.now() - 4 * 3600 * 1000),
      efficiency: 96,
      punctuality: 99,
      weeklyDays: 5
    },
    {
      id: 'EMP004',
      name: 'José Martínez',
      department: 'Administración',
      photo: null,
      isActive: false,
      dailySeconds: 8 * 3600 + 10 * 60,
      monthlySeconds: 120 * 3600,
      sessionStart: null,
      efficiency: 94,
      punctuality: 92,
      weeklyDays: 5
    }
  ]);

  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [sortBy, setSortBy] = useState('name'); // name, daily, monthly, efficiency

  // Efecto para actualizar los timers en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setEmployees(prev => 
        prev.map(emp => ({
          ...emp,
          dailySeconds: emp.isActive ? emp.dailySeconds + 1 : emp.dailySeconds,
          monthlySeconds: emp.isActive ? emp.monthlySeconds + 1 : emp.monthlySeconds
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Función para alternar el estado de tiempo de un empleado
  const handleToggleTime = (employeeId) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === employeeId 
          ? {
              ...emp,
              isActive: !emp.isActive,
              sessionStart: !emp.isActive ? new Date() : null
            }
          : emp
      )
    );
  };

  // Función para ver detalles del empleado
  const handleViewDetails = (employeeId) => {
    alert(`Ver detalles completos del empleado ${employeeId}`);
  };

  // Filtrar empleados
  const filteredEmployees = employees.filter(emp => {
    if (filter === 'active') return emp.isActive;
    if (filter === 'inactive') return !emp.isActive;
    return true;
  });

  // Ordenar empleados
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    switch (sortBy) {
      case 'daily':
        return b.dailySeconds - a.dailySeconds;
      case 'monthly':
        return b.monthlySeconds - a.monthlySeconds;
      case 'efficiency':
        return (b.efficiency || 0) - (a.efficiency || 0);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Estadísticas generales
  const stats = {
    total: employees.length,
    active: employees.filter(emp => emp.isActive).length,
    totalDailyHours: employees.reduce((sum, emp) => sum + emp.dailySeconds, 0) / 3600,
    avgEfficiency: employees.reduce((sum, emp) => sum + (emp.efficiency || 0), 0) / employees.length
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Control de Tiempo Laboral</h1>
          <p className="dashboard-subtitle">Dashboard profesional para seguimiento de empleados</p>
        </div>

        {/* Estadísticas generales */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-card-content">
              <Users className="stat-card-icon total" />
              <div className="stat-card-info">
                <p className="stat-card-label">Total Empleados</p>
                <p className="stat-card-value">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-content">
              <Play className="stat-card-icon active" />
              <div className="stat-card-info">
                <p className="stat-card-label">Activos Ahora</p>
                <p className="stat-card-value">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-content">
              <Clock className="stat-card-icon hours" />
              <div className="stat-card-info">
                <p className="stat-card-label">Horas Hoy</p>
                <p className="stat-card-value">{stats.totalDailyHours.toFixed(1)}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-content">
              <Award className="stat-card-icon efficiency" />
              <div className="stat-card-info">
                <p className="stat-card-label">Eficiencia Promedio</p>
                <p className="stat-card-value">{stats.avgEfficiency.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de filtrado y ordenamiento */}
        <div className="controls-panel">
          <div className="controls-content">
            <div className="control-group">
              <label className="control-label">Filtrar:</label>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="control-select"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
            <div className="control-group">
              <label className="control-label">Ordenar por:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="control-select"
              >
                <option value="name">Nombre</option>
                <option value="daily">Tiempo diario</option>
                <option value="monthly">Tiempo mensual</option>
                <option value="efficiency">Eficiencia</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid de empleados */}
        <div className="employees-grid">
          {sortedEmployees.map(employee => (
            <EmployeeTimeCard
              key={employee.id}
              employee={employee}
              onToggleTime={handleToggleTime}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {/* Mensaje si no hay empleados */}
        {sortedEmployees.length === 0 && (
          <div className="empty-state">
            <Users className="empty-state-icon" />
            <h3 className="empty-state-title">No hay empleados</h3>
            <p className="empty-state-text">No se encontraron empleados con los filtros aplicados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalTimeTracker;