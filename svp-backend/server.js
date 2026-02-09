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

// Setup and Debug endpoints removed after successful deployment verification

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
