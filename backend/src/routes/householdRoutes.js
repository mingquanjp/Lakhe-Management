// backend/src/routes/householdRoutes.js
const express = require('express');
const router = express.Router();
const householdController = require('../controllers/householdController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', householdController.getHouseholds);
router.post('/', householdController.createHousehold);
router.post('/split', householdController.splitHousehold);
router.post('/change-head', householdController.changeHead);

// Specific routes MUST come before /:id
router.get('/temporary', householdController.getTemporaryHouseholds);
router.post('/temporary', householdController.createTemporaryHousehold);
router.get('/temporary/:id', householdController.getTemporaryHouseholdById);

router.get('/:id', householdController.getHouseholdById);
router.delete('/:id', householdController.deleteHousehold);
router.post('/split', householdController.splitHousehold);
router.post('/change-head', householdController.changeHeadOfHousehold);

module.exports = router;
