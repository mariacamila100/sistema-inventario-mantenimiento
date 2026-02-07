import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/navbar';
import Home from './pages/Home';
import Productos from './pages/Productos';
import Movimientos from './pages/Movimientos';
import Categorias from './pages/Categorias';
import Proveedores from './pages/Proveedores';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Informes from './pages/Informes'; 
import Marcas from './pages/Marcas';

// --- COMPONENTE DE RUTA PROTEGIDA ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  // Cargar datos del usuario al iniciar o recargar
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parseando usuario", e);
      }
    }
  }, [isAuthenticated]);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <Router>
      {/* Añadimos bg-slate-50 aquí para que toda la pantalla tenga 
        color de fondo siempre, evitando el flash blanco.
      */}
      <div className="flex min-h-screen bg-slate-50 w-full overflow-x-hidden">
        
        {/* Navbar lateral/superior */}
        {isAuthenticated && (
          <Navbar 
            onLogout={handleLogout} 
            userName={user?.nombre_completo || user?.username || 'Usuario'} 
          />
        )}

        {/* CAMBIOS REALIZADOS:
          1. Eliminada la clase 'transition-all duration-300' (Culpable del movimiento extraño).
          2. Si no está autenticado, el main ocupa el 100% sin paddings extra.
        */}
        <main className={`flex-1 flex flex-col ${isAuthenticated ? 'lg:p-8 p-4 mt-16 lg:mt-0' : 'w-full'}`}>
          <Routes>
            {/* Rutas Públicas */}
            <Route
              path="/login"
              element={!isAuthenticated ? <Login onLoginSuccess={handleLogin} /> : <Navigate to="/" replace />}
            />
            <Route
              path="/registro"
              element={!isAuthenticated ? <Registro /> : <Navigate to="/" replace />}
            />

            {/* Rutas Protegidas */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/productos" element={<ProtectedRoute><Productos /></ProtectedRoute>} />
            <Route path="/movimientos" element={<ProtectedRoute><Movimientos /></ProtectedRoute>} />
            <Route path="/categorias" element={<ProtectedRoute><Categorias /></ProtectedRoute>} />
            <Route path="/proveedores" element={<ProtectedRoute><Proveedores /></ProtectedRoute>} />
            <Route path="/marcas" element={<ProtectedRoute><Marcas /></ProtectedRoute>} />
            <Route path="/informes" element={<ProtectedRoute><Informes /></ProtectedRoute>} />

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;