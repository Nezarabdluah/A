const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Submit support ticket (public)
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, description } = req.body;

        const result = await db.query(
            'INSERT INTO support_tickets (name, email, subject, description) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, email, subject, description]
        );

        res.status(201).json({ message: 'Ticket submitted successfully', ticketId: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all tickets (admin)
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM support_tickets ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single ticket
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM support_tickets WHERE id = $1', [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update ticket status
router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;

        await db.query(
            'UPDATE support_tickets SET status = $1, updated_at = NOW() WHERE id = $2',
            [status, req.params.id]
        );
        res.json({ message: 'Ticket updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete ticket
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM support_tickets WHERE id = $1', [req.params.id]);
        res.json({ message: 'Ticket deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
