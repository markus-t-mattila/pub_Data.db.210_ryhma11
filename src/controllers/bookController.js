import pool from '../config/db.js';

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
    book_id: { column: 'b.id', operator: '=', wrapLike: false }
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
      t.class,
      b.sale_price
    FROM book b
    JOIN title t ON b.title_id = t.id
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
