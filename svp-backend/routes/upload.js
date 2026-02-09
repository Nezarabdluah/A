const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'svp-uploads',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
        resource_type: 'auto', // Allow diverse file types
    },
});

const upload = multer({ storage: storage });

// Upload passport
router.post('/passport', upload.single('passport'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        res.json({
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                path: `/uploads/${req.file.filename}`
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

// Upload certificate document
router.post('/certificate', upload.single('certificate'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        res.json({
            message: 'Certificate uploaded successfully',
            file: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                path: `/uploads/${req.file.filename}`
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

// Upload any document
router.post('/document', upload.single('document'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        res.json({
            message: 'Document uploaded successfully',
            file: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                path: `/uploads/${req.file.filename}`
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

// Delete uploaded file
router.delete('/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(uploadsDir, filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ message: 'File deleted successfully' });
        } else {
            res.status(404).json({ message: 'File not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Delete failed', error: error.message });
    }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File size exceeds 3MB limit' });
        }
        return res.status(400).json({ message: error.message });
    }
    if (error) {
        return res.status(400).json({ message: error.message });
    }
    next();
});

module.exports = router;
