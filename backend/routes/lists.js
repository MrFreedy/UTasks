const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const lists = await pool.query('SELECT * FROM lists');
        res.status(200).json(lists.rows);
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const list = await pool.query('SELECT * FROM lists WHERE id = $1', [id]);
        if (list.rowCount === 0) {
            return res.status(404).send('List not found');
        }
        res.status(200).json(list.rows[0]);
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, boardId} = req.body;
        const newList = await pool.query('INSERT INTO lists (name, boardid) VALUES($1, $2)', [name, boardId]);
        res.status(200).send('List created');
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, boardId } = req.body;
        const updateList = await pool.query('UPDATE lists SET name = $1, boardid = $2 WHERE id = $3', [name, boardId, id]);
        if(updateList.rowCount === 0) {
            return res.status(404).send('List not found');
        }
        res.status(200).send('List updated');
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleteList = await pool.query('DELETE FROM lists WHERE id = $1', [id]);
        if(deleteList.rowCount === 0) {
            return res.status(404).send('List not found');
        }
        res.status(200).send('List deleted');
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

router.get('/board/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const list = await pool.query('SELECT * FROM lists WHERE boardid = $1', [id]);
        if (list.rowCount === 0) {
            return res.status(404).send('List not found');
        }
        res.status(200).json(list.rows);
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

module.exports = router;