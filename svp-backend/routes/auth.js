const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

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
            'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id',
            [email, passwordHash, firstName, lastName]
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Get current user
router.get('/me', verifyToken, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
