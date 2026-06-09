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
                national_insurance VARCHAR(20) UNIQUE,
                green_points INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS green_points INTEGER DEFAULT 0;
        `);

        await pool.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS national_insurance VARCHAR(20) UNIQUE;
        `);

        /* ================================================= */
        /* APPROVED RESIDENTS TABLE */
        /* ================================================= */

        await pool.query(`
            CREATE TABLE IF NOT EXISTS approved_residents (
                id SERIAL PRIMARY KEY,
                national_insurance VARCHAR(20) UNIQUE NOT NULL,
                postcode VARCHAR(10) NOT NULL,
                area VARCHAR(100) NOT NULL
            );
        `);

        await pool.query(`
            INSERT INTO approved_residents
                (national_insurance, postcode, area)
            VALUES
                ('AB123456C', 'B16 8AA', 'Ladywood'),
                ('CD987654E', 'B16 8AB', 'Ladywood'),
                ('EF456789G', 'B16 9BA', 'Ladywood')
            ON CONFLICT (national_insurance) DO NOTHING;
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

        /* ================================================= */
        /* WASTE REPORTS TABLE */
        /* ================================================= */

        await pool.query(`
            CREATE TABLE IF NOT EXISTS waste_reports (
                id SERIAL PRIMARY KEY,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                issue_type VARCHAR(100) NOT NULL,
                location TEXT NOT NULL,
                details TEXT NOT NULL,
                latitude DECIMAL,
                longitude DECIMAL,
                points_earned INTEGER DEFAULT 5,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        /* ================================================= */
        /* SEWAGE ALERTS TABLE */
        /* ================================================= */

        await pool.query(`
            CREATE TABLE IF NOT EXISTS sewage_alerts (
                id SERIAL PRIMARY KEY,
                location_name VARCHAR(255) UNIQUE NOT NULL,
                water_company VARCHAR(100) DEFAULT 'Severn Trent Water',
                river_catchment VARCHAR(150),
                latitude DECIMAL(9,6),
                longitude DECIMAL(9,6),
                spill_count INT NOT NULL,
                duration_hours DECIMAL(10,2) NOT NULL,
                year_monitored INT NOT NULL,
                is_active_alert BOOLEAN DEFAULT FALSE
            );
        `);

        // Demo Data for Map
        await pool.query(`
            INSERT INTO sewage_alerts 
                (location_name, river_catchment, latitude, longitude, spill_count, duration_hours, year_monitored, is_active_alert)
            VALUES 
                ('Hockley Brook Monitor', 'Tame (Catchment)', 52.4912, -1.9314, 42, 184.50, 2026, true),
                ('Ladywood Drainage Monitor', 'Tame (Catchment)', 52.47993828460706, -1.9212873688002168, 30, 60, 2026, true),
                ('Lucas Circus Sewage Monitor', 'Trent (Catchment)', 52.49387674125492, -1.9079114733928477, 10, 127, 2026, false),
                ('Portlannd Drainage Monitor', 'Trent (Catchment)', 52.47623500185852, -1.9493181674865354, 20, 184, 2026, true),
                ('Edgbaston Sewage Monitor', 'Edgbaston (Catchment)', 52.461540124807705, -1.9205724917036757, 6, 104, 2026, false),
                ('River Rea Sewage Monitor', 'Trent (Catchment)', 52.4741, -1.8892, 19, 62.15, 2026, false),
                ('Bourn Brook Sewage Monitor', 'Rea (Catchment)', 52.4485, -1.9421, 8, 14.30, 2025, false)
            ON CONFLICT (location_name) DO NOTHING;
        `);

        /* ================================================= */
        /* SEED TEST ACCOUNTS */
        /* ================================================= */

        console.log('🟢 Database initialized.');
        console.log('Syncing team accounts...');

        const adminHash = await bcrypt.hash('password', 10);
        const testerHash = await bcrypt.hash('password', 10);

        await pool.query(`
            INSERT INTO users 
                (name, email, password, national_insurance)
            VALUES 
                ($1, $2, $3, $4),
                ($5, $6, $7, $8)
            ON CONFLICT (email) DO NOTHING;
        `, [
            'Admin',
            'admin@test.com',
            adminHash,
            'AB123456C',

            'Tester',
            'tester@test.com',
            testerHash,
            'CD987654E'
        ]);

        await pool.query(`
            UPDATE users
            SET green_points = 0
            WHERE email IN ('admin@test.com', 'tester@test.com');
        `);

        console.log('Admin: admin@test.com | password');
        console.log('Tester: tester@test.com | password');

    } catch (error) {
        console.error('DB Initialization Failed:', error);
        throw error;
    }
}