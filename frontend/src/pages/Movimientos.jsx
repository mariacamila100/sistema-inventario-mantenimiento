import { useState, useEffect } from 'react';
import { movimientosAPI, productosAPI } from '../services/api';
import { Plus, ArrowUp, ArrowDown } from 'lucide-react';

function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    producto_id: '',
    tipo: 'entrada',
    cantidad: 1,
    motivo: '',
    usuario: '',
    observaciones: '',
  });

  useEffect(() => {
    loadMovimientos();
    loadProductos();
  }, []);

  const loadMovimientos = async () => {
    try {
      const response = await movimientosAPI.getAll();
      setMovimientos(response.data);
    } catch (error) {
      console.error('Error cargando movimientos:', error);
    }
  };

  const loadProductos = async () => {
    try {
      const response = await productosAPI.getAll();
      setProductos(response.data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await movimientosAPI.create(formData);
      loadMovimientos();
      closeModal();
    } catch (error) {
      console.error('Error registrando movimiento:', error);
      alert('Error al registrar el movimiento');
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Movimientos de Inventario</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Registrar Movimiento</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {movimientos.map((mov) => (
                <tr key={mov.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(mov.fecha).toLocaleString('es-CO')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{mov.producto}</div>
                      <div className="text-gray-500 text-xs">{mov.codigo}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {mov.tipo === 'entrada' ? (
                      <span className="flex items-center space-x-1 text-green-600">
                        <ArrowUp className="w-4 h-4" />
                        <span>Entrada</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-red-600">
                        <ArrowDown className="w-4 h-4" />
                        <span>Salida</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{mov.cantidad}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{mov.motivo}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{mov.usuario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Registrar Movimiento</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
                <select
                  required
                  value={formData.producto_id}
                  onChange={(e) => setFormData({ ...formData, producto_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar producto...</option>
                  {productos.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.codigo} - {prod.nombre} (Stock: {prod.stock_actual})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimiento *</label>
                <select
                  required
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
                <input
                  type="text"
                  required
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  placeholder="Ej: Compra, Mantenimiento bomba, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario *</label>
                <input
                  type="text"
                  required
                  value={formData.usuario}
                  onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                  placeholder="Nombre del usuario"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Detalles adicionales (opcional)"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Movimientos;