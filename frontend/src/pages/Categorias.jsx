import { useState, useEffect } from 'react';
import { categoriasAPI } from '../services/api';
import { Plus, Edit, Trash2, Search, Layers, Calendar } from 'lucide-react';

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      const response = await categoriasAPI.getAll();
      setCategorias(response.data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoriasAPI.update(editingCategory.id, formData);
      } else {
        await categoriasAPI.create(formData);
      }
      loadCategorias();
      closeModal();
    } catch (error) {
      console.error('Error guardando categoría:', error);
      alert('Error al guardar la categoría');
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
    if (window.confirm('¿Estás seguro de eliminar esta categoría? Los productos asociados podrían quedar sin categoría.')) {
      try {
        await categoriasAPI.delete(id);
        loadCategorias();
      } catch (error) {
        console.error('Error eliminando categoría:', error);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ nombre: '', descripcion: '' });
  };

  const filteredCategorias = categorias.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header idéntico a Productos */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Categorías</h1>
          <p className="text-slate-500 mt-1">Organiza tus repuestos y herramientas por familias.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus className="w-5 h-5" /> Nueva Categoría
        </button>
      </header>

      {/* Buscador Moderno */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>

      {/* Vista Desktop: Tabla Redondeada */}
      <div className="hidden lg:block bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-sm font-semibold text-slate-600 uppercase">Nombre</th>
              <th className="px-8 py-5 text-sm font-semibold text-slate-600 uppercase">Descripción</th>
              <th className="px-8 py-5 text-sm font-semibold text-slate-600 uppercase">Fecha Creación</th>
              <th className="px-8 py-5 text-sm font-semibold text-slate-600 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredCategorias.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-5 font-bold text-slate-800 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Layers className="w-5 h-5" />
                  </div>
                  {cat.nombre}
                </td>
                <td className="px-8 py-5 text-slate-500 max-w-xs truncate">
                  {cat.descripcion || 'Sin descripción'}
                </td>
                <td className="px-8 py-5 text-slate-500">
                   <div className="flex items-center gap-2">
                     <Calendar className="w-4 h-4" />
                     {new Date(cat.created_at).toLocaleDateString()}
                   </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista Móvil: Tarjetas (Igual que Productos) */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {filteredCategorias.map((cat) => (
          <div key={cat.id} className="bg-white p-6 rounded-[2rem] shadow-md border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
               <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                 <Layers className="w-6 h-6" />
               </div>
               <div>
                 <h3 className="font-bold text-slate-800 text-lg">{cat.nombre}</h3>
                 <p className="text-sm text-slate-400">Creado: {new Date(cat.created_at).toLocaleDateString()}</p>
               </div>
            </div>
            <p className="text-slate-500 text-sm mb-6">{cat.descripcion || 'Sin descripción'}</p>
            <div className="flex gap-2 pt-4 border-t border-slate-50">
               <button onClick={() => handleEdit(cat)} className="flex-1 bg-slate-50 text-slate-600 py-3 rounded-xl font-bold flex justify-center items-center gap-2">
                 <Edit className="w-4 h-4" /> Editar
               </button>
               <button onClick={() => handleDelete(cat.id)} className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold flex justify-center items-center gap-2">
                 <Trash2 className="w-4 h-4" /> Eliminar
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Moderno */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-black text-slate-900 mb-6">
              {editingCategory ? 'Actualizar Categoría' : 'Nueva Categoría'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nombre de Categoría</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  placeholder="Ej: Rodamientos"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Descripción (Opcional)</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all h-32"
                  placeholder="Describe qué tipos de repuestos incluye..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
                  {editingCategory ? 'Guardar Cambios' : 'Crear Ahora'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categorias;