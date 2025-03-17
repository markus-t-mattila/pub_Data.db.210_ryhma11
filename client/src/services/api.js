import axios from "axios";

const API_URL = "http://localhost:3000"; // Backendin osoite


export const testBackend = async () => {
    try {
        const response = await axios.get(`${API_URL}/`);
        return response.data;
    } catch (error) {
        console.error("Backend ei vastaa:", error);
        return { message: "Backend ei vastaa" };
    }
};

export const searchBooks = async (query) => {
    try {
        const response = await axios.get(`${API_URL}/books/search?q=${query}`);
        return response.data;
    } catch (error) {
        console.error("Virhe haettaessa kirjoja:", error);
        return [];
    }
};