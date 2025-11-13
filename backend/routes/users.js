const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const router = express.Router();
const { generateObjectId } = require('../utils');

router.get('/', async (req, res) => {
    try {
        const users = await pool.query('SELECT * FROM users');
        res.status(200).json(users.rows);
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (user.rowCount === 0) {
            return res.status(404).send('User not found');
        }
        res.status(200).json(user.rows[0]);
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

router.post('/', async (req, res) => {
    try {
        const { username, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const id = generateObjectId();
        const newUser = await pool.query('INSERT INTO users (id, username, password) VALUES($1, $2, $3)', [id, username, hashedPassword]);
        res.status(200).send('User created');
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const updateUser = await pool.query('UPDATE users SET username = $1, password = $2 WHERE id = $3', [username, hashedPassword, id]);
        if(updateUser.rowCount === 0) {
            return res.status(404).send('User not found');
        }
        res.status(200).send('User updated');
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleteUser = await pool.query('DELETE FROM users WHERE id = $1', [id]);
        if(deleteUser.rowCount === 0) {
            return res.status(404).send('User not found');
        }
        res.status(200).send('User deleted');
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (user.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        const safeUser = {
            id: user.rows[0].id,
            username: user.rows[0].username,
            created_at: user.rows[0].created_at
        };

        return res.status(200).json({
            message: 'User connected',
            user: safeUser
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;