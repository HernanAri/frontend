import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './Components/common/ProtectedRoute';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import Admin from './Pages/Admin';
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
              <ProtectedRoute allowedRoles={['admin', 'gerente', 'empleado', 'vigilante']}>
                <VehiculoRegistro />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lista-vehiculos"
            element={
              <ProtectedRoute allowedRoles={['admin', 'gerente', 'empleado', 'vigilante']}>
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