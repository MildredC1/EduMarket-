import React, { useState, useEffect } from 'react';

// tabla 'valoraciones' con campo 'puntuacion' (1-5)
export default function RatingComentario({ cursoId, usuarioId }) {
    
    // Estado para guardar la valoración actual del usuario (si ya existe)
    const [rating, setRating] = useState(0); 
    const [comentario, setComentario] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [cargandoValoracion, setCargandoValoracion] = useState(true);

    //  Cargar valoración existente al iniciar
    useEffect(() => {
        
        fetch(`/api/cursos/${cursoId}/mi-valoracion`, { credentials: 'include' }) 
            .then(res => res.json())
            .then(data => {
                if (data.valoracion) {
                    setRating(data.valoracion.puntuacion || 0);
                    setComentario(data.valoracion.comentario || '');
                }
            })
            .catch(err => console.error("Error al cargar valoración previa:", err))
            .finally(() => setCargandoValoracion(false));
    }, [cursoId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje('');

        if (rating < 1 || rating > 5) {
            setMensaje('Por favor, selecciona una puntuación válida (1 a 5).');
            return;
        }

        try {
            // endpoint POST/PUT para crear o actualizar la valoración
            const res = await fetch(`/api/cursos/${cursoId}/valorar`, {
                method: 'POST', // Usamos POST, el backend debe manejar la inserción/actualización (UPSERT)
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ puntuacion: rating, comentario }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al enviar la valoración.');
            }

            setMensaje(data.mensaje || '¡Valoración enviada exitosamente!');
            
        } catch (err) {
            setMensaje('Error: ' + err.message);
        }
    };
    
    if (cargandoValoracion) return <p>Cargando tu valoración...</p>;

    return (
        <div style={{ marginTop: '40px', padding: '20px', border: '1px dashed #ccc', borderRadius: '8px' }}>
            <h3>Deja tu Valoración</h3>
            
            {mensaje && <p style={{ color: mensaje.startsWith('Error') ? 'red' : 'green' }}>{mensaje}</p>}
            
            <form onSubmit={handleSubmit}>
                
                {/*  Rating (Estrellas) */}
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px' }}>Puntuación (1-5):</label>
                    <div style={{ fontSize: '24px', cursor: 'pointer' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span 
                                key={star} 
                                onClick={() => setRating(star)}
                                style={{ color: star <= rating ? 'gold' : 'lightgray' }}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>

                {/* Comentario */}
                <div style={{ marginTop: '15px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold' }}>Comentario (Opcional):</label>
                    <textarea 
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        rows="4"
                        style={{ width: '100%', padding: '10px' }}
                        placeholder="Escribe tu opinión sobre el curso..."
                    />
                </div>

                <button type="submit" style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', marginTop: '10px' }}>
                    Guardar Valoración
                </button>
            </form>
        </div>
    );
}