const express = require('express');
const bcrypt = require('bcryptjs');
const { pool, poolConnect, sql } = require('../database/db');

const router = express.Router();

// Get all users (admin only)
router.get('/', async (req, res) => {
    try {
        await poolConnect;
        const result = await pool.request()
            .query('SELECT id, email, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single user
router.get('/:id', async (req, res) => {
    try {
        await poolConnect;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create user (admin)
router.post('/', async (req, res) => {
    try {
        await poolConnect;
        const { email, password, firstName, lastName, role } = req.body;

        // Check if user exists
        const existing = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT id FROM users WHERE email = @email');

        if (existing.recordset.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert user
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .input('password_hash', sql.NVarChar, passwordHash)
            .input('first_name', sql.NVarChar, firstName)
            .input('last_name', sql.NVarChar, lastName)
            .input('role', sql.NVarChar, role || 'user')
            .query('INSERT INTO users (email, password_hash, first_name, last_name, role) OUTPUT INSERTED.id VALUES (@email, @password_hash, @first_name, @last_name, @role)');

        res.status(201).json({ message: 'User created', id: result.recordset[0].id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    try {
        await poolConnect;
        const { email, firstName, lastName, role } = req.body;

        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('email', sql.NVarChar, email)
            .input('first_name', sql.NVarChar, firstName)
            .input('last_name', sql.NVarChar, lastName)
            .input('role', sql.NVarChar, role)
            .query('UPDATE users SET email = @email, first_name = @first_name, last_name = @last_name, role = @role, updated_at = GETDATE() WHERE id = @id');

        res.json({ message: 'User updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user password
router.put('/:id/password', async (req, res) => {
    try {
        await poolConnect;
        const { password } = req.body;

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('password_hash', sql.NVarChar, passwordHash)
            .query('UPDATE users SET password_hash = @password_hash, updated_at = GETDATE() WHERE id = @id');

        res.json({ message: 'Password updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        await poolConnect;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM users WHERE id = @id');
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
