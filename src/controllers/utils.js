import pool from '../config/db.js';

const query = `
    SELECT name
    FROM book_type`;

const {rows} = await pool.query(query);
console.log(rows);
