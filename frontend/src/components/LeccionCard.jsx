import React from 'react';

const getYouTubeVideoId = (url) => {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtube.com')) {
            return urlObj.searchParams.get('v');
        }
        if (urlObj.hostname.includes('youtu.be')) {
            return urlObj.pathname.substring(1);
        }
    } catch (e) {
        return null;
    }
    return null;
};

export default function LeccionCard({ leccion }) {
    
    // campo 'url_contenido' de  tabla 'lecciones' contiene URL de YouTube
    const videoId = leccion.tipo === 'video' ? getYouTubeVideoId(leccion.url_contenido) : null;
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0` : null;

    return (
        <div style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '15px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            backgroundColor: '#fff'
        }}>
            <h4 style={{ color: '#333', marginBottom: '10px' }}>
                {leccion.titulo}
                <span style={{ marginLeft: '10px', fontSize: '0.8em', color: '#666' }}>
                    ({leccion.tipo.toUpperCase()})
                </span>
            </h4>
            
            {/* --- REPRODUCTOR EN CARD --- */}
            {leccion.tipo === 'video' && embedUrl && (
                <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', marginBottom: '15px' }}>
                    <iframe
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '4px' }}
                        src={embedUrl}
                        title={leccion.titulo}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            )}
            
            {/* Si es artículo, muestra el texto (si existe) */}
            {leccion.tipo === 'articulo' && leccion.texto_contenido && (
                <p style={{ color: '#555', borderLeft: '3px solid #007bff', paddingLeft: '10px' }}>
                    {leccion.texto_contenido}
                </p>
            )}

            {leccion.duracion_min && (
                <small style={{ color: '#007bff' }}>Duración: {leccion.duracion_min} min.</small>
            )}
        </div>
    );
}