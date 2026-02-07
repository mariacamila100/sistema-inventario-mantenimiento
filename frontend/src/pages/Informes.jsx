import { useState, useEffect } from 'react';
import api from '../services/api';
import { FileSpreadsheet, Package, AlertCircle, Users, FileText, Wind, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import { exportToPDF } from '../services/reportGenerator'; 
import logoEmpresa from '../assets/logoAsset.png'; 

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
    } catch (error) { console.error("Error:", error); } 
    finally { setLoading(false); }
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
    } catch (error) { setReporteActual([]); }
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(value);
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reporteActual);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Informe Aconfrios");
    XLSX.writeFile(wb, `Aconfrios_Reporte_${tipoReporte}.xlsx`);
  };

  const handleExportPDF = () => {
    if (reporteActual.length > 0) {
      const reporteFormateado = reporteActual.map(row => {
        const fila = { ...row };
        Object.keys(fila).forEach(key => {
          if (key.includes('PRECIO') || key.includes('VALOR')) {
            fila[key] = formatMoney(fila[key]);
          }
        });
        return fila;
      });

      const totalFormateado = formatMoney(totalInforme);
      // PASAMOS logoEmpresa COMO CUARTO PARÁMETRO
      exportToPDF(tipoReporte, reporteFormateado, totalFormateado, logoEmpresa);
    }
  };

  if (loading && !data) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white text-[#003366]">
      <Wind className="w-12 h-12 animate-spin mb-4" />
      <span className="text-xs font-black uppercase tracking-[0.3em]">Cargando Sistema de Informes...</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 h-[calc(100vh-40px)] flex flex-col font-sans">
      
      {/* Header Estilo Aconfrios */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-[#003366] rounded-2xl">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Centro de Reportes</h1>
          <p className="text-slate-500 text-sm">Generación de documentos oficiales Aconfrios S.A.</p>
        </div>
      </div>

      {/* Botones de Selección de Reporte */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: 'inventario', label: 'Inventario General', icon: Package, activeClass: 'border-[#00529b] bg-blue-50/50 text-[#00529b]', iconClass: 'bg-[#00529b]' },
          { id: 'critico', label: 'Stock Crítico', icon: AlertCircle, activeClass: 'border-red-500 bg-red-50/50 text-red-700', iconClass: 'bg-red-500' },
          { id: 'proveedores', label: 'Directorio Proveedores', icon: Users, activeClass: 'border-emerald-500 bg-emerald-50/50 text-emerald-700', iconClass: 'bg-emerald-500' }
        ].map((btn) => (
          <button key={btn.id} onClick={() => generarReporte(btn.id)}
            className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between group shadow-sm ${
              tipoReporte === btn.id ? btn.activeClass : 'bg-white border-slate-100 hover:border-slate-300 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-colors ${
                tipoReporte === btn.id ? 'text-white ' + btn.iconClass : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
              }`}>
                <btn.icon className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm uppercase tracking-tight">{btn.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Contenedor de Tabla */}
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-2xl shadow-slate-200/50 flex flex-col flex-1 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-[10px] font-black text-[#003366] uppercase tracking-[0.2em]">Vista Previa del Documento</h2>
              {tipoReporte === 'inventario' && (
                <div className="flex items-center gap-2 mt-1">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <p className="text-emerald-600 font-black text-lg">{formatMoney(totalInforme)}</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={handleExportPDF} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#003366] text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-[#001a33] transition-all shadow-lg shadow-blue-900/20">
              <FileText className="w-4 h-4" /> EXPORTAR PDF
            </button>
            <button onClick={handleExportExcel} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/10">
              <FileSpreadsheet className="w-4 h-4" /> EXCEL
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0">
  <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-10">
    <tr>
      {reporteActual.length > 0 && Object.keys(reporteActual[0]).map(key => (
        <th key={key} className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">
          {key.replace('_', ' ')}
        </th>
      ))}
    </tr>
  </thead>
  <tbody className="divide-y divide-slate-50">
    {reporteActual.map((row, i) => (
      <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
        {Object.entries(row).map(([key, val], j) => {
          // Lógica de estilo selectivo
          const isMainColumn = key.includes('PRODUCTO') || key.includes('NOMBRE');
          const isNumeric = key.includes('PRECIO') || key.includes('VALOR') || key.includes('CANTIDAD') || key.includes('STOCK');

          return (
            <td key={j} className={`px-8 py-4 text-xs transition-colors ${
              isMainColumn 
                ? 'font-medium text-slate-900' // Resalte sutil para el nombre
                : 'font-normal text-slate-500' // Texto base para lo demás
            }`}>
              <span className={`${isNumeric ? 'font-mono text-slate-600' : ''}`}>
                {key.includes('PRECIO') || key.includes('VALOR') ? formatMoney(val) : val}
              </span>
            </td>
          );
        })}
      </tr>
    ))}
  </tbody>
</table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; border: 2px solid #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #00529b; }
      ` }} />
    </div>
  );
}

export default Informes;