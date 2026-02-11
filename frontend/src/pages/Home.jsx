import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importamos el hook de navegación
import { productosAPI } from '../services/api';
import { Package, AlertTriangle, TrendingUp, Boxes, ArrowRight, Settings } from 'lucide-react';

function Home() {
  const navigate = useNavigate(); // 2. Inicializamos el hook
  const [stats, setStats] = useState({
    totalProductos: 0,
    bajosStock: 0,
    valorTotal: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await productosAPI.getAll();
      const productos = response.data;
      
      const totalProductos = productos.length;
      const bajosStock = productos.filter(p => p.alerta_stock === 'BAJO STOCK').length;
      const valorTotal = productos.reduce((sum, p) => sum + (p.stock_actual * p.precio_unitario), 0);
      
      setStats({ totalProductos, bajosStock, valorTotal });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-10">
      {/* Header con Bienvenida */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Panel de Control</h1>
          <p className="text-slate-500 mt-1 text-sm lg:text-base">Gestión de inventario electromecánico en tiempo real.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-3 lg:px-4 py-2 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all shadow-sm">
            <Settings className="w-4 h-4" /> Configuración
          </button>
        </div>
      </header>
      
      {/* Tarjetas - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">
        {/* Tarjeta Total */}
        <div className="relative group overflow-hidden bg-[#1e293b] rounded-2xl lg:rounded-3xl p-6 lg:p-8 text-white shadow-xl shadow-slate-200 transition-transform hover:-translate-y-1">
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-slate-300 font-medium mb-1 text-sm uppercase tracking-wider">Stock General</p>
              <h3 className="text-4xl lg:text-5xl font-bold">{stats.totalProductos}</h3>
              <p className="mt-3 lg:mt-4 text-xs lg:text-sm text-slate-400 flex items-center gap-1 font-semibold uppercase tracking-widest">
                Ítems registrados <ArrowRight className="w-3 h-3 text-blue-400" />
              </p>
            </div>
            <div className="bg-white/5 p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-white/10 backdrop-blur-md">
              <Boxes className="w-8 lg:w-10 h-8 lg:h-10 text-blue-400" />
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>
        
        {/* Tarjeta Alertas - AHORA CLICABLE */}
        <div 
          onClick={() => navigate('/informes', { state: { tipo: 'critico' } })} // Enviamos el estado
          className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-sm flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md hover:border-red-100 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="bg-red-50 p-3 lg:p-4 rounded-xl lg:rounded-2xl text-red-500 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-8 lg:w-10 h-8 lg:h-10" />
            </div>
            {stats.bajosStock > 0 && (
              <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1 rounded-lg animate-pulse uppercase tracking-tighter">
                Acción Requerida
              </span>
            )}
          </div>
          <div className="mt-4 lg:mt-6">
            <h3 className="text-3xl lg:text-4xl font-bold text-slate-800">{stats.bajosStock}</h3>
            <p className="text-slate-500 font-bold text-xs lg:text-sm uppercase tracking-widest flex items-center gap-2">
              Stock Crítico <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </div>
        </div>
        
        {/* Tarjeta Valor */}
        <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="bg-emerald-50 p-3 lg:p-4 rounded-xl lg:rounded-2xl text-emerald-500">
              <TrendingUp className="w-8 lg:w-10 h-8 lg:h-10" />
            </div>
          </div>
          <div className="mt-4 lg:mt-6">
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
              ${stats.valorTotal.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
            </h3>
            <p className="text-slate-500 font-bold text-xs lg:text-sm uppercase tracking-widest">Valorización Total</p>
          </div>
        </div>
      </div>
      
      {/* Sección de Acceso Rápido */}
      <div className="bg-white border border-slate-100 rounded-2xl lg:rounded-[2.5rem] p-6 lg:p-10 relative overflow-hidden shadow-sm">
        <div className="relative z-10 grid md:grid-cols-2 gap-6 lg:gap-10 items-center text-slate-800">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black mb-3 lg:mb-4">Guía de Operaciones</h2>
            <p className="text-slate-500 text-sm lg:text-lg mb-6 lg:mb-8 leading-relaxed">
              Mantén el control total de los repuestos y materiales de mantenimiento. Revisa las alertas para evitar paradas no programadas.
            </p>
            <div className="flex flex-wrap gap-3 lg:gap-4">
              <div className="flex items-center gap-2 lg:gap-3 bg-slate-50 border border-slate-100 px-3 lg:px-5 py-2 lg:py-3 rounded-xl">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs lg:text-sm font-bold text-slate-600 uppercase tracking-tight">Gestión</span>
              </div>
              <div className="flex items-center gap-2 lg:gap-3 bg-slate-50 border border-slate-100 px-3 lg:px-5 py-2 lg:py-3 rounded-xl">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs lg:text-sm font-bold text-slate-600 uppercase tracking-tight">Alertas</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex justify-end opacity-20">
            <Package className="w-32 lg:w-48 h-32 lg:h-48 text-slate-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;