const express = require('express');
const pool = require('../db');
const router = express.Router();

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
        const { name, description, userId} = req.body;
        const newBoard = await pool.query('INSERT INTO boards (name, description, userid) VALUES($1, $2, $3)', [name, description, userId]);
        res.status(200).send('Board created');
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const updateBoard = await pool.query('UPDATE boards SET name = $1, description = $2 WHERE id = $3', [name, description, id]);
        if(updateBoard.rowCount === 0) {
            return res.status(404).send('Board not found');
        }
        res.status(200).send('Board updated');
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleteBoard = await pool.query('DELETE FROM boards WHERE id = $1', [id]);
        if(deleteBoard.rowCount === 0) {
            return res.status(404).send('Board not found');
        }
        res.status(200).send('Board deleted');
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

router.get('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const board = await pool.query('SELECT * FROM boards WHERE userid = $1', [id]);
        if (board.rowCount === 0) {
            return res.status(404).send('Board not found');
        }
        res.status(200).json(board.rows);
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

module.exports = router;