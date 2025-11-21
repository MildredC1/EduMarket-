import { useState, useEffect } from 'react';

export default function MisCursos() {
  const [cursos, setCursos] = useState([]);
  const [error, setError] = useState(null); // Nuevo estado para manejar errores

  useEffect(() => {
    // 1. Limpiar errores antes de la solicitud
    setError(null); 
    
    fetch('/api/cursos/mis-cursos', { credentials: 'include' })
      .then(res => {
        // 2. Manejo de errores: Si la respuesta no es OK, leer el error del body
        if (!res.ok) {
           return res.json().then(data => { throw new Error(data.error || `Error del servidor: Código ${res.status}`); });
        }
        return res.json();
      })
      .then(data => {
        // 3. Verificar que la data sea un array para evitar el TypeError
        if (Array.isArray(data)) {
          setCursos(data);
        } else {
          throw new Error('Formato de respuesta inesperado del servidor. Se esperaba una lista.');
        }
      })
      .catch(err => {
        console.error(err);
        setError(err.message); // Guardar el error para mostrarlo
        setCursos([]); // IMPORTANTE: Asegurar que 'cursos' es un array vacío
      });
  }, []);

  return (
    <div>
      <h2>Mis Cursos</h2>
      {error && <p style={{ color: 'red' }}>Error al cargar los cursos: {error}</p>} {/* Mostrar mensaje de error */}
      
      {/* Lógica para mostrar "No tienes cursos inscritos todavía." si no hay cursos Y NO hay error */}
      {cursos.length === 0 && !error ? (
        <p>No tienes cursos inscritos todavía.</p>
      ) : (
        cursos.map(curso => (
          <div key={curso.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h3>{curso.titulo}</h3>
            <p>{curso.descripcion}</p>
            <small>Categorías: {curso.categorias}</small>
          </div>
        ))
      )}
    </div>
  );
}