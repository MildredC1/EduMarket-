import { useState } from 'react';
import { AuthContext } from './auth.hook.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (correo, rol,nombre) => setUser({ correo, rol,nombre });

  const logout = () => {
    setUser(null);
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

