import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, QrCode, LayoutDashboard, Clock, Users, Settings } from 'lucide-react';
import { Car, List } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
      isActive(path)
        ? 'bg-[#3B82F6] text-[#F9FAFB]'
        : 'text-[#9CA3AF] hover:bg-[#374151] hover:text-[#F9FAFB]'
    }`;

  return (
    <nav className="bg-[#1F2937] border-b border-[#374151] shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#3B82F6] rounded-lg flex items-center justify-center">
              <img src="logo3.png" alt="" />
            </div>
            <div>
              <h1 className="text-xl font-script italic tracking-tight text-[#F9FAFB]">CLOKIFY</h1>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-2">
            <Link to="/qr-reader" className={linkClass('/qr-reader')}>
              <QrCode size={18} />
              <span className="hidden md:inline">Lector QR</span>
            </Link>

            {(user?.rol === 'admin' || user?.rol === 'gerente') && (
              <>
                <Link to="/dashboard" className={linkClass('/dashboard')}>
                  <Car size={18} />
                  <span className="hidden md:inline">Dashboard</span>
                </Link>
                <Link to="/gestion" className={linkClass('/gestion')}>
                  <List size={18} />
                  <span className="hidden md:inline">Tiempos</span>
                </Link>
              </>
            )}

            {user?.rol === 'admin' && (
              <Link to="/admin" className={linkClass('/admin')}>
                <Settings size={18} />
                <span className="hidden md:inline">Admin</span>
              </Link>
            )}

            {(user.rol === 'vigilante' || user.rol === 'admin') && (
              <>
                <Link to = "/registro-vehiculo" className={linkClass('/registro-vehiculo')}>
                  <Clock size={18} />
                  <span className="hidden md:inline">Registrar Vehículo</span>
                </Link>
                <Link to = "/lista-vehiculos" className={linkClass('/lista-vehiculos')}>
                  <Clock size={18} />
                  <span className="hidden md:inline">Lista de Vehículos</span>
                </Link>
              </>
            )}
          </div>

          {/* Usuario */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-[#F9FAFB]">{user?.nombre}</p>
              <p className="text-xs text-[#9CA3AF] capitalize">{user?.rol}</p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-[#F87171] text-[#F9FAFB] rounded-lg hover:bg-red-700 transition"
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
