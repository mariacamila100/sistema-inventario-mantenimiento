import { useState, useEffect, useCallback, useMemo } from 'react';
import { productosAPI, categoriasAPI, proveedoresAPI, marcasAPI } from '../services/api';
import {
  Plus, Edit, Trash2, Search, Package, Tag,
  X, CheckCircle2, AlertCircle, Loader2,
  ChevronLeft, ChevronRight, AlertTriangle, MapPin,
  Copyright
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

// --- DIÁLOGO DE CONFIRMACIÓN ---
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

function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [notification, setNotification] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); 

  const [formData, setFormData] = useState({
    codigo: '', nombre: '', descripcion: '', categoria_id: '',
    proveedor_id: '', marca_id: '', stock_actual: 0, stock_minimo: 5,
    precio_unitario: '', ubicacion: '',
  });

  const loadData = useCallback(async () => {
    if (productos.length === 0) setLoading(true);
    try {
      const [resProd, resCat, resProv, resMarc] = await Promise.all([
        productosAPI.getAll(),
        categoriasAPI.getAll(),
        proveedoresAPI.getAll(),
        marcasAPI.getAll()
      ]);
      setProductos(resProd.data);
      setCategorias(resCat.data);
      setProveedores(resProv.data);
      setMarcas(resMarc.data);
    } catch (error) {
      setNotification({ message: 'Error al cargar los datos', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [productos.length]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- OPTIMIZACIÓN: Filtrado memorizado ---
  const filtered = useMemo(() => {
    return productos.filter(p =>
      p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [productos, searchTerm]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  // --- OPTIMIZACIÓN: Filas de tabla memorizadas ---
  const rowsRendered = useMemo(() => {
    return currentItems.map((p) => (
      <tr key={p.id} className="hover:bg-slate-50 transition-colors flex flex-col lg:table-row p-4 sm:p-6 lg:p-0 border-b lg:border-none">
        {/* Producto */}
        <td className="lg:px-8 lg:py-5 py-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-xl text-[#003366] shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-800 uppercase text-sm tracking-tight truncate">{p.nombre}</p>
              <p className="text-[10px] text-slate-400 font-mono font-bold tracking-wider">{p.codigo}</p>
            </div>
          </div>
        </td>

        {/* Categoría / Marca */}
        <td className="lg:px-8 lg:py-5 py-2">
          <div className="flex flex-row lg:flex-col items-center lg:items-start justify-between lg:justify-center gap-1">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest lg:hidden">Detalles</span>
            <div className="flex flex-col lg:gap-1 text-right lg:text-left">
              <span className="flex items-center lg:justify-start justify-end gap-1.5 text-slate-600 font-medium text-xs">
                <Tag className="w-3 h-3 text-[#003366]/60 hidden lg:block" /> {p.categoria || 'S/C'}
              </span>
              <span className="flex items-center lg:justify-start justify-end gap-1.5 text-slate-400 font-medium text-[10px]">
                <Copyright className="w-3 h-3 text-slate-300 hidden lg:block" /> {p.marca || 'Genérico'}
              </span>
            </div>
          </div>
        </td>

        {/* Stock */}
        <td className="lg:px-8 lg:py-5 py-2">
          <div className="flex items-center justify-between lg:justify-center">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest lg:hidden">Stock</span>
            <div className={`px-3 py-1 rounded-full font-bold text-sm ${Number(p.stock_actual) <= Number(p.stock_minimo) ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
              {p.stock_actual} <span className="text-[10px] opacity-60 ml-1">min: {p.stock_minimo}</span>
            </div>
          </div>
        </td>

        {/* Precio */}
        <td className="lg:px-8 lg:py-5 py-2">
          <div className="flex flex-row lg:flex-col items-center lg:items-start justify-between lg:justify-center">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest lg:hidden">Precio</span>
            <div className="text-right lg:text-left">
              <p className="font-bold text-slate-700 text-sm">
                ${Number(p.precio_unitario).toLocaleString('es-CO')}
              </p>
              <p className="text-[10px] text-slate-400 font-normal uppercase hidden lg:block">
                Total: ${(Number(p.stock_actual) * Number(p.precio_unitario)).toLocaleString('es-CO')}
              </p>
            </div>
          </div>
        </td>

        {/* Acciones */}
        <td className="lg:px-8 lg:py-5 py-4 lg:py-5 mt-2 lg:mt-0 border-t lg:border-none border-slate-50">
          <div className="flex justify-between lg:justify-end items-center gap-2">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest lg:hidden">Opciones</span>
            <div className="flex gap-1">
              <button onClick={() => {
                setEditingProduct(p);
                setFormData({
                  ...p,
                  precio_unitario: p.precio_unitario.toString(),
                  categoria_id: p.categoria_id || '',
                  proveedor_id: p.proveedor_id || '',
                  marca_id: p.marca_id || ''
                });
                setShowModal(true);
              }} className="p-2 text-[#003366] hover:bg-slate-100 rounded-xl transition-all">
                <Edit className="w-5 h-5" />
              </button>
              <button onClick={() => setConfirmDelete({ show: true, id: p.id })} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </td>
      </tr>
    ));
  }, [currentItems]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoria_id || !formData.proveedor_id || !formData.marca_id) {
      setNotification({ message: 'Selecciona categoría, proveedor y marca', type: 'error' });
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        stock_actual: Number(formData.stock_actual),
        stock_minimo: Number(formData.stock_minimo),
        precio_unitario: formData.precio_unitario
      };

      if (editingProduct) {
        await productosAPI.update(editingProduct.id, dataToSend);
        setNotification({ message: 'Producto actualizado con éxito', type: 'success' });
      } else {
        await productosAPI.create(dataToSend);
        setNotification({ message: 'Producto registrado correctamente', type: 'success' });
      }
      loadData();
      closeModal();
    } catch (error) {
      setNotification({ message: 'Error al guardar: ' + (error.response?.data?.error || 'Error interno'), type: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await productosAPI.delete(confirmDelete.id);
      setNotification({ message: 'Eliminado correctamente', type: 'success' });
      setConfirmDelete({ show: false, id: null });
      loadData();
    } catch (error) {
      setNotification({ message: 'Error al eliminar el producto', type: 'error' });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      codigo: '', nombre: '', descripcion: '', categoria_id: '',
      proveedor_id: '', marca_id: '', stock_actual: 0, stock_minimo: 5,
      precio_unitario: '', ubicacion: '',
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Productos</h1>
          <p className="text-slate-500 font-medium">Gestión de inventario y stock técnico</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#003366] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#001a33] shadow-lg shadow-blue-900/10 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Nuevo Producto
        </button>
      </header>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-[#003366]/5 outline-none transition-all"
        />
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#003366] animate-spin mb-2" />
            <span className="text-slate-600 font-bold text-center px-4">Sincronizando inventario...</span>
          </div>
        )}

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead className="hidden lg:table-header-group">
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Producto</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Categoría / Marca</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Stock</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Precio / Total</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                rowsRendered
              ) : (
                !loading && (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-medium">
                      No se encontraron productos que coincidan con la búsqueda.
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {!loading && filtered.length > 0 && (
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 font-medium">
              Mostrando <span className="text-slate-900 font-bold">{indexOfFirstItem + 1}</span> a <span className="text-slate-900 font-bold">{Math.min(indexOfLastItem, filtered.length)}</span> de {filtered.length} productos
            </p>

            <div className="flex items-center gap-3">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2.5 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm active:scale-90"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>

              <div className="flex items-center gap-3 px-1">
                <div className="w-10 h-10 rounded-xl bg-[#003366] text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-900/20">
                  {currentPage}
                </div>
                <span className="text-slate-300 font-light text-xl">/</span>
                <span className="text-sm font-bold text-slate-500">{totalPages}</span>
              </div>

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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[120] p-2">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-7 w-full max-w-2xl shadow-2xl animate-in zoom-in duration-200 border-4 border-white overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={closeModal} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Código *</label>
                  <input required type="text" disabled={!!editingProduct} value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#003366]/5 disabled:bg-slate-50 uppercase font-mono text-xs" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre *</label>
                  <input required type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#003366]/5 text-xs font-bold" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Categoría *</label>
                  <select required value={formData.categoria_id} onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium">
                    <option value="">Seleccionar...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Marca *</label>
                  <select required value={formData.marca_id} onChange={(e) => setFormData({ ...formData, marca_id: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium">
                    <option value="">Seleccionar...</option>
                    {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Proveedor *</label>
                  <select required value={formData.proveedor_id} onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium">
                    <option value="">Seleccionar...</option>
                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Stock Actual</label>
                  <input type="number" disabled={!!editingProduct} value={formData.stock_actual} onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none text-xs font-bold" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Stock Mínimo</label>
                  <input type="number" value={formData.stock_minimo} onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none text-xs font-bold" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Precio Unitario ($)</label>
                  <input type="text" value={formData.precio_unitario} onChange={(e) => setFormData({ ...formData, precio_unitario: e.target.value.replace(/[^0-9.]/g, '') })} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none font-bold text-[#003366] text-xs" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Ubicación Almacén</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-400" />
                    <input type="text" value={formData.ubicacion} onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })} className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Descripción del Ítem</label>
                  <input type="text" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} placeholder="Breve detalle..." className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none text-xs font-medium" />
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button type="submit" className="w-full sm:w-1/3 py-3 bg-[#003366] text-white font-black rounded-2xl hover:bg-[#001a33] shadow-lg shadow-blue-900/20 transition-all uppercase tracking-widest text-xs">
                  {editingProduct ? 'Guardar Cambios' : 'Registrar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDelete.show}
        title="¿Desactivar Producto?"
        message="El producto no se eliminará permanentemente, pero no aparecerá en el inventario activo. ¿Deseas continuar?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete({ show: false, id: null })}
      />

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

export default Productos;