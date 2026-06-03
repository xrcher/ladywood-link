import express from 'express';
import path from 'path';
import session from 'express-session';
import {initDb, pool} from './db.js';
import {authController} from './controllers/authController.js';
import {requireAuth} from './middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'super_secure_prototype_string',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 * 60 }
}));

app.use(express.static(path.join(process.cwd(), 'frontend')));
const getHtmlPage = (fileName) => path.join(process.cwd(), 'frontend', 'pages', fileName);

// Auth Views
app.get('/', (req, res) => res.redirect('/login'));
app.get('/login', (req, res) => res.sendFile(getHtmlPage('login.html')));
app.post('/login', authController.postLogin);
app.get('/register', (req, res) => res.sendFile(getHtmlPage('register.html')));
app.post('/register', authController.postRegister);
app.get('/logout', authController.logout);

// ⚠️⚠️⚠️ DEVELOPMENT ONLY - FAKE LOGIN SESSION - REMOVE BEFORE RELEASE ⚠️️️⚠️️️⚠️️️
app.get('/dev-bypass', (req, res) => {
     req.session.userId = 'mock-id';
     req.session.userName = 'Tester';
     res.redirect('/dashboard');
});

// HTML Views
app.get('/dashboard', requireAuth, (req, res) => {res.sendFile(getHtmlPage('dashboard.html'));});
app.get('/profile', requireAuth, (req, res) => {res.sendFile(getHtmlPage('profile.html'));});
app.get('/recycling', requireAuth, (req, res) => {res.sendFile(getHtmlPage('recycling.html'));});
app.get('/bin-collection', requireAuth, (req, res) => {res.sendFile(getHtmlPage('bin-collection.html'));});
app.get('/settings', requireAuth, (req, res) => {res.sendFile(getHtmlPage('settings.html'));});
app.get('/waste-report', requireAuth, (req, res) => {res.sendFile(getHtmlPage('waste-report.html'));});
// app.get('/flood-alerts', requireAuth, (req, res) => res.sendFile(getHtmlPage('flood-alerts.html')));
// app.get('/water-alerts', requireAuth, (req, res) => res.sendFile(getHtmlPage('flood-alerts.html')));

// test-db Check
app.get('/test-db', async (req, res) => {
    try {
        const timeResult = await pool.query('SELECT NOW();');
        const usersResult = await pool.query('SELECT COUNT(*) FROM users;');
        res.json({
            status: "🟢",
            message: "Node.js and Docker SQL are connected",
            databaseTime: timeResult.rows[0].now,
            registeredUserCount: parseInt(usersResult.rows[0].count)
        });
    } catch (error) {
        console.error("DB Error:", error);
        res.status(500).json({
            status: "🔴", message: "Failed to connect", error: error.message
        });
    }
});

// Boot
async function startServer() {
    try {
        await initDb();
        app.listen(PORT, () => {
            console.log(`Online at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();