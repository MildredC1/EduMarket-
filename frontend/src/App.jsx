import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Inicio from './pages/Inicio.jsx';
import Cursos from './pages/Cursos.jsx';
import Registro from './pages/Registro.jsx';
import Login from './pages/Login.jsx';
import CrearCurso from './pages/CrearCurso';
import DetalleCurso from './pages/DetalleCurso';
import MisCursos from './pages/MisCursos'; 



export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cursos" element={<Cursos />} />
        <Route path="/crear-curso" element={<CrearCurso />} />
        <Route path="/curso/:id" element={<DetalleCurso />} />
        <Route path="/mis-cursos" element={<MisCursos />} />
      </Routes>
    </BrowserRouter>
  );
}



