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
      RETURNING id, title_id, sale_price, condition, modified_at;
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


  export const cancelReservation = async (req, res) => {
    const { bookId } = req.body;
  
    if (!bookId) {
      return res.status(400).json({ error: 'bookId puuttuu' });
    }
  
    const client = await pool.connect();
  
    try {
      await client.query('BEGIN');
  
      const result = await client.query(
        `
        UPDATE book
        SET status = 'AVAILABLE', modified_at = NOW()
        WHERE id = $1 AND (status = 'RESERVED' OR status = 'AVAILABLE')
        RETURNING id;
        `,
        [bookId]
      );
  
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Varausta ei löytynyt tai kirjaa ei voi peruuttaa.' });
      }
  
      await client.query('COMMIT');
  
      return res.status(200).json({
        message: 'Varaus peruutettu ja kirja asetettu takaisin saataville.',
        book_id: result.rows[0].id
      });
  
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Virhe varauksen peruutuksessa:', error.message);
      return res.status(500).json({ error: 'Server Error: ' + error.message });
    } finally {
      client.release();
    }
  };

  export const extendReservationTime = async (req, res) => {
    const { books } = req.body;
  
    if (!books || !Array.isArray(books)) {
      return res.status(400).json({ error: "Virheellinen pyyntö, books puuttuu tai ei ole taulukko." });
    }
  
    const client = await pool.connect();
  
    try {
      await client.query("BEGIN");
  
      const updatedBooks = [];
  
      for (const book of books) {
        const { book_id, modified_at } = book;
  
        const result = await client.query(
          `
          UPDATE book
          SET modified_at = NOW()
          WHERE id = $1 AND status = 'RESERVED' AND modified_at = $2
          RETURNING id, isbn, condition, sale_price;
          `,
          [book_id, modified_at]
        );
  
        if (result.rowCount === 0) {
          await client.query("ROLLBACK");
          return res.status(409).json({ error: `Kirjan ${book_id} varausta ei voitu jatkaa.` });
        }
  
        const updated = result.rows[0];
  
        const titleResult = await client.query(`
          SELECT name, weight
          FROM title
          WHERE isbn = $1;
        `, [updated.isbn]);
  
        if (titleResult.rowCount === 0) {
          await client.query("ROLLBACK");
          return res.status(404).json({ error: 'Teoksen tiedot puuttuvat.' });
        }
  
        const title = titleResult.rows[0];
  
        updatedBooks.push({
          book_id: updated.id,
          title_name: title.name,
          sale_price: updated.sale_price,
          condition: updated.condition,
          weight: title.weight,
          modified_at: new Date().toISOString()
        });
      }
  
      await client.query("COMMIT");
      return res.status(200).json({ message: "Varauksia jatkettiin", updatedBooks });
  
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Virhe varauksen jatkamisessa:", error.message);
      return res.status(500).json({ error: "Palvelinvirhe: " + error.message });
    } finally {
      client.release();
    }
  };