import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Alustava oletus: ei kirjautunut
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Tarkistetaan localStoragesta (tai sessionStoragesta),
    // onko jo talletettu esim. "isLoggedIn=true"
    const storedLogin = localStorage.getItem("loggedIn");
    if (storedLogin === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  // Kirjaudu sisään (esim. kutsutaan, kun login pyyntö onnistuu)
  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem("loggedIn", "true");
  };

  // Kirjaudu ulos
  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("loggedIn");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
