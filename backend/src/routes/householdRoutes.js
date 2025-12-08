// backend/src/routes/householdRoutes.js

const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const {
  getAllHouseholds,
  getHouseholdById,
  createHousehold,
  updateHousehold,
  deleteHousehold
} = require('../controllers/householdController');
// Tất cả routes đều yêu cầu authentication
router.get('/households', verifyToken, getAllHouseholds);
router.get('/households/:householdId', verifyToken, getHouseholdById);
router.post('/households', verifyToken, requireAdmin, createHousehold);
router.put('/households/:householdId', verifyToken, requireAdmin, updateHousehold);
router.delete('/households/:householdId', verifyToken, requireAdmin, deleteHousehold);
module.exports = router;