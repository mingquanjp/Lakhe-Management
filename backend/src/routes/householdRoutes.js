const express = require('express');
const router = express.Router();
const householdController = require('../controllers/householdController');

router.get('/', householdController.getHouseholds);
router.post('/', householdController.createHousehold);
router.delete('/:id', householdController.deleteHousehold);
router.post('/split', householdController.splitHousehold);
module.exports = router;