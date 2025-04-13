import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import dotenv from "dotenv";
import { exec } from "child_process";

// Määritellään __filename ja __dirname ES-moduuleissa:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Määritetään absoluuttinen polku .env‑tiedostolle.
// .env sijaitsee yhden tason yläpuolella tämän tiedoston sijaintia:
const envPath = path.resolve(__dirname, '../.env');
console.log("Ladataan .env tiedostosta:", envPath);

// (Varmista, että tiedosto todella on kyseisessä paikassa.)
if (!fs.existsSync(envPath)) {
  console.error(`Virhe: .env tiedostoa ei löytynyt polusta ${envPath}`);
}

// Ladataan ympäristömuuttujat käyttäen absoluuttista polkua:
dotenv.config({ path: envPath });

// varmistetaan että env muuttujat saadaan paikalleen
const { registerAdmin } = await import("../controllers/admin.js");

const PG_USER = process.env.DB_USER || "postgres";
const PG_HOST = process.env.DB_HOST || "localhost";
const PG_PASSWORD = process.env.DB_PASSWORD || "password";
const PG_DB = process.env.DB_NAME || "central_divari";
const RESET_DB = process.env.RESET_DB || "backend/database/sql_statements/reset_db.sql";
const INIT_DB = process.env.INIT_DB || "backend/database/sql_statements/init_db.sql";


const CREATE_USER_COMMAND = `
psql -h ${PG_HOST} -U ${PG_USER} -W -c "CREATE USER divari_user WITH PASSWORD 'password';"
psql -h ${PG_HOST} -U ${PG_USER} -W -c "GRANT ALL PRIVILEGES ON DATABASE ${PG_DB} TO divari_user;"
`;

// Komennot tietokannan alustamiseen
const RESET_DB_COMMAND = `psql -h ${PG_HOST} -U ${PG_USER} -f ${RESET_DB}`;
const INIT_DB_COMMAND = `psql -h ${PG_HOST} -U ${PG_USER} -f ${INIT_DB}`;

console.log("Resetoidaan tietokanta...");

// Ajetaan ensin resetointi
exec(RESET_DB_COMMAND,
  { env: {...process.env, PGPASSWORD: PG_PASSWORD}}, async (error, stdout, stderr) => {
  if (stdout) {
    console.log('STDOUT:\n'+stdout);
  }
  if (stderr) {
    console.log('STDERR:\n'+stderr);
  }

  if (error) {
    console.error("Virhe tietokannan resetoinnissa:", stderr);
    return;
  }
  console.log("resetointi onnistui!");

  // Ajetaan sen jälkeen alustus
  console.log("alustetaan tietokanta...");
  exec(INIT_DB_COMMAND,
    { env: {...process.env, PGPASSWORD: PG_PASSWORD}}, async (error, stdout, stderr) => {
    if (stdout) {
      console.log('STDOUT:\n'+stdout);
    }
    if (stderr) {
      console.log('STDERR:\n'+stderr);
    }
  
    if (error) {
      console.error("Virhe tietokannan alustuksessa:", stderr);
      return;
    }
    console.log("Tietokannan alustus onnistui!");
    await createAdmins();
  });
});

const createAdmins = async () => {
  const centralAdminRequest = {
    body: {
      email: "central@admin.dev",
      password: "divariadmin",
      is_central: true,
    }
  }
  const externalAdminRequest = {
    body: {
      email: "external@admin.dev",
      password: "divariadmin2",
      is_central: false,
      storeIds: [
        "a1111111-1111-1111-1111-111111111111",
        "a2222222-2222-2222-2222-222222222222",
      ],
    }
  }
  registerAdmin(centralAdminRequest, {
    status: (code) => ({
      json: (data) => {
        console.log("Keskusadmin:", data);
      }
    })
  });
  registerAdmin(externalAdminRequest, {
    status: (code) => ({
      json: (data) => {
        console.log("Ulkoinen admin:", data);
      }
    })
  });
}

