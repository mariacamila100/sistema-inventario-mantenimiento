import { useState, useEffect, useCallback } from 'react';
import { bodegasAPI } from '../services/api';
import {
  Warehouse, Edit, Search, 
  X, CheckCircle2, AlertCircle, Loader2,
  ChevronLeft, ChevronRight, Package, Layers
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
    <div className={`fixed bottom-5 right-5 left-5 md:left-auto flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl z-[150] animate-in slide-in-from-bottom-5 ${styles} font-sans`}>
      {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="font-bold text-sm flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4" /></button>
    </div>
  );
};

function Bodegas() {
  const [bodegas, setBodegas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBodega, setEditingBodega] = useState(null);
  const [notification, setNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

  const loadBodegas = useCallback(async (isFirstLoad = false) => {
    if (isFirstLoad) setLoading(true);
    try {
      const response = await bodegasAPI.getAll();
      setBodegas(response.data);
    } catch (error) {
      setNotification({ message: 'Error al conectar con las bodegas', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBodegas(true); }, [loadBodegas]);

  const filtered = bodegas.filter(b =>
    b.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.descripcion && b.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBodega) {
        await bodegasAPI.update(editingBodega.id, formData);
        setNotification({ message: 'Bodega actualizada correctamente', type: 'success' });
      }
      loadBodegas();
      closeModal();
    } catch (error) {
      setNotification({ message: 'Error al procesar la solicitud', type: 'error' });
    }
  };

  const handleEdit = (bod) => {
    setEditingBodega(bod);
    setFormData({ nombre: bod.nombre, descripcion: bod.descripcion || '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBodega(null);
    setFormData({ nombre: '', descripcion: '' });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 font-sans">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase italic">Bodegas</h1>
          <p className="text-slate-500 font-medium italic">Gestión de puntos de almacenamiento y stock total.</p>
        </div>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar bodegas..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-[#003366]/5 outline-none transition-all font-medium text-slate-600"
        />
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#003366] animate-spin mb-2" />
            <span className="text-slate-600 font-bold uppercase text-xs tracking-widest">Cargando datos...</span>
          </div>
        )}

        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left">
            <thead className="hidden md:table-header-group">
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Sede / Punto</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Ocupación Actual</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Dirección / Notas</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.length > 0 ? (
                currentItems.map((bod) => (
                  <tr key={bod.id} className="hover:bg-slate-50/50 transition-colors flex flex-col md:table-row p-6 md:p-0">
                    <td className="px-0 md:px-8 py-2 md:py-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-900 rounded-2xl text-white shrink-0 shadow-lg shadow-slate-200">
                          <Warehouse className="w-5 h-5" />
                        </div>
                        <div className="font-bold text-slate-800 uppercase text-sm tracking-tight">{bod.nombre}</div>
                      </div>
                    </td>

                    <td className="px-0 md:px-8 py-2 md:py-6">
                      <div className="flex justify-center gap-3">
                        <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100 text-blue-700" title="Tipos de productos únicos">
                          <Layers className="w-3 h-3" />
                          <span className="text-[10px] font-black uppercase">{bod.total_productos_unicos} SKUs</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100 text-emerald-700" title="Suma total de stock">
                          <Package className="w-3 h-3" />
                          <span className="text-[10px] font-black uppercase">{bod.stock_total_acumulado} Unds</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-0 md:px-8 py-2 md:py-6">
                      <p className="text-slate-500 text-xs font-medium italic truncate max-w-[250px]">
                        {bod.descripcion || 'Sin información adicional'}
                      </p>
                    </td>

                    <td className="px-0 md:px-8 py-2 md:py-6 text-right">
                      <button 
                        onClick={() => handleEdit(bod)} 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 text-[#003366] hover:bg-[#003366] hover:text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border border-slate-200"
                      >
                        <Edit className="w-4 h-4" /> Personalizar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                !loading && (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-medium">
                      No se encontraron resultados para su búsqueda.
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {!loading && filtered.length > 0 && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 font-medium italic">
              Mostrando <span className="text-slate-900 font-bold">{indexOfFirstItem + 1}</span> a <span className="text-slate-900 font-bold">{Math.min(indexOfLastItem, filtered.length)}</span> de {filtered.length} puntos
            </p>
            <div className="flex items-center gap-3">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2.5 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm active:scale-90">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-3 px-1">
                <div className="w-10 h-10 rounded-xl bg-[#003366] text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-900/20">{currentPage}</div>
                <span className="text-slate-300 font-light text-xl">/</span>
                <span className="text-sm font-bold text-slate-500">{totalPages}</span>
              </div>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2.5 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm active:scale-90">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Edición */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 w-full max-w-md shadow-2xl animate-in zoom-in duration-200 border-4 border-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Personalizar Sede</h2>
              <button onClick={closeModal} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Punto *</label>
                <input required type="text" maxLength={25} value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl border-2 border-slate-100 outline-none focus:border-[#003366] focus:bg-white transition-all text-sm font-bold text-slate-700 uppercase" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección / Notas</label>
                <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl border-2 border-slate-100 outline-none focus:border-[#003366] focus:bg-white transition-all h-28 resize-none text-sm font-bold text-slate-700" placeholder="Ej: Calle 10 # 45-20..." />
              </div>
              <button type="submit" className="w-full py-4 bg-[#003366] text-white font-black rounded-2xl hover:bg-slate-900 shadow-xl shadow-blue-900/20 transition-all uppercase tracking-[0.2em] text-xs active:scale-95 mt-4">
                Actualizar Información
              </button>
            </form>
          </div>
        </div>
      )}

      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
}

export default Bodegas;