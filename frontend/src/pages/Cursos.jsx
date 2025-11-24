import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth.hook';


export default function Cursos() {
  const { usuario } = useAuth();
  const [cursos, setCursos] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
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
    <div>
      <h2>{titulo}</h2>
      {error && <p style={{ color: 'red' }}>Error al cargar los cursos: {error}</p>}
      
      {/* Nuevo Bloque de Comprobación de Lista Vacía */}
      {cursos.length === 0 && !error && (
        <p style={{ color: esGestion ? 'blue' : 'gray' }}>
          {esGestion 
            ? 'Actualmente no tienes cursos para gestionar. ¡Crea uno para empezar!' 
            : 'No hay cursos disponibles en el catálogo en este momento.'
          }
        </p>
      )}

      {cursos.length > 0 && (
        <ul>
          {cursos.map(curso => {
            
            const esInstructor = usuario && usuario.rol === 'instructor';
            const esAdmin = usuario && usuario.rol === 'admin';
            
            // Determinar si el usuario es el instructor de este curso
            const esPropietario = esInstructor 
              && String(usuario.id) === String(curso.instructor_id);
              
            // Puede gestionar si es Admin O es el Instructor Propietario
            const puedeGestionar = esAdmin || esPropietario;

            return (
              <li key={curso.id} style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                {curso.titulo} - {curso.habilitado ? 'Activo' : 'Inactivo'}
                
                <Link to={`/curso/${curso.id}`} style={{ marginLeft: '15px', textDecoration: 'none', color: '#007bff' }}>Ver detalle</Link>
                
                {/* Mostrar botón de Edición solo si puede gestionar */}
                {puedeGestionar && (
                  <Link to={`/editar-curso/${curso.id}`} style={{ marginLeft: '15px' }}>
                    <button style={{ backgroundColor: 'orange', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', color: 'white' }}>
                      Editar Curso
                    </button>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}