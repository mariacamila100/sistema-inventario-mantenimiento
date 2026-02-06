import { useState } from 'react';
import { LogIn, User, Lock, Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para el ojito
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await authAPI.login(formData);
      const { token, user } = response.data;
      onLoginSuccess(token, user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl shadow-blue-100 p-8 md:p-12 border border-slate-100 animate-in fade-in zoom-in duration-300">
        
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-blue-600 rounded-3xl text-white mb-4 shadow-lg shadow-blue-200">
            <LogIn className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bienvenido</h1>
          <p className="text-slate-500 font-medium">Gestión de Inventario & Mantenimiento</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2 animate-shake">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Usuario</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                required
                type="text" 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                placeholder="Nombre de usuario"
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                required
                type={showPassword ? "text" : "password"} 
                className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              {/* Botón del ojito */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar al Sistema"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <p className="text-slate-500 text-sm font-medium mb-4">¿Aún no tienes una cuenta?</p>
          <Link 
            to="/registro" 
            className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors group"
          >
            <div className="p-2 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
              <UserPlus className="w-4 h-4" />
            </div>
            Registrarse ahora
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Login;