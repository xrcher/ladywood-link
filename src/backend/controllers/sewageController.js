import { pool } from '../db.js';

export const sewageController = {
    getAlerts: async (req, res) => {
        try {
            const query = `
                SELECT * FROM sewage_alerts 
                ORDER BY is_active_alert DESC, duration_hours DESC;
            `;
            const result = await pool.query(query);
            return res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error fetching data:', error);
            return res.status(500).json({ success: false, message: 'Failed to retrieve dta' });
        }
    }
};