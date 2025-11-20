import { useState } from 'react';
import { AuthContext } from './auth.hook.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (correo, rol) => setUser({ correo, rol });

  const logout = () => {
    setUser(null);
    fetch('/api/logout', { method: 'POST', credentials: 'include' });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

