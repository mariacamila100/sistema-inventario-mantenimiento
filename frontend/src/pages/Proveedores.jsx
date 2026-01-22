import { useState, useEffect } from 'react';
import { proveedoresAPI } from '../services/api';
import { Plus, Edit, Trash2, Search, Truck, Phone, Globe, User } from 'lucide-react';

function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    contacto_nombre: '',
    telefono: '',
    email: '',
    direccion: ''
  });

  useEffect(() => {
    loadProveedores();
  }, []);

  const loadProveedores = async () => {
    try {
      const response = await proveedoresAPI.getAll();
      setProveedores(response.data);
    } catch (error) {
      console.error('Error cargando proveedores:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProvider) {
        await proveedoresAPI.update(editingProvider.id, formData);
      } else {
        await proveedoresAPI.create(formData);
      }
      loadProveedores();
      closeModal();
    } catch (error) {
      console.error('Error guardando proveedor:', error);
      alert('Error al guardar el proveedor');
    }
  };

  const handleEdit = (prov) => {
    setEditingProvider(prov);
    setFormData({
      nombre: prov.nombre,
      contacto_nombre: prov.contacto_nombre || '',
      telefono: prov.telefono || '',
      email: prov.email || '',
      direccion: prov.direccion || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este proveedor? Asegúrate de que no tenga productos asociados.')) {
      try {
        await proveedoresAPI.delete(id);
        loadProveedores();
      } catch (error) {
        console.error('Error eliminando proveedor:', error);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProvider(null);
    setFormData({ nombre: '', contacto_nombre: '', telefono: '', email: '', direccion: '' });
  };

  const filtered = proveedores.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.contacto_nombre && p.contacto_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Proveedores</h1>
          <p className="text-slate-500 mt-1">Directorio de aliados estratégicos para mantenimiento.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus className="w-5 h-5" /> Nuevo Proveedor
        </button>
      </header>

      {/* Buscador */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por nombre o contacto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>

      {/* Vista Desktop: Tabla */}
      <div className="hidden lg:block bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-sm font-semibold text-slate-600 uppercase">Empresa</th>
              <th className="px-8 py-5 text-sm font-semibold text-slate-600 uppercase">Contacto</th>
              <th className="px-8 py-5 text-sm font-semibold text-slate-600 uppercase">Teléfono</th>
              <th className="px-8 py-5 text-sm font-semibold text-slate-600 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((prov) => (
              <tr key={prov.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3 font-bold text-slate-800">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Truck className="w-5 h-5" /></div>
                    {prov.nombre}
                  </div>
                </td>
                <td className="px-8 py-5 text-slate-600">
                   <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /> {prov.contacto_nombre || '---'}</div>
                </td>
                <td className="px-8 py-5 text-slate-600">
                   <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {prov.telefono || '---'}</div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(prov)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(prov.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista Móvil: Tarjetas */}
      <div className="lg:hidden grid gap-4">
        {filtered.map((prov) => (
          <div key={prov.id} className="bg-white p-6 rounded-[2rem] shadow-md border border-slate-100 space-y-4">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Truck className="w-6 h-6" /></div>
               <div>
                 <h3 className="font-bold text-slate-800 text-lg">{prov.nombre}</h3>
                 <p className="text-sm text-slate-400">{prov.email || 'Sin correo'}</p>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-slate-500">Encargado:</div><div className="font-medium text-slate-800">{prov.contacto_nombre}</div>
              <div className="text-slate-500">Tel:</div><div className="font-medium text-slate-800">{prov.telefono}</div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-slate-50">
               <button onClick={() => handleEdit(prov)} className="flex-1 bg-slate-50 text-slate-600 py-3 rounded-xl font-bold flex justify-center items-center gap-2"><Edit className="w-4 h-4" /> Editar</button>
               <button onClick={() => handleDelete(prov.id)} className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold flex justify-center items-center gap-2"><Trash2 className="w-4 h-4" /> Borrar</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-6">{editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nombre de la Empresa *</label>
                <input type="text" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Persona de Contacto</label>
                  <input type="text" value={formData.contacto_nombre} onChange={(e) => setFormData({...formData, contacto_nombre: e.target.value})} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Teléfono</label>
                  <input type="text" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Correo Electrónico</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Proveedores;