import { createContext, useContext, useState, useEffect } from "react";
import { getAdminSession, logoutAdmin } from "../services/api";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const response = await getAdminSession();
        setAdmin(response.data.admin || null);
      } catch (error) {
        setAdmin(null);
      }
      setLoading(false);
    };
    checkAdminSession();
  }, []);

  const logout = async () => {
    await logoutAdmin();
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, setAdmin, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
