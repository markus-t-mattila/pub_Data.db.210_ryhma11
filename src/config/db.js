import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: 'divari_user',
  host: 'localhost',
  database: 'central_divari',
  password: 'password',
  port: 5432
})

export default pool;