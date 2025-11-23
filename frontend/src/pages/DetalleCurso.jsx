import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/auth.hook'; 

export default function DetalleCurso() {
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth(); 

  console.log('Usuario de la sesión:', usuario);
  const [curso, setCurso] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(''); 

  useEffect(() => {
    
    setCargando(true);
    setError('');
    
    fetch(`/api/cursos/${id}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Error desconocido del servidor'); });
        }
        return res.json();
      })
      .then(data => {
        setCurso(data);
      })
      .catch(err => {
        setError(err.message);
        setCurso(null);
      })
      .finally(() => {
        setCargando(false);
      });
  }, [id]);

  
  const inscribirse = async () => {
    if (!usuario) {
      setMensaje('Debes iniciar sesión para inscribirte en un curso.');
      return;
    }

    setMensaje(''); // Limpiar mensajes
    
    try {
      // Usamos la ruta ya definida en cursos.js
      const res = await fetch(`/api/cursos/${id}/inscribirse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar la inscripción.');
      }

      setMensaje(data.mensaje || '¡Inscripción exitosa!');
      
      // Opcional: Redirigir a Mis Cursos después de una inscripción exitosa
      setTimeout(() => {
         navigate('/mis-cursos');
      }, 1500);

    } catch (err) {
      setMensaje('Error: ' + err.message);
    }
  };
  
  // --- Lógica de Renderizado ---
  
  if (cargando) return <p>Cargando curso...</p>;

  if (error) return <p style={{ color: 'red' }}>Error al cargar el curso: {error}</p>;

  if (!curso || !curso.id) return <p>El curso con ID {id} no fue encontrado.</p>;

  return (
  <div style={{ maxWidth: '700px', margin: 'auto' }}>
    <h2>{curso.titulo}</h2>
    <p>{curso.descripcion}</p>
    {/* ... otros detalles ... */}

    
    {usuario ? (
      // SI el usuario EXISTE, solo mostramos el botón.
      <button onClick={inscribirse}>Inscribirme</button>
    ) : (
      // SI el usuario NO EXISTE, mostramos el mensaje de advertencia.
      <p style={{ color: 'orange', fontWeight: 'bold' }}>
        Debes iniciar sesión para inscribirte en un curso.
      </p>
    )}
    

    
    {mensaje && <p style={{ color: mensaje.includes('Error') ? 'red' : 'green' }}>{mensaje}</p>}
  </div>
);
}