import { useState, useEffect, useCallback, useMemo } from 'react';
import { movimientosAPI, productosAPI, proveedoresAPI } from '../services/api';
import { 
  Plus, ArrowUp, ArrowDown, Search, X, 
  CheckCircle2, AlertCircle, Loader2, 
  ChevronLeft, ChevronRight, Calendar, ChevronDown,
  FileText
} from 'lucide-react';

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = type === 'success' 
    ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
    : "bg-red-50 border-red-100 text-red-600";

  return (
    <div className={`fixed bottom-5 right-5 left-5 md:left-auto flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl z-[150] animate-in slide-in-from-bottom-5 ${styles}`}>
      {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="font-bold text-sm flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4" /></button>
    </div>
  );
};

function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState(null);

  const [searchProduct, setSearchProduct] = useState('');
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const [formData, setFormData] = useState({
    producto_id: '',
    tipo: 'entrada',
    cantidad: 1,
    motivo: '',
    observaciones: '',
    numero_documento: '',
    proveedor_id: ''
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [movRes, prodRes, provRes] = await Promise.all([
        movimientosAPI.getAll(),
        productosAPI.getAll(),
        proveedoresAPI.getAll()
      ]);
      setMovimientos(movRes.data);
      setProductos(prodRes.data);
      setProveedores(provRes.data);
    } catch (error) {
      setNotification({ message: 'Error al cargar los datos', type: 'error' });
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = movimientos.filter(m =>
    m.producto_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.motivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.numero_documento?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = useMemo(() => {
    return productos.filter(p => 
      p.nombre.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(searchProduct.toLowerCase())
    );
  }, [productos, searchProduct]);

  // Lógica de Paginación
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación rápida de UX antes de enviar al servidor
    const productoSeleccionado = productos.find(p => p.id === Number(formData.producto_id));
    if (formData.tipo === 'salida' && productoSeleccionado && Number(formData.cantidad) > productoSeleccionado.stock_actual) {
      setNotification({ 
        message: `Stock insuficiente. Disponible: ${productoSeleccionado.stock_actual}`, 
        type: 'error' 
      });
      return;
    }

    try {
      await movimientosAPI.create({
        ...formData,
        producto_id: Number(formData.producto_id),
        cantidad: Number(formData.cantidad),
        proveedor_id: formData.proveedor_id ? Number(formData.proveedor_id) : null
      });
      setNotification({ message: 'Movimiento registrado con éxito', type: 'success' });
      loadData();
      closeModal();
    } catch (error) {
      setNotification({ 
        message: error.response?.data?.error || 'Error al registrar', 
        type: 'error' 
      });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsSelectOpen(false);
    setSearchProduct('');
    setFormData({
      producto_id: '', tipo: 'entrada', cantidad: 1,
      motivo: '', observaciones: '', numero_documento: '', proveedor_id: ''
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Movimientos</h1>
          <p className="text-slate-500 font-medium">Historial detallado de inventario.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Nuevo Registro
        </button>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar movimientos..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
        />
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-2" />
            <span className="text-slate-600 font-bold">Cargando datos...</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Fecha</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Detalle</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Tipo</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Cantidad</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentItems.length > 0 ? (
                currentItems.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Calendar className="w-4 h-4 text-slate-300" />
                        {new Date(mov.fecha).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-500 uppercase">{mov.producto_nombre}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <FileText className="w-3 h-3 text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                            {mov.numero_documento || mov.motivo}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        mov.tipo === 'entrada' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {mov.tipo === 'entrada' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>}
                        {mov.tipo}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center text-sm font-normal text-slate-700">{mov.cantidad}</td>
                    <td className="px-8 py-5 text-right text-[11px] font-normal text-slate-600 uppercase">
                      {mov.username || 'Admin'}
                    </td>
                  </tr>
                ))
              ) : (
                !loading && (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-medium">
                      No hay movimientos registrados.
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 font-medium">
              Mostrando <span className="text-slate-900 font-bold">{indexOfFirstItem + 1}</span> a <span className="text-slate-900 font-bold">{Math.min(indexOfLastItem, filtered.length)}</span> de {filtered.length} movimientos
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-100 transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                      currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border border-slate-200 text-slate-400 hover:border-blue-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-100 transition-all shadow-sm"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 w-full max-w-2xl shadow-2xl animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">Nuevo Movimiento</h2>
              <button onClick={closeModal} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-6 h-6"/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 space-y-2 relative">
                <label className="text-sm font-bold text-slate-700 ml-1">Producto *</label>
                <div 
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 flex justify-between items-center cursor-pointer bg-slate-50 hover:border-blue-300 transition-all"
                >
                  <span className={formData.producto_id ? "text-slate-900 font-bold" : "text-slate-400"}>
                    {formData.producto_id ? productos.find(p => p.id === Number(formData.producto_id))?.nombre : "Seleccionar producto..."}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isSelectOpen ? 'rotate-180' : ''}`} />
                </div>

                {isSelectOpen && (
                  <div className="absolute w-full mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl z-[130] overflow-hidden">
                    <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="Filtrar por nombre..."
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none"
                        value={searchProduct}
                        onChange={(e) => setSearchProduct(e.target.value)}
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredProducts.map(prod => (
                        <div 
                          key={prod.id}
                          onClick={() => {
                            setFormData({...formData, producto_id: prod.id});
                            setIsSelectOpen(false);
                            setSearchProduct('');
                          }}
                          className="px-4 py-3 hover:bg-blue-600 hover:text-white cursor-pointer group transition-colors"
                        >
                          <p className="font-bold text-sm">{prod.nombre}</p>
                          <p className="text-[10px] uppercase opacity-70">Stock: {prod.stock_actual}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Tipo</label>
                <select value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})} className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold bg-white outline-none focus:ring-4 focus:ring-blue-500/10">
                  <option value="entrada">🟢 Entrada</option>
                  <option value="salida">🔴 Salida</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Cantidad *</label>
                <input type="number" required min="1" value={formData.cantidad} onChange={(e) => setFormData({...formData, cantidad: e.target.value})} className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold outline-none focus:ring-4 focus:ring-blue-500/10" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">N° Documento</label>
                <input type="text" value={formData.numero_documento} onChange={(e) => setFormData({...formData, numero_documento: e.target.value})} placeholder="Ej: FAC-101" className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Proveedor</label>
                <select value={formData.proveedor_id} onChange={(e) => setFormData({...formData, proveedor_id: e.target.value})} className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-4 focus:ring-blue-500/10">
                  <option value="">No aplica</option>
                  {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Motivo *</label>
                <input type="text" required value={formData.motivo} onChange={(e) => setFormData({...formData, motivo: e.target.value})} placeholder="Ej: Compra de mercadería" className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10" />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Observaciones</label>
                <textarea rows="2" value={formData.observaciones} onChange={(e) => setFormData({...formData, observaciones: e.target.value})} className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none resize-none focus:ring-4 focus:ring-blue-500/10"></textarea>
              </div>

              <button type="submit" className="md:col-span-2 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-[0.98]">
                REGISTRAR MOVIMIENTO
              </button>
            </form>
          </div>
        </div>
      )}

      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
    </div>
  );
}

export default Movimientos;