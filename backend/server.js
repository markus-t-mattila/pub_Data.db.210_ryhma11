import 'dotenv/config'; // pakotetaan latautumaan jotta saadaan muuttujat käyttoon


// tarkastetaan kayttaja
console.log(process.env.DB_USER);

import express from 'express';
import session from 'express-session'; // Lisätty express-session
import cors from 'cors'; // Lisätty CORS
import pool from "./config/db.js"; // Tietokantayhteys
import bookRoutes from './routes/bookRoutes.js';
import customer from './routes/customer.js'; // Lisätty asiakasreitit
import file from './routes/file.js';
import adminRoutes from './routes/admin.js'; // Lisätty adminreitit
import storeRoutes from './routes/stores.js'; // Lisätty myymäläreitit
import titleRoutes from './routes/tittle.js'; // Lisätty title-reitit
import purchase from './routes/purchase.js'; // Lisätty ostosreitit
import './controllers/utils.js';
import shippingRoutes from './routes/shipping.js';
import orderRoutes from './routes/orders.js'; // Lisätty tilausreitit
import {getEnums} from './controllers/utils.js';



const app = express();
const PORT = process.env.PORT || 3001;

// Salli kaikki pyynnöt frontendiltä
app.use(cors({
  origin: 'http://localhost:3000', // jos frontti on portissa 3000
  credentials: true               // salli evästeet
}));

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// KÄRKEEN, ennen reittien määrittelyä:
app.use(session({
  secret: process.env.SESSION_SECRET || 'oma_sessio_salasana',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,    // true vain HTTPS:llä
    maxAge: 1000 * 60 * 60  // esim. 1 tunti
  }
}));

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

// Käytä asiakasreittejä
app.use('/customers', customer);

// Käytä tiedostoreittejä
app.use('/uploads', file);

// admin reitit
app.use('/admin', adminRoutes);

// Stores-reitit
app.use('/stores', storeRoutes);

// Title-reitit
app.use('/title', titleRoutes);

app.use('/purchase', purchase);

app.use('/shipping', shippingRoutes);

app.use('/orders', orderRoutes);

app.get('/enums', getEnums);

// Testireitti, jolla frontend voi varmistaa, että backend toimii
app.get("/", (req, res) => {
  res.json({ message: "Backend toimii!" });
});

// Käynnistä serveri (korjattu `PORT`-muuttuja)
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on 127.0.0.1:${PORT}`);
});
