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
router.get('/fees/overall-statistics', verifyToken, getOverallStatistics);
router.get('/fees/all-households', verifyToken, getAllHouseholdsWithPaymentSummary);

// Fee CRUD routes
router.post('/fees', verifyToken, createFee);
router.get('/fees', verifyToken, getAllFees);
router.get('/fees/:feeId', verifyToken, getFeeById);
router.put('/fees/:feeId', verifyToken, updateFee);
router.delete('/fees/:feeId', verifyToken, deleteFee);

// Fee statistics & household routes
router.get('/fees/:feeId/statistics', verifyToken, getFeeStatistics);
router.get('/fees/:feeId/summary', verifyToken, getFeeSummary);
router.get('/fees/:feeId/households', verifyToken, getHouseholdPaymentStatus);
router.get('/fees/:feeId/unpaid-households', verifyToken, getUnpaidHouseholds);
router.get('/fees/:feeId/all-households', verifyToken, getAllHouseholdsForFee);

// Household payment & resident routes
router.get('/fees/households/:id/payments', verifyToken, getHouseholdPaymentHistory);
router.get('/fees/households/:id/residents', verifyToken, getHouseholdResidents);

// Payment routes
router.post('/payments', verifyToken, createPayment);
router.get('/payments/household/:householdId', verifyToken, getHouseholdPaymentHistory);

module.exports = router;
