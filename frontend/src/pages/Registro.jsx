import { useState } from 'react';
import { UserPlus, User, Mail, Lock, ShieldCheck, Loader2, ArrowLeft, Eye, EyeOff, Wind, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

function Registro() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
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
    <div className="flex flex-1 min-h-screen bg-white font-sans text-slate-800 overflow-hidden">
      
      {/* SECCIÓN IZQUIERDA: Branding Inmersivo (Igual al Login para consistencia) */}
      <div className="hidden lg:flex lg:w-3/5 relative bg-[#003366] items-center justify-center p-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=2000" 
            alt="Ingeniería Industrial" 
            className="h-full w-full object-cover opacity-20 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#00529b] via-[#003366]/95 to-transparent" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Wind className="w-12 h-12 text-blue-300" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase">Aconfrios</h1>
              <p className="text-blue-200 text-lg italic font-light tracking-wide">"Confort para la vida"</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Únete a nuestro equipo técnico y administrativo
          </h2>

          <div className="space-y-4 mt-8">
            {[
              "Acceso al control de stock en tiempo real",
              "Registro de movimientos de entrada/salida",
              "Gestión de proveedores y categorías",
              "Reportes detallados de inventario"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-blue-100/90">
                <CheckCircle2 className="w-6 h-6 text-blue-400" />
                <span className="text-lg font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: Formulario de Registro */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-white relative">
        <div className="max-w-md w-full mx-auto py-10">
          
          <div className="mb-8">
            <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#00529b] font-bold text-xs uppercase tracking-widest transition-colors mb-6 group">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Volver al inicio
            </Link>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Nueva Cuenta</h3>
            <p className="text-slate-500 mt-2 font-medium">Complete los datos para el registro técnico</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold animate-in fade-in slide-in-from-left-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre Completo */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre y Apellido</label>
              <div className="relative group">
                <input 
                  required
                  type="text" 
                  className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-[#00529b] focus:ring-0 outline-none transition-all text-slate-700 font-medium"
                  placeholder="Ej: Juan Pérez"
                  onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})}
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00529b] transition-colors w-5 h-5" />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID de Usuario</label>
              <div className="relative group">
                <input 
                  required
                  type="text" 
                  className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-[#00529b] focus:ring-0 outline-none transition-all text-[#00529b] font-bold"
                  placeholder="usuario_tecnico"
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
                <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00529b] transition-colors w-5 h-5" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Corporativo</label>
              <div className="relative group">
                <input 
                  required
                  type="email" 
                  className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-[#00529b] focus:ring-0 outline-none transition-all text-slate-700 font-medium"
                  placeholder="usuario@aconfrios.com"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00529b] transition-colors w-5 h-5" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña de Seguridad</label>
              <div className="relative group">
                <input 
                  required
                  type={showPassword ? "text" : "password"} 
                  className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-[#00529b] focus:ring-0 outline-none transition-all text-slate-700 font-medium"
                  placeholder="••••••••"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#00529b] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-[#00529b] hover:bg-[#003366] text-white font-bold rounded-2xl shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-3 active:scale-[0.95] disabled:opacity-70 text-lg uppercase tracking-tight mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                "Crear Cuenta Técnica"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 font-medium">
            ¿Ya tienes acceso?{' '}
            <Link 
              to="/login" 
              className="text-[#00529b] font-extrabold hover:text-[#003366] underline underline-offset-4 decoration-blue-200"
            >
              Inicia Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Registro;