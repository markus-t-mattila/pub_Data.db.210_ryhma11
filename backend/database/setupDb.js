import { exec } from "child_process";
import dotenv from "dotenv";
import { registerAdmin } from "../controllers/admin.js";

dotenv.config();

const PG_USER = process.env.DB_USER || "postgres";
const PG_HOST = process.env.DB_HOST || "localhost";
const PG_DB = "central_divari";


const CREATE_USER_COMMAND = `
psql -h ${PG_HOST} -U ${PG_USER} -W -c "CREATE USER divari_user WITH PASSWORD 'password';"
psql -h ${PG_HOST} -U ${PG_USER} -W -c "GRANT ALL PRIVILEGES ON DATABASE ${PG_DB} TO divari_user;"
`;

// Komennot tietokannan alustamiseen
const RESET_DB_COMMAND = `psql -h ${PG_HOST} -U ${PG_USER} -f backend/database/sql_statements/reset_db.sql`;
const INIT_DB_COMMAND = `psql -h ${PG_HOST} -U ${PG_USER} -f backend/database/sql_statements/init_db.sql`;

console.log("Resetoidaan tietokanta...");

// Ajetaan ensin resetointi
exec(RESET_DB_COMMAND, async (error, stdout, stderr) => {
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
  exec(INIT_DB_COMMAND, async (error, stdout, stderr) => {
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

