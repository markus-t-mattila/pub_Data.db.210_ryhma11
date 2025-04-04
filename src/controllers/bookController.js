import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const searchBooks = async (req, res) => {
  const searchTerm = req.query.q;
  if (!searchTerm) {
    return res.status(400).json({ error: 'Missing search term' });
  }
  const query = `
    WITH matches AS (
      SELECT
        t.isbn,
        t.name,
        t.writer,
        t.year,
        t.weight,
        t.type,
        t.class,
        b.sale_price,
        (LENGTH(LOWER(t.name)) - LENGTH(REPLACE(LOWER(t.name), LOWER($1), ''))) AS matches_full_word,
        CASE WHEN t.name ILIKE '%' || $1 || '%' THEN 1 ELSE 0 END AS matches_partial
      FROM book b
      JOIN title t ON b.title_id = t.id
    )
    SELECT *
    FROM matches
    WHERE matches_full_word > 0 OR matches_partial = 1
    ORDER BY matches_full_word DESC, matches_partial DESC;
  `;
  try {
    const { rows } = await pool.query(query, [searchTerm]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
};


export const titlesByClass = async (req, res) => {
  const query = `
    SELECT
      t.class,
      COUNT(b.id) AS count,
      SUM(b.sale_price) AS total_price,
      AVG(b.sale_price) AS average_price
    FROM book b
    INNER JOIN title t ON b.title_id = t.id
    WHERE b.status = 'AVAILABLE'
    GROUP BY t.class;
  `
  try {
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
}

export const availableBooks = async (req, res) => {
  const query = `
    SELECT
      b.id AS book_id,
      t.id AS title_id,
      b.status,
      t.name,
      t.writer,
      t.year,
      t.weight,
      t.type,
      t.class,
      b.sale_price,
      t.isbn
    FROM book b
    JOIN title t ON b.title_id = t.id
    WHERE b.status = 'AVAILABLE'
    ORDER BY t.name ASC`;
  try {
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const queryBooks = async (req, res) => {
  // Määritellään sallitut hakukentät ja niihin liittyvät vertailuoperaattorit
  // Avain on hakutermin nimi, arvo on SQL-ehto (taulun sarake + vertailu)
  const allowedFilters = {
    name: { column: 'LOWER(t.name)', operator: 'LIKE', wrapLike: true },
    writer: { column: 'LOWER(t.writer)', operator: 'LIKE', wrapLike: true },
    //type: { column: 't.type', operator: '=', wrapLike: false },
    //class: { column: 't.class', operator: '=', wrapLike: false },
    min_price: { column: 'b.sale_price', operator: '>=', wrapLike: false },
    max_price: { column: 'b.sale_price', operator: '<=', wrapLike: false },
    min_year: { column: 't.year', operator: '>=', wrapLike: false },
    max_year: { column: 't.year', operator: '<=', wrapLike: false },
    status: { column: 'b.status', operator: '=', wrapLike: false },
    title_id: { column: 't.id', operator: '=', wrapLike: false },
    book_id: { column: 'b.id', operator: '=', wrapLike: false },
    shop: { column: 's.name', operator: '=', wrapLike: true }
  };

  const conditions = []; // SQL-ehdot
  const values = [];     // SQL-parametrit
  let i = 1;              // Parametrien numerointi ($1, $2, ...)

  // Käydään läpi kaikki sallitut hakutermit
  for (const [param, config] of Object.entries(allowedFilters)) {
    const value = req.query[param];
    if (value !== undefined) {
      // Jos kyseessä LIKE-haku, lisätään % ympärille
      const paramValue = config.wrapLike ? `%${value}%` : value;

      // Lisätään SQL-ehto oikealla operaattorilla
      conditions.push(`${config.column} ${config.operator} $${i++}`);
      values.push(paramValue);
    }
  }

  // Rakennetaan WHERE-lause vain jos ehtoja on
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  // Rakennetaan koko SQL-kysely
  const query = `
    SELECT
      b.id AS book_id,
      t.id AS title_id,
      b.status,
      t.name,
      t.writer,
      t.year,
      t.weight,
      t.type,
      t.class,
      b.sale_price,
      t.isbn,
      b.condition,
      b.modified_at,
      s.name AS store,
      s.email AS store_email,
      s.phone_num AS store_phone

    FROM book b
    JOIN title t ON b.title_id = t.id
    JOIN store s ON b.store_id = s.id
    ${whereClause}
    ORDER BY t.name ASC
  `;

  try {
    // Suoritetaan kysely ja palautetaan tulokset
    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (err) {
    // Virheen sattuessa lokitetaan ja palautetaan virheilmoitus
    console.error('Search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};




// Funktio uuden kirjan ja tarvittaessa titlen lisäämiseen
export const addBookWithTitleService = async (req, res) => {
  const {
    isbn,
    name,
    writer,
    publisher,
    year,
    weight,
    type_name,
    class_name,
    store_name,
    condition,
    purchase_price,
    sale_price,
    add_to_single_store,
  } = req.body;

  // Tarkistetaan että kaikki pakolliset kentät on annettu
  if (
    !name ||
    !writer ||
    !publisher ||
    !weight ||
    !type_name ||
    !class_name ||
    !store_name ||
    !condition ||
    !purchase_price ||
    !sale_price
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Normalisoidaan syötetyt luokka- ja tyyppinimet ISOILLA kirjaimilla
    const typeNameNormalized = type_name.toUpperCase();
    const classNameNormalized = class_name.toUpperCase();

    // Haetaan sallitut tyypit ja luokat
    const typeResult = await client.query('SELECT name FROM book_type');
    const classResult = await client.query('SELECT name FROM book_class');
    const allowedTypes = typeResult.rows.map(row => row.name);
    const allowedClasses = classResult.rows.map(row => row.name);

    // Tarkistetaan että tyypit ovat validit
    if (!allowedTypes.includes(typeNameNormalized)) {
      return res.status(400).json({
        error: 'Invalid type_name',
        allowed_types: allowedTypes
      });
    }
    if (!allowedClasses.includes(classNameNormalized)) {
      return res.status(400).json({
        error: 'Invalid class_name',
        allowed_classes: allowedClasses
      });
    }

    // Tarkistetaan löytyykö jo kyseinen title
    const existing = await client.query(
      `SELECT id FROM title
       WHERE LOWER(name) = LOWER($1) AND LOWER(writer) = LOWER($2) AND year = $3 AND LOWER(publisher) = LOWER($4)`,
      [name, writer, year, publisher]
    );

    let titleId;

    if (existing.rows.length > 0) {
      // Jos title löytyy, otetaan id talteen
      titleId = existing.rows[0].id;
    } else {
      // Muuten lisätään uusi title
      titleId = uuidv4();
      await client.query(
        `INSERT INTO title (
          id, isbn, name, writer, publisher, year, weight, type, class, created_at, modified_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [
          titleId,
          isbn,
          name,
          writer,
          publisher,
          year,
          weight,
          typeNameNormalized,
          classNameNormalized
        ]
      );
    }

    // Haetaan kaikki store-nimet ja id:t
    const storeRes = await client.query('SELECT id, name FROM store');

    // Etsitään store_name pienellä kirjainkoolla
    const matchingStore = storeRes.rows.find(
      store => store.name.toLowerCase() === store_name.toLowerCase()
    );

    if (!matchingStore) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `Store '${store_name}' not found`,
        allowed_stores: storeRes.rows.map(row => row.name)
      });
    }

    const storeId = matchingStore.id;

    // Lisätään uusi book instanssi
    const bookId = uuidv4();
    await client.query(
      `INSERT INTO book (
        id, title_id, condition, purchase_price, sale_price, status, store_id, created_at, modified_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
      )`,
      [
        bookId,
        titleId,
        condition,
        purchase_price,
        sale_price,
        'AVAILABLE',
        storeId
      ]
    );

    /*** Lisätään kirja myös sen omistavan divarin tietokantaan, ***/
    /*** jos käyttäjä on valinnut sen lisättäväksi ***/
    if (add_to_single_store) {
      // Haetaan divarin skeeman nimi id:n perusteella
      const schemaRes = await client.query(
        "SELECT schema_name FROM store_schema_mapping WHERE store_id = $1",
        [storeId],
      );
      if (schemaRes.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: `No schema found for store '${store_name}'`,
        });
      }
      const storeSchema = schemaRes.rows[0].schema_name;

      // Tarkistetaan löytyykö title divarista
      const existingStoreTitle = await client.query(
        `SELECT id FROM ${storeSchema}.title
         WHERE LOWER(name) = LOWER($1) AND LOWER(writer) = LOWER($2) AND year = $3 AND LOWER(publisher) = LOWER($4)`,
        [name, writer, year, publisher],
      );

      // Jos ei, niin lisätään title divariin
      if (existingStoreTitle.rows.length === 0) {
        await client.query(
          `INSERT INTO ${storeSchema}.title (
            id, isbn, name, writer, publisher, year, weight, type, class, created_at, modified_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
          [
            titleId,
            isbn,
            name,
            writer,
            publisher,
            year,
            weight,
            typeNameNormalized,
            classNameNormalized,
          ],
        );
      }

      // Lisätään book divariin
      await client.query(
        `INSERT INTO ${storeSchema}.book (
          id, title_id, condition, purchase_price, sale_price, status, store_id, created_at, modified_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [
          bookId,
          titleId,
          condition,
          purchase_price,
          sale_price,
          "AVAILABLE",
          storeId,
        ],
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: 'Book added successfully',
      book_id: bookId,
      title_id: titleId,
      added_to_single_store: !!add_to_single_store,
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding book/title:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};
