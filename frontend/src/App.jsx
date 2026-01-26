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
      setUser(JSON.parse(savedUser));
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
      <div className="flex min-h-screen bg-slate-50">
        
        {/* Navbar con datos del usuario y función de logout */}
        {isAuthenticated && (
          <Navbar 
            onLogout={handleLogout} 
            userName={user?.nombre_completo || user?.username || 'Usuario'} 
          />
        )}

        <main className={`flex-1 transition-all duration-300 ${isAuthenticated ? 'lg:p-8 p-4 mt-16 lg:mt-0' : 'p-0'}`}>
          <Routes>
            {/* Rutas Públicas */}
            <Route
              path="/login"
              element={!isAuthenticated ? <Login onLoginSuccess={handleLogin} /> : <Navigate to="/" />}
            />
            <Route
              path="/registro"
              element={!isAuthenticated ? <Registro /> : <Navigate to="/" />}
            />

            {/* Rutas Protegidas */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/productos" element={<ProtectedRoute><Productos /></ProtectedRoute>} />
            <Route path="/movimientos" element={<ProtectedRoute><Movimientos /></ProtectedRoute>} />
            <Route path="/categorias" element={<ProtectedRoute><Categorias /></ProtectedRoute>} />
            <Route path="/proveedores" element={<ProtectedRoute><Proveedores /></ProtectedRoute>} />
            
            {/* NUEVA RUTA DE INFORMES AÑADIDA AQUÍ */}
            <Route path="/informes" element={<ProtectedRoute><Informes /></ProtectedRoute>} />

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;