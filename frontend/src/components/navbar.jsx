import { Link, useLocation } from 'react-router-dom';
import { Package, History, Home, Menu, X, LogOut, Wind, LayoutDashboard, Boxes, ClipboardList, Truck, FileText, Warehouse } from 'lucide-react'; 
import { useState } from 'react';

function Navbar({ onLogout, userName }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isActive = (path) => {
    // Usamos el azul más claro para resaltar el item activo sobre el fondo oscuro
    return location.pathname === path ? 'bg-[#00529b] shadow-lg shadow-blue-900/20' : '';
  };

  // He actualizado algunos iconos para que se vean más acordes a un sistema técnico
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Inicio' },
    { path: '/productos', icon: Boxes, label: 'Productos' },
    { path: '/movimientos', icon: History, label: 'Movimientos' },
    { path: '/bodegas', icon: Warehouse, label: 'Bodegas' },
     { path: '/marcas', icon: Package, label: 'Marcas'},
    { path: '/proveedores', icon: Truck, label: 'Proveedores' },
    { path: '/informes', icon: FileText, label: 'Informes' },
   
  ];

  return (
    <>
      {/* MÓVIL: Barra superior con el azul de Aconfrios */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#003366] text-white z-50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Wind className="w-6 h-6 text-blue-300" />
            <span className="font-bold text-sm tracking-tight uppercase">Aconfrios S.A.</span>
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-[#00529b] rounded-lg transition"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menú desplegable móvil */}
        {isMenuOpen && (
          <div className="bg-[#003366] border-t border-white/10">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-6 py-4 hover:bg-[#00529b] transition ${isActive(item.path)}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-6 py-4 hover:bg-red-600 transition border-t border-white/5"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>

      {/* ESCRITORIO: Sidebar con degradado corporativo */}
      <nav className="hidden lg:flex w-64 bg-gradient-to-b from-[#003366] to-[#002244] text-white min-h-screen flex-col shadow-2xl sticky top-0">
        
        {/* Header del Sidebar - Icono Wind de Aconfrios */}
        <div className="p-6 flex items-center space-x-3 border-b border-white/10">
          <Wind className="w-8 h-8 text-blue-300" />
          <span className="font-black text-lg leading-tight tracking-tighter uppercase">
            Aconfrios <br /> <span className="text-blue-200 text-xs font-medium normal-case tracking-normal italic">Inventario</span>
          </span>
        </div>
        
        {/* Enlaces del Menú */}
        <div className="flex-1 px-4 py-6">
          <div className="flex flex-col space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-[#00529b]/50 transition-all duration-200 group ${isActive(item.path)}`}
              >
                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform text-blue-200" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer del Sidebar con Usuario y Logout */}
        <div className="p-4 border-t border-white/10 bg-black/10">
          {/* Info Usuario */}
          <div className="px-4 py-3 mb-2 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[10px] text-blue-300 uppercase font-black tracking-widest">Personal Técnico</p>
            <p className="text-sm font-bold truncate text-white">{userName}</p>
          </div>
          
          {/* Botón Logout */}
          <button 
            onClick={onLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl hover:bg-red-600/20 hover:text-red-400 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-bold text-sm">Cerrar Sesión</span>
          </button>

          <div className="mt-4 text-[9px] text-white/30 text-center font-medium tracking-tighter">
            © 2026 ACONFRIOS S.A. <br /> CONFORT PARA LA VIDA
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;