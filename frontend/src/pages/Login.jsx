import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth.hook';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setMensaje('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena }),
        credentials: 'include' // las cookies
      });
      let data;
      try {
        data = await res.json();
      } catch (e) {
        // Manejar el caso de una respuesta no-JSON (como una página de error 500 por defecto)
        // Puedes lanzar un error genérico o verificar el estado de la respuesta aquí.
        if (!res.ok) {
           throw new Error(`Error en el servidor: Código ${res.status}`);
        }
        // Si res.ok es true, pero falló el JSON, es un problema inusual.
        throw new Error('Respuesta inválida del servidor (No JSON)');
      }
      
      // Ahora, verificamos si la respuesta fue exitosa (res.ok es true para 200-299)
      if (!res.ok) {
        // Si res.ok es false, `data` debería contener el objeto de error del servidor.
        // Si el servidor no devolvió un cuerpo con el error, el `data.error` podría ser undefined.
        throw new Error(data.error || `Error en el inicio de sesión con estado ${res.status}`);
      }

      // Guardar usuario en contexto
      login(data.usuario.correo, data.usuario.rol, data.usuario.nombre);

      setMensaje(data.mensaje);
      navigate('/'); // redirige al inicio
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={e => setCorreo(e.target.value)}
          required
          style={{ display: 'block', marginBottom: '10px', width: '100%' }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={e => setContrasena(e.target.value)}
          required
          style={{ display: 'block', marginBottom: '10px', width: '100%' }}
        />
        <button type="submit">Ingresar</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
    </div>
  );
}
