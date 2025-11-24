import { useState, useEffect } from 'react';
import CursoCard from '../components/CursoCard';

export default function MisCursos() {
  const [cursos, setCursos] = useState([]);
  const [error, setError] = useState(null); 

  useEffect(() => {
    
    setError(null); 
    
    fetch('/api/cursos/mis-cursos', { credentials: 'include' })
      .then(res => {
        
        if (!res.ok) {
           return res.json().then(data => { throw new Error(data.error || `Error del servidor: Código ${res.status}`); });
        }
        return res.json();
      })
      .then(data => {
        
        if (Array.isArray(data)) {
          setCursos(data);
        } else {
          throw new Error('Formato de respuesta inesperado del servidor. Se esperaba una lista.');
        }
      })
      .catch(err => {
        console.error(err);
        setError(err.message); // Guardar el error para mostrarlo
        setCursos([]); // IMPORTANTE: Asegurar que 'cursos' es un array vacío
      });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
            <h2>Mis Cursos Comprados 🎓</h2>
            
            {cursos.length === 0 ? (
                <p>Aún no te has inscrito en ningún curso.</p>
            ) : (
                // 
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0' }}>
                    {cursos.map(curso => (
                        <CursoCard 
                            key={curso.id} 
                            curso={curso} 
                            puedeGestionar={false} // Los estudiantes no pueden editar sus cursos comprados
                        />
                    ))}
                </div>
            )}
        </div>
  );
    
}