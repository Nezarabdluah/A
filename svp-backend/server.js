require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const certificatesRoutes = require('./routes/certificates');
const laborResultsRoutes = require('./routes/laborResults');
const supportRoutes = require('./routes/support');
const uploadRoutes = require('./routes/upload');
const usersRoutes = require('./routes/users');
const applicantsRoutes = require('./routes/applicants');

app.use('/api/auth', authRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/labor-results', laborResultsRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/applicants', applicantsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'SVP Backend API is running' });
});

// Setup endpoint (temporary)
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
app.get('/api/setup', async (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({
        connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
        ssl: isProduction ? { rejectUnauthorized: false } : false
    });

    try {
        // Sample admin user (password: admin123)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                role VARCHAR(20) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Check if admin exists
            const existingAdmin = await pool.query("SELECT id FROM users WHERE email = 'admin@svp.com'");
            
            if (existingAdmin.rows.length === 0) {
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash('admin123', salt);
                
                await pool.query(
                    "INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, 'Admin', 'User', 'admin')",
                    ['admin@svp.com', hash]
                );
            } else {
                // Reset password if exists
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash('admin123', salt);
                
                await pool.query(
                    "UPDATE users SET password_hash = $1 WHERE email = 'admin@svp.com'",
                    [hash]
                );
            }
        `);
        res.json({ status: 'OK', message: 'Database seeded with admin user.' });
    } catch (error) {
        res.status(500).json({ status: 'Error', error: error.message });
    } finally {
        await pool.end();
    }
});

// API documentation
app.get('/api', (req, res) => {
    res.json({
        name: 'SVP International Backend API',
        version: '1.0.0',
        endpoints: {
            auth: {
                'POST /api/auth/login': 'User login',
                'POST /api/auth/register': 'User registration',
                'GET /api/auth/me': 'Get current user (requires token)'
            },
            certificates: {
                'GET /api/certificates/verify': 'Verify certificate (public)',
                'GET /api/certificates': 'Get all certificates',
                'GET /api/certificates/:id': 'Get single certificate',
                'POST /api/certificates': 'Create certificate',
                'PUT /api/certificates/:id': 'Update certificate',
                'DELETE /api/certificates/:id': 'Delete certificate'
            },
            laborResults: {
                'GET /api/labor-results/check': 'Check labor result (public)',
                'GET /api/labor-results': 'Get all labor results',
                'GET /api/labor-results/:id': 'Get single labor result',
                'POST /api/labor-results': 'Create labor result',
                'PUT /api/labor-results/:id': 'Update labor result',
                'DELETE /api/labor-results/:id': 'Delete labor result'
            },
            support: {
                'GET /api/support': 'Get all support tickets',
                'GET /api/support/:id': 'Get single ticket',
                'POST /api/support': 'Create support ticket',
                'PUT /api/support/:id': 'Update ticket status',
                'DELETE /api/support/:id': 'Delete ticket'
            },
            upload: {
                'POST /api/upload/passport': 'Upload passport image',
                'POST /api/upload/certificate': 'Upload certificate document',
                'POST /api/upload/document': 'Upload any document',
                'DELETE /api/upload/:filename': 'Delete uploaded file'
            },
            users: {
                'GET /api/users': 'Get all users',
                'GET /api/users/:id': 'Get single user',
                'POST /api/users': 'Create user',
                'PUT /api/users/:id': 'Update user',
                'PUT /api/users/:id/password': 'Update user password',
                'DELETE /api/users/:id': 'Delete user'
            },
            applicants: {
                'GET /api/applicants': 'Get all applicants',
                'GET /api/applicants/:id': 'Get single applicant',
                'POST /api/applicants': 'Create applicant (sign up)',
                'PUT /api/applicants/:id/status': 'Update applicant status',
                'PUT /api/applicants/:id/verification': 'Update verification',
                'DELETE /api/applicants/:id': 'Delete applicant'
            }
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API docs available at http://localhost:${PORT}/api`);
});
