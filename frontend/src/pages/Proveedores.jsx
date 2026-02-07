import { useState, useEffect, useCallback } from 'react';
import { proveedoresAPI } from '../services/api';
import { 
  Plus, Edit, Trash2, Search, Truck, Phone, 
  User, X, CheckCircle2, AlertCircle, Loader2, 
  ChevronLeft, ChevronRight, Mail, MapPin, AlertTriangle 
} from 'lucide-react';

// --- COMPONENTE CONFIRM DIALOG COMPACTO ---
const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-[2rem] p-6 w-full max-w-[320px] shadow-2xl animate-in fade-in zoom-in duration-200 border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="shrink-0 w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 leading-tight uppercase tracking-tight">{title}</h3>
        </div>
        <p className="text-slate-500 mb-6 text-sm font-normal leading-snug px-1">{message}</p>
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

function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [notification, setNotification] = useState(null);
  
  // Estado para el ConfirmDialog
  const [confirmData, setConfirmData] = useState({ isOpen: false, id: null });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '', 
    telefono: '',
    email: '',
    direccion: ''
  });

  const loadProveedores = useCallback(async () => {
    setLoading(true);
    try {
      const response = await proveedoresAPI.getAll();
      setProveedores(response.data);
    } catch (error) {
      setNotification({ message: 'Error al cargar los proveedores', type: 'error' });
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  useEffect(() => {
    loadProveedores();
  }, [loadProveedores]);

  const filtered = proveedores.filter(p =>
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.contacto && p.contacto.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProvider) {
        await proveedoresAPI.update(editingProvider.id, formData);
        setNotification({ message: 'Proveedor actualizado con éxito', type: 'success' });
      } else {
        await proveedoresAPI.create(formData);
        setNotification({ message: 'Proveedor creado con éxito', type: 'success' });
      }
      loadProveedores();
      closeModal();
    } catch (error) {
      setNotification({ message: 'Error al procesar la solicitud', type: 'error' });
    }
  };

  const handleEdit = (prov) => {
    setEditingProvider(prov);
    setFormData({
      nombre: prov.nombre,
      contacto: prov.contacto || '', 
      telefono: prov.telefono || '',
      email: prov.email || '',
      direccion: prov.direccion || ''
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setConfirmData({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    try {
      await proveedoresAPI.delete(confirmData.id);
      setNotification({ message: 'Proveedor desactivado correctamente', type: 'success' });
      loadProveedores();
    } catch (error) {
      setNotification({ message: 'Error al desactivar proveedor', type: 'error' });
    } finally {
      setConfirmData({ isOpen: false, id: null });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProvider(null);
    setFormData({ nombre: '', contacto: '', telefono: '', email: '', direccion: '' });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Proveedores</h1>
          <p className="text-slate-500 font-medium">Directorio de aliados estratégicos para mantenimiento.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#003366] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#001a33] shadow-lg shadow-blue-900/10 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Nuevo Proveedor
        </button>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por nombre o contacto..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-[#003366]/10 outline-none transition-all"
        />
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#003366] animate-spin mb-2" />
            <span className="text-slate-600 font-bold">Actualizando directorio...</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Empresa</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Contacto</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Teléfono / Email</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentItems.length > 0 ? (
                currentItems.map((prov) => (
                  <tr key={prov.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-xl text-[#003366]">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div className="font-bold text-slate-800 uppercase text-sm tracking-tight">{prov.nombre}</div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <User className="w-4 h-4 text-slate-300" />
                        {prov.contacto || '---'}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                          <Phone className="w-3.5 h-3.5 text-[#00529b]" /> {prov.telefono || '---'}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Mail className="w-3.5 h-3.5" /> {prov.email || 'No registrado'}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(prov)} className="p-2 text-[#003366] hover:bg-blue-50 rounded-xl transition-all">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDeleteClick(prov.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                !loading && <tr><td colSpan="4" className="px-8 py-20 text-center text-slate-400">No se encontraron proveedores.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 font-medium">
              Mostrando <span className="text-slate-900 font-bold">{indexOfFirstItem + 1}</span> a <span className="text-slate-900 font-bold">{Math.min(indexOfLastItem, filtered.length)}</span> de {filtered.length} proveedores
            </p>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-100 shadow-sm"><ChevronLeft className="w-5 h-5" /></button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl font-bold text-sm ${currentPage === i + 1 ? 'bg-[#003366] text-white shadow-lg' : 'bg-white border text-slate-400'}`}>{i + 1}</button>
                ))}
              </div>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-100 shadow-sm"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 w-full max-w-md shadow-2xl animate-in zoom-in duration-200 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">{editingProvider ? 'Editar Proveedor' : 'Nuevo Registro'}</h2>
              <button onClick={closeModal} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"><X className="w-6 h-6"/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre de la Empresa *</label>
                <input required type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#003366]/5 transition-all text-sm" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Contacto</label>
                  <input type="text" value={formData.contacto} onChange={(e) => setFormData({...formData, contacto: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#003366]/5 transition-all text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Teléfono</label>
                  <input type="text" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#003366]/5 transition-all text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Correo Electrónico</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#003366]/5 transition-all text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Dirección Física</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input type="text" value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#003366]/5 transition-all text-sm" />
                </div>
              </div>
              <button type="submit" className="w-full py-3.5 bg-[#003366] text-white font-bold rounded-xl hover:bg-[#001a33] shadow-lg shadow-blue-900/10 transition-all mt-2 active:scale-[0.98]">
                {editingProvider ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DIÁLOGO DE CONFIRMACIÓN */}
      <ConfirmDialog 
        isOpen={confirmData.isOpen}
        title="¿Desactivar proveedor?"
        message="El proveedor no aparecerá en nuevos registros pero se mantendrá en el historial."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmData({ isOpen: false, id: null })}
        isLoading={false}
      />

      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
}

export default Proveedores;