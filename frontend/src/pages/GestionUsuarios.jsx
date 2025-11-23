
import { useState, useEffect } from 'react';
import { useAuth } from '../context/auth.hook';
import { Card, CardBody, CardHeader } from '../components/Card';

export default function GestionUsuarios() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Roles válidos que se pueden asignar
  const rolesValidos = ['estudiante', 'instructor', 'soporte', 'admin'];

  // 1. Obtener la lista de usuarios (Solo admin)
  const cargarUsuarios = () => {
    setError('');
    fetch('/api/admin/usuarios', { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          // Lanza un error si el admin no está logueado o tiene rol incorrecto (403/401)
          return res.json().then(data => { throw new Error(data.error || 'Error al cargar usuarios'); });
        }
        return res.json();
      })
      .then(data => setUsuarios(data))
      .catch(err => setError(err.message));
  };

  useEffect(() => {
    // Solo intenta cargar si el usuario está logueado y es admin
    if (user && user.rol === 'admin') {
      cargarUsuarios();
    } else if (user) {
      setError('Acceso denegado. Solo administradores pueden gestionar usuarios.');
    }
  }, [user]);

  // 2. Cambiar el rol de un usuario
  const cambiarRolUsuario = async (userId, nuevoRol) => {
    try {
      const res = await fetch(`/api/admin/usuarios/${userId}/rol`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol: nuevoRol }),
        credentials: 'include'
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Fallo al actualizar el rol.');
      }

      setMensaje(`Rol de usuario ${userId} actualizado a ${nuevoRol}.`);
      cargarUsuarios(); // Recargar la lista
      
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user || user.rol !== 'admin') {
    return <p style={{ color: 'red', textAlign: 'center' }}>Acceso restringido a administradores.</p>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: 'auto', padding: '20px' }}>
      <h2>Gestión de Usuarios</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      
      {usuarios.length === 0 ? (
        <p>No hay usuarios registrados (o error de carga).</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {usuarios.map(u => (
            <Card key={u.id}>
              <CardHeader>
                <strong>{u.nombre} {u.apellido}</strong>
              </CardHeader>
              <CardBody>
                <p>ID: {u.id}</p>
                <p>Correo: {u.correo}</p>
                <p>Rol actual: <strong>{u.rol}</strong></p>
                <label>
                  Cambiar Rol:
                  <select
                    value={u.rol}
                    onChange={e => cambiarRolUsuario(u.id, e.target.value)}
                    style={{ marginLeft: '10px' }}
                  >
                    {rolesValidos.map(rol => (
                      <option key={rol} value={rol}>{rol}</option>
                    ))}
                  </select>
                </label>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}