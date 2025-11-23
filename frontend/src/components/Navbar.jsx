import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth.hook';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const isLoggedIn = usuario && usuario.rol; // Verifica si hay sesión activa
  const isAdmin = usuario && usuario.rol === 'admin';

  return (
    <nav style={{ padding: '10px', background: '#eee', display: 'flex', gap: '10px' }}>
      <Link to="/">Inicio</Link>
      <Link to="/cursos">Cursos</Link>
      {/* Mostrar solo si NO está logueado */}
      {!isLoggedIn && (
        <>
          <Link to="/registro">Registrarse</Link>
          <Link to="/login">Login</Link>
        </>
      )}
      {/*  Enlaces condicionales por Rol */}
      {isAdmin && (
        <Link to="/gestion-usuarios">Gestionar Usuarios</Link> // 👈 NUEVO ENLACE ADMIN
      )} 

      {isLoggedIn && (usuario.rol === 'instructor' || usuario.rol === 'admin') && (
        <Link to="/crear-curso">Crear Curso</Link>
      )}

      {isLoggedIn && usuario.rol === 'estudiante' && (
        <Link to="/mis-cursos">Mis Cursos</Link>
      )}

      {/*  Información y Botón de Salida (Siempre a la derecha si está logueado) */}
      {isLoggedIn ? (
        <span style={{ marginLeft: 'auto' }}>
          Bienvenido <strong>{usuario.nombre}</strong> ({usuario.rol})
          <button onClick={logout} style={{ marginLeft: '10px' }}>Salir</button>
        </span>
      ) : (
        <span style={{ marginLeft: 'auto' }}>No has iniciado sesión</span>
      )}
    </nav>
  );
}


     
  