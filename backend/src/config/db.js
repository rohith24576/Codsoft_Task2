import pg from 'pg';
import dotenv from 'dotenv';

const envConfig = dotenv.config({ override: true });

const { Pool } = pg;

const connectionString = envConfig.parsed?.DATABASE_URL || process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Supabase and most hosted Postgres
  }
});

export const query = (text, params) => pool.query(text, params);
export default pool;
