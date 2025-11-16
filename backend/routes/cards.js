const express = require('express');
const pool = require('../db');
const router = express.Router();
const { generateObjectId } = require('../utils');

router.get('/', async (req, res) => {
    try {
        const cards = await pool.query('SELECT * FROM cards');

        return res.status(200).json({
            success: true,
            data: cards.rows
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const card = await pool.query('SELECT * FROM cards WHERE id = $1', [id]);

        if (card.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Card not found' });
        }

        return res.status(200).json({
            success: true,
            data: card.rows[0]
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, description, listId, dueDate, priority } = req.body;
        const id = generateObjectId();
        const newCard = await pool.query(
            'INSERT INTO cards (id, title, description, listid, duedate, priority) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id, title, description, listId, dueDate, priority]
        );

        return res.status(200).json({
            success: true,
            data: newCard.rows[0],
            message: "Card created successfully"
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Charger la carte pour éviter de perdre des données
        const existing = await pool.query('SELECT * FROM cards WHERE id = $1', [id]);
        if (existing.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Card not found' });
        }

        const old = existing.rows[0];

        // Correction dueDate
        let dueDate = req.body.dueDate;

        // Si dueDate est vide / undefined → garder l'ancienne valeur
        if (!dueDate || dueDate.trim() === "") {
            dueDate = old.duedate;
        }

        const {
            title = old.title,
            description = old.description,
            listId = old.listid,
            priority = old.priority,
            isCompleted = old.iscompleted
        } = req.body;

        const updated = await pool.query(
            `UPDATE cards
             SET title = $1, description = $2, listid = $3, duedate = $4,
                 priority = $5, iscompleted = $6
             WHERE id = $7
             RETURNING *`,
            [title, description, listId, dueDate, priority, isCompleted, id]
        );

        return res.status(200).json({
            success: true,
            data: updated.rows[0],
            message: "Card updated successfully"
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deleteCard = await pool.query('DELETE FROM cards WHERE id = $1', [id]);

        if (deleteCard.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Card not found' });
        }

        return res.status(200).json({
            success: true,
            message: "Card deleted successfully"
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/list/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const cards = await pool.query('SELECT * FROM cards WHERE listid = $1', [id]);

        if (cards.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Cards not found' });
        }

        return res.status(200).json({
            success: true,
            data: cards.rows
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;