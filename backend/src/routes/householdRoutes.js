const express = require('express');
const router = express.Router();
const householdController = require('../controllers/householdController');

router.get('/', householdController.getAllHouseholds);
router.get('/:id', householdController.getHouseholdById);
router.post('/', householdController.createHousehold);
router.post('/split', householdController.splitHousehold);

module.exports = router;
