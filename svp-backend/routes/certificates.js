const express = require('express');
const { pool, poolConnect, sql } = require('../database/db');

const router = express.Router();

// Verify certificate (public)
router.get('/verify', async (req, res) => {
    try {
        await poolConnect;
        const { passportNumber, certificateSerial } = req.query;

        const result = await pool.request()
            .input('passportNumber', sql.NVarChar, passportNumber)
            .input('certificateSerial', sql.NVarChar, certificateSerial)
            .query('SELECT * FROM certificates WHERE passport_number = @passportNumber AND certificate_serial = @certificateSerial');

        if (result.recordset.length === 0) {
            return res.json({ valid: false, message: 'Certificate not found' });
        }

        const cert = result.recordset[0];
        res.json({
            valid: true,
            status: cert.status,
            data: {
                holderName: cert.holder_name,
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
        await poolConnect;
        const result = await pool.request().query('SELECT * FROM certificates ORDER BY created_at DESC');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single certificate
router.get('/:id', async (req, res) => {
    try {
        await poolConnect;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM certificates WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create certificate
router.post('/', async (req, res) => {
    try {
        await poolConnect;
        const { certificateSerial, passportNumber, holderName, issueDate, expiryDate, status } = req.body;

        const result = await pool.request()
            .input('certificate_serial', sql.NVarChar, certificateSerial)
            .input('passport_number', sql.NVarChar, passportNumber)
            .input('holder_name', sql.NVarChar, holderName)
            .input('issue_date', sql.Date, issueDate)
            .input('expiry_date', sql.Date, expiryDate)
            .input('status', sql.NVarChar, status || 'Valid')
            .query('INSERT INTO certificates (certificate_serial, passport_number, holder_name, issue_date, expiry_date, status) OUTPUT INSERTED.id VALUES (@certificate_serial, @passport_number, @holder_name, @issue_date, @expiry_date, @status)');

        res.status(201).json({ message: 'Certificate created', id: result.recordset[0].id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update certificate
router.put('/:id', async (req, res) => {
    try {
        await poolConnect;
        const { certificateSerial, passportNumber, holderName, issueDate, expiryDate, status } = req.body;

        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('certificate_serial', sql.NVarChar, certificateSerial)
            .input('passport_number', sql.NVarChar, passportNumber)
            .input('holder_name', sql.NVarChar, holderName)
            .input('issue_date', sql.Date, issueDate)
            .input('expiry_date', sql.Date, expiryDate)
            .input('status', sql.NVarChar, status)
            .query('UPDATE certificates SET certificate_serial = @certificate_serial, passport_number = @passport_number, holder_name = @holder_name, issue_date = @issue_date, expiry_date = @expiry_date, status = @status, updated_at = GETDATE() WHERE id = @id');

        res.json({ message: 'Certificate updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete certificate
router.delete('/:id', async (req, res) => {
    try {
        await poolConnect;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM certificates WHERE id = @id');
        res.json({ message: 'Certificate deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
