const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/db');

const router = express.Router();

// Get all users (admin only)
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT id, email, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single user
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = $1',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create user (admin)
router.post('/', async (req, res) => {
    try {
        const { email, password, firstName, lastName, role } = req.body;

        // Check if user exists
        const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);

        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert user
        const result = await db.query(
            'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [email, passwordHash, firstName, lastName, role || 'user']
        );

        res.status(201).json({ message: 'User created', id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    try {
        const { email, firstName, lastName, role } = req.body;

        await db.query(
            'UPDATE users SET email = $1, first_name = $2, last_name = $3, role = $4, updated_at = NOW() WHERE id = $5',
            [email, firstName, lastName, role, req.params.id]
        );

        res.json({ message: 'User updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user password
router.put('/:id/password', async (req, res) => {
    try {
        const { password } = req.body;

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await db.query(
            'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
            [passwordHash, req.params.id]
        );

        res.json({ message: 'Password updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
