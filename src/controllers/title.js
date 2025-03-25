import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

// Funktio uuden title-rivin lisäämiseen
export const addTitle = async (req, res) => {
  const {
    isbn,
    name,
    writer,
    publisher,
    year,
    weight,
    type_name,
    class_name
  } = req.body;

  // Tarkistetaan että kaikki pakolliset kentät on annettu
  if (!name || !writer || !publisher || !weight || !type_name || !class_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Tarkistetaan löytyykö jo kyseinen title (nimi + kirjoittaja)
    const existing = await pool.query(`
        SELECT id 
        FROM title 
        WHERE 
            LOWER(name) = LOWER($1) AND 
            LOWER(writer) = LOWER($2) AND
            year = $3 AND
            LOWER(publisher) = LOWER($4)`,
      [name, writer, year, publisher]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Title already exists' });
    }

    // käyttäjän syöttämät tyypit ja luokat isoiksi kirjaimiksi
    const typeNameNormalized = type_name.toUpperCase();
    const classNameNormalized = class_name.toUpperCase();

    // Haetaan kaikki sallitut tyyppi- ja luokkanimet
    const typeResult = await pool.query('SELECT name FROM book_type');
    const classResult = await pool.query('SELECT name FROM book_class');

    // Muutetaan tulokset puhtaaksi arrayksi
    const allowedTypes = typeResult.rows.map(row => row.name);
    const allowedClasses = classResult.rows.map(row => row.name);

    // Tarkistetaan löytyykö annettu type_name ja class_name sallituista
    const isValidType = allowedTypes.includes(typeNameNormalized);
    const isValidClass = allowedClasses.includes(classNameNormalized);

    if (!isValidClass) {
      return res.status(400).json({
        error: 'Invalid class_name',
        allowed_classes: allowedClasses
      });
    }
    if (!isValidType) {
        return res.status(400).json({
          error: 'Invalid type_name',
          allowed_types: allowedTypes
        });
      }

    // Suoritetaan lisäys
    const query = `
      INSERT INTO title (
        id, isbn, name, writer, publisher, year, weight, type, class, created_at, modified_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      )
    `;

    const id = uuidv4();

    await pool.query(query, [
      id,
      isbn,
      name,
      writer,
      publisher,
      year,
      weight,
      typeNameNormalized,
      classNameNormalized
    ]);

    res.status(201).json({ message: 'Title added successfully', title_id: id });

  } catch (err) {
    console.error('Error adding title:', err);
    res.status(500).json({ error: 'Failed to add title' });
  }
};

export const getDistinctTitles = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT isbn, name, writer, publisher, year, weight
      FROM title
      ORDER BY name ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Virhe haettaessa distinct titleja:", err);
    res.status(500).json({ error: "Titlejen haku epäonnistui" });
  }
};