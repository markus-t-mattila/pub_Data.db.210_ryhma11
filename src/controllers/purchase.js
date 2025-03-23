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
        weight: title.weight,
        modified_at: book.modified_at
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
        WITH expired AS (
          SELECT id
          FROM book
          WHERE 
            (status = 'RESERVED' OR (purchase_id IS NOT NULL AND status = 'AVAILABLE'))
            AND modified_at <= (NOW() - INTERVAL '5 minutes')
          FOR UPDATE SKIP LOCKED
          LIMIT 100
        )
        UPDATE book
        SET 
          status = 'AVAILABLE',
          modified_at = NOW(),
          purchase_id = NULL
        WHERE id IN (SELECT id FROM expired)
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
    console.log(books);
  
    if (!books || !Array.isArray(books)) {
      return res.status(400).json({ error: "Virheellinen pyyntö, books puuttuu tai ei ole taulukko." });
    }
  
    const client = await pool.connect();
  
    try {
      await client.query("BEGIN");
  
      const updatedBooks = [];
  
      for (const book of books) {
        const { book_id, modified_at } = book;
        console.log(book_id, modified_at);
        const result = await client.query(
          `
          UPDATE book
          SET modified_at = NOW()
          WHERE id = $1
            AND status = 'RESERVED'
            AND DATE_TRUNC('second', modified_at) = DATE_TRUNC('second', $2::timestamptz)
          RETURNING id, title_id, condition, sale_price;
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
          WHERE id = $1;
        `, [updated.title_id]);
  
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

  export const createPurchaseOrder = async (req, res) => {
    const { customer, books, shipping } = req.body;
  
    if (!customer || !Array.isArray(books) || books.length === 0 || !shipping?.batches) {
      return res.status(400).json({ error: "Puuttuvia tietoja tilauksesta." });
    }
  
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Käyttäjä ei ole kirjautunut." });
    }
    const client = await pool.connect();
  
    try {
      await client.query("BEGIN");
  
      // Luodaan uusi purchase-rivi
      const result = await client.query(`
        INSERT INTO purchase (id, date, total_price, shipping_price, customer_id, created_at, modified_at)
        VALUES (uuid_generate_v4(), NOW(), $1, $2, $3, NOW(), NOW())
        RETURNING id
      `, [
        books.reduce((sum, b) => sum + parseFloat(b.price), 0),
        shipping.totalCost,
        userId
      ]);
  
      const purchaseId = result.rows[0].id;
  
      // Luodaan shipment-rivit jokaiselle batchille
      const shipmentMap = [];
  
      for (const batch of shipping.batches) {
        const shipmentResult = await client.query(`
          INSERT INTO shipment (id, purchase_id, shipping_id, created_at, modified_at)
          VALUES (uuid_generate_v4(), $1, $2, NOW(), NOW())
          RETURNING id
        `, [purchaseId, batch.packageMaxWeight]);
  
        shipmentMap.push({
          shipment_id: shipmentResult.rows[0].id,
          items: [...batch.items] // painolista
        });
      }
  
      // Kohdistetaan jokainen kirja oikeaan shipmentiin painon mukaan
      for (const book of books) {
        const bookWeight = Number(book.weight);
  
        // Etsi shipment jossa tämä paino on vielä käyttämättä
        let matchedShipment = null;
  
        for (const shipment of shipmentMap) {
          const matchIndex = shipment.items.findIndex(w => Number(w) === bookWeight);
          if (matchIndex !== -1) {
            matchedShipment = shipment;
            shipment.items.splice(matchIndex, 1); // käytetty
            break;
          }
        }
  
        if (!matchedShipment) {
          throw new Error(`Kirjaa ${book.book_id} ei voitu kohdistaa mihinkään shipmentiin.`);
        }
  
        // Päivitetäa book: status = 'SOLD', purchase_id = tämä
        await client.query(`
          UPDATE book
          SET status = 'SOLD', purchase_id = $1, modified_at = NOW()
          WHERE id = $2
        `, [purchaseId, book.book_id]);
  
        // Lisätää shipment_item -rivi
        await client.query(`
          INSERT INTO shipment_item (shipment_id, book_id)
          VALUES ($1, $2)
        `, [matchedShipment.shipment_id, book.book_id]);
      }
  
      await client.query("COMMIT");
  
      return res.status(201).json({
        message: "Tilaus tallennettu onnistuneesti.",
        purchase_id: purchaseId,
        shipment_count: shipmentMap.length
      });
  
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Virhe tilauksen tallennuksessa:", error.message);
      return res.status(500).json({ error: "Palvelinvirhe: " + error.message });
    } finally {
      client.release();
    }
  };
  