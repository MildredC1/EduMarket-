import { useEffect, useState } from 'react';

export default function Cursos() {
  const [cursos, setCursos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/cursos', { credentials: 'include' }) // incluye cookies de login
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCursos(data);
        } else {
          setError(data.error || 'Respuesta inesperada');
        }
      })
      .catch(err => setError(err.message));
  }, []);

  return (
    <div>
      <h2>Cursos disponibles</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {cursos.map(curso => (
          <li key={curso.id}>{curso.titulo} - {curso.habilitado ? 'Activo' : 'Inactivo'}</li>
        ))}
      </ul>
    </div>
  );
}
