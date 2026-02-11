import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // IMPORTANTE: Para recibir el estado
import api from '../services/api';
import { FileSpreadsheet, Package, AlertCircle, Users, FileText, Wind, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import { exportToPDF } from '../services/reportGenerator';
import logoEmpresa from '../assets/logoAsset.png';

function Informes() {
  const location = useLocation(); // Inicializamos para leer si venimos del Home
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reporteActual, setReporteActual] = useState([]);
  const [tipoReporte, setTipoReporte] = useState('inventario');
  const [totalInforme, setTotalInforme] = useState(0);

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/informes/resumen');
      setData(res.data);
      
      // LÓGICA DE REDIRECCIÓN: 
      // Si recibimos 'tipo' desde el estado de navegación (Home), usamos ese,
      // de lo contrario, por defecto es 'inventario'.
      const reportePrioritario = location.state?.tipo || 'inventario';
      generarReporte(reportePrioritario);
      
    } catch (error) { 
      console.error("Error al cargar datos iniciales:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  const generarReporte = async (tipo) => {
    setTipoReporte(tipo); // Esto ilumina el botón correspondiente (Azul, Rojo o Verde)
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
      console.error("Error al generar reporte:", error);
      setReporteActual([]); 
    }
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
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 h-screen flex flex-col font-sans overflow-hidden">

      <div className="flex items-center gap-3 shrink-0">
        <div className="p-3 bg-[#003366] rounded-2xl">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Centro de Reportes</h1>
          <p className="text-slate-500 text-sm">Documentos oficiales Aconfrios S.A.</p>
        </div>
      </div>

      {/* Selectores de Reporte */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        {[
          { id: 'inventario', label: 'Inventario General', icon: Package, activeClass: 'border-[#00529b] bg-blue-50/50 text-[#00529b]', iconClass: 'bg-[#00529b]' },
          { id: 'critico', label: 'Stock Crítico', icon: AlertCircle, activeClass: 'border-red-500 bg-red-50/50 text-red-700', iconClass: 'bg-red-500' },
          { id: 'proveedores', label: 'Directorio Proveedores', icon: Users, activeClass: 'border-emerald-500 bg-emerald-50/50 text-emerald-700', iconClass: 'bg-emerald-500' }
        ].map((btn) => (
          <button 
            key={btn.id} 
            onClick={() => generarReporte(btn.id)}
            className={`p-4 md:p-6 rounded-3xl border-2 transition-all flex items-center justify-between group shadow-sm ${
              tipoReporte === btn.id ? btn.activeClass : 'bg-white border-slate-100 hover:border-slate-300 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-colors ${
                tipoReporte === btn.id ? 'text-white ' + btn.iconClass : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
              }`}>
                <btn.icon className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs md:text-sm uppercase tracking-tight">{btn.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Contenedor de Tabla */}
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-2xl shadow-slate-200/50 flex flex-col flex-1 overflow-hidden mb-4">
        <div className="px-8 py-5 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 bg-white">
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
            <button onClick={handleExportPDF} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#003366] text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-[#001a33] transition-all">
              <FileText className="w-4 h-4" /> PDF
            </button>
            <button onClick={handleExportExcel} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all">
              <FileSpreadsheet className="w-4 h-4" /> EXCEL
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-auto custom-scrollbar bg-white">
          <table className="w-full text-left border-separate border-spacing-0 table-responsive">
            <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-10 hidden md:table-header-group">
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
                <tr key={i} className="group hover:bg-slate-50/50 transition-colors responsive-tr">
                  {Object.entries(row).map(([key, val], j) => {
                    const isMainColumn = key.includes('PRODUCTO') || key.includes('NOMBRE');
                    const isNumeric = key.includes('PRECIO') || key.includes('VALOR') || key.includes('CANTIDAD') || key.includes('STOCK');

                    return (
                      <td
                        key={j}
                        data-label={key.replace('_', ' ')}
                        className={`px-8 py-4 text-xs transition-colors responsive-td ${
                          isMainColumn ? 'font-medium text-slate-900' : 'font-normal text-slate-500'
                        }`}
                      >
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
          {reporteActual.length === 0 && (
              <div className="p-20 text-center text-slate-400">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-medium">No hay datos disponibles para este reporte.</p>
              </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        @media (max-width: 768px) {
          .table-responsive thead { display: none; }
          .responsive-tr {
            display: block;
            border: 1px solid #f1f5f9;
            margin: 1rem;
            border-radius: 1.5rem;
            padding: 0.5rem;
            background: white;
          }
          .responsive-td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.6rem 1rem !important;
            border-bottom: 1px solid #f8fafc !important;
          }
          .responsive-td:last-child { border-bottom: none !important; }
          .responsive-td::before {
            content: attr(data-label);
            font-weight: 800;
            font-size: 0.65rem;
            text-transform: uppercase;
            color: #94a3b8;
          }
        }
      ` }} />
    </div>
  );
}

export default Informes;