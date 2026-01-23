import { useState, useEffect, useCallback } from 'react';
import { categoriasAPI } from '../services/api';
import { 
  Plus, Edit, Trash2, Search, Layers, Calendar, 
  X, CheckCircle2, AlertCircle, Loader2, 
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

function Categorias() {
  // Estados de datos
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de UI
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [notification, setNotification] = useState(null);

  // Estados de Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  const loadCategorias = useCallback(async () => {
    setLoading(true);
    try {
      const response = await categoriasAPI.getAll();
      setCategorias(response.data);
    } catch (error) {
      setNotification({ message: 'Error al conectar con las categorías', type: 'error' });
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  // Filtrado
  const filtered = categorias.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.descripcion && c.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Paginación
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoriasAPI.update(editingCategory.id, formData);
        setNotification({ message: 'Categoría actualizada correctamente', type: 'success' });
      } else {
        await categoriasAPI.create(formData);
        setNotification({ message: 'Categoría creada con éxito', type: 'success' });
      }
      loadCategorias();
      closeModal();
    } catch (error) {
      setNotification({ message: 'Error al procesar la categoría', type: 'error' });
    }
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      nombre: cat.nombre,
      descripcion: cat.descripcion || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta categoría? Ten en cuenta que los productos asociados podrían quedar huérfanos.')) {
      try {
        await categoriasAPI.delete(id);
        setNotification({ message: 'Categoría eliminada con éxito', type: 'success' });
        loadCategorias();
      } catch (error) {
        setNotification({ message: 'Error: No se pudo eliminar la categoría', type: 'error' });
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ nombre: '', descripcion: '' });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Categorías</h1>
          <p className="text-slate-500 font-medium">Organiza tus repuestos y herramientas por familias.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Nueva Categoría
        </button>
      </header>

      {/* Buscador */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar categorías..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
        />
      </div>

      {/* Tabla con Loading State */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative min-h-[400px]">
        
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-2" />
            <span className="text-slate-600 font-bold">Cargando organización...</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Nombre</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Descripción</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Creado el</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentItems.length > 0 ? (
                currentItems.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div className="font-bold text-slate-800 uppercase text-sm tracking-tight">{cat.nombre}</div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-slate-500 text-sm max-w-xs truncate" title={cat.descripcion}>
                        {cat.descripcion || 'Sin descripción adicional'}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        {cat.created_at ? new Date(cat.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                !loading && (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-medium">
                      No se encontraron categorías.
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
            <p className="text-sm text-slate-500 font-medium">
              Mostrando <span className="text-slate-900 font-bold">{indexOfFirstItem + 1}</span> a <span className="text-slate-900 font-bold">{Math.min(indexOfLastItem, filtered.length)}</span> de {filtered.length} categorías
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button onClick={closeModal} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-6 h-6"/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nombre de la Categoría *</label>
                <input 
                  required 
                  type="text" 
                  value={formData.nombre} 
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                  placeholder="Ej: Motores, Eléctricos, Pintura..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Descripción</label>
                <textarea 
                  value={formData.descripcion} 
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})} 
                  placeholder="Detalla qué tipo de productos pertenecen a esta categoría..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all h-32 resize-none" 
                />
              </div>

              <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all mt-4">
                {editingCategory ? 'Guardar Cambios' : 'Registrar Categoría'}
              </button>
            </form>
          </div>
        </div>
      )}

      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
}

export default Categorias;