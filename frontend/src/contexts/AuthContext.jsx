import { createContext, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  // Resolvemos o erro do useEffect inicializando o estado com uma função (Lazy Initializer)
  const [user, setUser] = useState(() => {
    try {
      const storagedUser = localStorage.getItem('@RitmoX:user');
      const storagedToken = localStorage.getItem('@RitmoX:token');

      if (storagedUser && storagedToken) {
        return JSON.parse(storagedUser);
      }
    } catch (error) {
      console.error("Erro ao ler localStorage", error);
    }
    return null;
  });

  async function login(email, senha) {
    const response = await api.post('/auth/login', { email, senha });
    const { token, usuario } = response.data;

    localStorage.setItem('@RitmoX:token', token);
    localStorage.setItem('@RitmoX:user', JSON.stringify(usuario));
    
    setUser(usuario);
  }

  function logout() {
    localStorage.removeItem('@RitmoX:token');
    localStorage.removeItem('@RitmoX:user');
    sessionStorage.removeItem('@RitmoX:greeting_shown');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, isAdmin: user?.is_admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}