import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

export async function initDb() {
    try {
        /* ================================================= */
        /* USERS TABLE */
        /* ================================================= */

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                green_points INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS green_points INTEGER DEFAULT 0;
        `);

        /* ================================================= */
        /* RECYCLING LOGS TABLE */
        /* ================================================= */

        await pool.query(`
            CREATE TABLE IF NOT EXISTS recycling_logs (
                id SERIAL PRIMARY KEY,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                weight INTEGER NOT NULL,
                location VARCHAR(100) NOT NULL,
                notes TEXT,
                points_earned INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('🟢 Database initialized.');
        console.log('Syncing team accounts...');

        /* ================================================= */
        /* SEED TEST ACCOUNTS */
        /* ================================================= */

        const adminHash = await bcrypt.hash('password', 10);
        const testerHash = await bcrypt.hash('password', 10);

        await pool.query(`
            INSERT INTO users (name, email, password)
            VALUES 
                ($1, $2, $3),
                ($4, $5, $6)
            ON CONFLICT (email) DO NOTHING;
        `, [
            'Admin', 'admin@test.com', adminHash,
            'Tester', 'tester@test.com', testerHash
        ]);

        await pool.query(`
            UPDATE users
            SET green_points = 0
            WHERE email = 'tester@test.com';
        `);

        console.log('Admin: admin@test.com | password');
        console.log('Tester: tester@test.com | password');

    } catch (error) {
        console.error('DB Initialization Failed:', error);
        throw error;
    }
}