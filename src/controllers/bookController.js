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
    res.status(500).json({ error: 'Internal error' });
  }
};


export const titlesByClass = async (req, res) => {
  const query = `
    SELECT 
      bc.name AS class,
      COUNT(b.id) AS count,
      SUM(b.sale_price) AS total_price,
      AVG(b.sale_price) AS average_price
    FROM book b
    INNER JOIN title t ON b.title_id = t.id
    INNER JOIN book_class bc ON bc.id = t.class_id
    WHERE b.status = 'AVAILABLE'
    GROUP BY bc.id;
  `
  try {
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
}