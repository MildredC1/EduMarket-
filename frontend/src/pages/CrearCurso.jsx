import { useState, useEffect } from 'react';
import { useAuth } from '../context/auth.hook';

export default function CrearCurso() {
  const { user } = useAuth(); 
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

  useEffect(() => {
    fetch('/api/categorias')
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(err => console.error('Error al cargar categorías:', err));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
        {/* 🔹 Título */}
        <input 
          type="text" 
          name="titulo" 
          placeholder="Título" 
          value={form.titulo} 
          onChange={handleChange} 
          required 
        />

        {/* 🔹 Categorías justo después del título */}
        <label style={{ display: 'block', marginTop: '10px' }}>Categorías:</label>
        <div style={{ marginBottom: '15px' }}>
          {categorias.map(cat => (
            <label key={cat.id} style={{ display: 'inline-block', marginRight: '10px' }}>
              <input
                type="checkbox"
                value={cat.id}
                checked={form.categorias.includes(String(cat.id))}
                onChange={e => {
                  if (e.target.checked) {
                    setForm({ ...form, categorias: [...form.categorias, String(cat.id)] });
                  } else {
                    setForm({ ...form, categorias: form.categorias.filter(c => c !== String(cat.id)) });
                  }
                }}
              />
              {cat.nombre}
            </label>
          ))}
        </div>

        {/* 🔹 Descripción */}
        <textarea 
          name="descripcion" 
          placeholder="Descripción" 
          value={form.descripcion} 
          onChange={handleChange} 
          required 
        />

        {/* 🔹 Precio */}
        <input 
          type="number" 
          name="precio" 
          placeholder="Precio" 
          value={form.precio} 
          onChange={handleChange} 
          required 
          step="1" 
        />

        {/* 🔹 Nivel */}
        <input 
          type="text" 
          name="nivel" 
          placeholder="Nivel (básico, intermedio, avanzado)" 
          value={form.nivel} 
          onChange={handleChange} 
          required 
        />

        {/* 🔹 Imagen principal */}
        <input 
          type="text" 
          name="imagen_principal" 
          placeholder="URL imagen principal" 
          value={form.imagen_principal} 
          onChange={handleChange} 
          required 
        />

        {/* 🔹 Enlace YouTube */}
        <input 
          type="text" 
          name="enlace_youtube" 
          placeholder="Enlace YouTube" 
          value={form.enlace_youtube} 
          onChange={handleChange} 
        />

        <button type="submit">Crear curso</button>
      </form>

      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
