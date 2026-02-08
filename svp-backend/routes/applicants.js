const express = require('express');
const { pool, poolConnect, sql } = require('../database/db');
const bcrypt = require('bcryptjs');
const { sendOTPEmail, sendApprovalEmail } = require('../services/emailService');

// Mock OTP storage (In production, use Redis or DB with expiry)
// We will use the database table 'otp_codes' in this implementation


const router = express.Router();

// Create new applicant (sign up step 1)
router.post('/', async (req, res) => {
    try {
        await poolConnect;
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
        const existing = await pool.request()
            .input('passportNumber', sql.NVarChar, passportNumber)
            .query('SELECT id FROM applicants WHERE passport_number = @passportNumber');

        if (existing.recordset.length > 0) {
            return res.status(400).json({ message: 'Applicant already exists with this passport' });
        }

        // Insert applicant
        const result = await pool.request()
            .input('passport_number', sql.NVarChar, passportNumber)
            .input('first_name', sql.NVarChar, noFirstName ? null : firstName)
            .input('last_name', sql.NVarChar, noLastName ? null : lastName)
            .input('no_first_name', sql.Bit, noFirstName || false)
            .input('no_last_name', sql.Bit, noLastName || false)
            .input('nationality', sql.NVarChar, nationality)
            .input('email', sql.NVarChar, email)
            .input('phone', sql.NVarChar, phone)
            .input('country_code', sql.NVarChar, countryCode)
            .input('passport_image', sql.NVarChar, passportImagePath)
            .input('status', sql.NVarChar, 'Pending')
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
        await pool.request()
            .input('email', sql.NVarChar, email)
            .input('code', sql.NVarChar, otpCode)
            .input('expiry', sql.DateTime, otpExpiry)
            .query('INSERT INTO otp_codes (email, code, expiry) VALUES (@email, @code, @expiry)');

        // Insert applicant
        const insertResult = await pool.request()
            .input('passport_number', sql.NVarChar, passportNumber)
            .input('first_name', sql.NVarChar, noFirstName ? null : firstName)
            .input('last_name', sql.NVarChar, noLastName ? null : lastName)
            .input('no_first_name', sql.Bit, noFirstName || false)
            .input('no_last_name', sql.Bit, noLastName || false)
            .input('nationality', sql.NVarChar, nationality)
            .input('email', sql.NVarChar, email)
            .input('phone', sql.NVarChar, phone)
            .input('country_code', sql.NVarChar, countryCode)
            .input('passport_image', sql.NVarChar, passportImagePath)
            .input('password_hash', sql.NVarChar, passwordHash)
            .input('status', sql.NVarChar, 'Pending')
            .query(`
                INSERT INTO applicants 
                (passport_number, first_name, last_name, no_first_name, no_last_name, nationality, email, phone, country_code, passport_image, password_hash, status) 
                OUTPUT INSERTED.id 
                VALUES (@passport_number, @first_name, @last_name, @no_first_name, @no_last_name, @nationality, @email, @phone, @country_code, @passport_image, @password_hash, @status)
            `);


        res.status(201).json({
            message: 'Application submitted successfully',
            applicantId: insertResult.recordset[0].id
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        await poolConnect;
        const { email, code } = req.body;

        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .input('code', sql.NVarChar, code)
            .query(`
                SELECT TOP 1 * FROM otp_codes 
                WHERE email = @email AND code = @code 
                AND expiry > SYSUTCDATETIME()
                ORDER BY created_at DESC
            `);

        if (result.recordset.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Mark as verified updates
        await pool.request()
            .input('email', sql.NVarChar, email)
            .query(`
                UPDATE applicants 
                SET is_verified = 1 
                WHERE email = @email
            `);

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
    try {
        await poolConnect;
        const { email } = req.body;

        // Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP
        await pool.request()
            .input('email', sql.NVarChar, email)
            .input('code', sql.NVarChar, otpCode)
            .input('expiry', sql.DateTime, otpExpiry)
            .query('INSERT INTO otp_codes (email, code, expiry) VALUES (@email, @code, @expiry)');

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
        await poolConnect;
        const result = await pool.request()
            .query('SELECT * FROM applicants ORDER BY created_at DESC');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single applicant
router.get('/:id', async (req, res) => {
    try {
        await poolConnect;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM applicants WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Applicant not found' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update applicant status
router.put('/:id/status', async (req, res) => {
    try {
        await poolConnect;
        const { status } = req.body;

        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('status', sql.NVarChar, status)
            .query('UPDATE applicants SET status = @status, updated_at = GETDATE() WHERE id = @id');

        res.json({ message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update applicant verification step
router.put('/:id/verification', async (req, res) => {
    try {
        await poolConnect;
        const { verificationCode, verificationStatus } = req.body;

        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('verification_code', sql.NVarChar, verificationCode)
            .input('verification_status', sql.NVarChar, verificationStatus)
            .query('UPDATE applicants SET verification_code = @verification_code, verification_status = @verification_status, updated_at = GETDATE() WHERE id = @id');

        res.json({ message: 'Verification updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete applicant
router.delete('/:id', async (req, res) => {
    try {
        await poolConnect;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM applicants WHERE id = @id');
        res.json({ message: 'Applicant deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
