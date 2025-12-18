const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', authController.login);

// Protected routes (admin only)
router.get('/users', verifyToken, requireAdmin, authController.getAllUsers);
router.post('/users', verifyToken, requireAdmin, authController.createUser);
router.put('/users/:user_id', verifyToken, requireAdmin, authController.updateUser);
router.delete('/users/:user_id', verifyToken, requireAdmin, authController.deleteUser);

module.exports = router;
