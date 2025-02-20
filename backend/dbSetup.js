import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: './data.env' });

const { Pool } = pg;

// Connect to PostgreSQL as a superuser to create the database
const adminPool = new Pool({
    user: 'postgres', // superuser or admin username
    host: 'localhost',
    database: 'postgres', // use the default "postgres" database for admin tasks
    password: process.env.PG_PASSWORD, // admin password
    port: 5432,
  });

  const createDatabase = async () => {
    try {
      const dbName = 'users';
  
      // Check if database already exists
      const dbExists = await adminPool.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [dbName]
      );
      console.log(`checking dbExists`);
  
      if (dbExists.rowCount === 0) {
        await adminPool.query(`CREATE DATABASE ${dbName}`);
        console.log(`Database "${dbName}" created successfully.`);
      } else {
        console.log(`Database "${dbName}" already exists.`);
      }
    } catch (err) {
      console.error('Error creating database:', err);
    } finally {
        if (!adminPool.ended) {
            await adminPool.end();
            console.log(`Database connection pool closed.`);
        }
    }
  };

const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT false,
        userId INTEGER REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("Tables created successfully");
  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    pool.end();
  }
};

createDatabase();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

createTables();
