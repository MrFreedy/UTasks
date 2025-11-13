const express = require('express');
const pool = require('../db');
const { generateObjectId } = require('../utils');
const router = express.Router();

// GET - Tous les messages (ordre chronologique)
router.get('/', async (req, res) => {
    try {
        const messages = await pool.query(
            'SELECT * FROM messages ORDER BY createdAt ASC'
        );
        res.status(200).json({
            success: true,
            data: messages.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - Créer un message
router.post('/', async (req, res) => {
    try {
        const { userId, username, content } = req.body;
        const id = generateObjectId();
        const createdAt = new Date();

        await pool.query(
            'INSERT INTO messages (id, userId, username, content, createdAt) VALUES ($1, $2, $3, $4, $5)',
            [id, userId, username, content, createdAt]
        );

        res.status(200).json({
            success: true,
            data: { id, userId, username, content, createdAt }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;