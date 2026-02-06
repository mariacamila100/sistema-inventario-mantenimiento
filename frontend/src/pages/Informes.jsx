import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FileSpreadsheet, Package, AlertCircle, 
  Users
} from 'lucide-react';
import * as XLSX from 'xlsx';

function Informes() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reporteActual, setReporteActual] = useState([]);
  const [tipoReporte, setTipoReporte] = useState('inventario');
  const [totalInforme, setTotalInforme] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/informes/resumen');
      setData(res.data);
      generarReporte('inventario');
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const generarReporte = async (tipo) => {
    setTipoReporte(tipo);
    try {
      const endpoints = {
        inventario: '/informes/inventario-completo',
        critico: '/informes/stock-critico',
        proveedores: '/informes/proveedores'
      };
      const res = await api.get(endpoints[tipo]);
      
      if (tipo === 'inventario') {
        setReporteActual(res.data.detalles || []);
        setTotalInforme(res.data.sumatoriaTotal || 0);
      } else {
        setReporteActual(res.data || []);
        setTotalInforme(0);
      }
    } catch (error) {
      console.error("Error:", error);
      setReporteActual([]);
    }
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const exportarExcel = () => {
    const datosParaExportar = [...reporteActual];

    if (tipoReporte === 'inventario' && datosParaExportar.length > 0) {
      const ultimaFila = {};
      const llaves = Object.keys(datosParaExportar[0]);
      
      llaves.forEach(key => ultimaFila[key] = "");
      
      // Asignamos el texto y el valor en las últimas dos posiciones del Excel
      ultimaFila[llaves[llaves.length - 2]] = "Total General Valorizado:";
      ultimaFila[llaves[llaves.length - 1]] = totalInforme;
      
      datosParaExportar.push(ultimaFila);
    }

    const ws = XLSX.utils.json_to_sheet(datosParaExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Informe");
    XLSX.writeFile(wb, `Reporte_${tipoReporte}.xlsx`);
  };

  if (loading && !data) return (
    <div className="h-screen flex items-center justify-center bg-white text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">
      Cargando Informes...
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 h-[calc(100vh-40px)] flex flex-col">
      
      {/* SELECTORES CON COLORES DINÁMICOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: 'inventario', label: 'Inventario Completo', icon: Package, activeClass: 'border-blue-500 bg-blue-50/50 text-blue-700', iconClass: 'bg-blue-500' },
          { id: 'critico', label: 'Stock Bajo Mínimo', icon: AlertCircle, activeClass: 'border-orange-500 bg-orange-50/50 text-orange-700', iconClass: 'bg-orange-500' },
          { id: 'proveedores', label: 'Lista Proveedores', icon: Users, activeClass: 'border-emerald-500 bg-emerald-50/50 text-emerald-700', iconClass: 'bg-emerald-500' }
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => generarReporte(btn.id)}
            className={`p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group shadow-sm ${
              tipoReporte === btn.id 
              ? btn.activeClass 
              : 'bg-white border-transparent hover:border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl transition-colors ${
                tipoReporte === btn.id ? 'text-white ' + btn.iconClass : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
              }`}>
                <btn.icon className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm tracking-tight">{btn.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* VISTA DE DATOS */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-md">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Detalle del Informe</h2>
          <button 
            onClick={exportarExcel} 
            className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
          >
            <FileSpreadsheet className="w-4 h-4" /> Exportar a Excel
          </button>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar relative">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <tr>
                {reporteActual.length > 0 && Object.keys(reporteActual[0]).map(key => (
                  <th key={key} className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {reporteActual.map((row, i) => (
                <tr key={i} className="group hover:bg-slate-50/30 transition-colors">
                  {Object.entries(row).map(([key, val], j) => (
                    <td key={j} className={`px-8 py-5 text-sm ${key === 'PRODUCTO' || key === 'NOMBRE' ? 'font-bold text-slate-700' : 'text-slate-500'}`}>
                      {key.includes('PRECIO') || key.includes('VALOR') ? formatMoney(val) : val}
                    </td>
                  ))}
                </tr>
              ))}

              {/* FILA DE TOTAL SOBRIA (Negro/Gris) */}
              {tipoReporte === 'inventario' && reporteActual.length > 0 && (
                <tr className="bg-slate-50/80 border-t-2 border-slate-200">
                  <td colSpan={Object.keys(reporteActual[0]).length - 1} className="px-8 py-8 text-right">
                    <span className="text-sm font-medium text-slate-500">Total General Valorizado:</span>
                  </td>
                  <td className="px-8 py-8">
                    <span className="text-xl font-black text-slate-900">{formatMoney(totalInforme)}</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
}

export default Informes;