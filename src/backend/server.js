import express from 'express';
import path from 'path';
import session from 'express-session';
import bcrypt from 'bcrypt';

import { initDb, pool } from './db.js';
import { authController } from './controllers/authController.js';
import { requireAuth } from './middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

const getHtmlPage = (fileName) =>
    path.join(process.cwd(), 'frontend', 'pages', fileName);

/* ================================================= */
/* MIDDLEWARE */
/* ================================================= */

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'super_secure_prototype_string',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000 * 60
    }
}));

app.use(express.static(path.join(process.cwd(), 'frontend')));

/* ================================================= */
/* AUTH ROUTES */
/* ================================================= */

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.sendFile(getHtmlPage('login.html'));
});

app.post('/login', authController.postLogin);

app.get('/register', (req, res) => {
    res.sendFile(getHtmlPage('register.html'));
});

app.post('/register', authController.postRegister);

app.get('/logout', authController.logout);

/* ================================================= */
/* DEVELOPMENT BYPASS - REMOVE BEFORE FINAL RELEASE */
/* ================================================= */

app.get('/dev-bypass', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name FROM users WHERE email = $1',
            ['tester@test.com']
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Tester account not found.');
        }

        const tester = result.rows[0];

        req.session.userId = tester.id;
        req.session.userName = tester.name;

        res.redirect('/dashboard');

    } catch (error) {
        console.error('Dev bypass error:', error);
        res.status(500).send('Dev bypass failed.');
    }
});

/* ================================================= */
/* PAGE ROUTES */
/* ================================================= */

app.get('/dashboard', requireAuth, (req, res) => {
    res.sendFile(getHtmlPage('dashboard.html'));
});

app.get('/recycling', requireAuth, (req, res) => {
    res.sendFile(getHtmlPage('recycling.html'));
});

app.get('/bin-collection', requireAuth, (req, res) => {
    res.sendFile(getHtmlPage('bin-collection.html'));
});

app.get('/settings', requireAuth, (req, res) => {
    res.sendFile(getHtmlPage('settings.html'));
});

app.get('/waste-report', requireAuth, (req, res) => {
    res.sendFile(getHtmlPage('waste-report.html'));
});

app.get('/rewards', requireAuth, (req, res) => {
    res.sendFile(getHtmlPage('rewards.html'));
});

/* ================================================= */
/* API ROUTES */
/* ================================================= */

app.get('/api/user', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT name FROM users WHERE id = $1',
            [req.session.userId]
        );

        if (result.rows.length === 0) {
            return res.json({ name: 'User' });
        }

        res.json({
            name: result.rows[0].name
        });

    } catch (error) {
        console.error('User fetch error:', error);
        res.json({ name: 'User' });
    }
});

app.get('/api/points', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT green_points FROM users WHERE id = $1',
            [req.session.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        res.json({
            success: true,
            points: result.rows[0].green_points
        });

    } catch (error) {
        console.error('Points fetch error:', error);

        res.status(500).json({
            success: false,
            message: 'Could not load points.'
        });
    }
});

app.post('/redeem', requireAuth, async (req, res) => {
    try {
        const cost = Number(req.body.cost);

        if (!Number.isInteger(cost) || cost <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reward cost.'
            });
        }

        const result = await pool.query(
            'SELECT green_points FROM users WHERE id = $1',
            [req.session.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        const currentPoints = result.rows[0].green_points;

        if (currentPoints < cost) {
            return res.json({
                success: false,
                message: 'Not enough Green Points.'
            });
        }

        const newPoints = currentPoints - cost;

        await pool.query(
            'UPDATE users SET green_points = $1 WHERE id = $2',
            [newPoints, req.session.userId]
        );

        res.json({
            success: true,
            points: newPoints
        });

    } catch (error) {
        console.error('Redeem error:', error);

        res.status(500).json({
            success: false,
            message: 'Something went wrong.'
        });
    }
});

app.post('/api/recycling-log', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const { weight, location, notes } = req.body;

        const validLocations = [
            'Green Channel',
            'Rob Metals',
            'Enviro City'
        ];

        const recycledKg = Number(weight);

        if (!Number.isInteger(recycledKg) || recycledKg <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid whole number for KG recycled.'
            });
        }

        if (!validLocations.includes(location)) {
            return res.status(400).json({
                success: false,
                message: 'Please select a valid recycling location.'
            });
        }

        const pointsEarned = recycledKg * 10;

        await pool.query(`
            INSERT INTO recycling_logs 
                (user_id, weight, location, notes, points_earned)
            VALUES 
                ($1, $2, $3, $4, $5);
        `, [
            userId,
            recycledKg,
            location,
            notes || '',
            pointsEarned
        ]);

        const result = await pool.query(`
            UPDATE users
            SET green_points = green_points + $1
            WHERE id = $2
            RETURNING green_points;
        `, [
            pointsEarned,
            userId
        ]);

        res.json({
            success: true,
            message: `Report submitted successfully. You earned ${pointsEarned} Green Points!`,
            pointsEarned,
            totalPoints: result.rows[0].green_points
        });

    } catch (error) {
        console.error('Recycling log error:', error);

        res.status(500).json({
            success: false,
            message: 'Something went wrong while submitting your recycling report.'
        });
    }
});

app.get('/api/recycling-history', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                weight,
                location,
                notes,
                points_earned,
                created_at
            FROM recycling_logs
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 5;
        `, [
            req.session.userId
        ]);

        res.json({
            success: true,
            logs: result.rows
        });

    } catch (error) {
        console.error('Recycling history error:', error);

        res.status(500).json({
            success: false,
            message: 'Could not load recycling history.'
        });
    }
});

app.post('/api/change-password', requireAuth, async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body;

        if (!newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in both password fields.'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match.'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query(
            `UPDATE users
             SET password = $1
             WHERE id = $2`,
            [hashedPassword, req.session.userId]
        );

        const userResult = await pool.query(
            'SELECT name FROM users WHERE id = $1',
            [req.session.userId]
        );

        req.session.userName = userResult.rows[0].name;

        res.json({
            success: true,
            message: 'Password updated successfully.'
        });

    } catch (error) {
        console.error('Password update error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to update password.'
        });
    }

});

app.post('/api/waste-report', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const { issueType, location, details, latitude, longitude } = req.body;

        if (!issueType || !location || !details) {
            return res.status(400).json({
                success: false,
                message: 'Please complete all required fields.'
            });
        }

        await pool.query(`
            INSERT INTO waste_reports
                (user_id, issue_type, location, details, latitude, longitude, points_earned)
            VALUES
                ($1, $2, $3, $4, $5, $6, $7);
        `, [
            userId,
            issueType,
            location,
            details,
            latitude || null,
            longitude || null,
            5
        ]);

        const result = await pool.query(`
            UPDATE users
            SET green_points = green_points + 5
            WHERE id = $1
            RETURNING green_points;
        `, [userId]);

        res.json({
            success: true,
            message: 'Waste report submitted successfully. You earned 5 Green Points!',
            pointsEarned: 5,
            totalPoints: result.rows[0].green_points
        });

    } catch (error) {
        console.error('Waste report error:', error);

        res.status(500).json({
            success: false,
            message: 'Something went wrong while submitting your waste report.'
        });
    }
});

app.get('/api/waste-history', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                issue_type,
                location,
                details,
                points_earned,
                created_at
            FROM waste_reports
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 5;
        `, [req.session.userId]);

        res.json({
            success: true,
            reports: result.rows
        });

    } catch (error) {
        console.error('Waste history error:', error);

        res.status(500).json({
            success: false,
            message: 'Could not load waste report history.'
        });
    }
});

app.get('/api/user-overview', requireAuth, async (req, res) => {
    try {

        const reportCount = await pool.query(`
            SELECT COUNT(*) 
            FROM waste_reports
            WHERE user_id = $1
        `, [req.session.userId]);

        const points = await pool.query(`
            SELECT green_points
            FROM users
            WHERE id = $1
        `, [req.session.userId]);

        res.json({
            reports: reportCount.rows[0].count,
            points: points.rows[0].green_points
        });

    } catch (error) {
        console.error('User overview error:', error);

        res.status(500).json({
            success: false,
            message: 'Could not load overview data.'
        });
    }
});

/* ================================================= */
/* DATABASE TEST ROUTE */
/* ================================================= */

app.get('/test-db', async (req, res) => {
    try {
        const timeResult = await pool.query('SELECT NOW();');
        const usersResult = await pool.query('SELECT COUNT(*) FROM users;');

        res.json({
            status: '🟢',
            message: 'Node.js and Docker SQL are connected',
            databaseTime: timeResult.rows[0].now,
            registeredUserCount: parseInt(usersResult.rows[0].count)
        });

    } catch (error) {
        console.error('DB Error:', error);

        res.status(500).json({
            status: '🔴',
            message: 'Failed to connect',
            error: error.message
        });
    }
});

/* ================================================= */
/* SERVER BOOT */
/* ================================================= */

async function startServer() {
    try {
        await initDb();

        app.listen(PORT, () => {
            console.log(`Online at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();