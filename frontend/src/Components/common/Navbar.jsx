import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, QrCode, LayoutDashboard, Clock, Users, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const linkClass = (path) => {
    return `flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
      isActive(path)
        ? 'bg-blue-100 text-blue-700 font-medium'
        : 'text-gray-700 hover:bg-gray-100'
    }`;
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Título */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <QrCode className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Sistema QR</h1>
              <p className="text-xs text-gray-500">Control de Asistencia</p>
            </div>
          </div>

          {/* Menú de Navegación */}
          <div className="flex items-center space-x-2">
            {/* Lectura QR - Todos */}
            <Link to="/qr-reader" className={linkClass('/qr-reader')}>
              <QrCode size={18} />
              <span className="hidden md:inline">Lector QR</span>
            </Link>

            {/* Dashboard - Admin y Gerente */}
            {(user?.rol === 'admin' || user?.rol === 'gerente') && (
              <Link to="/dashboard" className={linkClass('/dashboard')}>
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">Dashboard</span>
              </Link>
            )}

            {/* Gestión de Tiempos - Admin y Gerente */}
            {(user?.rol === 'admin' || user?.rol === 'gerente') && (
              <Link to="/gestion" className={linkClass('/gestion')}>
                <Clock size={18} />
                <span className="hidden md:inline">Tiempos</span>
              </Link>
            )}

            {/* Administración - Solo Admin */}
            {user?.rol === 'admin' && (
              <Link to="/admin" className={linkClass('/admin')}>
                <Settings size={18} />
                <span className="hidden md:inline">Admin</span>
              </Link>
            )}
          </div>

          {/* Usuario y Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-800">{user?.nombre}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.rol}</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;