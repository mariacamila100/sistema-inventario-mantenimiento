import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { movimientosAPI, productosAPI, proveedoresAPI } from '../services/api';
import {
  Plus, ArrowUp, ArrowDown, Search, X,
  CheckCircle2, AlertCircle, Loader2,
  ChevronLeft, ChevronRight, Calendar, ChevronDown,
  DollarSign, User
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const [formData, setFormData] = useState({
    producto_id: '', tipo: 'entrada', cantidad: 1, precio_historico: '',
    motivo: '', observaciones: '', numero_documento: '', proveedor_id: ''
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
      setNotification({ message: 'Error al sincronizar datos', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return movimientos.filter(m =>
      m.producto_nombre?.toLowerCase().includes(term) ||
      m.motivo?.toLowerCase().includes(term) ||
      m.numero_documento?.toLowerCase().includes(term)
    );
  }, [movimientos, searchTerm]);

  const filteredProducts = useMemo(() => {
    const term = searchProduct.toLowerCase();
    return productos.filter(p =>
      p.nombre.toLowerCase().includes(term) ||
      p.codigo?.toLowerCase().includes(term)
    );
  }, [productos, searchProduct]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  const selectedProduct = useMemo(() => 
    productos.find(p => p.id === Number(formData.producto_id)),
    [productos, formData.producto_id]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.producto_id) {
        setNotification({ message: 'Debe seleccionar un producto', type: 'error' });
        return;
    }

    // CORRECCIÓN: Usar precio_unitario (nombre real en tu tabla SQL)
    const costoBase = Number(selectedProduct?.precio_unitario || 0);
    let precioFinal = 0;

    if (formData.tipo === 'entrada') {
      precioFinal = costoBase;
    } else {
      // Si no seleccionó porcentaje en salida, dar error (excepto si elige "0")
      if (formData.precio_historico === '') {
        setNotification({ message: 'Seleccione un valor de salida', type: 'error' });
        return;
      }
      const porcentaje = Number(formData.precio_historico);
      precioFinal = costoBase * (1 + porcentaje);

      if (Number(formData.cantidad) > selectedProduct.stock_actual) {
        setNotification({
          message: `Stock insuficiente. Disponible: ${selectedProduct.stock_actual}`,
          type: 'error'
        });
        return;
      }
    }

    try {
      await movimientosAPI.create({
        ...formData,
        producto_id: Number(formData.producto_id),
        cantidad: Number(formData.cantidad),
        precio_historico: precioFinal, // Se envía el precio calculado para el kárdex
        proveedor_id: formData.proveedor_id ? Number(formData.proveedor_id) : null
      });
      setNotification({ message: 'Movimiento registrado con éxito', type: 'success' });
      loadData();
      closeModal();
    } catch (error) {
      setNotification({ message: error.response?.data?.error || 'Error al registrar', type: 'error' });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsSelectOpen(false);
    setSearchProduct('');
    setFormData({
      producto_id: '', tipo: 'entrada', cantidad: 1, precio_historico: '',
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
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#003366] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#001a33] shadow-lg shadow-blue-900/10 transition-all active:scale-95"
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
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-[#003366]/5 outline-none transition-all font-medium text-slate-600"
        />
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#003366] animate-spin mb-2" />
            <span className="text-slate-600 font-bold">Sincronizando...</span>
          </div>
        )}

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead className="hidden lg:table-header-group">
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Fecha</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Detalle</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Tipo</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Cantidad</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 block lg:table-row-group">
              {filtered.length > 0 ? (
                currentItems.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-50/50 transition-colors flex flex-col lg:table-row p-6 lg:p-0">
                    <td className="px-0 lg:px-8 py-2 lg:py-5 block lg:table-cell">
                      <div className="flex items-center justify-between lg:justify-start gap-3">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest lg:hidden">Fecha</span>
                        <div className="flex items-center gap-2">
                           <Calendar className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
                           <span className="text-sm font-bold text-slate-600">
                            {new Date(mov.fecha || mov.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-0 lg:px-8 py-2 lg:py-5 block lg:table-cell border-t border-slate-50 lg:border-none mt-1 lg:mt-0 pt-3 lg:pt-5">
                      <div className="flex justify-between lg:block gap-4">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest lg:hidden mt-0.5">Detalle</span>
                        <div className="text-right lg:text-left">
                          <div className="text-sm font-semibold text-slate-700 leading-tight">
                            {mov.producto_nombre}
                          </div>
                          <div className="text-[11px] text-slate-400 font-normal">
                            {mov.numero_documento || mov.motivo}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-0 lg:px-8 py-2 lg:py-5 block lg:table-cell border-t border-slate-50 lg:border-none mt-1 lg:mt-0 pt-3 lg:pt-5">
                      <div className="flex items-center justify-between lg:justify-center">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest lg:hidden">Tipo</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                          mov.tipo === 'entrada' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {mov.tipo}
                        </span>
                      </div>
                    </td>

                    <td className="px-0 lg:px-8 py-2 lg:py-5 block lg:table-cell border-t border-slate-50 lg:border-none mt-1 lg:mt-0 pt-3 lg:pt-5 text-center">
                      <div className="flex items-center justify-between lg:justify-center">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest lg:hidden">Cantidad</span>
                        <div className={`text-sm font-bold ${mov.tipo === 'entrada' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {mov.tipo === 'entrada' ? '+' : '-'}{mov.cantidad}
                        </div>
                      </div>
                    </td>

                    <td className="px-0 lg:px-8 py-2 lg:py-5 block lg:table-cell border-t border-slate-50 lg:border-none mt-1 lg:mt-0 pt-3 lg:pt-5 text-right">
                      <div className="flex items-center justify-between lg:justify-end gap-2">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest lg:hidden">Usuario</span>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-lg">
                          {mov.username || 'Admin'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                !loading && (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-medium w-full block lg:table-cell">
                      No se encontraron movimientos.
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="p-4 bg-white border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400 font-semibold tracking-tight">
              Mostrando <span className="text-slate-900 font-black">{indexOfFirstItem + 1}</span> a <span className="text-slate-900 font-black">{Math.min(indexOfLastItem, filtered.length)}</span> de {filtered.length}
            </p>
            <div className="flex items-center gap-3">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 rounded-xl bg-slate-50 border border-slate-100 disabled:opacity-20 hover:bg-white hover:shadow-md transition-all">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#003366] text-white flex items-center justify-center font-bold text-xs">{currentPage}</div>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-slate-400">{totalPages}</span>
              </div>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 rounded-xl bg-slate-50 border border-slate-100 disabled:opacity-20 hover:bg-white hover:shadow-md transition-all">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in duration-200 border-4 border-white overflow-y-auto max-h-[95vh]">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">Nuevo Registro</h2>
              <button onClick={closeModal} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1 relative">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Producto *</label>
                <div
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 flex justify-between items-center cursor-pointer bg-slate-50 hover:border-[#003366]/30 transition-all"
                >
                  <span className={formData.producto_id ? "text-slate-900 font-bold text-sm" : "text-slate-400 text-sm"}>
                    {formData.producto_id ? selectedProduct?.nombre : "Seleccionar producto..."}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isSelectOpen ? 'rotate-180' : ''}`} />
                </div>

                {isSelectOpen && (
                  <div className="absolute w-full mt-1 bg-white border border-slate-100 shadow-2xl rounded-2xl z-[130] overflow-hidden">
                    <div className="p-2 bg-slate-50/50">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Buscar por nombre o código..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#003366]/10"
                        value={searchProduct}
                        onChange={(e) => setSearchProduct(e.target.value)}
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {filteredProducts.map(prod => (
                        <div
                          key={prod.id}
                          onClick={() => {
                            setFormData({ ...formData, producto_id: prod.id });
                            setIsSelectOpen(false);
                            setSearchProduct('');
                          }}
                          className="px-4 py-2 hover:bg-[#003366] hover:text-white cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                        >
                          <p className="font-bold text-xs">{prod.nombre}</p>
                          <p className="text-[9px] uppercase opacity-70 font-black">Stock: {prod.stock_actual} | Costo: ${prod.precio_unitario}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Tipo</label>
                  <select 
                    value={formData.tipo} 
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value, precio_historico: '' })} 
                    className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 font-black outline-none text-xs appearance-none ${formData.tipo === 'entrada' ? 'text-emerald-600 bg-emerald-50/10' : 'text-rose-600 bg-rose-50/10'}`}
                  >
                    <option value="entrada">ENTRADA</option>
                    <option value="salida">SALIDA</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Cantidad *</label>
                  <input type="number" required min="1" value={formData.cantidad} onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-bold outline-none text-xs" />
                </div>

                <div className="space-y-1">
                  {formData.tipo === 'salida' && (
                    <>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Valor Salida *</label>
                      <div className="relative">
                        <select
                          required
                          value={formData.precio_historico}
                          onChange={(e) => setFormData({ ...formData, precio_historico: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-bold outline-none text-xs text-[#003366] bg-white appearance-none"
                        >
                          <option value="">Seleccionar...</option>
                          <option value="0">Costo Base (Ajuste)</option>
                          <option value="0.07">+ 7% ganancia</option>
                          <option value="0.10">+ 10% Ganancia</option>
                          <option value="0.20">+ 20% Ganancia</option>
                        
                        </select>
                        <ChevronDown className="absolute right-4 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                      {formData.producto_id && formData.precio_historico !== '' && (
                        <p className="text-[10px] font-bold text-emerald-600 mt-1 ml-1">
                          Ref: ${(Number(selectedProduct?.precio_unitario) * (1 + Number(formData.precio_historico))).toFixed(2)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">N° Documento</label>
                  <input type="text" value={formData.numero_documento} onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })} placeholder="Ej: FACT-001" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Proveedor (Opcional)</label>
                  <select value={formData.proveedor_id} onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium">
                    <option value="">No aplica</option>
                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Motivo / Concepto *</label>
                <input type="text" required value={formData.motivo} onChange={(e) => setFormData({ ...formData, motivo: e.target.value })} placeholder="Ej: Venta al detalle..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium" />
              </div>

              <div className="flex justify-center pt-3">
                <button type="submit" className="w-full sm:w-1/3 py-3.5 bg-[#003366] text-white font-black rounded-2xl hover:bg-[#001a33] shadow-lg shadow-blue-900/20 transition-all uppercase tracking-widest text-xs active:scale-95">
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
    </div>
  );
}

export default Movimientos;