import pool from '../config/db.js';

/**
 * Hakee store-taulusta divaritiedot annetun parametrisuodatuksen perusteella.
 * Tukee suodatusta seuraavilla kentillä:
 * name, street_address, postcode, city, email, phone_num, website
 */
export const searchStores = async (req, res) => {
  // Määritellään kentät, joiden perusteella käyttäjä saa suodattaa
  const allowedFields = ['id', 'name', 'street_address', 'postcode', 'city', 'email', 'phone_num', 'website'];

  const conditions = []; // Tänne kerätään SQL WHERE-ehtolauseet
  const values = [];     // Tämä sisältää query-parametrien arvot SQL:ää varten
  let i = 1;              // SQL-parametrien numerointi ($1, $2, jne.)

  // Käydään läpi kaikki sallitut kentät
  for (const field of allowedFields) {
    if (req.query[field]) {
      // Lisätään ehtolause SQL:ään
      conditions.push(`LOWER(${field}) LIKE LOWER($${i++})`);
      // Lisätään arvoksi LIKE-haku, esim. %tampere%
      values.push(`%${req.query[field]}%`);
    }
  }

  // Rakennetaan WHERE-ehto, jos parametreja löytyi
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  // Varsinainen SQL-kysely (huomaa ORDER BY)
  const query = `
    SELECT id, name, street_address, postcode, city, email, phone_num, website
    FROM store
    ${whereClause}
    ORDER BY name ASC
  `;

  try {
    // Suoritetaan kysely tietokantaan
    const { rows } = await pool.query(query, values);

    // Palautetaan tulokset JSON-muodossa
    res.json(rows);
  } catch (err) {
    // Jos virhe tapahtuu, tulostetaan se ja palautetaan virheilmoitus
    console.error('Internal error', err);
    res.status(500).json({ error: 'Internal Error' });
  }
};
