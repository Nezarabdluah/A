const express = require('express');
const { pool, poolConnect, sql } = require('../database/db');

const router = express.Router();

// Check labor result (public)
router.get('/check', async (req, res) => {
    try {
        await poolConnect;
        const { passportNumber, occupationKey, nationalityCode } = req.query;

        const result = await pool.request()
            .input('passportNumber', sql.NVarChar, passportNumber)
            .input('occupationKey', sql.NVarChar, occupationKey)
            .input('nationalityCode', sql.NVarChar, nationalityCode)
            .query('SELECT * FROM labor_results WHERE passport_number = @passportNumber AND occupation_key = @occupationKey AND nationality_code = @nationalityCode');

        if (result.recordset.length === 0) {
            return res.json({ found: false, message: 'Labor result not found' });
        }

        const data = result.recordset[0];
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
        await poolConnect;
        const result = await pool.request().query('SELECT * FROM labor_results ORDER BY created_at DESC');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create labor result
router.post('/', async (req, res) => {
    try {
        await poolConnect;
        const { passportNumber, occupationKey, nationalityCode, examDate, score, result } = req.body;

        const insertResult = await pool.request()
            .input('passport_number', sql.NVarChar, passportNumber)
            .input('occupation_key', sql.NVarChar, occupationKey)
            .input('nationality_code', sql.NVarChar, nationalityCode)
            .input('exam_date', sql.Date, examDate)
            .input('score', sql.Int, score)
            .input('result', sql.NVarChar, result || 'Passed')
            .query('INSERT INTO labor_results (passport_number, occupation_key, nationality_code, exam_date, score, result) OUTPUT INSERTED.id VALUES (@passport_number, @occupation_key, @nationality_code, @exam_date, @score, @result)');

        res.status(201).json({ message: 'Labor result created', id: insertResult.recordset[0].id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update labor result
router.put('/:id', async (req, res) => {
    try {
        await poolConnect;
        const { passportNumber, occupationKey, nationalityCode, examDate, score, result } = req.body;

        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('passport_number', sql.NVarChar, passportNumber)
            .input('occupation_key', sql.NVarChar, occupationKey)
            .input('nationality_code', sql.NVarChar, nationalityCode)
            .input('exam_date', sql.Date, examDate)
            .input('score', sql.Int, score)
            .input('result', sql.NVarChar, result)
            .query('UPDATE labor_results SET passport_number = @passport_number, occupation_key = @occupation_key, nationality_code = @nationality_code, exam_date = @exam_date, score = @score, result = @result, updated_at = GETDATE() WHERE id = @id');

        res.json({ message: 'Labor result updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete labor result
router.delete('/:id', async (req, res) => {
    try {
        await poolConnect;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM labor_results WHERE id = @id');
        res.json({ message: 'Labor result deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
