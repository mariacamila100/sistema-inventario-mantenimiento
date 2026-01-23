import { useState, useEffect, useCallback } from 'react';
import { movimientosAPI, productosAPI } from '../services/api';
import { 
  Plus, ArrowUp, ArrowDown, ClipboardList, Calendar, 
  Search, X, CheckCircle2, AlertCircle, Loader2, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';

// --- COMPONENTE DE NOTIFICACIÓN ---
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
  // Estados de datos
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  
  // Estados de UI
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados de Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const [formData, setFormData] = useState({
    producto_id: '',
    tipo: 'entrada',
    cantidad: 1,
    motivo: '',
    usuario: '',
    observaciones: '',
  });

  // Carga de datos optimizada con Promise.all
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [movRes, prodRes] = await Promise.all([
        movimientosAPI.getAll(),
        productosAPI.getAll()
      ]);
      setMovimientos(movRes.data);
      setProductos(prodRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setNotification({ message: 'Error al conectar con el servidor', type: 'error' });
    } finally {
      // Un pequeño delay para que la transición no sea brusca
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Lógica de filtrado
  const filteredMovimientos = movimientos.filter(m =>
    m.producto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.usuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de paginación
  const totalPages = Math.ceil(filteredMovimientos.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMovimientos.slice(indexOfFirstItem, indexOfLastItem);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await movimientosAPI.create(formData);
      setNotification({ message: '¡Movimiento registrado correctamente!', type: 'success' });
      loadData();
      closeModal();
    } catch (error) {
      setNotification({ message: 'Error al registrar el movimiento', type: 'error' });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      producto_id: '',
      tipo: 'entrada',
      cantidad: 1,
      motivo: '',
      usuario: '',
      observaciones: '',
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      
      {/* Header adaptable */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Movimientos</h1>
          <p className="text-slate-500 font-medium">Historial de entradas y salidas de inventario.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Registrar Movimiento
        </button>
      </header>

      {/* Buscador */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por producto, código o responsable..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reiniciar a página 1 al buscar
          }}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
        />
      </div>

      {/* Contenedor de Tabla con Loading State */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative min-h-[400px]">
        
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-2" />
            <span className="text-slate-600 font-bold">Cargando movimientos...</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Fecha</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Producto</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Tipo</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Cantidad</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentItems.length > 0 ? (
                currentItems.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5 text-slate-500">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-slate-300" />
                        {new Date(mov.fecha).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                          <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{mov.producto}</div>
                          <div className="text-slate-400 text-[10px] font-mono">{mov.codigo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        mov.tipo === 'entrada' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-orange-50 text-orange-600 border-orange-100'
                      }`}>
                        {mov.tipo === 'entrada' ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                        {mov.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-black text-slate-900 text-lg">
                      {mov.cantidad}
                    </td>
                    <td className="px-8 py-5 text-slate-500 italic text-sm">
                      {mov.usuario}
                    </td>
                  </tr>
                ))
              ) : (
                !loading && (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-medium">
                      No se encontraron movimientos registrados.
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {!loading && filteredMovimientos.length > 0 && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 font-medium">
              Mostrando <span className="text-slate-900 font-bold">{indexOfFirstItem + 1}</span> a <span className="text-slate-900 font-bold">{Math.min(indexOfLastItem, filteredMovimientos.length)}</span> de {filteredMovimientos.length} registros
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                      currentPage === i + 1 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                        : 'bg-white border border-slate-200 text-slate-400 hover:border-blue-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition-all shadow-sm"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Registro */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 w-full max-w-lg shadow-2xl animate-in zoom-in duration-200 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">Nuevo Registro</h2>
              <button onClick={closeModal} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-6 h-6"/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Producto</label>
                <select
                  required
                  value={formData.producto_id}
                  onChange={(e) => setFormData({ ...formData, producto_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                >
                  <option value="">Seleccionar producto...</option>
                  {productos.map((prod) => (
                    <option key={prod.id} value={prod.id}>{prod.nombre} (Stock: {prod.stock_actual})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Tipo</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                  >
                    <option value="entrada">🟢 Entrada</option>
                    <option value="salida">🔴 Salida</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Cantidad</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Motivo / Referencia</label>
                <input
                  type="text"
                  required
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  placeholder="Ej: Mantenimiento Preventivo"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Responsable</label>
                <input
                  type="text"
                  required
                  value={formData.usuario}
                  onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                  placeholder="Nombre de quien retira/entrega"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all mt-4">
                Completar Registro
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Componente de Notificación */}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
    </div>
  );
}

export default Movimientos;