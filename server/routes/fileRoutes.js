const express = require('express');
const router = express.Router();
const upload = require('../config/uploadConfig');
const { uploadFile, getMyFiles, getAllFiles, downloadFile, shareFile, deleteFile } = require('../controllers/fileController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/rbacMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Upload (MANAGER and ADMIN) - USER cannot upload
router.post('/upload', authorizeRole(['ADMIN', 'MANAGER']), upload.single('file'), uploadFile);

// List My Files (All roles can see their own files or shared files)
router.get('/my-files', getMyFiles);

// Download File
router.get('/download/:id', downloadFile);

// Share File (Owner only)
router.post('/share/:id', shareFile);

// Delete File (Owner or Admin)
router.delete('/:id', deleteFile);

// Admin: List All Files
router.get('/all', authorizeRole(['ADMIN']), getAllFiles);

module.exports = router;
