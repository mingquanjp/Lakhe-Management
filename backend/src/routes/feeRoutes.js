const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const {
  createFee,
  getAllFees,
  getFeeById,
  updateFee,
  deleteFee,
  createPayment,
  getUnpaidHouseholds,
  getFeeSummary,
  getHouseholdPaymentHistory,
  getAllHouseholdsForFee // ← THÊM này
} = require('../controllers/feeController');

// Fee routes
router.post('/fees', verifyToken, createFee);
router.get('/fees', verifyToken, getAllFees);
router.get('/fees/:feeId', verifyToken, getFeeById);
router.put('/fees/:feeId', verifyToken, updateFee);
router.delete('/fees/:feeId', verifyToken, deleteFee);
// Payment routes
router.post('/payments', verifyToken, createPayment);
router.get('/fees/:feeId/unpaid-households', verifyToken, getUnpaidHouseholds);
router.get('/fees/:feeId/all-households', verifyToken, getAllHouseholdsForFee); // ← THÊM route mới
router.get('/fees/:feeId/summary', verifyToken, getFeeSummary);
router.get('/payments/household/:householdId', verifyToken, getHouseholdPaymentHistory);
module.exports = router;