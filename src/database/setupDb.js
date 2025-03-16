import { exec } from "child_process";
import dotenv from "dotenv";

dotenv.config();

const PG_USER = process.env.DB_USER || "postgres";
const PG_HOST = process.env.DB_HOST || "localhost";
const PG_PASSWORD = process.env.DB_PASSWORD || "";
const PG_DB = process.env.DB_NAME || "central_divari";


const CREATE_USER_COMMAND = `
psql -h ${PG_HOST} -U ${PG_USER} -W -c "CREATE USER divari_user WITH PASSWORD 'password';"
psql -h ${PG_HOST} -U ${PG_USER} -W -c "GRANT ALL PRIVILEGES ON DATABASE ${PG_DB} TO divari_user;"
`;

// Komennot tietokannan alustamiseen
const RESET_DB_COMMAND = `psql -h ${PG_HOST} -U ${PG_USER} -f src/database/reset_db.sql`;
const INIT_DB_COMMAND = `psql -h ${PG_HOST} -U ${PG_USER} -f src/database/init_db.sql`;

console.log("Resetoidaan tietokanta...");

// Ajetaan ensin resetointi
exec(RESET_DB_COMMAND, (error, stdout, stderr) => {
  if (error) {
    console.error("Virhe tietokannan resetoinnissa:", stderr);
    return;
  }
  console.log("resetointi onnistui!");

  // Ajetaan sen jälkeen alustus
  console.log("alustetaan tietokanta...");
  exec(INIT_DB_COMMAND, (error, stdout, stderr) => {
    if (error) {
      console.error("Virhe tietokannan alustuksessa:", stderr);
      return;
    }
    console.log("Tietokannan alustus onnistui!");
  });
});
