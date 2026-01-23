import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/navbar';
import Home from './pages/Home';
import Productos from './pages/Productos';
import Movimientos from './pages/Movimientos';
import Categorias from './pages/Categorias';
import Proveedores from './pages/Proveedores';
import Login from './pages/Login'; // Asegúrate de crear este archivo
import Registro from './pages/Registro';

// --- COMPONENTE DE RUTA PROTEGIDA ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Escuchar cambios en el login
  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100">

        {/* Solo mostramos el Navbar si el usuario está autenticado */}
        {isAuthenticated && <Navbar onLogout={handleLogout} />}

        <main className={`flex-1 ${isAuthenticated ? 'p-10' : 'p-0'}`}>
          <Routes>
            {/* Ruta Pública */}
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


            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;