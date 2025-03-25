import axios from "axios";

export const BASE_URL = "http://localhost:3000";


export const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    timeout: 5000,
  });

export const testBackend = async () => {
    try {
        const response = await api.get("/");
        return response.data;
    } catch (error) {
        console.error("Backend ei vastaa:", error);
        return { message: "Backend ei vastaa" };
    }
};

export const searchBooks = async (query) => {
    try {
        const response = await api.get(`/books/search?q=${query}`);
        return response.data;
    } catch (error) {
        console.error("Virhe haettaessa kirjoja:", error);
        return [];
    }
};

export const getClasses = async () => {
    try {
        const response = await api.get("/books/classes");
        return response.data;
    } catch (error) {
        console.error("Virhe haettaessa teosluokkia:", error);
        return [];
    }
};

export const getCustomersStats = async () => {
    try {
        const response = await api.get("/customers/stats");
        return response.data;
    } catch (error) {
        console.error("Virhe haettaessa asiakasdataa:", error);
        return null;
    }
};

// Customer rekisterointi
export const registerCustomer = async (userData) => {
    // userData on { name, email, password, phone, street_address, postcode, city }
    return api.post("/customers", userData);
  };
  
// Hae asiakas
export const getCustomer = async (params) => {
    // params on esim. { id: 'xxx' } tai { email: 'xxx@example.com' }
    return axios.get("/customers", { params });
};

// Login funkkari
export const loginCustomer = async (email, password) => {
    return api.post("/customers/login", { email, password });
};

// omat tiedot
export const getMyInfo = async () => {
    // Kutsuu "GET /customers/me" reittiä back-endissä
    return api.get("/customers/me");
};

// Admin kirjautuminen

export const loginAdmin = async (email, password) => {
    return api.post("/admin/login", { email, password });
};
  
export const getAdminSession = async () => {
    return api.get("/admin/me"); // Hakee kirjautuneen adminin tiedot
};
  
export const logoutAdmin = async () => {
    return api.post("/admin/logout"); // Poistaa adminin istunnon
};

export const availableBooks = async () => {
    return api.get("/books/available");
};

export const reserveBook = async (bookId) => {
    try {
      const response = await api.post("/purchase/reserve", { bookId });
      return response.data;
    } catch (error) {
      console.error("Virhe kirjan varaamisessa:", error);
      throw error.response?.data || { error: "Tuntematon virhe" };
    }
};


export const cancelReservation = async (bookId) => {
  try {
    const response = await api.post('/purchase/release', { bookId });
    return response.data;
  } catch (error) {
    console.error('Virhe peruuttaessa varausta:', error);
    throw error.response?.data?.error || "Varauksen peruutus epäonnistui";
  }
};

export const getBookById = async (id) => {
    try {
      const response = await api.get(`/books`, {
        params: { book_id: id }
      });
      return response.data;
    } catch (error) {
      console.error("Virhe yksittäisen kirjan haussa:", error);
      throw error;
    }
};

export const calculateShippingCost = async (weights) => {
    try {
      const response = await api.post(`/shipping/delivery-cost`, { weights });
      return response.data;
    } catch (error) {
      console.error("Calculation Error:", error);
      throw error;
    }
  };

export const extendReservation = async (data) => {
  const response = await api.post("/purchase/extend-reservation", data);
  return response.data;
};

export const sendPurchaseOrder = async (data) => {
  const response = await api.post("/purchase/order", data);
  return response.data;
};

export const getMyOrders = async (params = {}) => {
  const response = await api.get("/orders", { params });
  return response.data;
};

export const addBookWithTitle = async (book) => {
    try {
      const response = await api.post(`/books`, book);
      return response;
    } catch (error) {
      console.error("Virhe kirjan lisäämisessä:", error);
      throw error;
    }
}

export const searchStoresByIds = async (ids) => {
  const results = await Promise.all(
    ids.map((id) => api.get("/stores", { params: { id } }))
  );
  return results.flatMap((r) => r.data);
};

export const searchAllStores = async () => {
  const response = await api.get("/stores");
  return response.data;
};
