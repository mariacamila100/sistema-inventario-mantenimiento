import { useState } from 'react';
import { UserPlus, User, Mail, Lock, ShieldCheck, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function Registro() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para el ojito
  
  const [formData, setFormData] = useState({
    username: '',
    nombre_completo: '',
    email: '',
    password: '',
    rol_id: '2'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl shadow-blue-100 p-8 md:p-12 border border-slate-100 animate-in fade-in zoom-in duration-300">
        
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-blue-600 rounded-3xl text-white mb-4 shadow-lg shadow-blue-200">
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Crear Cuenta</h1>
          <p className="text-slate-500 font-medium">Únete al sistema de inventario</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre Completo */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              required
              type="text" 
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
              placeholder="Nombre Completo"
              onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})}
            />
          </div>

          {/* Username */}
          <div className="relative">
            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              required
              type="text" 
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300 font-bold text-blue-600"
              placeholder="Nombre de usuario"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              required
              type="email" 
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
              placeholder="Correo electrónico"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {/* Password con funcionalidad de "Ojito" */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              required
              type={showPassword ? "text" : "password"} 
              className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
              placeholder="Contraseña"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98] mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Registrarme"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <p className="text-slate-500 text-sm font-medium mb-4">¿Ya tienes una cuenta?</p>
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Volver al Login
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Registro;