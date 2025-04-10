import pool from "../config/db.js";
import { XMLParser } from "fast-xml-parser";
import { v4 as uuidv4 } from "uuid";

/**
 * Hakee store-taulusta divaritiedot annetun parametrisuodatuksen perusteella.
 * Tukee suodatusta seuraavilla kentillä:
 * name, street_address, postcode, city, email, phone_num, website
 */
export const searchStores = async (req, res) => {
  // Määritellään kentät, joiden perusteella käyttäjä saa suodattaa
  const allowedFields = [
    "id",
    "name",
    "street_address",
    "postcode",
    "city",
    "email",
    "phone_num",
    "website",
  ];

  const conditions = []; // Tänne kerätään SQL WHERE-ehtolauseet
  const values = []; // Tämä sisältää query-parametrien arvot SQL:ää varten
  let i = 1; // SQL-parametrien numerointi ($1, $2, jne.)

  // Käydään läpi kaikki sallitut kentät
  for (const field of allowedFields) {
    if (req.query[field]) {
      if (field === "id") {
        // UUID ilman LOWERiä ja LIKEa
        conditions.push(`${field} = $${i++}`);
        values.push(req.query[field]);
      } else if (field === "postcode") {
        // Postinumero: tässä käytetään =-operaattoria ja likea
        conditions.push(`${field} = $${i++}`);
        values.push(`%${req.query[field]}%`);
      } else {
        // Muut kentät: käytetään LIKEa ja LOWERia
        conditions.push(`LOWER(${field}) LIKE LOWER($${i++})`);
        values.push(`%${req.query[field]}%`);
      }
    }
  }

  // Rakennetaan WHERE-ehto, jos parametreja löytyi
  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

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
    console.error("Internal error", err);
    res.status(500).json({ error: "Internal Error" });
  }
};


/**
 * Luo uuden divarin XML-tiedostosta / tallentaa teostietoja olemassa olevalle divarille.
 * - Divarin perustiedot otetaan req.body:stä (name, street_address, postcode, city, email, phone_num, website).
 * - XML-tiedosto sisältää vain teosten tiedot (<teokset><teos> … </teokset>).
 * - Jos ownDatabase on valittu, luodaan uusi skeema ja kopioidaan tarvittavat taulut sinne.
 * - Mikäli yhden teoksen nideillä on eri painoja, muodostetaan kutakin painoryhmää varten oma title,
 *   jolloin title-tasolla tallennetaan paino.
 */
export const addStoreFromXml = async (xmlData, storeDetails, ownDatabase) => {
  // Parsitaan XML ja haetaan teosten tiedot
  const parser = new XMLParser({ ignoreAttributes: false });
  const xmlParsed = parser.parse(xmlData);
  const teokset = xmlParsed.teokset;
  if (!teokset || !teokset.teos) {
    throw new Error("XML-tiedoston rakenne on virheellinen: teokset puuttuu.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Tarkistetaan, onko divaria, jolla on sama nimi, jo olemassa.
    // Jos on, käytetään olemassa olevaa store_id:tä, muuten luodaan uusi.
    const storeCheck = await client.query(
      "SELECT id FROM store WHERE name = $1",
      [storeDetails.name]
    );
    let storeId;
    if (storeCheck.rows.length > 0) {
      storeId = storeCheck.rows[0].id;
    } else {
      storeId = uuidv4();
      await client.query(
        `INSERT INTO store (id, name, street_address, postcode, city, email, phone_num, website, created_at, modified_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
        [
          storeId,
          storeDetails.name,
          storeDetails.street_address,
          storeDetails.postcode,
          storeDetails.city,
          storeDetails.email,
          storeDetails.phone_num,
          storeDetails.website
        ]
      );
    }

    // Jos ownDatabase on valittu, tarkistetaan onko skeema jo olemassa kyseiselle divarille.
    let schemaName = null;
    if (ownDatabase) {
      const mapping = await client.query(
        "SELECT schema_name FROM store_schema_mapping WHERE store_id = $1",
        [storeId]
      );
      if (mapping.rows.length > 0) {
        schemaName = mapping.rows[0].schema_name;
      } else {
        const schemaQuery = await client.query(
          `SELECT nspname FROM pg_namespace
           WHERE nspname LIKE 'd%_divari'
           ORDER BY nspname ASC`
        );
        let nextSchemaNumber = 1;
        const existingSchemas = schemaQuery.rows.map((row) => row.nspname);
        while (existingSchemas.includes(`d${nextSchemaNumber}_divari`)) {
          nextSchemaNumber++;
        }
        schemaName = `d${nextSchemaNumber}_divari`;
        await client.query(`CREATE SCHEMA ${schemaName}`);

        await client.query(
          `CREATE TABLE ${schemaName}.book_type AS TABLE public.book_type WITH NO DATA`
        );
        await client.query(
          `CREATE TABLE ${schemaName}.book_class AS TABLE public.book_class WITH NO DATA`
        );
        await client.query(
          `INSERT INTO ${schemaName}.book_type (name) SELECT name FROM public.book_type`
        );
        await client.query(
          `INSERT INTO ${schemaName}.book_class (name) SELECT name FROM public.book_class`
        );

        await client.query(
          `CREATE TABLE ${schemaName}.title (LIKE public.title INCLUDING ALL)`
        );
        await client.query(
          `CREATE TABLE ${schemaName}.book (LIKE public.book INCLUDING ALL)`
        );

        await client.query(
          `INSERT INTO store_schema_mapping (store_id, schema_name)
           VALUES ($1, $2)`,
          [storeId, schemaName]
        );
      }
    }

    // Prosessoidaan teostiedot XML:stä.
    const teosArray = Array.isArray(teokset.teos) ? teokset.teos : [teokset.teos];
    for (const teos of teosArray.filter(Boolean)) {
      const ttiedot = teos.ttiedot;
      if (!ttiedot) continue;

      // Ryhmitellään nide-elementit painon (paino) mukaan
      const nideData = Array.isArray(teos.nide) ? teos.nide : [teos.nide];
      const weightGroups = {};
      for (const nide of nideData.filter(Boolean)) {
        // Oletetaan, että paino on pakollinen, mutta jos puuttuu, käytetään arvoa 0
        const weightValue = nide.paino ? parseFloat(nide.paino) : 0;
        if (!weightGroups[weightValue]) {
          weightGroups[weightValue] = [];
        }
        weightGroups[weightValue].push(nide);
      }

      // Jos nideillä on useampia eri painoja, luodaan jokaiselle painoryhmälle oma title.
      // Jos vain yksi paino löytyy, luodaan yksi title.
      for (const weightKey in weightGroups) {
        let titleId;
        const weightValue = parseFloat(weightKey);
        // Tarkistetaan, onko teokselle jo title olemassa, tunnistettuna isbn:llä ja painolla.
        const titleCheck = await client.query(
          `SELECT id FROM public.title WHERE isbn = $1 AND weight = $2`,
          [ttiedot.isbn, weightValue]
        );
        if (titleCheck.rows.length > 0) {
          titleId = titleCheck.rows[0].id;
        } else {
          titleId = uuidv4();
          await client.query(
            `INSERT INTO public.title (id, isbn, name, writer, publisher, weight, type, class, created_at, modified_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
            [
              titleId, 
              ttiedot.isbn, 
              ttiedot.nimi,
              ttiedot.tekija,
              ttiedot.kustantaja || 'unknown',
              weightValue,
              ttiedot.tyyppi || 'OTHER',
              ttiedot.luokka || 'OTHER'] 
          );
        }
        if (ownDatabase && schemaName) {
          await client.query(
            `INSERT INTO ${schemaName}.title (id, isbn, name, writer, publisher, weight, type, class, created_at, modified_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
             [
              titleId, 
              ttiedot.isbn, 
              ttiedot.nimi,
              ttiedot.tekija,
              ttiedot.kustantaja || 'unknown',
              weightValue,
              ttiedot.tyyppi || 'OTHER',
              ttiedot.luokka || 'OTHER'] 
          );
        }

        // Lisätään kaikki kyseisen painoryhmän nide-elementit viitaten tähän titleId:hen
        const groupNides = weightGroups[weightKey];
        for (const nide of groupNides) {
          const bookId = uuidv4();
          const hinta = parseFloat(nide.hinta);
          await client.query(
            `INSERT INTO public.book (id, title_id, purchase_id, store_id, condition, purchase_price, sale_price, status, created_at, modified_at)
             VALUES ($1, $2, NULL, $3, $4, $5, $6, $7, NOW(), NOW())`,
            [bookId, titleId, storeId, "GOOD", hinta, hinta, "AVAILABLE"]
          );
          if (ownDatabase && schemaName) {
            await client.query(
              `INSERT INTO ${schemaName}.book (id, title_id, purchase_id, store_id, condition, purchase_price, sale_price, status, created_at, modified_at)
               VALUES ($1, $2, NULL, $3, $4, $5, $6, $7, NOW(), NOW())`,
              [bookId, titleId, storeId, "GOOD", hinta, hinta, "AVAILABLE"]
            );
          }
        }
      }
    }

    await client.query("COMMIT");
    return {
      message:
        ownDatabase && schemaName
          ? `Store added successfully under schema: ${schemaName}`
          : "Store added successfully"
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};


/* Triggeri, joka synkronoi keskusdivarin tietokannan joka toinen minuutti */
export const syncCentralDB = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Haetaan kaikkien divareiden skeemat
    const schemaRes = await client.query("SELECT store_id, schema_name FROM store_schema_mapping");

    for (const { store_id, schema_name } of schemaRes.rows) {
      // Lisätään kaikki puuttuvat teokset keskusdivariin
      const insertTitles = await client.query(`
        INSERT INTO title (id, isbn, name, writer, publisher, year, weight, type, class, created_at, modified_at)
        SELECT t.id, t.isbn, t.name, t.writer, t.publisher, t.year, t.weight, t.type, t.class, t.created_at, t.modified_at
        FROM ${schema_name}.title t
        WHERE NOT EXISTS (
          SELECT 1 FROM title WHERE id = t.id
        )
      `);
      
      // Päivitetään olemassa olevat teostiedot jos niitä on muokattu
      const updateTitles = await client.query(`
        UPDATE title AS central
        SET
          isbn = t.isbn,
          name = t.name,
          writer = t.writer,
          publisher = t.publisher,
          year = t.year,
          weight = t.weight,
          type = t.type,
          class = t.class,
          modified_at = t.modified_at
        FROM ${schema_name}.title t
        WHERE central.id = t.id
          AND t.modified_at > central.modified_at
      `);

      // Lisätään kaikki puuttuvat kirjat keskusdivariin
      const insertBooks = await client.query(`
        INSERT INTO book (id, title_id, purchase_id, store_id, condition, purchase_price, sale_price, status, created_at, modified_at)
        SELECT b.id, b.title_id, b.purchase_id, b.store_id, b.condition, b.purchase_price, b.sale_price, b.status, b.created_at, b.modified_at
        FROM ${schema_name}.book b
        WHERE NOT EXISTS (
          SELECT 1 FROM book WHERE id = b.id
        )
      `);
      
      // Päivitetään olemassa olevat kirjat jos niiden tietoja on muokattu
      const updateBooks = await client.query(`
        UPDATE book AS central
        SET
          title_id = b.title_id,
          purchase_id = b.purchase_id,
          store_id = b.store_id,
          condition = b.condition,
          purchase_price = b.purchase_price,
          sale_price = b.sale_price,
          status = b.status,
          modified_at = b.modified_at
        FROM ${schema_name}.book b
        WHERE central.id = b.id
          AND b.modified_at > central.modified_at
      `);

      if (
        insertTitles.rowCount > 0 ||
        insertBooks.rowCount > 0 ||
        updateTitles.rowCount > 0 ||
        updateBooks.rowCount > 0
      ) {
        console.log(
          `Synkronoitu ${schema_name}: lisätty ${insertTitles.rowCount} teosta ja ${insertBooks.rowCount} kirjaa, ` +
          `päivitetty ${updateTitles.rowCount} teosta ja ${updateBooks.rowCount} kirjaa.`
        );
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Synkronointivirhe:", err.message);
  } finally {
    client.release();
  }
};