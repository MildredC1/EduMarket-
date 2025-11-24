import React from 'react';  
import miFondo from '../assets/img/image.png';
export default function Inicio() {

  
  const estiloFondo = {
    // Usamos el recurso importado directamente
    backgroundImage: `url(${miFondo})`,
    
    
    backgroundSize: 'cover',        // Cubre todo el contenedor sin repetir
    backgroundPosition: 'center',   // Centra la imagen
    backgroundAttachment: 'fixed',  // Mantiene la imagen fija al hacer scroll (efecto paralaje)
    
    
    minHeight: '100vh', 
    width: '100%',
    
   
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Un tono oscuro base
    backgroundBlendMode: 'darken',         // Combina el color oscuro con la imagen
    
    // 5. Estilos de texto (para que el texto sea legible)
    color: '#E0E0E0', // Texto claro
    padding: '20px',
  };

  return (
   // estilo de fondo al contenedor principal
    <div style={estiloFondo}>
      
      <p>Bienvenido, frontend funcionando. Este es un ejemplo de contenido sobre el fondo llamativo de programación.</p>
    </div>
  );
}