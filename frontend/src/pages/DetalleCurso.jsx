import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; 
import { useAuth } from '../context/auth.hook'; 
import LeccionCard from '../components/LeccionCard';
import RatingComentario from '../components/RatingComentario';

export default function DetalleCurso() {

    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario } = useAuth(); 

    // Variables de Control de Roles
    const isStudent = usuario && usuario.rol === 'estudiante';
    const isLoggedIn = usuario && usuario.rol;

    const [curso, setCurso] = useState(null);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(true);
    const [mensaje, setMensaje] = useState('');
    const [estaInscrito, setEstaInscrito] = useState(false);
    const [contenido, setContenido] = useState(null); 

    useEffect(() => {
        
        setCargando(true);
        setError('');
        
        // Asegúrate de que esta llamada traiga la propiedad estaInscrito y el 'contenido' del backend
        fetch(`/api/cursos/${id}`, { credentials: 'include' })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(data => { throw new Error(data.error || 'Error desconocido del servidor'); });
                }
                return res.json();
            })
            .then(data => {
                setCurso(data.curso); 
                setEstaInscrito(data.estaInscrito || false); 
                // El backend debe devolver el contenido (módulos y lecciones) si el usuario está inscrito
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
        if (!usuario) {
            setMensaje('Debes iniciar sesión para inscribirte en un curso.');
            return;
        }

        setMensaje('');
        
        if (estaInscrito) {
            alert('¡Ya estás inscrito en este curso!');
            return;
        }

        try {
            const res = await fetch(`/api/cursos/${id}/inscribirse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al completar la compra.');
            }

            const confirmar = window.confirm(
                '¡Felicidades! Curso comprado exitosamente.\n\n¿Quieres ver tus cursos ahora?'
            );

            if (confirmar) {
                navigate('/mis-cursos');
            } else {

                setEstaInscrito(true);
                setMensaje('¡Curso comprado correctamente! Puedes ir a "Mis Cursos" cuando quieras.');
                // Re-cargar el contenido tras la inscripción (opcional, si el backend lo requiere)
                // fetchContenido(); 
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
            navigate('/cursos'); 
        } catch (err) {

            alert('Error: ' + err.message);
        }
    };

    // --- Lógica de Botones Condicionales ---
    const BotonesAccion = () => {
        if (!curso) return null; 
        
        const esPropietario = usuario && String(usuario.id) === String(curso.instructor_id); 
        
        const puedeGestionar = usuario && (usuario.rol === 'admin' || (usuario.rol === 'instructor' && esPropietario));
        
        // 1. Botones para ADMIN/INSTRUCTOR (Gestionar Contenido y Editar)
        if (puedeGestionar) {
            return (
                <div style={{ marginTop: '20px' }}>
                    <Link to={`/editar-curso/${id}`}>
                        <button style={{ backgroundColor: 'orange', marginRight: '10px' }}>
                            Editar Detalles
                        </button>
                    </Link>
                    {/* ENLACE PARA GESTIONAR MÓDULOS Y LECCIONES */}
                    <Link to={`/editar-curso/${id}/contenido`}> 
                        <button style={{ backgroundColor: 'darkblue', marginRight: '10px' }}>
                            Gestionar Contenido
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

    // Definición de ContenidoCurso (IMPLEMENTA CARDS Y REPRODUCTOR)
    const ContenidoCurso = ({ contenido }) => {
    if (!contenido || contenido.length === 0) {
        return <p>Este curso aún no tiene contenido publicado.</p>;
    }

    return (
        <div style={{ marginTop: '30px' }}>
            <h2>Contenido del Curso</h2>
            {contenido.map(modulo => (
                <div key={modulo.id} style={{ marginBottom: '40px' }}>
                    <h3 style={{ color: '#007bff', borderBottom: '2px solid #007bff', paddingBottom: '5px' }}>
                        Módulo {modulo.orden}: {modulo.titulo}
                    </h3>

                    {modulo.lecciones && modulo.lecciones.length > 0 ? (
                        <div>
                            {modulo.lecciones.map((leccion) => (
                                // Utiliza el LeccionCard
                                <LeccionCard 
                                    key={leccion.id} 
                                    leccion={leccion} 
                                />
                            ))}
                        </div>
                    ) : (
                        <p>Módulo sin lecciones.</p>
                    )}
                </div>
            ))}

            {/* ⭐️ SECCIÓN DE RATING Y COMENTARIO ⭐️ */}
            {isStudent && usuario && (
                <RatingComentario cursoId={curso.id} usuarioId={usuario.id} />
            )}
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
            <p style={{ fontStyle: 'italic' }}>Por: **{curso.instructor_nombre} {curso.instructor_apellido}**</p>
            <p>Nivel: **{curso.nivel}**</p>
            <p>Precio: **${curso.precio}**</p>
            <p>Rating Promedio: **{curso.rating_promedio ? curso.rating_promedio.toFixed(1) + ' ★' : 'Sin calificación'}**</p>
            
            <p style={{ marginTop: '15px' }}>{curso.descripcion}</p>

            {/* Mensaje de éxito/error de inscripción o eliminación */}
            {mensaje && <p style={{ color: mensaje.startsWith('Error') ? 'red' : 'green', fontWeight: 'bold' }}>{mensaje}</p>}
            
            {/* Botones de acción (gestión o compra) */}
            <BotonesAccion />
            
            {/* Contenido (Solo se muestra si estaInscrito es true) */}
            {estaInscrito && <ContenidoCurso contenido={contenido} />}
            
        </div>
    );
}