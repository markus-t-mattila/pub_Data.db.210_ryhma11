import pool from '../config/db.js';
// Yllä: pool viittaa db.js:ään, joka luo tietokantayhteyden. 

// salasana hash
import bcrypt from 'bcrypt';

import { requireLogin } from '../middleware/auth.js';
import { createFileWithContent, jsonToCsv } from '../utils/helpers.js';

// GET /api/customers?id=xxx tai email=xxx
export const getCustomer = async (req, res) => {
    try {

        const { id, email } = req.query;
  
        // Jos kumpaakaan ei ole, virhe
        if (!id && !email) {
            return res.status(400).json({ error: 'Anna parametri "id" tai "email".' });
        }
      
        let query = '';
        let values = [];
      
        if (id) {
            query = 'SELECT * FROM customer WHERE id = $1';
            values = [id];
        } 
        else {
            query = 'SELECT * FROM customer WHERE email = $1';
            values = [email];
        }
      
        const result = await pool.query(query, values);
      
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Asiakasta ei löytynyt.' });
        }
      
        return res.json(result.rows[0]);
    } catch (error) {
        console.error('Virhe haettaessa asiakasta:', error);
        return res.status(500).json({ error: 'Internal Error' });
    }
};

export const createCustomersStatsFile = async (req, res) => {
  const query = `
    SELECT 
      c.name,
      c.email,
      COUNT(b.id) AS bought_books_count
    FROM customer c
    LEFT JOIN purchase p ON c.id = p.customer_id 
        AND p.date >= NOW() - INTERVAL '1 year'
    LEFT JOIN book b ON p.id = b.purchase_id
    GROUP BY c.id, c.name, c.email;
  `

  try { 
    const result = await pool.query(query);
    const { rows } = result;

    const shownHeader = ['Nimi', 'Sähköposti', 'Ostettujen kirjojen lkm'];
    const csvContent = jsonToCsv(rows, shownHeader);
    const path = await createFileWithContent(csvContent, 'csv');
  
    res.json({path: path});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
}

export const registerCustomer = async (req, res) => {
  try {
    // Otetaan tiedot req.body:sta
    const {
      name,             
      email,            
      password,         
      phone,            
      street_address,   
      postcode,         
      city              
    } = req.body;

    // Validoi syötteitä sovellustasolla (esim. kentät eivät tyhjiä, sähköpostin muoto on ok, jne.)
    if(!name || !password || !phone || !street_address || !postcode || !city) {
      return res.status(400).json({ error: 'Pakollisia kenttiä puuttuu.' });
    }
    
    // Säpo tarkistus
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Sähköpostiosoite ei kelpaa.' });
    }
     
    // Salasanan hashaus bcryptillä
    const hashedPassword = await bcrypt.hash(password, 10);

    // SQL-lause. Oletetaan, että passwrd-sarake on nimetty passwrd.
    // Käytetään CURRENT_TIMESTAMP tai NOW() asettamaan created_at ja modified_at
    const insertQuery = `
      INSERT INTO customer
      (name, email, passwrd, phone, street_address, postcode, city, created_at, modified_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *;
    `;

    const values = [
      name,             // $1                 
      email,            // $2
      hashedPassword,   // $3   
      phone,            // $4
      street_address,   // $5   
      postcode,         // $6
      city              // $7
    ];

    // Suoritetaan INSERT
    const result = await pool.query(insertQuery, values);

    // Palautetaan esim. luodun asiakkaan rivit
    return res.status(201).json({
      message: 'Asiakas lisätty onnistuneesti.',
      customer: result.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      // Tietokanta heittää 23505, kun UNIQUE-violation tapahtuu
      return res.status(400).json({ error: 'Sähköposti on jo käytössä' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
};

// Kirjautuminen: POST /customers/login
export const loginCustomer = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email ja password vaaditaan' });
      }
  
      // Haetaan käyttäjä kannasta emailin perusteella
      const query = 'SELECT * FROM customer WHERE email = $1';
      const result = await pool.query(query, [email]);
      if (result.rowCount === 0) {
        // Käyttäjää ei löydy
        return res.status(401).json({ error: 'Väärä sähköposti tai salasana' });
      }
  
      const user = result.rows[0];
  
      // Verrataan plaintext-salasanaa hashed-salasanaan
      const isMatch = await bcrypt.compare(password, user.passwrd);
      if (!isMatch) {
        return res.status(401).json({ error: 'Väärä sähköposti tai salasana' });
      }
  
      // Tähän asti päästään vain jos salasana täsmää
      // Tallennetaan session-tiedot express-sessioniin
      req.session.user = { id: user.id, email: user.email };
      // Voit tallentaa muutakin, esim. user.name
  
      return res.json({
        success: true,
        message: 'Kirjautuminen onnistui, session luotu.'
      });
  
    } catch (error) {
      console.error('Virhe kirjautumisessa:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const getMyProfile = async (req, res) => {
    try {
      // Luetaan user.id sessionista
      const userId = req.session.user.id;
  
      // Haetaan kantatiedot
      const query = `
        SELECT id, name, email, phone, street_address, postcode, city 
        FROM customer 
        WHERE id = $1
      `;
      const result = await pool.query(query, [userId]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Not found' });
      }
  
      return res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };