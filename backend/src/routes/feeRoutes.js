const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');

// Fee routes
router.get('/', feeController.getAllFees);
router.post('/', feeController.createFee);
router.get('/overall-statistics', feeController.getOverallStatistics);
router.get('/all-households', feeController.getAllHouseholdsWithPaymentSummary);
router.delete('/:id', feeController.deleteFee);
router.get('/:id/statistics', feeController.getFeeStatistics);
router.get('/:id/households', feeController.getHouseholdPaymentStatus);

// Household payment routes
router.get('/households/:id/payments', feeController.getHouseholdPaymentHistory);
router.get('/households/:id/residents', feeController.getHouseholdResidents);

// Payment routes
router.post('/payments', feeController.createPayment);

module.exports = router;
