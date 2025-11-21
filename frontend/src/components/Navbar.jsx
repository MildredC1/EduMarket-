import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth.hook';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={{ padding: '10px', background: '#eee', display: 'flex', gap: '10px' }}>
      <Link to="/">Inicio</Link>
      <Link to="/registro">Registrarse</Link>
      <Link to="/cursos">Cursos</Link>
      <Link to="/login">Login</Link> 

      {user ? (
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
