import { useState, useEffect } from 'react';
import { informesAPI } from '../services/api'; // Asegúrate de agregarla a api.js
import { BarChart3, TrendingUp, AlertTriangle, DollarSign, Package, Download } from 'lucide-react';

function Informes() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInformes = async () => {
      try {
        const res = await informesAPI.getResumen();
        setData(res.data);
      } catch (error) {
        console.error("Error cargando informes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInformes();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold">Generando reportes...</div>;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Panel de Informes</h1>
          <p className="text-slate-500 font-medium">Análisis de rendimiento y stock del almacén.</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
          <Download className="w-4 h-4" /> Exportar PDF
        </button>
      </header>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-50">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <Package className="w-6 h-6" />
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Stock Total</p>
          <h3 className="text-3xl font-black text-slate-900">{data?.resumen?.stock_total || 0} u.</h3>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-50">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Valorización</p>
          <h3 className="text-3xl font-black text-slate-900">
            ${new Intl.NumberFormat('es-CO').format(data?.resumen?.valor_inventario || 0)}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-50">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Stock Crítico</p>
          <h3 className="text-3xl font-black text-slate-900">{data?.stockCritico?.length || 0} Productos</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lista de Alerta */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50">
          <h4 className="text-xl font-black mb-6 flex items-center gap-2">
            <TrendingUp className="text-blue-600" /> Reposición Urgente
          </h4>
          <div className="space-y-4">
            {data?.stockCritico.map((prod, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div>
                  <p className="font-bold text-slate-800">{prod.nombre}</p>
                  <p className="text-xs text-slate-400">Mínimo requerido: {prod.stock_minimo}</p>
                </div>
                <span className="px-4 py-1 bg-red-100 text-red-600 rounded-full font-black text-sm">
                  {prod.stock_actual} en stock
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfica Simple (Visualización de ejemplo con Tailwind) */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
            <h4 className="text-xl font-black mb-6">Actividad Mensual</h4>
            <div className="flex items-end justify-between h-48 gap-4">
                {data?.grafica.map((item, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 gap-2">
                        <div className="w-full flex flex-col justify-end gap-1 h-32">
                            <div className="bg-blue-500 rounded-t-lg transition-all hover:bg-blue-400" style={{ height: `${(item.entradas * 100) / 20}%` }}></div>
                            <div className="bg-orange-500 rounded-t-lg transition-all hover:bg-orange-400" style={{ height: `${(item.salidas * 100) / 20}%` }}></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.mes}</span>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex gap-4 text-xs font-bold">
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Entradas</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500 rounded-sm"></div> Salidas</div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Informes;