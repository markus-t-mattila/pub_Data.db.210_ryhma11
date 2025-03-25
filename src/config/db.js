import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: 'divari_user',
  host: 'localhost',
  database: 'central_divari',
  password: 'password',
  port: 5432,
  statement_timeout: 5000 // katkaise yli 5 sekunnin kyselyt
})

export default pool;