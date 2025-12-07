const express = require('express');
const router = express.Router();
const householdController = require('../controllers/householdController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
// Định nghĩa route: GET /api/households
router.get('/', householdController.getHouseholds);

module.exports = router;