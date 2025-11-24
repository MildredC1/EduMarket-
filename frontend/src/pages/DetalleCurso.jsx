import { useState, useEffect } from 'react';
import { useParams, useNavigate,Link} from 'react-router-dom'; 
import { useAuth } from '../context/auth.hook'; 

export default function DetalleCurso() {

  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth(); 

// Variables de Control de Roles
  const isLoggedIn = usuario && usuario.rol;
  const isStudent = usuario && usuario.rol === 'estudiante';
  
  console.log('Usuario de la sesión:', usuario);
  const [curso, setCurso] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [estaInscrito, setEstaInscrito] = useState(false);
  const [contenido, setContenido] = useState(null); 

  useEffect(() => {
    
    setCargando(true);
    setError('');
    
    // Asegúrate de que esta llamada traiga la propiedad estaInscrito del backend
    fetch(`/api/cursos/${id}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Error desconocido del servidor'); });
        }
        return res.json();
      })
      .then(data => {
        setCurso(data.curso); // El backend debe devolver { curso: data, estaInscrito: boolean }
        setEstaInscrito(data.estaInscrito || false); // <-- Usamos el valor del backend
        setContenido(data.contenido || null);
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
    // 1. Validar que el usuario haya iniciado sesión
    if (!usuario) {
        setMensaje('Debes iniciar sesión para inscribirte en un curso.');
        return;
    }

    setMensaje('');
    
    // 2. Comprobación de curso ya comprado (Respuesta inmediata)
    // ESTA LÍNEA DEBE SER REDUNDANTE si el backend funciona, pero es buena práctica
    if (estaInscrito) {
        alert('¡Ya estás inscrito en este curso!');
        return;
    }

    try {
        // Llama al endpoint de inscripción
        const res = await fetch(`/api/cursos/${id}/inscribirse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok) {
            // Captura errores del backend (incluyendo el de duplicado 'Ya estás inscrito...')
            throw new Error(data.error || 'Error al completar la compra.');
        }

        // 3. Alerta de éxito y confirmación de redirección
        const confirmar = window.confirm(
            '¡Felicidades! Curso comprado exitosamente.\n\n¿Quieres ver tus cursos ahora?'
        );

        if (confirmar) {
            // Redirigir a la ruta de Mis Cursos
            navigate('/mis-cursos');
        } else {

            setEstaInscrito(true);
            setMensaje('¡Curso comprado correctamente! Puedes ir a "Mis Cursos" cuando quieras.');
        }

    } catch (err) {
        setMensaje('Error: ' + err.message);
    }
  };

  const eliminar = async () => {
     if (!window.confirm("¿Estás seguro de ELIMINAR este curso de forma definitiva?")) return;

      try {
        const res = await fetch(`/api/cursos/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Error al eliminar el curso.');
        }

        alert(data.mensaje || 'Curso eliminado exitosamente.');
        navigate('/cursos'); // Redirigir al catálogo
      } catch (err) {

        alert('Error: ' + err.message);
      }
  };

  // --- Lógica de Botones Condicionales CORREGIDA ---
  const BotonesAccion = () => {
       if (!curso) return null; 
       
       const esPropietario = usuario && String(usuario.id) === String(curso.instructor_id); 
       
       const puedeGestionar = usuario && (usuario.rol === 'admin' || (usuario.rol === 'instructor' && esPropietario));
       
       // 1. Botones para ADMIN/INSTRUCTOR
       if (puedeGestionar) {
         return (
              <div style={{ marginTop: '20px' }}>
                 <Link to={`/editar-curso/${id}`}>
                     <button style={{ backgroundColor: 'orange', marginRight: '10px' }}>
                        Editar Curso
                      </button>
                  </Link>
                    {usuario.rol === 'admin' && (
                      <button onClick={eliminar} style={{ backgroundColor: 'red' }}>
                         Eliminar Curso
                      </button>
                   )}
                 
                </div>
            );
        }

  // 2. Botones para ESTUDIANTE
      if (isStudent) {
          if (estaInscrito) {
              return (
                // AHORA REDIRIGE CON LINK A MIS CURSOS
                  <div style={{ marginTop: '20px' }}>
                      <p style={{ color: 'green', fontWeight: 'bold' }}>¡Ya estás inscrito en este curso!</p>
                       <Link to="/mis-cursos"> 
                         <button style={{ backgroundColor: 'blue' }}>
                            Ir a Mis Cursos / Contenido
                         </button>
                       </Link>
                    </div>
                );
            } else {

  // Si es estudiante y NO está inscrito (Mostrar "Comprar Curso")
              return (
                  <div style={{ marginTop: '20px' }}>
                      <button onClick={inscribirse} style={{ backgroundColor: 'green' }}>
                        Comprar Curso (Precio: ${curso.precio})
                      </button>
                  </div>
                );
            }
      }

  // 3. Botones para Visitante (o Instructor No Propietario / no logueado)
       return (
            <div style={{ marginTop: '20px' }}>
              <p>Debes <Link to="/login">iniciar sesión</Link> como estudiante para comprar este curso.</p>
              <button disabled style={{ backgroundColor: '#ccc' }}>
                  Comprar Curso (Precio: ${curso.precio})
              </button>
          </div>
     );
  };

  // Definición de ContenidoCurso (se mantiene sin cambios)
  const ContenidoCurso = ({ contenido }) => {
      if (!contenido || contenido.length === 0) {
          return <p>Este curso aún no tiene contenido publicado.</p>;
      }

      return (
          <div style={{ border: '1px solid #007bff', padding: '15px', marginTop: '20px' }}>
              <h3>Contenido del Curso </h3>
              {contenido.map(modulo => (
                  <div key={modulo.id} style={{ marginBottom: '15px' }}>
                      <h4 style={{ color: '#007bff', borderBottom: '1px solid #eee' }}>
                          {modulo.titulo}
                      </h4>
                      {modulo.lecciones.length > 0 ? (
                          <ol style={{ paddingLeft: '20px' }}>
                              {modulo.lecciones.map(leccion => (
                                  <li key={leccion.id} style={{ marginBottom: '5px' }}>
                                      <span style={{ fontWeight: 'bold' }}>{leccion.titulo}</span>
                                  </li>
                              ))}
                          </ol>
                      ) : (
                          <p>Módulo sin lecciones.</p>
                      )}
                  </div>
              ))}
          </div>
      );
    }
    
  // --- RETORNO PRINCIPAL ---
  if (cargando) return <div>Cargando detalle del curso...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!curso) return <div>Curso no encontrado o no disponible.</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>{curso.titulo}</h1>
      <p style={{ fontStyle: 'italic' }}>Por: {curso.instructor_nombre} {curso.instructor_apellido}</p>
      <p>Nivel: **{curso.nivel}**</p>
      <p>Precio: **${curso.precio}**</p>
      <p>Rating: **{curso.rating_promedio ? curso.rating_promedio.toFixed(1) : 'Sin calificación'}**</p>
      <p>Categorías: **{curso.categorias || 'No asignadas'}**</p>
      
      <p>{curso.descripcion}</p>

      {/* Mensaje de éxito/error de inscripción o eliminación */}
      {mensaje && <p style={{ color: mensaje.startsWith('Error') ? 'red' : 'green', fontWeight: 'bold' }}>{mensaje}</p>}
      
      {/* Botones de acción (gestión o compra) */}
      <BotonesAccion />
      
      {/* Contenido (Solo se debería mostrar si estaInscrito es true) */}
      {estaInscrito && <ContenidoCurso contenido={contenido} />}
      
    </div>
  );
}