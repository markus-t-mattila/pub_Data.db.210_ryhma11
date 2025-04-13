import pkg from 'pg';
import dotenv from 'dotenv';

// huom oletuksena .env tiedosto on juuressa
dotenv.config({path:'../../.env'});

const { Pool } = pkg;

// Luodaan uusi yhteyspooli PostgreSQL-tietokantaa varten
const pool = new Pool({
  user: process.env.DB_USER || 'divari_user',             // Tietokannan käyttäjänimi
  host: process.env.DB_HOST || 'localhost',               // Tietokantapalvelimen osoite
  database: process.env.DB_NAME || 'central_divari',      // Tietokannan nimi
  password: process.env.DB_PASSWORD || 'password',        // Salasana
  port: process.env.DB_PORT || 5432,                      // Portti (PostgreSQL-oletus: 5432)

  // Poolin hallintaan liittyvät asetukset
  max: 10,                        // Enintään 10 samanaikaista yhteyttä poolissa
  idleTimeoutMillis: 10000,      // Vapautetaan yhteys, jos sitä ei ole käytetty 10 sekuntiin
  connectionTimeoutMillis: 2000, // Odotetaan max 2 sekuntia ennen kuin yhteydenotto epäonnistuu
  statement_timeout: 5000        // Katkaise yksittäinen kysely, jos se kestää yli 5 sekuntia
});


export default pool;