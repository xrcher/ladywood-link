import { pool } from '../db.js';
import bcrypt from 'bcrypt';

export const authController = {
    postRegister: async (req, res) => {
        const { nationalInsurance, name, email, password } = req.body;

        if (!nationalInsurance || !name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Form is missing required fields.' });
        }

        try {
            const cleanEmail = email.toLowerCase().trim();
            const cleanNationalInsurance = nationalInsurance
                .toUpperCase()
                .replace(/\s+/g, '')
                .trim();

            /* ================================================= */
            /* CHECK RESIDENT ELIGIBILITY */
            /* ================================================= */
            const residentCheck = await pool.query(
                `
                    SELECT *
                    FROM approved_residents
                    WHERE national_insurance = $1
                      AND area = $2;
                `,
                [cleanNationalInsurance, 'Ladywood']
            );

            if (residentCheck.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Your National Insurance number is not recognized as a registered Ladywood resident."
                });
            }

            /* ================================================= */
            /* CREATE USER */
            /* ================================================= */
            const hashedPassword = await bcrypt.hash(password, 10);

            const query = `
                INSERT INTO users
                    (national_insurance, name, email, password)
                VALUES
                    ($1, $2, $3, $4)
                    RETURNING id, name;
            `;

            const result = await pool.query(query, [
                cleanNationalInsurance,
                name,
                cleanEmail,
                hashedPassword
            ]);

            const newUser = result.rows[0];

            req.session.userId = newUser.id;
            req.session.userName = newUser.name;
            
            return res.status(200).json({ success: true, redirect: '/dashboard' });

        } catch (error) {
            if (error.code === '23505') {
                return res.status(400).json({
                    success: false,
                    message: "This email address or National Insurance number is already registered."
                });
            }

            console.error('Registration Error:', error);
            return res.status(500).json({ success: false, message: 'A secure mapping anomaly occurred.' });
        }
    },

    postLogin: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        try {
            const cleanEmail = email.toLowerCase().trim();

            const result = await pool.query(
                'SELECT * FROM users WHERE email = $1;',
                [cleanEmail]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ success: false, message: 'Invalid email or password combination.' });
            }

            const user = result.rows[0];
            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                return res.status(401).json({ success: false, message: 'Invalid email or password combination.' });
            }

            req.session.userId = user.id;
            req.session.userName = user.name;

            return res.status(200).json({ success: true, redirect: '/dashboard' });

        } catch (error) {
            console.error('Login Error:', error);
            return res.status(500).json({ success: false, message: 'A secure mapping anomaly occurred.' });
        }
    },

    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Session Deletion Exception:', err);
            }
            res.clearCookie('connect.sid');
            res.redirect('/login');
        });
    }
};