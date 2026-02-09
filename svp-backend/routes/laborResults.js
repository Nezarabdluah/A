const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Check labor result (public)
router.get('/check', async (req, res) => {
    try {
        const { passportNumber, occupationKey, nationalityCode } = req.query;

        const result = await db.query(
            'SELECT * FROM labor_results WHERE passport_number = $1 AND occupation_key = $2 AND nationality_code = $3',
            [passportNumber, occupationKey, nationalityCode]
        );

        if (result.rows.length === 0) {
            return res.json({ found: false, message: 'Labor result not found' });
        }

        const data = result.rows[0];
        res.json({
            found: true,
            data: {
                passportNumber: data.passport_number,
                occupationKey: data.occupation_key,
                nationalityCode: data.nationality_code,
                examDate: data.exam_date,
                score: data.score,
                result: data.result
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all labor results (admin)
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM labor_results ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create labor result
router.post('/', async (req, res) => {
    try {
        const { passportNumber, occupationKey, nationalityCode, examDate, score, result } = req.body;

        const insertResult = await db.query(
            'INSERT INTO labor_results (passport_number, occupation_key, nationality_code, exam_date, score, result) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [passportNumber, occupationKey, nationalityCode, examDate, score, result || 'Passed']
        );

        res.status(201).json({ message: 'Labor result created', id: insertResult.rows[0].id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update labor result
router.put('/:id', async (req, res) => {
    try {
        const { passportNumber, occupationKey, nationalityCode, examDate, score, result } = req.body;

        await db.query(
            'UPDATE labor_results SET passport_number = $1, occupation_key = $2, nationality_code = $3, exam_date = $4, score = $5, result = $6, updated_at = NOW() WHERE id = $7',
            [passportNumber, occupationKey, nationalityCode, examDate, score, result, req.params.id]
        );

        res.json({ message: 'Labor result updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete labor result
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM labor_results WHERE id = $1', [req.params.id]);
        res.json({ message: 'Labor result deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
