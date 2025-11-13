const express = require('express');
const pool = require('../db');
const router = express.Router();
const { generateObjectId } = require('../utils');

router.get('/', async (req, res) => {
    try {
        const boards = await pool.query('SELECT * FROM boards');
        res.status(200).json(boards.rows);
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const board = await pool.query('SELECT * FROM boards WHERE id = $1', [id]);
        if (board.rowCount === 0) {
            return res.status(404).send('Board not found');
        }
        res.status(200).json(board.rows[0]);
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, description, userId } = req.body;
        const id = generateObjectId();
        const newBoard = await pool.query(
            'INSERT INTO boards (id, name, description, userid) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, name, description, userId]
        );

        const board = newBoard.rows[0];

        return res.status(200).json({
            success: true,
            data: {
                id: board.id,
                name: board.name,
                description: board.description,
                userId: board.userid
            },
            message: "Board created successfully"
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const updateBoard = await pool.query(
            'UPDATE boards SET name = $1, description = $2 WHERE id = $3 RETURNING *',
            [name, description, id]
        );

        if (updateBoard.rowCount === 0) {
            return res.status(404).json({ error: 'Board not found' });
        }

        const board = updateBoard.rows[0];

        return res.status(200).json({
            success: true,
            data: {
                id: board.id,
                name: board.name,
                description: board.description,
                userId: board.userid
            },
            message: "Board updated successfully"
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deleteBoard = await pool.query(
            'DELETE FROM boards WHERE id = $1',
            [id]
        );

        if (deleteBoard.rowCount === 0) {
            return res.status(404).json({ error: 'Board not found' });
        }

        return res.status(200).json({
            success: true,
            message: "Board deleted successfully"
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.get('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const boards = await pool.query(
            'SELECT * FROM boards WHERE userid = $1',
            [id]
        );

        if (boards.rowCount === 0) {
            return res.status(404).json({ error: 'Board not found' });
        }

        const formattedBoards = boards.rows.map(board => ({
            id: board.id,
            name: board.name,
            description: board.description,
            userId: board.userid
        }));

        return res.status(200).json({
            success: true,
            data: formattedBoards
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;