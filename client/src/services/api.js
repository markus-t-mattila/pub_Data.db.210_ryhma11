import axios from "axios";

const BASE_URL = "http://localhost:3000";


const api = axios.create({
    baseURL: BASE_URL, // tai prosessin .env:stä
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