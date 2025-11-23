import { useState, useEffect } from 'react'; 
import { AuthContext } from './auth.hook.js';


const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};


export function AuthProvider({ children }) {
    
    const [usuario, setUsuario] = useState(null);

    
    const [isCheckingAuth, setIsCheckingAuth] = useState(true); 


    
    useEffect(() => {
        
        const id = getCookie('usuario'); // ID de usuario guardado en la cookie 'usuario'
        const rol = getCookie('rol');      // Rol guardado en la cookie 'rol'
        const nombre = getCookie('nombre'); // (Opcional) Si guardas el nombre en la cookie

        if (id && rol) {
            
            setUsuario({ id: id, rol: rol, nombre: nombre || '' }); 
        }
        
      
        setIsCheckingAuth(false); 
        
    }, []); 


    
    const login = (id, rol, nombre) => setUsuario({ id, rol, nombre });

    const logout = () => {
        setUsuario(null);

        fetch('/api/logout', { method: 'POST', credentials: 'include' });
    };

  


    return (
        
        <AuthContext.Provider value={{ usuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}