import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, QrCode, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold">Sistema de Asistencia</h1>
            
            <div className="flex space-x-4">
              <Link
                to="/qr-reader"
                className="flex items-center space-x-2 hover:bg-blue-700 px-3 py-2 rounded transition"
              >
                <QrCode size={20} />
                <span>Lector QR</span>
              </Link>
              
              {user?.rol === 'admin' && (
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 hover:bg-blue-700 px-3 py-2 rounded transition"
                >
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <p className="font-medium">{user?.nombre}</p>
              <p className="text-blue-200 text-xs capitalize">{user?.rol}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 hover:bg-blue-700 px-3 py-2 rounded transition"
            >
              <LogOut size={20} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;