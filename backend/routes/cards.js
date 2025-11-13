const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const cards = await pool.query('SELECT * FROM cards');
        res.status(200).json(cards.rows);
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const card = await pool.query('SELECT * FROM cards WHERE id = $1', [id]);
        if (card.rowCount === 0) {
            return res.status(404).send('Card not found');
        }
        res.status(200).json(card.rows[0]);
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, description, listId, dueDate, priority} = req.body;
        const newCard = await pool.query('INSERT INTO cards (title, description, listid, duedate, priority) VALUES($1, $2, $3, $4, $5)', [title, description, listId, dueDate, priority]);
        res.status(200).send('Card created');
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, listId, dueDate, priority, isCompleted } = req.body;
        const updateCard = await pool.query('UPDATE cards SET title = $1, description = $2, listid = $3, duedate = $4, priority = $5, iscompleted = $6 WHERE id = $7', [title, description, listId, dueDate, priority, isCompleted, id]);
        if(updateCard.rowCount === 0) {
            return res.status(404).send('Card not found');
        }
        res.status(200).send('Card updated');
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleteCard = await pool.query('DELETE FROM cards WHERE id = $1', [id]);
        if(deleteCard.rowCount === 0) {
            return res.status(404).send('Card not found');
        }
        res.status(200).send('Card deleted');
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

router.get('/list/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const cards = await pool.query('SELECT * FROM cards WHERE listid = $1', [id]);
        if (cards.rowCount === 0) {
            return res.status(404).send('Cards not found');
        }
        res.status(200).json(cards.rows);
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

module.exports = router;