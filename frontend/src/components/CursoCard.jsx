// CursoCard.jsx

import React from 'react';

import { Link, useNavigate } from 'react-router-dom'; 

// --- ESTILOS (Asegúrate de que tus estilos coincidan con lo que tenías) ---
const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    width: '300px', 
    margin: '15px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
};

const imageStyle = {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '10px',
    backgroundColor: '#f0f0f0'
};

const statusStyle = (habilitado) => ({
    fontSize: '0.8em',
    fontWeight: 'bold',
    color: habilitado ? 'green' : 'red',
    border: `1px solid ${habilitado ? 'green' : 'red'}`,
    padding: '2px 6px',
    borderRadius: '12px',
    alignSelf: 'flex-start',
    marginBottom: '10px'
});
// --------------------------------------------------------------------------


export default function CursoCard({ curso, puedeGestionar, usuarioLogueado }) {
    
    const navigate = useNavigate(); // 🚨 CAMBIO: Inicializar hook useNavigate

    // 🚨 CAMBIO: Desestructurar esta_inscrito
    const { id, titulo, descripcion, precio, nivel, imagen_principal, habilitado, esta_inscrito } = curso; 

    const isStudent = usuarioLogueado?.rol === 'estudiante';
    const isOwnerOrAdmin = puedeGestionar;

    // --- FUNCIÓN DE COMPRA DIRECTA ---
    const handleCompra = async (e) => {
        // Prevenir la navegación si la acción es un clic en botón (no Link)
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault(); 
        }

        
        if (!usuarioLogueado) {
            alert('Debes iniciar sesión o registrarte como estudiante para comprar este curso.');
            navigate('/login'); // Redirigir al login
            return;
        }
        
        // 2. VALIDACIÓN: Rol no estudiante (Instructor/Admin que no debería ver este botón)
        if (!isStudent) {
            // Esto es un doble check por si un admin presiona el botón de "Comprar Curso"
            alert('Solo los estudiantes pueden comprar cursos.');
            return;
        }

        // 3.  VALIDACIÓN: Curso ya comprado
        if (esta_inscrito) {
            const goToMisCursos = window.confirm(
                '¡Curso ya comprado!\n\nYa estás inscrito en este curso.\n\n¿Quieres ir a "Mis Cursos" ahora?'
            );
            if (goToMisCursos) {
                navigate('/mis-cursos');
            }
            return;
        }

        // 4. Proceder con la inscripción/compra
        try {
            const res = await fetch(`/api/cursos/${id}/inscribirse`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al completar la compra. Por favor, inténtalo de nuevo.');
            }

            // 5.  Éxito en la compra (Alerta y redirección solicitada)
            const confirmar = window.confirm(
                '¡Felicidades! Curso comprado exitosamente.\n\n¿Quieres ver tus cursos ahora?'
            ); 

            if (confirmar) {
                navigate('/mis-cursos'); // Redirección solicitada
            } 
            // Si el usuario cancela, recargar para que la tarjeta muestre "Ir a Mi Curso"
            // navigate(0); 

        } catch (error) {
            console.error('Error durante la compra:', error);
            alert(`Error en la compra: ${error.message}`);
        }
    };
    
    // --- LÓGICA CONDICIONAL DEL BOTÓN ---
    let buttonAction; // Puede ser un string (URL) o una función (handleCompra)
    let buttonText;
    let buttonBgColor;
    
    if (isOwnerOrAdmin) {
        // Instructor/Admin: Siempre Ver Detalle / Gestionar
        buttonText = 'Ver Detalle / Gestionar';
        buttonAction = `/curso/${id}`; 
        buttonBgColor = 'orange';
    } else if (isStudent) {
        // Estudiante Logueado
        if (esta_inscrito) {
            buttonText = 'Ir a Mi Curso'; // Ya lo compró
            buttonAction = `/mis-cursos`; // Link directo a mis cursos
            buttonBgColor = 'green';
        } else {
            buttonText = `Comprar Curso ($${precio})`; // Botón de compra directa
            buttonAction = handleCompra; // Función para comprar
            buttonBgColor = '#007bff';
        }
    } else {
        // Visitante (No logueado)
        //  CAMBIO: Mostrar "Comprar Curso" y usar handleCompra para forzar el login
        buttonText = 'Comprar Curso';
        buttonAction = handleCompra; // Llama a handleCompra, que redirige al login
        buttonBgColor = '#007bff';
    }

    // --- FUNCIÓN DE RENDERIZADO DEL BOTÓN ---
    const renderButton = () => {
        if (typeof buttonAction === 'string') {
            // Si la acción es una URL (Link)
            return (
                <Link to={buttonAction} style={{ flexGrow: 1, textDecoration: 'none' }}>
                    <button style={{ width: '100%', backgroundColor: buttonBgColor, color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}>
                        {buttonText}
                    </button>
                </Link>
            );
        } else {
            // Si la acción es una función (Compra o Redirección a Login)
            return (
                <button 
                    onClick={buttonAction} 
                    style={{ width: '100%', backgroundColor: buttonBgColor, color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {buttonText}
                </button>
            );
        }
    };

    // Retorno principal
    return (
        <div style={cardStyle}>
            
            {/*  IMAGEN CORREGIDA: Ahora se usa la prop imagen_principal */}
            <img 
                src={imagen_principal || 'placeholder.jpg'} 
                alt={titulo} 
                style={imageStyle} 
            />

            {/* Titulo y Status */}
            <h3 style={{ margin: '5px 0' }}>{titulo}</h3>
            <span style={statusStyle(habilitado)}>
                {habilitado ? 'Habilitado' : 'Deshabilitado'}
            </span>
            {/* Detalles Rápidos */}
            <p style={{ fontSize: '0.9em', color: '#555', flexGrow: 1 }}>
                {descripcion.substring(0, 80) + '...'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: '#007bff' }}>${precio}</span>
                <span style={{ fontSize: '0.85em', color: '#888' }}>Nivel: {nivel}</span>
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {renderButton()} {/* Botón condicional */}
                
                {isOwnerOrAdmin && (
                    <Link to={`/editar-curso/${id}`} style={{ flexGrow: 1, textDecoration: 'none' }}>
                        <button style={{ width: '100%', backgroundColor: 'gray', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}>
                            Editar
                        </button>
                    </Link>
                )}
            </div>
        </div>
    );
}