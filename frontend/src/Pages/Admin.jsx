import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import { userAPI } from '../api/endpoints';
import { UserPlus, Edit2, Trash2, Users, Clock, Search, CheckCircle, XCircle } from 'lucide-react';

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
    } catch {
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const dataToSend = {
        ...formData,
        documento: Number(formData.documento),
        celular: Number(formData.celular),
        correo: formData.correo.trim(),
      };

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
    } catch {
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

  const filteredUsers = users.filter(
    (user) =>
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.documento?.toString().includes(searchTerm)
  );

  const getRoleBadge = (rol) => {
    const styles = {
      admin: 'bg-purple-900 text-purple-200',
      supervisor: 'bg-blue-900 text-blue-200',
      vigilante: 'bg-orange-900 text-orange-200',
      usuario: 'bg-green-900 text-green-200',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[rol] || styles.usuario}`}>
        {rol.charAt(0).toUpperCase() + rol.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#111827] text-gray-100">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
          <p className="text-gray-400">Gestiona usuarios y sus permisos del sistema</p>
        </div>

        {/* Alert Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
              message.type === 'success' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
            }`}
          >
            {message.type === 'success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Search and New User */}
        <div className="bg-[#1F2937] rounded-lg shadow-md p-4 mb-6 border border-[#374151]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#111827] border border-[#374151] rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        {/* Tabla de Usuarios */}
        <div className="bg-[#1F2937] rounded-lg shadow-md overflow-hidden border border-[#374151]">
          {isLoading ? (
            <div className="p-8 text-center">
              <Clock className="animate-spin mx-auto text-blue-500 mb-4" size={48} />
              <p className="text-gray-400">Cargando usuarios...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto text-gray-500 mb-4" size={48} />
              <p className="text-gray-400">No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-300">
                <thead className="bg-[#374151] text-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">Nombre</th>
                    <th className="px-6 py-3 text-left">Usuario</th>
                    <th className="px-6 py-3 text-left">Documento</th>
                    <th className="px-6 py-3 text-left">Rol</th>
                    <th className="px-6 py-3 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.idusuario}
                      className="hover:bg-[#2D3748] border-b border-[#374151]"
                    >
                      <td className="px-6 py-4 font-medium">{user.nombre}</td>
                      <td className="px-6 py-4">{user.username}</td>
                      <td className="px-6 py-4">{user.documento}</td>
                      <td className="px-6 py-4">{getRoleBadge(user.rol)}</td>
                      <td className="px-6 py-4 flex space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-400 hover:text-blue-200"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.idusuario)}
                          className="text-red-400 hover:text-red-200"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1F2937] rounded-lg shadow-xl max-w-3xl w-full p-6 border border-[#374151]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-200">
                  <XCircle size={24} />
                </button>
              </div>

              {/* Formulario */}
              <div className="flex-1 overflow-y-auto max-h-[60vh] pr-2 space-y-4">
                {Object.keys(formData).map((key) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-400 mb-2 capitalize">
                      {key}
                    </label>
                    <input
                      type="text"
                      name={key}
                      value={formData[key]}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#111827] border border-[#374151] rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-500 rounded-lg hover:bg-[#374151] transition"
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
    </div>
  );
};

export default Admin;
