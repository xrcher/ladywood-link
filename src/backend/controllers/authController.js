import bcrypt from 'bcrypt';
import { pool } from '../db.js';

export const authController = {
    getLogin: (req, res) => {
        res.render('login', { error: null });
    },

    postLogin: async (req, res) => {
        const { email, password } = req.body;

        try {
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = result.rows[0];

            if (!user) {return res.render('login', { error: 'Invalid email or password.' });}

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {return res.render('login', { error: 'Invalid email or password.' });}

            req.session.userId = user.id;
            req.session.userName = user.name || "User";

            res.redirect('/dashboard');} catch (error) {console.error(error);
            res.render('login', { error: 'An unexpected database error occurred.' });
        }
    },

    // Clear session
    logout: (req, res) => {
        req.session.destroy(() => {
            res.redirect('/login');
        });
    }
};