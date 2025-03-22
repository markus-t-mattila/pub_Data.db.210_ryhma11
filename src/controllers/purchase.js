import pool from '../config/db.js';


export const reserveBook = async (req, res) => {
  const { bookId } = req.body;

  if (!bookId) {
    return res.status(400).json({ error: 'bookId puuttuu payloadista' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Päivitetään kirjan tila ja varmistetaan että se oli varattavissa
    const result = await client.query(`
      UPDATE book 
      SET status = 'RESERVED', modified_at = NOW()
      WHERE 
        id = $1 AND 
        status = 'AVAILABLE' AND
        purchase_id IS NULL
      RETURNING id, title_id, sale_price, condition;
    `, [bookId]);

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Hups, joku oli sinua nopeampi.' });
    }

    const book = result.rows[0];

    // Haetaan title-taulusta kirjan nimi ja paino
    const titleResult = await client.query(`
      SELECT name, weight
      FROM title
      WHERE id = $1;
    `, [book.title_id]);

    if (titleResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Kirjan otsikkotietoja ei löytynyt' });
    }

    const title = titleResult.rows[0];

    await client.query('COMMIT');

    // Palautetaan vain tarvittavat kentät
    return res.status(200).json({
      message: 'Kirja varattu onnistuneesti, 5min aikaa viimeistellä ostos.',
      book: {
        book_id: book.id,
        title_name: title.name,
        sale_price: book.sale_price,
        condition: book.condition,
        weight: title.weight
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Virhe varaamisessa: ${error.message}`);
    return res.status(500).json({ error: 'Tietokantavirhe: ' + error.message });

  } finally {
    client.release();
  }
};


export const releaseExpiredReservations = async () => {
    const client = await pool.connect();
  
    try {
      await client.query('BEGIN');
  
      // Päivitä kaikki 5 minuuttia vanhemmat varaukset takaisin AVAILABLE-tilaan
      const result = await client.query(`
        UPDATE book
        SET 
            status = 'AVAILABLE', 
            modified_at = NOW(),
            purchase_id = NULL
        WHERE 
            (status = 'RESERVED' OR
            (purchase_id IS NOT NULL AND status = 'AVAILABLE')) 
          AND modified_at <= (NOW() - INTERVAL '5 minutes')
        RETURNING id;
      `);
  
      await client.query('COMMIT');
  
      if (result.rowCount > 0) {
        console.log(`Vapautettiin ${result.rowCount} kirjaa:`, result.rows.map(r => r.id));
      }
  
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Virhe vanhentuneiden varausten vapauttamisessa: ${error.message}`);
  
    } finally {
      client.release();
    }
  };
