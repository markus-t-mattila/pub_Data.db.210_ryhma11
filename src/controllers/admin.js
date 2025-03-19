import bcrypt from 'bcrypt';
import pool from '../config/db.js';

// Uuden adminin rekisteröinti, jossa voidaan määrittää kaupat, joihin admin liitetään
export const registerAdmin = async (req, res) => {
  try {
    // Otetaan tiedot req.body:sta
    const {
      email,
      password,
      is_central, // true → keskusadmin; false tai puuttuu → tavallinen admin
      storeIds    // taulukko store-id:istä, joihin tavallinen admin liitetään
    } = req.body;

    // Perusvalidointi
    if (!email || !password) {
      return res.status(400).json({ error: 'email, salasana ovat pakollisia.' });
    }

    // Jos admin ei ole keskusadmin, vähintään yksi kauppa tulee olla annettu
    if (!is_central && (!storeIds || !Array.isArray(storeIds) || storeIds.length === 0)) {
      return res.status(400).json({ error: 'Ei keskusadmin, joten vähintään yksi kauppa on annettava.' });
    }

    // Sähköpostin tarkistus
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Sähköpostiosoite on virheellisessä muodossa.' });
    }

    // Salasanan hashays
    const hashedPassword = await bcrypt.hash(password, 10);

    // Aloitetaan transaktio, jotta adminin lisäys ja storeihin liittäminen tehdään yhtenä kokonaisuutena
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Lisätään admin admin-tauluun
      const insertAdminQuery = `
        INSERT INTO admin
          (email, passwrd, is_central)
        VALUES
          ($1, $2, $3)
        RETURNING *;
      `;
      const adminValues = [email, hashedPassword,is_central ?? false];
      const result = await client.query(insertAdminQuery, adminValues);
      const admin = result.rows[0];

      // Jos admin ei ole keskusadmin, liitetään hänet annettuihin kauppoihin
      if (!admin.is_central && storeIds && Array.isArray(storeIds) && storeIds.length > 0) {
        for (const storeId of storeIds) {
          const insertAdminStoreQuery = `
            INSERT INTO admin_store (admin_id, store_id)
            VALUES ($1, $2)
          `;
          await client.query(insertAdminStoreQuery, [admin.id, storeId]);
        }
      }

      await client.query('COMMIT');

      return res.status(201).json({
        message: 'Admin-käyttäjä luotu onnistuneesti.',
        admin: admin
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Sähköposti on jo käytössä.' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
