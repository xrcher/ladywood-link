import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function initDb() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;


    try {
        await pool.query(createTableQuery);
        console.log("Tables initialized successfully!");
    } catch (error) {
        console.error("Failed to initialize tables.", error);
    }
}