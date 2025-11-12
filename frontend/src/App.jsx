import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import QRReader from './pages/QRReader';
import Dashboard from './pages/Dashboard';
import Admin from './Pages/admin';
import Gestion from './Pages/Gestion';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />
          
          {/* Ruta para lectura QR - Todos los usuarios autenticados */}
          <Route
            path="/qr-reader"
            element={
              <ProtectedRoute>
                <QRReader />
              </ProtectedRoute>
            }
          />
          
          {/* Dashboard - Solo Admin y Gerente */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'gerente']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Gestión de Tiempos - Admin y Gerente */}
          <Route
            path="/gestion"
            element={
              <ProtectedRoute allowedRoles={['admin', 'gerente']}>
                <Gestion />
              </ProtectedRoute>
            }
          />
          
          {/* Administración de Usuarios - Solo Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Admin />
              </ProtectedRoute>
            }
          />
          
          {/* Redirecciones */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;