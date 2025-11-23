import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth.hook';

export default function Navbar() {
  const { user, logout } = useAuth();
  const isLoggedIn = user && user.rol; // Verifica si hay sesión activa
  const isAdmin = user && user.rol === 'admin';

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

      {isLoggedIn && (user.rol === 'instructor' || user.rol === 'admin') && (
        <Link to="/crear-curso">Crear Curso</Link>
      )}

      {isLoggedIn && user.rol === 'estudiante' && (
        <Link to="/mis-cursos">Mis Cursos</Link>
      )}

      {/*  Información y Botón de Salida (Siempre a la derecha si está logueado) */}
      {isLoggedIn ? (
        <span style={{ marginLeft: 'auto' }}>
          Bienvenido <strong>{user.nombre}</strong> ({user.rol})
          <button onClick={logout} style={{ marginLeft: '10px' }}>Salir</button>
        </span>
      ) : (
        <span style={{ marginLeft: 'auto' }}>No has iniciado sesión</span>
      )}
    </nav>
  );
}


     
  