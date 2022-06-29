import {Pool} from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const db = new Pool({
  host: process.env.DB_PG_HOST,
  port: 5432,
  user: process.env.DB_PG_USERNAME,
  password: process.env.DB_PG_PASSWORD,
  database: process.env.DB_PG_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default db;
