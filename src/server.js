import express from 'express';
import dotenv from 'dotenv'; // Lisätty dotenv
import cors from 'cors'; // Lisätty CORS
import pool from "./config/db.js"; // Tietokantayhteys
import bookRoutes from './routes/bookRoutes.js';


// Lataa ympäristömuuttujat (varmista, että polku on oikein)
dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 3000;

// Salli kaikki pyynnöt frontendiltä
app.use(cors());

// Middleware JSON-pyyntöjen käsittelyyn
app.use(express.json());

// Tarkista tietokantayhteys
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Käytä kirja-reittejä
app.use('/books', bookRoutes);

// Testireitti, jolla frontend voi varmistaa, että backend toimii
app.get("/", (req, res) => {
  res.json({ message: "Backend toimii!" });
});

// Käynnistä serveri (korjattu `PORT`-muuttuja)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
