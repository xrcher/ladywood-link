import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();
const { Pool } = pg;
export const pool = new Pool({connectionString: process.env.DATABASE_URL,});

export async function initDb() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            green_points INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
    `;
    try {
        // User table check
        await pool.query(createTableQuery);

        // rewards
        await pool.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS green_points INTEGER DEFAULT 0;
        `);

        console.log("🟢 Database initialized.");
        console.log("Syncing team accounts...");

        // Hash testing accounts
        const adminHash = await bcrypt.hash('password', 10);
        const testerHash = await bcrypt.hash('password', 10);

        // Insert team accounts (skip if existing)
        const seedQuery = `
            INSERT INTO users (name, email, password) VALUES 
            ($1, $2, $3),
            ($4, $5, $6)
            ON CONFLICT (email) DO NOTHING;
        `;

        await pool.query(seedQuery, [
            'Admin', 'admin@test.com', adminHash,
            'Tester', 'tester@test.com', testerHash
        ]);

        // Give tester points for rewards testing
        await pool.query(`
            UPDATE users
            SET green_points = 563
            WHERE email = 'tester@test.com';
        `);

        console.log("Admin: admin@test.com | password");
        console.log("Tester: tester@test.com | password");

    } catch (error) {
        console.error("DB Initialization Failed:", error);
        throw error;
    }
}