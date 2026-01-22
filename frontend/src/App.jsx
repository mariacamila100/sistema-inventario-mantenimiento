
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import Home from './pages/Home';
import Productos from './pages/Productos';
import Movimientos from './pages/Movimientos';
import Categorias from './pages/Categorias';
import Proveedores from './pages/Proveedores';


function App() {
  return (
    <Router>
      {/* Añadimos 'flex' para poner los elementos uno al lado del otro */}
      <div className="flex min-h-screen bg-gray-100">
        
        {/* Lado izquierdo: El menú lateral */}
        <Navbar />

        {/* Lado derecho: El contenido de las páginas */}
        <main className="flex-1 p-10"> 
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/movimientos" element={<Movimientos />} />   
            <Route path="/categorias" element={<Categorias />} /> 
            <Route path="/proveedores" element={<Proveedores />} /> 
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;