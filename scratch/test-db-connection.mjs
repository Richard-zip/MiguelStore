import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    const res = await pool.query('SELECT 1');
    console.log('Connection successful, result:', res.rows);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await pool.end();
  }
})();
