import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function DetalleCurso() {
  const { id } = useParams(); // id del curso desde la URL
  const [curso, setCurso] = useState(null);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    fetch(`/api/cursos/catalogo/cursos/${id}`)
      .then(res => res.json())
      .then(data => setCurso(data))
      .catch(err => console.error(err));
  }, [id]);

  const inscribirse = async () => {
    try {
      const res = await fetch(`/api/cursos/${id}/inscribirse`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      setMensaje(data.mensaje || data.error);
    } catch (err) {
      setMensaje('Error al inscribirse');
    }
  };

  if (!curso) return <p>Cargando curso...</p>;

  return (
    <div>
      <h2>{curso.titulo}</h2>
      <p>{curso.descripcion}</p>
      <p>Precio: {curso.precio}</p>
      <p>Instructor: {curso.instructor_nombre} {curso.instructor_apellido}</p>

      <button onClick={inscribirse}>Inscribirme</button>

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}
