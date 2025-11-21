import { useState, useEffect } from 'react'; // 👈 Importar useEffect
import { AuthContext } from './auth.hook.js';

// Función auxiliar para leer una cookie (debes asegurarte de que esta función exista)
// Si no la tienes, te doy una versión simple:
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};


export function AuthProvider({ children }) {
    // Hemos cambiado 'user' por 'usuario' para coincidir con tu hook y backend
    const [usuario, setUsuario] = useState(null);

    // Si estás usando un estado para verificar si el contexto está listo
    const [isCheckingAuth, setIsCheckingAuth] = useState(true); 


    // 🎯 NUEVO CÓDIGO CLAVE PARA PERSISTENCIA 🎯
    useEffect(() => {
        // 1. Intentar leer las cookies de sesión
        const id = getCookie('usuario'); // ID de usuario guardado en la cookie 'usuario'
        const rol = getCookie('rol');      // Rol guardado en la cookie 'rol'
        const nombre = getCookie('nombre'); // (Opcional) Si guardas el nombre en la cookie

        if (id && rol) {
            // 2. Si las cookies existen, restaurar el estado de la sesión
            // Nota: Aquí se usa el ID de la cookie, no el correo.
            setUsuario({ id: id, rol: rol, nombre: nombre || '' }); 
        }
        
        // 3. Marcar la autenticación como revisada
        setIsCheckingAuth(false); 
        
    }, []); // El array vacío asegura que solo se ejecute al montar (al cargar la página)


    // Asegúrate de que tu función de login use los mismos campos (id, rol, nombre)
    // Usaremos ID en lugar de correo para la clave del usuario en el estado local.
    const login = (id, rol, nombre) => setUsuario({ id, rol, nombre });

    const logout = () => {
        setUsuario(null);
        // La cookie es eliminada por el backend en /api/logout, 
        // pero el navegador la sigue enviando hasta que es eliminada o expira.
        fetch('/api/logout', { method: 'POST', credentials: 'include' });
    };

    // Opcional: Si quieres evitar que la aplicación parpadee antes de verificar las cookies, 
    // puedes retornar un spinner aquí:
    // if (isCheckingAuth) return <div>Cargando sesión...</div>;


    return (
        // Asegúrate de usar 'usuario' aquí, ya que renombré 'user' a 'usuario' en el useState
        <AuthContext.Provider value={{ usuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}