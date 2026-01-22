import { useState, useEffect } from 'react';
import { productosAPI, categoriasAPI, proveedoresAPI } from '../services/api';
import { Plus, Edit, Trash2, Search, AlertCircle, Package } from 'lucide-react';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria_id: '',
    proveedor_id: '',
    stock_actual: 0,
    stock_minimo: 5,
    precio_unitario: 0,
    ubicacion: '',
  });

  useEffect(() => {
    loadProductos();
    loadCategorias();
    loadProveedores();
  }, []);

  const loadProductos = async () => {
    try {
      const response = await productosAPI.getAll();
      setProductos(response.data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const loadCategorias = async () => {
    try {
      const response = await categoriasAPI.getAll();
      setCategorias(response.data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

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
      if (editingProduct) {
        await productosAPI.update(editingProduct.id, formData);
      } else {
        await productosAPI.create(formData);
      }
      loadProductos();
      closeModal();
    } catch (error) {
      console.error('Error guardando producto:', error);
      alert('Error al guardar el producto');
    }
  };

  const handleEdit = (producto) => {
    setEditingProduct(producto);
    setFormData({
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      categoria_id: producto.categoria_id || '',
      proveedor_id: producto.proveedor_id || '',
      stock_actual: producto.stock_actual,
      stock_minimo: producto.stock_minimo,
      precio_unitario: producto.precio_unitario,
      ubicacion: producto.ubicacion || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await productosAPI.delete(id);
        loadProductos();
      } catch (error) {
        console.error('Error eliminando producto:', error);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      categoria_id: '',
      proveedor_id: '',
      stock_actual: 0,
      stock_minimo: 5,
      precio_unitario: 0,
      ubicacion: '',
    });
  };

  const filteredProductos = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-3 lg:px-4 py-4 lg:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Productos</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Vista de Tabla (Escritorio) */}
      <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProductos.map((producto) => (
                <tr key={producto.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{producto.codigo}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{producto.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{producto.categoria}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`font-semibold ${producto.stock_actual <= producto.stock_minimo ? 'text-red-600' : 'text-green-600'}`}>
                      {producto.stock_actual}
                    </span>
                    <span className="text-gray-500"> / {producto.stock_minimo}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${producto.precio_unitario.toLocaleString('es-CO')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{producto.ubicacion}</td>
                  <td className="px-6 py-4 text-sm">
                    {producto.alerta_stock === 'BAJO STOCK' ? (
                      <span className="flex items-center space-x-1 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>Bajo Stock</span>
                      </span>
                    ) : (
                      <span className="text-green-600">OK</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(producto)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(producto.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista de Tarjetas (Móvil) */}
      <div className="lg:hidden space-y-4">
        {filteredProductos.map((producto) => (
          <div key={producto.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            {/* Header de la tarjeta */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{producto.nombre}</h3>
                  <p className="text-sm text-gray-500">{producto.codigo}</p>
                </div>
              </div>
              {producto.alerta_stock === 'BAJO STOCK' && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Bajo</span>
                </span>
              )}
            </div>

            {/* Información */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div>
                <p className="text-gray-500">Categoría</p>
                <p className="font-semibold text-gray-900">{producto.categoria || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Ubicación</p>
                <p className="font-semibold text-gray-900">{producto.ubicacion || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Stock</p>
                <p className="font-semibold">
                  <span className={producto.stock_actual <= producto.stock_minimo ? 'text-red-600' : 'text-green-600'}>
                    {producto.stock_actual}
                  </span>
                  <span className="text-gray-500"> / {producto.stock_minimo}</span>
                </p>
              </div>
              <div>
                <p className="text-gray-500">Precio</p>
                <p className="font-semibold text-gray-900">
                  ${producto.precio_unitario.toLocaleString('es-CO')}
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex space-x-2 pt-3 border-t border-gray-200">
              <button
                onClick={() => handleEdit(producto)}
                className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition flex items-center justify-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span className="font-medium">Editar</span>
              </button>
              <button
                onClick={() => handleDelete(producto.id)}
                className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span className="font-medium">Eliminar</span>
              </button>
            </div>
          </div>
        ))}

        {filteredProductos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No se encontraron productos</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl lg:text-2xl font-bold mb-4">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                  <input
                    type="text"
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={editingProduct !== null}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={formData.categoria_id}
                    onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                  <select
                    value={formData.proveedor_id}
                    onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    {proveedores.map((prov) => (
                      <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {!editingProduct && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock_actual}
                      onChange={(e) => setFormData({ ...formData, stock_actual: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({ ...formData, stock_minimo: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Unitario *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.precio_unitario}
                    onChange={(e) => setFormData({ ...formData, precio_unitario: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className={!editingProduct ? 'sm:col-span-2 lg:col-span-1' : 'sm:col-span-2'}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                  <input
                    type="text"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition order-1 sm:order-2"
                >
                  {editingProduct ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Productos;