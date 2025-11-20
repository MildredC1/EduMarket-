import { useEffect, useState } from 'react';

export default function Cursos() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/cursos')   // gracias al proxy, apunta al backend
      .then(res => {
        if (!res.ok) throw new Error('Error en la respuesta del servidor');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setCursos(data);
        } else {
          setError('El backend no devolvió un array');
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando cursos...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <h2>Cursos disponibles</h2>
      <ul>
        {cursos.map(curso => (
          <li key={curso.id || curso.ID}>
            {curso.nombre || curso.nombre_curso}
          </li>
        ))}
      </ul>
    </div>
  );
}
