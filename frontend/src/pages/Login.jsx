import { useState } from 'react';
import { User, Lock, Loader2, Eye, EyeOff, Wind, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setError('Credenciales incorrectas. Acceso denegado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* CAMBIO CLAVE: Quitamos h-screen/w-screen. 
       Usamos flex-1 para que ocupe todo el espacio disponible que App.jsx le entrega.
    */
    <div className="flex flex-1 min-h-screen bg-white font-sans text-slate-800 overflow-hidden">

      {/* SECCIÓN IZQUIERDA: Branding Inmersivo (Oculto en móviles) */}
      <div className="hidden lg:flex lg:w-3/5 relative bg-[#003366] items-center justify-center p-20">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1581094288338-2314dddb7edd?auto=format&fit=crop&q=80&w=2000"
            alt="Refrigeración Industrial"
            className="h-full w-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#00529b] via-[#003366]/90 to-transparent" />
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
            Gestión Integral de Inventarios y Climatización
          </h2>

          <div className="grid grid-cols-2 gap-6 mt-12">
            {[
              "Especialistas en VRF y Chiller",
              "Distribuidor Autorizado LG",
              "Soporte Técnico Profesional",
              "Control de Activos Industrial"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2 text-blue-100/80">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-10 left-10 z-10">
          <div className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
            <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold">
              Centro de Servicio Especializado LG Electronics
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: Formulario */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-white relative">
        <div className="max-w-md w-full mx-auto py-12">
          <div className="mb-12">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <Wind className="w-8 h-8 text-[#00529b]" />
              <span className="text-2xl font-black text-[#003366] tracking-tighter uppercase">Aconfrios</span>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bienvenido</h3>
            <p className="text-slate-500 mt-2 font-medium">Inicie sesión en el panel administrativo</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold animate-in fade-in slide-in-from-left-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuario</label>
              <div className="relative group">
                <input
                  required
                  type="text"
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-[#00529b] focus:ring-0 outline-none transition-all text-slate-700 font-medium"
                  placeholder="Ingrese su usuario"
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00529b] transition-colors w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña de Acceso</label>
              <div className="relative group">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-[#00529b] focus:ring-0 outline-none transition-all text-slate-700 font-medium"
                  placeholder="••••••••"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              className="w-full py-4 bg-[#00529b] hover:bg-[#003366] text-white font-bold rounded-2xl shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-3 active:scale-[0.95] disabled:opacity-70 text-lg uppercase tracking-tight"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Validando...</span>
                </>
              ) : (
                "Entrar al Almacén"
              )}
            </button>
            {/* Botón de Registro */}
            <div className="mt-8 text-center">
              <p className="text-slate-500 font-medium">
                ¿No tienes una cuenta?{' '}
                <button
                  onClick={() => navigate('/registro')}
                  className="text-[#00529b] font-bold hover:underline decoration-2 underline-offset-4 transition-all"
                >
                  Registrarse
                </button>
              </p>
            </div>
          </form>

          <div className="mt-16">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4 text-center lg:text-left border-b border-slate-100 pb-2">Aliados Estratégicos</p>
            <div className="flex flex-wrap justify-center lg:justify-between gap-4 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="font-black text-xs">LG</span>
              <span className="font-black text-xs">YORK</span>
              <span className="font-black text-xs">SAMSUNG</span>
              <span className="font-black text-xs">TRANE</span>
              <span className="font-black text-xs">TECAM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;