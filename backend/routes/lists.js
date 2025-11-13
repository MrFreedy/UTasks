const express = require('express');
const pool = require('../db');
const router = express.Router();
const { generateObjectId } = require('../utils');

router.get('/', async (req, res) => {
    try {
        const lists = await pool.query('SELECT * FROM lists');

        return res.status(200).json({
            success: true,
            data: lists.rows
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const list = await pool.query('SELECT * FROM lists WHERE id = $1', [id]);

        if (list.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'List not found' });
        }

        return res.status(200).json({
            success: true,
            data: list.rows[0]
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, boardId } = req.body;
        const id = generateObjectId();
        const newList = await pool.query(
            'INSERT INTO lists (id, name, boardid) VALUES ($1, $2, $3) RETURNING *',
            [id, name, boardId]
        );

        return res.status(200).json({
            success: true,
            data: newList.rows[0],
            message: "List created successfully"
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, boardId } = req.body;

        const updateList = await pool.query(
            'UPDATE lists SET name = $1, boardid = $2 WHERE id = $3 RETURNING *',
            [name, boardId, id]
        );

        if (updateList.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'List not found' });
        }

        return res.status(200).json({
            success: true,
            data: updateList.rows[0],
            message: "List updated successfully"
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deleteList = await pool.query('DELETE FROM lists WHERE id = $1', [id]);

        if (deleteList.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'List not found' });
        }

        return res.status(200).json({
            success: true,
            message: "List deleted successfully"
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/board/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const lists = await pool.query('SELECT * FROM lists WHERE boardid = $1', [id]);

        if (lists.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Lists not found' });
        }

        return res.status(200).json({
            success: true,
            data: lists.rows
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;