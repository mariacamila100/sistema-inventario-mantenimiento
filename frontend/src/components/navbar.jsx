import { Link, useLocation } from 'react-router-dom';
import { Package, History, Home, Menu, X, LogOut } from 'lucide-react'; // Agregamos LogOut
import { useState } from 'react';

function Navbar({ onLogout, userName }) { // Agregamos los props
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700 shadow-md' : '';
  };

  const menuItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/productos', icon: Package, label: 'Productos' },
    { path: '/movimientos', icon: History, label: 'Movimientos' },
    { path: '/categorias', icon: History, label: 'Categorías' },
    { path: '/proveedores', icon: History, label: 'Proveedores' },
    { path: '/informes', icon: History, label: 'Informes' }
  ];

  return (
    <>
      {/* MÓVIL: Barra superior con hamburguesa */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-blue-600 text-white z-50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Package className="w-6 h-6" />
            <span className="font-bold text-sm">Inventario Mantenimiento</span>
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-blue-700 rounded-lg transition"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menú desplegable móvil */}
        {isMenuOpen && (
          <div className="bg-blue-600 border-t border-blue-500">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-6 py-4 hover:bg-blue-700 transition ${isActive(item.path)}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            {/* Logout en móvil */}
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-6 py-4 hover:bg-red-600 transition border-t border-blue-500/50"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>

      {/* ESCRITORIO: Sidebar lateral (oculto en móvil) */}
      <nav className="hidden lg:flex w-64 bg-blue-600 text-white min-h-screen flex-col shadow-2xl sticky top-0">
        {/* Header del Sidebar */}
        <div className="p-6 flex items-center space-x-3 border-b border-blue-500/50">
          <Package className="w-8 h-8" />
          <span className="font-bold text-lg leading-tight">
            Inventario <br /> Mantenimiento
          </span>
        </div>
        
        {/* Enlaces del Menú */}
        <div className="flex-1 px-4 py-6">
          <div className="flex flex-col space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-blue-500 transition-all duration-200 group ${isActive(item.path)}`}
              >
                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer del Sidebar con Usuario y Logout */}
        <div className="p-4 border-t border-blue-500/50">
          {/* Info Usuario */}
          <div className="px-4 py-2 mb-2 bg-blue-700/50 rounded-lg">
            <p className="text-[10px] text-blue-200 uppercase font-bold">Usuario</p>
            <p className="text-sm font-medium truncate">{userName}</p>
          </div>
          
          {/* Botón Logout */}
          <button 
            onClick={onLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl hover:bg-red-600 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>

          <div className="mt-4 text-[10px] text-blue-200 text-center">
            © 2026 Sistema Inventario
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;