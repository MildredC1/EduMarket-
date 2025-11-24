// Cursos.jsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth.hook';
import CursoCard from '../components/CursoCard';


export default function Cursos() {
  const { usuario } = useAuth();
  const [cursos, setCursos] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    // Usa la lógica de gestión (instructor/admin) para la ruta de fetch
    const esGestion = usuario && (usuario.rol === 'instructor' || usuario.rol === 'admin');
    const fetchUrl = esGestion ? '/api/cursos/gestion' : '/api/cursos';
      

    fetch(fetchUrl, { credentials: 'include' }) 
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCursos(data);
        } else {
          setError(data.error || 'Respuesta inesperada al cargar cursos.');
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setCargando(false));
  }, [usuario]);

  const esGestion = usuario && (usuario.rol === 'instructor' || usuario.rol === 'admin');
  const titulo = esGestion ? 'Gestión de Cursos' : 'Cursos disponibles';

  // --- Lógica de Renderizado ---
  
  if (cargando) {
    return <div>Cargando cursos...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>{titulo}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {esGestion && (
        <Link to="/crear-curso" style={{ marginBottom: '20px', display: 'inline-block' }}>
          <button>Crear Nuevo Curso</button>
        </Link>
      )}

      {cursos.length === 0 && !error && (
        <p>No hay cursos disponibles en este momento.</p>
      )}

      {cursos.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0' }}> 
          {cursos.map(curso => {
            
            const esInstructor = usuario?.rol === 'instructor';
            const esAdmin = usuario?.rol === 'admin';
            
            // Determinar si el usuario es el instructor de este curso
            const esPropietario = esInstructor 
              && String(usuario?.id) === String(curso.instructor_id); 
              
            // Puede gestionar si es Admin O es el Instructor Propietario
            const puedeGestionar = esAdmin || esPropietario;
            
            return (
              <CursoCard 
                key={curso.id} 
                curso={curso} 
                // La gestión solo tiene sentido si la ruta es '/gestion' (esGestion es true)
                puedeGestionar={puedeGestionar && esGestion} 
                usuarioLogueado={usuario} // 🚨 CAMBIO AÑADIDO: Pasar el objeto usuario
              />
            );
          })}
        </div>
      )}
    </div>
  );
}