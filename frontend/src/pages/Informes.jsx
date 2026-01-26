import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Download, FileSpreadsheet, Package, 
  ArrowLeftRight, AlertCircle, Filter, 
  Calendar, TrendingUp, DollarSign, Search
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function Informes() {
  // Estados para datos y UI
  const [activeTab, setActiveTab] = useState('inventario');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para filtros y búsqueda detallada
  const [filtros, setFiltros] = useState({ inicio: '', fin: '' });
  const [productos, setProductos] = useState([]);
  const [filtroProducto, setFiltroProducto] = useState('');
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    fetchData();
    cargarProductos();
  }, []);

  // Carga inicial de estadísticas generales
  const fetchData = async (inicio = '', fin = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/informes/resumen?fechaInicio=${inicio}&fechaFin=${fin}`);
      setData(res.data);
    } catch (error) {
      console.error("Error cargando informes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carga lista de productos para el buscador detallado
  const cargarProductos = async () => {
    try {
      const res = await api.get('/productos');
      setProductos(res.data);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

  // Consulta el historial específico (Pestaña Análisis)
  const consultarHistorial = async () => {
    try {
      const res = await api.get(`/informes/historial-producto?productoId=${filtroProducto}&fechaInicio=${filtros.inicio}&fechaFin=${filtros.fin}`);
      setHistorial(res.data);
    } catch (error) {
      console.error("Error cargando historial:", error);
    }
  };

  // --- FUNCIONES DE EXPORTACIÓN ---
  const exportToExcel = () => {
    const dataSource = activeTab === 'inventario' ? data.stockCritico : historial;
    const ws = XLSX.utils.json_to_sheet(dataSource);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, `Reporte_${activeTab}_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Reporte de ${activeTab.toUpperCase()}`, 14, 20);
    const tableData = activeTab === 'inventario' 
      ? data.stockCritico.map(p => [p.nombre, p.stock_actual, p.stock_minimo])
      : historial.map(h => [new Date(h.fecha).toLocaleDateString(), h.tipo, h.cantidad, h.motivo]);
    
    doc.autoTable({
      startY: 30,
      head: activeTab === 'inventario' ? [['Producto', 'Stock', 'Mínimo']] : [['Fecha', 'Tipo', 'Cant', 'Motivo']],
      body: tableData
    });
    doc.save(`Reporte_${activeTab}.pdf`);
  };

  if (loading && !data) return <div className="p-10 text-center font-black">PROCESANDO DATOS...</div>;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER PRINCIPAL */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight text-left">Informes Estratégicos</h1>
          <p className="text-slate-500 font-medium text-left">Auditoría de movimientos y estado de almacén.</p>
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <button onClick={exportToExcel} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-emerald-500 text-white px-5 py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100">
            <FileSpreadsheet className="w-5 h-5" /> Excel
          </button>
          <button onClick={exportToPDF} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
            <Download className="w-5 h-5" /> PDF
          </button>
        </div>
      </header>

      {/* FILTROS GLOBALES */}
      <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-wrap items-end gap-6 text-left">
        <div className="flex-1 min-w-[180px]">
          <label className="flex items-center gap-2 text-xs font-black text-slate-400 mb-2 uppercase ml-1"><Calendar className="w-3 h-3"/> Desde</label>
          <input type="date" className="w-full bg-slate-50 border-none rounded-xl font-bold" onChange={(e) => setFiltros({...filtros, inicio: e.target.value})} />
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="flex items-center gap-2 text-xs font-black text-slate-400 mb-2 uppercase ml-1"><Calendar className="w-3 h-3"/> Hasta</label>
          <input type="date" className="w-full bg-slate-50 border-none rounded-xl font-bold" onChange={(e) => setFiltros({...filtros, fin: e.target.value})} />
        </div>
        <button onClick={() => fetchData(filtros.inicio, filtros.fin)} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2">
          <Filter className="w-4 h-4" /> Aplicar
        </button>
      </section>

      {/* TABS */}
      <nav className="flex gap-8 border-b border-slate-200 ml-2">
        <button onClick={() => setActiveTab('inventario')} className={`pb-4 px-2 font-black text-sm uppercase transition-all relative ${activeTab === 'inventario' ? 'text-blue-600' : 'text-slate-400'}`}>
          Inventario General {activeTab === 'inventario' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full" />}
        </button>
        <button onClick={() => setActiveTab('movimientos')} className={`pb-4 px-2 font-black text-sm uppercase transition-all relative ${activeTab === 'movimientos' ? 'text-blue-600' : 'text-slate-400'}`}>
          Historial de Auditoría {activeTab === 'movimientos' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full" />}
        </button>
      </nav>

      {/* CONTENIDO DINÁMICO */}
      {activeTab === 'inventario' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 text-left">
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><TrendingUp className="text-blue-600" /> Flujo de Almacén</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.grafica}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="etiqueta" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="entradas" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Entradas" />
                  <Bar dataKey="salidas" fill="#f97316" radius={[6, 6, 0, 0]} name="Salidas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[3rem] text-white text-left shadow-xl shadow-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Valor Total Inventario</p>
              <h2 className="text-4xl font-black">${new Intl.NumberFormat('es-CO').format(data?.resumen?.valor_inventario || 0)}</h2>
            </div>
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 text-left">
              <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2"><AlertCircle className="text-orange-500" /> Stock Crítico</h3>
              <div className="space-y-4">
                {data?.stockCritico.map((item, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
                    <div><p className="font-bold text-slate-700">{item.nombre}</p><p className="text-[10px] text-slate-400 uppercase">Mínimo: {item.stock_minimo}</p></div>
                    <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg font-black text-xs">{item.stock_actual} U.</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 text-left">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[250px]">
              <label className="block text-xs font-black text-slate-400 mb-2 uppercase">Filtrar por Producto</label>
              <select className="w-full bg-slate-50 border-none rounded-xl font-bold" onChange={(e) => setFiltroProducto(e.target.value)}>
                <option value="">Todos los productos</option>
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <button onClick={consultarHistorial} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black hover:bg-slate-800 transition-all flex items-center gap-2">
              <Search className="w-4 h-4"/> Generar Reporte Detallado
            </button>
          </div>
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-5 text-xs font-black text-slate-400 uppercase">Fecha</th>
                  <th className="p-5 text-xs font-black text-slate-400 uppercase">Tipo</th>
                  <th className="p-5 text-xs font-black text-slate-400 uppercase">Cantidad</th>
                  <th className="p-5 text-xs font-black text-slate-400 uppercase">Motivo</th>
                  <th className="p-5 text-xs font-black text-slate-400 uppercase">Realizado Por</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((h, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-blue-50/20 transition-all">
                    <td className="p-5 text-sm font-bold text-slate-600">{new Date(h.fecha).toLocaleDateString()}</td>
                    <td className="p-5"><span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${h.tipo === 'entrada' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>{h.tipo}</span></td>
                    <td className="p-5 font-black text-slate-800">{h.cantidad} U.</td>
                    <td className="p-5 text-sm text-slate-500">{h.motivo}</td>
                    <td className="p-5 text-sm font-bold text-slate-700">{h.realizado_por || 'Sistema'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Informes;