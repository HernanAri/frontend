import { useState, useEffect } from 'react';
import { Clock, Play, Pause, StopCircle, LogOut, Calendar } from 'lucide-react';

const EmployeeSession = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedTime, setPausedTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(window.localStorage.getItem('user') || '{}');
    setUser(userData);
    loadActiveSession(userData.idusuario);
  }, []);

  useEffect(() => {
    let interval;
    if (session && session.estado === 'activa' && !isPaused) {
      interval = setInterval(() => {
        const start = new Date(session.inicio).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - start - pausedTime) / 1000);
        setCurrentTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [session, isPaused, pausedTime]);

  const loadActiveSession = async (userId) => {
    try {
      const token = window.localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/registro/usuario/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const sessions = await response.json();
        const active = sessions.find(s => s.estado === 'activa');
        if (active) {
          setSession(active);
          const start = new Date(active.inicio).getTime();
          const elapsed = Math.floor((Date.now() - start) / 1000);
          setCurrentTime(elapsed);
        }
      }
    } catch (err) {
      console.error('Error loading session:', err);
    }
  };

  const startSession = async () => {
    setIsLoading(true);
    try {
      const token = window.localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/registro/entrada/${user.idusuario}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data.sesion);
        setCurrentTime(0);
        setPausedTime(0);
        setIsPaused(false);
      }
    } catch (err) {
      console.error('Error starting session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePause = () => {
    if (!isPaused) {
      setPausedTime(prev => prev + (Date.now() - new Date(session.inicio).getTime() - currentTime * 1000));
    }
    setIsPaused(!isPaused);
  };

  const endSession = async () => {
    if (!window.confirm('¿Deseas finalizar tu jornada laboral?')) return;

    setIsLoading(true);
    try {
      const token = window.localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/registro/salida/${user.idusuario}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSession(null);
        setCurrentTime(0);
        setPausedTime(0);
        setIsPaused(false);
      }
    } catch (err) {
      console.error('Error ending session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    window.location.href = '/';
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="text-[#9CA3AF]">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] text-[#F9FAFB]">
      <nav className="bg-[#1F2937] border-b border-[#374151] shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#3B82F6] rounded-lg flex items-center justify-center">
              <Clock size={24} />
            </div>
            <h1 className="text-xl font-bold">CLOKIFY</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2 bg-[#F87171] text-white rounded-lg hover:bg-red-700 transition"
          >
            <LogOut size={18} />
            <span>Salir</span>
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#1F2937] rounded-xl shadow-xl border border-[#374151] overflow-hidden">
            <div className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] p-6 text-white">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {user.nombre?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user.nombre}</h2>
                  <p className="text-white/80 capitalize">{user.rol}</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {!session ? (
                <div className="text-center py-12">
                  <Clock className="mx-auto text-[#9CA3AF] mb-6" size={64} />
                  <h3 className="text-xl font-semibold mb-4">No hay sesión activa</h3>
                  <p className="text-[#9CA3AF] mb-8">Inicia tu jornada laboral</p>
                  <button
                    onClick={startSession}
                    disabled={isLoading}
                    className="px-8 py-4 bg-[#34D399] hover:bg-green-600 text-white rounded-lg font-semibold transition shadow-lg disabled:opacity-50 flex items-center space-x-2 mx-auto"
                  >
                    <Play size={24} />
                    <span>{isLoading ? 'Iniciando...' : 'Iniciar Jornada'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <div className={`text-6xl font-mono font-bold mb-4 ${
                      isPaused ? 'text-[#F59E0B]' : 'text-[#3B82F6]'
                    }`}>
                      {formatTime(currentTime)}
                    </div>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      isPaused 
                        ? 'bg-[#F59E0B]/20 text-[#F59E0B]' 
                        : 'bg-[#34D399]/20 text-[#34D399]'
                    }`}>
                      {isPaused ? '⏸ Pausado' : '● En curso'}
                    </div>
                  </div>

                  <div className="bg-[#111827] rounded-lg p-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#9CA3AF] flex items-center gap-2">
                        <Calendar size={16} />
                        Inicio de jornada:
                      </span>
                      <span className="font-medium">{formatDate(session.inicio)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={togglePause}
                      disabled={isLoading}
                      className={`py-4 rounded-lg font-semibold transition shadow-md flex items-center justify-center space-x-2 ${
                        isPaused
                          ? 'bg-[#34D399] hover:bg-green-600 text-white'
                          : 'bg-[#F59E0B] hover:bg-orange-600 text-white'
                      } disabled:opacity-50`}
                    >
                      {isPaused ? (
                        <>
                          <Play size={20} />
                          <span>Reanudar</span>
                        </>
                      ) : (
                        <>
                          <Pause size={20} />
                          <span>Pausar</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={endSession}
                      disabled={isLoading}
                      className="py-4 bg-[#F87171] hover:bg-red-700 text-white rounded-lg font-semibold transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <StopCircle size={20} />
                      <span>Finalizar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSession;