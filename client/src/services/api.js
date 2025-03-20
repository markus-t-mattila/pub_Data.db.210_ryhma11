import axios from "axios";

export const BASE_URL = "http://localhost:3000";


const api = axios.create({
    baseURL: BASE_URL, // tai prosessin .env:stä
    withCredentials: true,
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