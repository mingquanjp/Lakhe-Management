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
  getAllHouseholdsForFee,
  getFeeStatistics,
  getHouseholdPaymentStatus,
  getHouseholdResidents,
  getOverallStatistics,
  getAllHouseholdsWithPaymentSummary
} = require('../controllers/feeController');

// Overall statistics (phải đặt trước các routes có params)
router.get('/overall-statistics', verifyToken, getOverallStatistics);
router.get('/all-households', verifyToken, getAllHouseholdsWithPaymentSummary);
// Fee CRUD routes
router.post('/', verifyToken, createFee);
router.get('/', verifyToken, getAllFees);
router.get('/:feeId', verifyToken, getFeeById);
router.put('/:feeId', verifyToken, updateFee);
router.delete('/:feeId', verifyToken, deleteFee);
// Fee statistics & household routes
router.get('/:feeId/statistics', verifyToken, getFeeStatistics);
router.get('/:feeId/summary', verifyToken, getFeeSummary);
router.get('/:feeId/households', verifyToken, getHouseholdPaymentStatus);
router.get('/:feeId/unpaid-households', verifyToken, getUnpaidHouseholds);
router.get('/:feeId/all-households', verifyToken, getAllHouseholdsForFee);
// Household payment & resident routes
router.get('/households/:id/payments', verifyToken, getHouseholdPaymentHistory);
router.get('/households/:id/residents', verifyToken, getHouseholdResidents);
// Payment routes
router.post('/payments', verifyToken, createPayment);
router.get('/payments/household/:householdId', verifyToken, getHouseholdPaymentHistory);

module.exports = router;
