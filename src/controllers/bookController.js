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
        bt.name AS type,
        bc.name AS class,
        b.sale_price,
        (LENGTH(LOWER(t.name)) - LENGTH(REPLACE(LOWER(t.name), LOWER($1), ''))) AS matches_full_word,
        CASE WHEN t.name ILIKE '%' || $1 || '%' THEN 1 ELSE 0 END AS matches_partial
      FROM book b
      JOIN title t ON b.title_id = t.id
      JOIN book_type bt ON t.type_id = bt.id
      JOIN book_class bc ON t.class_id = bc.id
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
  const {
    name,
    writer,
    type_id,
    class_id,
    min_price,
    max_price,
    min_year,
    max_year
  } = req.query;

  let conditions = [];
  let values = [];
  let i = 1;

  if (name) {
    conditions.push(`LOWER(t.name) LIKE LOWER($${i++})`);
    values.push(`%${name}%`);
  }
  if (writer) {
    conditions.push(`LOWER(t.writer) LIKE LOWER($${i++})`);
    values.push(`%${writer}%`);
  }
  if (type_id) {
    conditions.push(`t.type_id = $${i++}`);
    values.push(type_id);
  }
  if (class_id) {
    conditions.push(`t.class_id = $${i++}`);
    values.push(class_id);
  }
  if (min_price) {
    conditions.push(`b.sale_price >= $${i++}`);
    values.push(min_price);
  }
  if (max_price) {
    conditions.push(`b.sale_price <= $${i++}`);
    values.push(max_price);
  }
  if (min_year) {
    conditions.push(`t.year >= $${i++}`);
    values.push(min_year);
  }
  if (max_year) {
    conditions.push(`t.year <= $${i++}`);
    values.push(max_year);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT
      b.id AS book_id,
      t.id AS title_id,
      t.name,
      t.writer,
      t.year,
      t.weight,
      bt.name AS type,
      bc.name AS class,
      b.sale_price
    FROM book b
    JOIN title t ON b.title_id = t.id
    JOIN book_type bt ON t.type_id = bt.id
    JOIN book_class bc ON t.class_id = bc.id
    ${whereClause}
    ORDER BY t.name ASC
  `;

  try {
    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};