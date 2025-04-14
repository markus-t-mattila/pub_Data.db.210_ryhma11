import 'dotenv/config'; // Ladataan ympäristömuuttujat .env-tiedostosta
import pkg from 'pg';

const { Pool } = pkg;

// asetetaan tiedot tietokanta yhteyttä varten
console.log("Tietokannan asetukset, joko ympäristömuuttujista tai suoraan:");
const details = {
  user: process.env.DB_USER || 'divari_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'central_divari',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
};

console.log("Tietokannan asetukset:", details);


// Luodaan uusi yhteyspooli PostgreSQL-tietokantaa varten
const pool = new Pool({
  user: process.env.DB_USER || 'divari_user',             // Tietokannan käyttäjänimi
  host: process.env.DB_HOST || 'localhost',               // Tietokantapalvelimen osoite
  database: process.env.DB_NAME || 'central_divari',      // Tietokannan nimi
  password: process.env.DB_PASSWORD || 'password',        // Salasana
  port: process.env.DB_PORT || 5432,                      // Portti (PostgreSQL-oletus: 5432)

  // Poolin hallintaan liittyvät asetukset
  max: 20,                        // Enintään 10 samanaikaista yhteyttä poolissa
  idleTimeoutMillis: 10000,      // Vapautetaan yhteys, jos sitä ei ole käytetty 10 sekuntiin
  connectionTimeoutMillis: 2000, // Odotetaan max 2 sekuntia ennen kuin yhteydenotto epäonnistuu
  statement_timeout: 5000        // Katkaise yksittäinen kysely, jos se kestää yli 5 sekuntia
});


export default pool;
