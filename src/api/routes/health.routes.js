const express = require('express');
const router = express.Router();
const db = require('../../db/connection');

router.get('/', async (req, res) => {
    try {
        // Check DB connection
        const tables = await db.query(`
            SELECT name FROM sqlite_master 
            WHERE type='table' 
            ORDER BY name;
        `);
        
        // Get cart_items structure
        const cartStructure = await db.query(`
            PRAGMA table_info(cart_items);
        `);

        res.json({
            status: 'healthy',
            database: 'connected',
            tables: tables,
            cartStructure: cartStructure,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

module.exports = router;
