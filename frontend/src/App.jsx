import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './Components/common/ProtectedRoute';
import Login from './Pages/Login';
import QRReader from './Pages/QRReader';
import Dashboard from './Pages/Dashboard';
import Admin from './Pages/admin';
import Gestion from './Pages/Gestion';
import EmployeeSession from './Pages/sesionEmpleados';
import VehiculoRegistro from './Pages/RegistroVehiculo';
import VehiculosLista from './Pages/ListaVehiculos';

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

          <Route 
            path="/sesion-empleados"
            element={
              <ProtectedRoute allowedRoles={['admin', 'gerente', 'empleado']}>
                <EmployeeSession />
              </ProtectedRoute>
            }
          />

          <Route
            path="/registro-vehiculo"
            element={
              <ProtectedRoute allowedRoles={['admin', 'gerente', 'empleado']}>
                <VehiculoRegistro />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lista-vehiculos"
            element={
              <ProtectedRoute allowedRoles={['admin', 'gerente', 'empleado']}>
                <VehiculosLista />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;