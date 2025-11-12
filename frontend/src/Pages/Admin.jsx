import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import { userAPI, sessionAPI } from '../api/endpoints';
import { UserPlus, Edit2, Trash2, Users, Clock, Search, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    documento: '',
    cargo: '',
    vehiculo: 'Ninguno',
    matricula: '',
    RH: 'O+',
    correo: '',
    direccion: '',
    celular: '',
    elementos: '',
    rol: 'usuario',
    username: '',
    password: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userAPI.getAllUsers();
      setUsers(data);
    } catch (error) {
      showMessage('error', 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
        const dataToSend = {
            ...formData,
            documento: Number(formData.documento),
            celular: Number(formData.celular),
            correo: formData.correo.trim(), 
        }

      if (editingUser) {
        await userAPI.updateUser(editingUser.idusuario, dataToSend);
        showMessage('success', 'Usuario actualizado correctamente');
      } else {
        await userAPI.createUser(dataToSend);
        showMessage('success', 'Usuario creado correctamente');
      }
      
      loadUsers();
      closeModal();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      documento: user.documento,
      cargo: user.cargo,
      vehiculo: user.vehiculo || 'Ninguno',
      matricula: user.matricula || '',
      RH: user.RH,
      correo: user.correo,
      direccion: user.direccion,
      celular: user.celular,
      elementos: user.elementos || '',
      rol: user.rol,
      username: user.username,
      password: ''
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
      await userAPI.deleteUser(userId);
      showMessage('success', 'Usuario eliminado correctamente');
      loadUsers();
    } catch (error) {
      showMessage('error', 'Error al eliminar usuario');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      nombre: '',
      documento: '',
      cargo: '',
      vehiculo: 'Ninguno',
      matricula: '',
      RH: 'O+',
      correo: '',
      direccion: '',
      celular: '',
      elementos: '',
      rol: 'usuario',
      username: '',
      password: ''
    });
  };

  const filteredUsers = users.filter(user =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.documento?.toString().includes(searchTerm)
  );

  const getRoleBadge = (rol) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800',
      supervisor: 'bg-blue-100 text-blue-800',
      vigilante: 'bg-orange-100 text-orange-800',
      usuario: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[rol] || styles.usuario}`}>
        {rol.charAt(0).toUpperCase() + rol.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Panel de Administración
          </h1>
          <p className="text-gray-600">
            Gestiona usuarios y sus permisos del sistema
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle size={24} />
            ) : (
              <XCircle size={24} />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              <UserPlus size={20} />
              <span>Nuevo Usuario</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <Clock className="animate-spin mx-auto text-blue-600 mb-4" size={48} />
              <p className="text-gray-600">Cargando usuarios...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.idusuario} className="hover:bg-gray-50">

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.nombre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.documento}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.rol)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.idusuario)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-800">{users.length}</p>
              </div>
              <Users className="text-blue-600" size={32} />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-gray-800">
                  {users.filter(u => u.rol === 'admin').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold">A</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Empleados</p>
                <p className="text-2xl font-bold text-gray-800">
                  {users.filter(u => u.rol === 'empleado').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">E</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Documento *
                  </label>
                  <input
                    type="number"
                    name="documento"
                    value={formData.documento}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña {editingUser && '(vacío = sin cambios)'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={!editingUser}
                    minLength={4}
                    maxLength={12}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo *
                  </label>
                  <input
                    type="text"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol *
                  </label>
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="usuario">Usuario</option>
                    <option value="vigilante">Vigilante</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo *
                  </label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Celular *
                  </label>
                  <input
                    type="number"
                    name="celular"
                    value={formData.celular}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehículo
                  </label>
                  <select
                    name="vehiculo"
                    value={formData.vehiculo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Ninguno">Ninguno</option>
                    <option value="Moto">Moto</option>
                    <option value="Carro">Carro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matrícula
                  </label>
                  <input
                    type="text"
                    name="matricula"
                    value={formData.matricula}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RH *
                  </label>
                  <select
                    name="RH"
                    value={formData.RH}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Elementos
                </label>
                <textarea
                  name="elementos"
                  value={formData.elementos}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Elementos asignados..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;