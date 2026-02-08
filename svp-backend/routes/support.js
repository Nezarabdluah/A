const express = require('express');
const { pool, poolConnect, sql } = require('../database/db');

const router = express.Router();

// Submit support ticket (public)
router.post('/', async (req, res) => {
    try {
        await poolConnect;
        const { name, email, subject, description } = req.body;

        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('email', sql.NVarChar, email)
            .input('subject', sql.NVarChar, subject)
            .input('description', sql.NVarChar, description)
            .query('INSERT INTO support_tickets (name, email, subject, description) OUTPUT INSERTED.id VALUES (@name, @email, @subject, @description)');

        res.status(201).json({ message: 'Ticket submitted successfully', ticketId: result.recordset[0].id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all tickets (admin)
router.get('/', async (req, res) => {
    try {
        await poolConnect;
        const result = await pool.request().query('SELECT * FROM support_tickets ORDER BY created_at DESC');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single ticket
router.get('/:id', async (req, res) => {
    try {
        await poolConnect;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM support_tickets WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update ticket status
router.put('/:id', async (req, res) => {
    try {
        await poolConnect;
        const { status } = req.body;

        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('status', sql.NVarChar, status)
            .query('UPDATE support_tickets SET status = @status, updated_at = GETDATE() WHERE id = @id');
        res.json({ message: 'Ticket updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete ticket
router.delete('/:id', async (req, res) => {
    try {
        await poolConnect;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM support_tickets WHERE id = @id');
        res.json({ message: 'Ticket deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
