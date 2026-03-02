import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize from localStorage so state persists on refresh
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (authData) => {
    // authData = { token, userId, name, email }
    localStorage.setItem("token", authData.token);
    localStorage.setItem("user", JSON.stringify({
      id: authData.userId,
      name: authData.name,
      email: authData.email,
    }));
    setUser({ id: authData.userId, name: authData.name, email: authData.email });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this in any component
export function useAuth() {
  return useContext(AuthContext);
}   