const express = require('express');
const db = require('../database/db');
const bcrypt = require('bcryptjs');
const { sendOTPEmail, sendApprovalEmail } = require('../services/emailService');

// Mock OTP storage (In production, use Redis or DB with expiry)
// We will use the database table 'otp_codes' in this implementation

const router = express.Router();

// Create new applicant (sign up step 1)
router.post('/', async (req, res) => {
    try {
        const {
            passportNumber,
            firstName,
            lastName,
            noFirstName,
            noLastName,
            nationality,
            email,
            phone,
            countryCode,
            passportImagePath,
            password // New field
        } = req.body;

        // Check if applicant exists
        const existing = await db.query('SELECT id FROM applicants WHERE passport_number = $1', [passportNumber]);

        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'Applicant already exists with this passport' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Send OTP Email
        try {
            await sendOTPEmail(email, otpCode);
        } catch (emailError) {
            console.error('Email sending failed:', emailError.message);
            // Continue anyway - OTP is stored in DB
        }

        // Store OTP
        await db.query(
            'INSERT INTO otp_codes (email, code, expiry) VALUES ($1, $2, $3)',
            [email, otpCode, otpExpiry]
        );

        // Insert applicant
        const insertResult = await db.query(`
            INSERT INTO applicants 
            (passport_number, first_name, last_name, no_first_name, no_last_name, nationality, email, phone, country_code, passport_image, password_hash, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id
        `, [
            passportNumber,
            noFirstName ? null : firstName,
            noLastName ? null : lastName,
            noFirstName || false,
            noLastName || false,
            nationality,
            email,
            phone,
            countryCode,
            passportImagePath,
            passwordHash,
            'Pending'
        ]);

        res.status(201).json({
            message: 'Application submitted successfully',
            applicantId: insertResult.rows[0].id
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, code } = req.body;

        const result = await db.query(`
            SELECT * FROM otp_codes 
            WHERE email = $1 AND code = $2 
            AND expiry > NOW()
            ORDER BY created_at DESC
            LIMIT 1
        `, [email, code]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Mark as verified updates
        await db.query(`
            UPDATE applicants 
            SET is_verified = 1 
            WHERE email = $1
        `, [email]);

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;

        // Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP
        await db.query(
            'INSERT INTO otp_codes (email, code, expiry) VALUES ($1, $2, $3)',
            [email, otpCode, otpExpiry]
        );

        // Send OTP Email
        try {
            await sendOTPEmail(email, otpCode);
        } catch (emailError) {
            console.error('Email sending failed:', emailError.message);
        }

        res.json({ message: 'OTP resent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all applicants (admin)
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM applicants ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single applicant
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM applicants WHERE id = $1', [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Applicant not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update applicant status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        await db.query(
            'UPDATE applicants SET status = $1, updated_at = NOW() WHERE id = $2',
            [status, req.params.id]
        );

        res.json({ message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update applicant verification step
router.put('/:id/verification', async (req, res) => {
    try {
        const { verificationCode, verificationStatus } = req.body;

        await db.query(
            'UPDATE applicants SET verification_code = $1, verification_status = $2, updated_at = NOW() WHERE id = $3',
            [verificationCode, verificationStatus, req.params.id]
        );

        res.json({ message: 'Verification updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete applicant
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM applicants WHERE id = $1', [req.params.id]);
        res.json({ message: 'Applicant deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
