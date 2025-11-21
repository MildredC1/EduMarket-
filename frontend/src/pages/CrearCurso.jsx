import { useState, useEffect } from 'react';
import { useAuth } from '../context/auth.hook';

export default function CrearCurso() {
  const { user } = useAuth(); // aquí tienes el usuario logueado
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    imagen_principal: '',
    imagenes_secundarias: [],
    precio: '',
    nivel: '',
    enlace_youtube: '',
    categorias: []
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // 🔹 Cargar categorías desde el backend
  useEffect(() => {
    fetch('/api/categorias')
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(err => console.error('Error al cargar categorías:', err));
  }, []);

  // 🔹 Manejar cambios en inputs
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Manejar selección múltiple de categorías
  const handleCategoriasChange = e => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    setForm({ ...form, categorias: values });
  };

  // 🔹 Enviar formulario al backend
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setMensaje('');

    try {
      const res = await fetch('/api/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear curso');

      setMensaje(data.mensaje);
      setForm({
        titulo: '',
        descripcion: '',
        imagen_principal: '',
        imagenes_secundarias: [],
        precio: '',
        nivel: '',
        enlace_youtube: '',
        categorias: []
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto' }}>
      <h2>Crear Curso</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="titulo" placeholder="Título" value={form.titulo} onChange={handleChange} required />
        <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} required />
        <input type="text" name="imagen_principal" placeholder="URL imagen principal" value={form.imagen_principal} onChange={handleChange} required />
        <input type="number" name="precio" placeholder="Precio" value={form.precio} onChange={handleChange} required />
        <input type="text" name="nivel" placeholder="Nivel (básico, intermedio, avanzado)" value={form.nivel} onChange={handleChange} required />
        <input type="text" name="enlace_youtube" placeholder="Enlace YouTube" value={form.enlace_youtube} onChange={handleChange} />

        <label>Categorías:</label>
        <select name="categorias" multiple value={form.categorias} onChange={handleCategoriasChange} required>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>

        <button type="submit">Crear curso</button>
      </form>

      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
