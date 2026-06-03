import { pool } from '../db.js';
import bcrypt from 'bcrypt';

export const authController = {
    postRegister: async (req, res) => {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).send("Form is missing required fields.");
        }

        try {
            const cleanEmail = email.toLowerCase().trim();
            const hashedPassword = await bcrypt.hash(password, 10);
            const query = `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name;`;
            const result = await pool.query(query, [name, cleanEmail, hashedPassword]);
            const newUser = result.rows[0];
            req.session.userId = newUser.id;
            req.session.userName = newUser.name;

            res.redirect('/dashboard');
        } catch (error) {
            if (error.code === '23505') {
                return res.status(400).send("Email address is already registered. <a href='/register'>Try registering again</a> or <a href='/login'>Login here</a>.");
            }
            console.error("Registration Error:", error);
            res.status(500).send("Mapping anomaly occurred during execution.");
        }
    },


    postLogin: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send("Email processing handles and security keys must be passed.");
        }

        try {
            const cleanEmail = email.toLowerCase().trim();
            const query = `SELECT * FROM users WHERE email = $1;`;
            const result = await pool.query(query, [cleanEmail]);

            if (result.rows.length === 0) {
                return res.status(401).send("Invalid login details. <a href='/login'>Click here to try again</a>");
            }

            const user = result.rows[0];

            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                return res.status(401).send("Invalid login details. <a href='/login'>Click here to try again</a>");
            }

            req.session.userId = user.id;
            req.session.userName = user.name;
            res.redirect('/dashboard');
        } catch (error) {
            console.error("Login Error:", error);
            res.status(500).send("Mapping anomaly occurred during execution.");
        }
    },

    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) console.error("Session Deletion Exception:", err);
            res.clearCookie('connect.sid');
            res.redirect('/login');
        });
    }
};