import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, QrCode, Clock, Settings, Car, List, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
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
        <div className="flex justify-between items-center h-16">

          {/* LOGO */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#3B82F6] rounded-lg flex items-center justify-center">
              <img src="logo3.png" alt="CLOKIFY" />
            </div>
            <h1 className="text-xl font-script italic tracking-tight text-[#F9FAFB]">
              CLOCKIFY
            </h1>
          </div>

          {/* BOTÓN HAMBURGUESA (Sólo móvil) */}
          <button
            className="md:hidden text-gray-200"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* LINKS (Versión Escritorio) */}
          <div className="hidden md:flex items-center space-x-2">

            {(user?.rol === 'admin' || user?.rol === 'gerente') && (
              <>
                <Link to="/dashboard" className={linkClass('/dashboard')}>
                  <Car size={18} />
                  <span>Dashboard</span>
                </Link>

                <Link to="/gestion" className={linkClass('/gestion')}>
                  <List size={18} />
                  <span>Tiempos</span>
                </Link>
              </>
            )}

            {user?.rol === 'admin' && (
              <Link to="/admin" className={linkClass('/admin')}>
                <Settings size={18} />
                <span>Admin</span>
              </Link>
            )}

            {(user?.rol === 'vigilante' || user?.rol === 'admin') && (
              <>
                <Link to="/registro-vehiculo" className={linkClass('/registro-vehiculo')}>
                  <Clock size={18} />
                  <span>Registrar Vehículo</span>
                </Link>

                <Link to="/lista-vehiculos" className={linkClass('/lista-vehiculos')}>
                  <Clock size={18} />
                  <span>Lista de Vehículos</span>
                </Link>
              </>
            )}
          </div>

          {/* USUARIO (ESCRITORIO) */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-[#F9FAFB]">{user?.nombre}</p>
              <p className="text-xs text-[#9CA3AF] capitalize">{user?.rol}</p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-[#F87171] text-[#F9FAFB] rounded-lg hover:bg-red-700 transition"
            >
              <LogOut size={18} />
              <span>Salir</span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col space-y-2">

            <Link to="/qr-reader" className={linkClass('/qr-reader')}>
              <QrCode size={18} /> <span>Lector QR</span>
            </Link>

            {(user?.rol === 'admin' || user?.rol === 'gerente') && (
              <>
                <Link to="/dashboard" className={linkClass('/dashboard')}>
                  <Car size={18} /> <span>Dashboard</span>
                </Link>

                <Link to="/gestion" className={linkClass('/gestion')}>
                  <List size={18} /> <span>Tiempos</span>
                </Link>
              </>
            )}

            {user?.rol === 'admin' && (
              <Link to="/admin" className={linkClass('/admin')}>
                <Settings size={18} /> <span>Admin</span>
              </Link>
            )}

            {(user?.rol === 'vigilante' || user?.rol === 'admin') && (
              <>
                <Link to="/registro-vehiculo" className={linkClass('/registro-vehiculo')}>
                  <Clock size={18} /> <span>Registrar Vehículo</span>
                </Link>

                <Link to="/lista-vehiculos" className={linkClass('/lista-vehiculos')}>
                  <Clock size={18} /> <span>Lista de Vehículos</span>
                </Link>
              </>
            )}

            {/* Usuario móvil */}
            <div className="border-t border-[#374151] pt-3 mt-3">
              <p className="text-sm text-[#F9FAFB]">{user?.nombre}</p>
              <p className="text-xs text-[#9CA3AF] capitalize">{user?.rol}</p>

              <button
                onClick={handleLogout}
                className="mt-3 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-[#F87171] text-[#F9FAFB] rounded-lg hover:bg-red-700 transition"
              >
                <LogOut size={18} />
                <span>Salir</span>
              </button>
            </div>

          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
