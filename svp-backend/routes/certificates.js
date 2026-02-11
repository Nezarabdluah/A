const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Verify certificate (public)
router.get('/verify', async (req, res) => {
    try {
        const { passportNumber, certificateSerial } = req.query;

        const result = await db.query(
            'SELECT * FROM certificates WHERE passport_number = $1 AND certificate_serial = $2',
            [passportNumber, certificateSerial]
        );

        if (result.rows.length === 0) {
            return res.json({ valid: false, message: 'Certificate not found' });
        }

        const cert = result.rows[0];
        res.json({
            valid: true,
            status: cert.status,
            data: {
                holderName: cert.holder_name,
                occupation: cert.occupation,
                certificateSerial: cert.certificate_serial,
                passportNumber: cert.passport_number,
                issueDate: cert.issue_date,
                expiryDate: cert.expiry_date
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all certificates (admin)
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM certificates ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single certificate
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM certificates WHERE id = $1', [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create certificate
router.post('/', async (req, res) => {
    try {
        const { certificateSerial, passportNumber, holderName, occupation, issueDate, expiryDate, status } = req.body;

        const result = await db.query(
            'INSERT INTO certificates (certificate_serial, passport_number, holder_name, occupation, issue_date, expiry_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [certificateSerial, passportNumber, holderName, occupation, issueDate, expiryDate, status || 'Valid']
        );

        res.status(201).json({ message: 'Certificate created', id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update certificate
router.put('/:id', async (req, res) => {
    try {
        const { certificateSerial, passportNumber, holderName, occupation, issueDate, expiryDate, status } = req.body;

        await db.query(
            'UPDATE certificates SET certificate_serial = $1, passport_number = $2, holder_name = $3, occupation = $4, issue_date = $5, expiry_date = $6, status = $7, updated_at = NOW() WHERE id = $8',
            [certificateSerial, passportNumber, holderName, occupation, issueDate, expiryDate, status, req.params.id]
        );

        res.json({ message: 'Certificate updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete certificate
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM certificates WHERE id = $1', [req.params.id]);
        res.json({ message: 'Certificate deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
