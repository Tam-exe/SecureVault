const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, getAuditLogs, deleteUser, updateUserStatus } = require('../controllers/adminController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/rbacMiddleware');

// All admin routes require authentication and Admin role
router.use(authenticateToken);
router.use(authorizeRole(['ADMIN']));

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/logs', getAuditLogs);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/status', updateUserStatus);

module.exports = router;
