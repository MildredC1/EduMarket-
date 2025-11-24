import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function EditarCurso() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Estado inicializado a null para la precarga
  const [formData, setFormData] = useState(null); 
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  
  // Nuevo estado para la lista completa de categorías disponibles
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);

  // Handler genérico para campos de texto/número
  const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler para checkboxes de categorías
  const handleCategoriaChange = (categoriaId) => {
      setFormData(prev => {
          const catId = Number(categoriaId);
          const currentCats = prev.categorias;

          if (currentCats.includes(catId)) {
              // Si ya está, lo quitamos
              return { ...prev, categorias: currentCats.filter(id => id !== catId) };
          } else {
              // Si no está, lo añadimos
              return { ...prev, categorias: [...currentCats, catId] };
          }
      });
  };

  // --- 1. Lógica de Carga de Datos (Incluye curso y categorías disponibles) ---
  useEffect(() => {
    setCargando(true);
    setError('');
    
    // Función para obtener la lista completa de categorías
    const fetchCategorias = fetch('/api/categorias', { credentials: 'include' })
        .then(res => res.json())
        .then(data => setCategoriasDisponibles(data))
        .catch(() => console.error("Error al cargar categorías disponibles"));

    // Obtener la data del curso
    const fetchCurso = fetch(`/api/cursos/${id}/gestion`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Error al cargar curso'); });
        }
        return res.json();
      })
      .then(data => {
        // Precargar el estado con los datos del curso
        setFormData({
            titulo: data.titulo,
            descripcion: data.descripcion,
            precio: data.precio,
            nivel: data.nivel,
            imagen_principal: data.imagen_principal || '',
            enlace_youtube: data.enlace_youtube || '',
            habilitado: data.habilitado,
            // Las categorías deben ser un array de IDs (números)
            categorias: data.categorias.map(cat => cat.id) 
        });
      });

    // Esperar ambas peticiones (curso y categorías)
    Promise.all([fetchCategorias, fetchCurso])
        .catch(err => {
            setError(err.message || 'Error al cargar datos necesarios para la edición.');
        })
        .finally(() => {
            setCargando(false);
        });

  }, [id]);

  // --- 2. Lógica de Envío (Actualización PUT) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData) return;

    setMensaje(''); 
    
    try {
      const res = await fetch(`/api/cursos/${id}`, { // Endpoint de actualización
        method: 'PUT', // Método PUT para actualizar
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar el curso.');
      }

      setMensaje(data.mensaje || '¡Curso actualizado exitosamente!');
      setTimeout(() => {
         navigate(`/curso/${id}`); // Redirigir al detalle
      }, 1500);

    } catch (err) {
      setMensaje('Error: ' + err.message);
    }
  };

  // --- Renderizado ---
  if (cargando) return <div>Cargando formulario de edición...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!formData) return <div>No se pudieron cargar los datos del curso.</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2> Editar Curso: {formData.titulo}</h2>
      {mensaje && <p style={{ color: mensaje.startsWith('Error') ? 'red' : 'green', fontWeight: 'bold' }}>{mensaje}</p>}
      
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>

        {/* 1. Título */}
        <div>
          <label>Título:</label>
          <input 
              type="text" 
              name="titulo"
              value={formData.titulo} 
              onChange={handleChange} 
              required 
          />
        </div>

        {/* 2. Categorías */}
        <div style={{ margin: '15px 0' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Categorías:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {categoriasDisponibles.map(cat => (
                    <label key={cat.id}>
                        <input 
                            type="checkbox" 
                            value={cat.id} 
                            checked={formData.categorias.includes(cat.id)}
                            onChange={() => handleCategoriaChange(cat.id)}
                        />
                        {cat.nombre}
                    </label>
                ))}
            </div>
        </div>
        
        {/* 3. Descripción */}
        <div>
            <label>Descripción:</label>
            <textarea 
                name="descripcion"
                value={formData.descripcion} 
                onChange={handleChange} 
                required 
                rows="4"
            ></textarea>
        </div>

        {/* 4. Precio y Nivel (usando select/input simple como en tu imagen original) */}
        <div style={{ display: 'flex', gap: '20px', margin: '10px 0' }}>
            <div>
                <label>Precio:</label>
                <input 
                    type="number" 
                    name="precio"
                    value={formData.precio} 
                    onChange={handleChange} 
                    required 
                    min="0"
                />
            </div>
            <div>
                <label>Nivel:</label>
                <select 
                    name="nivel"
                    value={formData.nivel} 
                    onChange={handleChange} 
                    required
                >
                    <option value="">Seleccionar Nivel</option>
                    <option value="básico">Básico</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                </select>
            </div>
        </div>

        {/* 5. URL Imagen Principal */}
        <div>
            <label>URL Imagen Principal:</label>
            <input 
                type="url" 
                name="imagen_principal"
                value={formData.imagen_principal} 
                onChange={handleChange} 
                required 
            />
        </div>

        {/* 6. Enlace YouTube */}
        <div>
            <label>Enlace YouTube:</label>
            <input 
                type="url" 
                name="enlace_youtube"
                value={formData.enlace_youtube} 
                onChange={handleChange} 
            />
        </div>
        
        {/* 7. Habilitado (Campo exclusivo de Edición) */}
         <div style={{ margin: '15px 0' }}>
           <label>
              <input 
                  type="checkbox" 
                  checked={formData.habilitado === 1} // Asume 1/0 de la DB
                  onChange={(e) => setFormData({...formData, habilitado: e.target.checked ? 1 : 0})} 
              />
              Habilitado
            </label>
        </div>

        <button type="submit" style={{ backgroundColor: 'orange', marginTop: '20px' }}>
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}