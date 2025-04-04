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

/* *
 * Luo uuden divarin xml-tiedostosta.
 *   Uuden divarin ja sen teosten ja kirjojen tiedot lisätään sekä
 * luodun divarin kantaan että keskustietokantaan.
 *   Keskusdivarista ennestään löytyviä teostietoja ei lisätä sinne uudestaan,
 * eli olemassa olevat teokset lisätään vain uuden divarin kantaan.
 *   Uuden divarin tiedot parsitaan saadusta xml-tiedostosta.
 * Tietoja ei varmisteta muuten kuin sen osalta, että uuden divarin
 * nimistä divaria ei ennestään ole.
 * */
export const addStoreFromXml = async (xmlData) => {
  const parser = new XMLParser({ ignoreAttributes: false });
  const storeData = parser.parse(xmlData).store;

  if (!storeData) {
    throw new Error("XML-tiedoston rakenne on virheellinen.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Tarkistetaan, onko lisättävn divarin nimi jo käytössä
    const storeCheck = await client.query(
      "SELECT id FROM store WHERE name = $1",
      [storeData.name],
    );
    if (storeCheck.rows.length > 0) {
      throw new Error("Tämän niminen divari on jo olemassa.");
    }

    // Nimetään uuden divarin skeema: d<juokseva numero>_divari
    const schemaQuery = await client.query(
      `SELECT nspname FROM pg_namespace
        WHERE nspname LIKE 'd%_divari'
        ORDER BY nspname ASC`,
    );

    let nextSchemaNumber = 1;
    const existingSchemas = schemaQuery.rows.map((row) => row.nspname);
    while (existingSchemas.includes(`d${nextSchemaNumber}_divari`)) {
      nextSchemaNumber++;
    }

    // Luodaan uudelle divarille oma skeema
    const schemaName = `d${nextSchemaNumber}_divari`;
    await client.query(`CREATE SCHEMA ${schemaName}`);

    // Kopioidaan keskusdivarin book_class ja book_type taulut uuteen skeemaan
    await client.query(
      `CREATE TABLE ${schemaName}.book_type AS TABLE public.book_type WITH NO DATA`,
    );
    await client.query(
      `CREATE TABLE ${schemaName}.book_class AS TABLE public.book_class WITH NO DATA`,
    );
    await client.query(
      `INSERT INTO ${schemaName}.book_type (name) SELECT name FROM public.book_type`,
    );
    await client.query(
      `INSERT INTO ${schemaName}.book_class (name) SELECT name FROM public.book_class`,
    );

    // Kopioidaan keskusdivarin title ja book taulujen rakenteet uuteen skeemaan
    await client.query(
      `CREATE TABLE ${schemaName}.title (LIKE public.title INCLUDING ALL)`,
    );
    await client.query(
      `CREATE TABLE ${schemaName}.book (LIKE public.book INCLUDING ALL)`,
    );

    // Lisätään uuden divarin tiedot keskustietokantaan
    const storeId = uuidv4();
    await client.query(
      `INSERT INTO store (id, name, street_address, postcode, city, email, phone_num, website, created_at, modified_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [
        storeId,
        storeData.name,
        storeData.street_address,
        storeData.postcode,
        storeData.city,
        storeData.email,
        storeData.phone_num,
        storeData.website,
      ],
    );

    // Tallennetaan uuden divarin skeeman nimi mapping-tauluun
    await client.query(
      `INSERT INTO store_schema_mapping (store_id, schema_name)
       VALUES ($1, $2)`,
      [storeId, schemaName]
    );

    // Prosessoidaan teostiedot
    const titles = Array.isArray(storeData.titles?.title)
      ? storeData.titles.title
      : [storeData.titles?.title];

    for (const title of titles.filter(Boolean)) {
      let titleId;

      const titleCheck = await client.query(
        `SELECT id FROM public.title WHERE isbn = $1`,
        [title.isbn],
      );

      // Lisätään uudet teostiedot keskustietokantaan
      if (titleCheck.rows.length > 0) {
        titleId = titleCheck.rows[0].id;
      } else {
        titleId = uuidv4();
        await client.query(
          `INSERT INTO public.title (id, isbn, name, writer, publisher, year, weight, type, class, created_at, modified_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
          [
            titleId,
            title.isbn,
            title.name,
            title.writer,
            title.publisher,
            parseInt(title.year, 10),
            parseInt(title.weight, 10),
            title.type,
            title.class,
          ],
        );
      }

      // Lisätään teostiedot uuden divarin skeemaan
      await client.query(
        `INSERT INTO ${schemaName}.title (id, isbn, name, writer, publisher, year, weight, type, class, created_at, modified_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7,
            (SELECT name FROM ${schemaName}.book_type WHERE name = $8),
            (SELECT name FROM ${schemaName}.book_class WHERE name = $9),
            NOW(), NOW())`,
        [
          titleId,
          title.isbn,
          title.name,
          title.writer,
          title.publisher,
          parseInt(title.year, 10),
          parseInt(title.weight, 10),
          title.type,
          title.class,
        ],
      );

      // Prosessoidaan nidetiedot
      const books = Array.isArray(title.books?.book)
        ? title.books.book
        : [title.books?.book];

      for (const book of books.filter(Boolean)) {
        const bookId = uuidv4();

        const validConditions = new Set(["NEW", "GOOD", "FAIR", "POOR"]);
        const bookCondition = validConditions.has(book.condition.toUpperCase())
          ? book.condition.toUpperCase()
          : "GOOD"; // Jos kirjan kuntoa ei ole annettu, asetetaan oletusarvo

        // Lisätään nidetiedot keskustietokantaan
        await client.query(
          `INSERT INTO public.book (id, title_id, purchase_id, store_id, condition, purchase_price, sale_price, status, created_at, modified_at)
            VALUES ($1, $2, NULL, $3, $4, $5, $6, $7, NOW(), NOW())`,
          [
            bookId,
            titleId,
            storeId,
            bookCondition,
            parseFloat(book.purchase_price),
            parseFloat(book.sale_price),
            book.status,
          ],
        );

        // Lisätään nidetiedot uuden divarin skeemaan
        await client.query(
          `INSERT INTO ${schemaName}.book (id, title_id, purchase_id, store_id, condition, purchase_price, sale_price, status, created_at, modified_at)
            VALUES ($1, $2, NULL, $3, $4, $5, $6, $7, NOW(), NOW())`,
          [
            bookId,
            titleId,
            storeId,
            bookCondition,
            parseFloat(book.purchase_price),
            parseFloat(book.sale_price),
            book.status,
          ],
        );
      }
    }

    await client.query("COMMIT");
    return { message: `Store added successfully under schema: ${schemaName}` };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
