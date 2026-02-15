import { useState, useEffect, useCallback } from 'react';
import { categoriasAPI } from '../services/api';
import {
  Plus, Edit, Trash2, Search, Layers,
  X, CheckCircle2, AlertCircle, Loader2,
  ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';

// --- COMPONENTE CONFIRM DIALOG ---
const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-[2rem] p-6 w-full max-w-[320px] shadow-2xl animate-in fade-in zoom-in duration-200 border border-slate-100 text-center">
        <div className="flex items-center gap-3 mb-4 text-left">
          <div className="shrink-0 w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tight">{title}</h3>
        </div>
        <p className="text-slate-500 mb-6 text-sm font-normal leading-snug text-left px-1">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} disabled={isLoading} className="flex-1 py-2.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={isLoading} className="flex-1 py-2.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2">
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Sí, desactivar"}
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [notification, setNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [confirmData, setConfirmData] = useState({ isOpen: false, id: null });
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

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

  useEffect(() => { loadCategorias(); }, [loadCategorias]);

  const filtered = categorias.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.descripcion && c.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
    setFormData({ nombre: cat.nombre, descripcion: cat.descripcion || '' });
    setShowModal(true);
  };

  const handleDeleteClick = (id) => { setConfirmData({ isOpen: true, id }); };

  const handleConfirmDelete = async () => {
    try {
      await categoriasAPI.delete(confirmData.id);
      setNotification({ message: 'Categoría desactivada con éxito', type: 'success' });
      loadCategorias();
    } catch (error) {
      setNotification({ message: 'Error: No se pudo desactivar la categoría', type: 'error' });
    } finally {
      setConfirmData({ isOpen: false, id: null });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ nombre: '', descripcion: '' });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Categorías</h1>
          <p className="text-slate-500 font-medium">Organiza tus repuestos por familias.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#003366] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#001a33] shadow-lg transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Nueva Categoría
        </button>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar categorías..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-[#003366]/5 outline-none transition-all font-medium text-slate-600"
        />
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#003366] animate-spin mb-2" />
            <span className="text-slate-600 font-bold">Cargando organización...</span>
          </div>
        )}

        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left">
            <thead className="hidden md:table-header-group">
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Nombre</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Descripción</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 block md:table-row-group">
              {currentItems.length > 0 ? (
                currentItems.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors flex flex-col md:table-row p-6 md:p-0">

                    {/* Nombre - Etiqueta a la izquierda en móvil */}
                    <td className="px-0 md:px-8 py-2 md:py-5 block md:table-cell">
                      <div className="flex items-center justify-between md:justify-start gap-4">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest md:hidden">Nombre</span>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-xl text-[#003366] shrink-0">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div className="font-bold text-slate-800 uppercase text-sm tracking-tight whitespace-nowrap">
                            {cat.nombre}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Descripción - Etiqueta a la izquierda en móvil */}
                    <td className="px-0 md:px-8 py-2 md:py-5 block md:table-cell border-t border-slate-50 md:border-none mt-1 md:mt-0 pt-3 md:pt-5">
                      <div className="flex justify-between md:block gap-4">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest md:hidden mt-0.5">Descripción</span>
                        <p className="text-slate-500 text-xs font-medium max-w-[180px] md:max-w-xs truncate text-right md:text-left" title={cat.descripcion}>
                          {cat.descripcion || 'Sin descripción adicional'}
                        </p>
                      </div>
                    </td>

                    {/* Acciones - Etiqueta a la izquierda en móvil */}
                    <td className="px-0 md:px-8 py-2 md:py-5 block md:table-cell border-t border-slate-50 md:border-none mt-1 md:mt-0 pt-3 md:pt-5">
                      <div className="flex items-center justify-between md:justify-end gap-2">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest md:hidden">Acciones</span>
                        <div className="flex gap-1">
                          <button onClick={() => handleEdit(cat)} className="p-2 text-[#003366] hover:bg-blue-50 rounded-xl transition-all">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDeleteClick(cat.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                !loading && (
                  <tr>
                    <td colSpan="3" className="px-8 py-20 text-center text-slate-400 font-medium">
                      No se encontraron categorías registradas.
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
        {/* Paginación Minimalista y Limpia */}
        {!loading && filtered.length > 0 && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">

            {/* Contador de registros (Mantiene tu texto original) */}
            <p className="text-sm text-slate-500 font-medium">
              Mostrando <span className="text-slate-900 font-bold">{indexOfFirstItem + 1}</span> a <span className="text-slate-900 font-bold">{Math.min(indexOfLastItem, filtered.length)}</span> de {filtered.length} movimientos
            </p>

            {/* Controles de navegación compactos */}
            <div className="flex items-center gap-3">
              {/* Flecha Anterior */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2.5 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm active:scale-90"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>

              {/* Cuadrito de Número Actual y Total */}
              <div className="flex items-center gap-3 px-1">
                <div className="w-10 h-10 rounded-xl bg-[#003366] text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-900/20">
                  {currentPage}
                </div>
                <span className="text-slate-300 font-light text-xl">/</span>
                <span className="text-sm font-bold text-slate-500">{totalPages}</span>
              </div>

              {/* Flecha Siguiente */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2.5 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm active:scale-90"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button onClick={closeModal} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre *</label>
                <input required type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#003366]/5 transition-all text-sm font-medium" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Descripción</label>
                <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#003366]/5 transition-all h-28 resize-none text-sm font-medium" />
              </div>
              <div className="flex justify-center pt-0.5">
                <button
                  type="submit"
                  className="w-full sm:w-1/3 py-3.5 bg-[#003366] text-white font-black rounded-2xl hover:bg-[#001a33] shadow-lg shadow-blue-900/20 transition-all uppercase tracking-widest text-xs active:scale-95"
                >
                  {editingCategory ? 'Guardar Cambios' : 'Registrar '}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmData.isOpen}
        title="¿Desactivar Categoría?"
        message="La categoría dejará de estar disponible para nuevos productos."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmData({ isOpen: false, id: null })}
      />
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
}

export default Categorias;