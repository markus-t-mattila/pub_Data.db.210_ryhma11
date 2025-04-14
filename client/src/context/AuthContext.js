import { createContext, useState, useEffect } from "react";
import { getMyInfo } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Alustava oletus: ei kirjautunut
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [forceLogin, setForceLogin] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // Tarkistetaan localStoragesta (tai sessionStoragesta),
    // onko jo talletettu esim. "isLoggedIn=true"
    const storedLogin = localStorage.getItem("loggedIn");
    if (storedLogin === "true") {
      login();
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      //console.log("Käyttäjä kirjautui sisään");
      //console.log("isLoggedIn", isLoggedIn);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!forceLogin) {
      //console.log("Käyttäjä kirjautui ulos");
      //console.log("forcelogin", forceLogin);
    }
  }, [forceLogin]);



  // Kirjaudu sisään (esim. kutsutaan, kun login pyyntö onnistuu)
  const login = async () => {
    try {
      const info = await getMyInfo();  // Hakee backendiltä kirjautuneen käyttäjän tiedot
      setUserInfo(info.data);
      setIsLoggedIn(!!info.data);
      localStorage.setItem("loggedIn", "true");
      console.log('info:', info);
      //setIsLoggedIn(true);
      //console.log("sisäänkirjautuminen onnistui");
      //console.log("info", info);
      //console.log("isLoggedIn", isLoggedIn);
    } catch (error) {
      console.error("Kirjautumistiedon hakeminen epäonnistui", error);
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  };


  // Kirjaudu ulos
  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("loggedIn");
    setUserInfo(null);
    setForceLogin(false);
    //console.log("Kirjauduttu ulos");
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isLoggedIn, 
        login, 
        logout,
        forceLogin,
        setForceLogin,
        userInfo
      }}>
      {children}
    </AuthContext.Provider>
  );
}
