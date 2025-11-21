import { useState, useEffect } from 'react';

export default function MisCursos() {
  const [cursos, setCursos] = useState([]);

  useEffect(() => {
    fetch('/api/cursos/mis-cursos', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCursos(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Mis Cursos</h2>
      {cursos.length === 0 ? (
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
