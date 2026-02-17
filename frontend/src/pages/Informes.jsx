import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  FileSpreadsheet, Package, AlertCircle, Users, FileText, 
  Wind, TrendingUp, History, Search, Filter, CalendarDays, Warehouse 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { exportToPDF } from '../services/reportGenerator';
import logoEmpresa from '../assets/logoAsset.png';

function Informes() {
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reporteActual, setReporteActual] = useState([]);
  const [tipoReporte, setTipoReporte] = useState('inventario');
  const [totalInforme, setTotalInforme] = useState(0);

  // Estados para datos de filtros (Opciones de la DB)
  const [marcas, setMarcas] = useState([]);
  const [bodegas, setBodegas] = useState([]); // Ajustado: categorias -> bodegas

  // Estados para valores seleccionados
  const [filtroProducto, setFiltroProducto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroMarca, setFiltroMarca] = useState('todas');
  const [filtroBodega, setFiltroBodega] = useState('todas'); // Ajustado: filtroCategoria -> filtroBodega
  const [filtroMes, setFiltroMes] = useState('todos');

  const meses = [
    { id: '01', name: 'Enero' }, { id: '02', name: 'Febrero' }, { id: '03', name: 'Marzo' },
    { id: '04', name: 'Abril' }, { id: '05', name: 'Mayo' }, { id: '06', name: 'Junio' },
    { id: '07', name: 'Julio' }, { id: '08', name: 'Agosto' }, { id: '09', name: 'Septiembre' },
    { id: '10', name: 'Octubre' }, { id: '11', name: 'Noviembre' }, { id: '12', name: 'Diciembre' }
  ];

  useEffect(() => {
    fetchInitialData();
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const [mRes, bRes] = await Promise.all([
        api.get('/marcas'),
        api.get('/bodegas') // Llamada ajustada al nuevo endpoint
      ]);
      setMarcas(mRes.data);
      setBodegas(bRes.data);
    } catch (error) {
      console.error("Error cargando filtros:", error);
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/informes/resumen');
      setData(res.data);
      const reportePrioritario = location.state?.tipo || 'inventario';
      generarReporte(reportePrioritario);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const generarReporte = async (tipo) => {
    setTipoReporte(tipo);
    try {
      const endpoints = {
        // Endpoint actualizado con parámetro bodega
        inventario: `/informes/inventario-completo?marca=${filtroMarca}&bodega=${filtroBodega}&mes=${filtroMes}`,
        critico: '/informes/stock-critico',
        proveedores: '/informes/proveedores',
        kardex: `/informes/kardex?producto=${filtroProducto}&tipo=${filtroTipo}`
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
    XLSX.writeFile(wb, `Aconfrios_${tipoReporte}.xlsx`);
  };

  const handleExportPDF = () => {
    if (reporteActual.length > 0) {
      const reporteFormateado = reporteActual.map(row => {
        const fila = { ...row };
        Object.keys(fila).forEach(key => {
          if (key.includes('PRECIO') || key.includes('VALOR') || key.includes('SUBTOTAL') || key.includes('HISTÓRICO')) {
            fila[key] = formatMoney(fila[key]);
          }
        });
        return fila;
      });
      exportToPDF(tipoReporte, reporteFormateado, totalInforme > 0 ? formatMoney(totalInforme) : null, logoEmpresa);
    }
  };

  if (loading && !data) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white text-[#003366]">
      <Wind className="w-12 h-12 animate-spin mb-4" />
      <span className="text-xs font-black uppercase tracking-[0.3em]">Cargando Sistema...</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 h-screen flex flex-col font-sans overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="p-3 bg-[#003366] rounded-2xl">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Centro de Reportes</h1>
          <p className="text-slate-500 text-sm">Documentos oficiales Aconfrios S.A.</p>
        </div>
      </div>

      {/* Selector de tipo de reporte */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        {[
          { id: 'inventario', label: 'Inventario General', icon: Package, activeClass: 'border-[#00529b] bg-blue-50/50 text-[#00529b]', iconClass: 'bg-[#00529b]' },
          { id: 'critico', label: 'Stock Crítico', icon: AlertCircle, activeClass: 'border-red-500 bg-red-50/50 text-red-700', iconClass: 'bg-red-500' },
          { id: 'kardex', label: 'Historial Kárdex', icon: History, activeClass: 'border-amber-500 bg-amber-50/50 text-amber-700', iconClass: 'bg-amber-500' },
          { id: 'proveedores', label: 'Proveedores', icon: Users, activeClass: 'border-emerald-500 bg-emerald-50/50 text-emerald-700', iconClass: 'bg-emerald-500' }
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

      {/* Panel Principal */}
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-2xl shadow-slate-200/50 flex flex-col flex-1 overflow-hidden mb-4">
        <div className="px-8 py-5 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 bg-white">
          <div className="flex flex-col gap-1 w-full md:w-auto">
            <h2 className="text-[10px] font-black text-[#003366] uppercase tracking-[0.2em]">Vista Previa del Documento</h2>
            
            {/* Filtros dinámicos según el reporte */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {tipoReporte === 'inventario' ? (
                <>
                  <div className="flex items-center gap-2 mr-4">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <p className="text-emerald-600 font-black text-lg">{formatMoney(totalInforme)}</p>
                  </div>
                  
                  {/* Select Marca */}
                  <div className="relative">
                    <Package className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                      className="pl-8 pr-8 py-2 bg-slate-50 border-none rounded-xl text-[10px] font-bold text-slate-600 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                      value={filtroMarca}
                      onChange={(e) => setFiltroMarca(e.target.value)}
                    >
                      <option value="todas">TODAS LAS MARCAS</option>
                      {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre.toUpperCase()}</option>)}
                    </select>
                  </div>

                  {/* Select Bodega */}
                  <div className="relative">
                    <Warehouse className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                      className="pl-8 pr-8 py-2 bg-slate-50 border-none rounded-xl text-[10px] font-bold text-slate-600 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                      value={filtroBodega}
                      onChange={(e) => setFiltroBodega(e.target.value)}
                    >
                      <option value="todas">TODAS LAS BODEGAS</option>
                      {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre.toUpperCase()}</option>)}
                    </select>
                  </div>

                  {/* Select Mes */}
                  <div className="relative">
                    <CalendarDays className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                      className="pl-8 pr-8 py-2 bg-slate-50 border-none rounded-xl text-[10px] font-bold text-slate-600 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                      value={filtroMes}
                      onChange={(e) => setFiltroMes(e.target.value)}
                    >
                      <option value="todos">CUALQUIER MES</option>
                      {meses.map(m => <option key={m.id} value={m.id}>{m.name.toUpperCase()}</option>)}
                    </select>
                  </div>

                  <button 
                    onClick={() => generarReporte('inventario')}
                    className="bg-[#003366] text-white px-4 py-2 rounded-xl text-[9px] font-black hover:bg-[#001a33] transition-all"
                  >
                    APLICAR
                  </button>
                </>
              ) : tipoReporte === 'kardex' && (
                <>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Filtrar producto..."
                      className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-[11px] focus:ring-2 focus:ring-amber-500 outline-none w-48 transition-all"
                      value={filtroProducto}
                      onChange={(e) => setFiltroProducto(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                      className="pl-9 pr-8 py-2 bg-slate-50 border-none rounded-xl text-[11px] focus:ring-2 focus:ring-amber-500 outline-none appearance-none cursor-pointer"
                      value={filtroTipo}
                      onChange={(e) => setFiltroTipo(e.target.value)}
                    >
                      <option value="todos">Todos</option>
                      <option value="entrada">Entradas</option>
                      <option value="salida">Salidas</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => generarReporte('kardex')}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold transition-colors"
                  >
                    APLICAR
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Botones Exportar */}
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={handleExportPDF} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#003366] text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-[#001a33] transition-all">
              <FileText className="w-4 h-4" /> PDF
            </button>
            <button onClick={handleExportExcel} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all">
              <FileSpreadsheet className="w-4 h-4" /> EXCEL
            </button>
          </div>
        </div>

        {/* Tabla */}
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
                    const isNumeric = key.includes('PRECIO') || key.includes('VALOR') || key.includes('CANT.') || key.includes('STOCK') || key.includes('SUBTOTAL') || key.includes('HISTÓRICO');

                    return (
                      <td
                        key={j}
                        data-label={key.replace('_', ' ')}
                        className={`px-8 py-4 text-xs transition-colors responsive-td ${
                          isMainColumn ? 'font-medium text-slate-900' : 'font-normal text-slate-500'
                        }`}
                      >
                        <span className={`${isNumeric ? 'font-mono text-slate-600' : ''}`}>
                          {(key.includes('PRECIO') || key.includes('VALOR') || key.includes('SUBTOTAL') || key.includes('HISTÓRICO')) ? formatMoney(val) : val}
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
    </div>
  );
}

export default Informes;