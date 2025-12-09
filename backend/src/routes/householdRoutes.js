const express = require('express');
const router = express.Router();
const householdController = require('../controllers/householdController');

router.get('/', householdController.getHouseholds);
router.get('/:id', householdController.getHouseholdById);
router.post('/', householdController.createHousehold);
router.delete('/:id', householdController.deleteHousehold);
router.post('/split', householdController.splitHousehold);
router.post('/change-head', householdController.changeHeadOfHousehold);

module.exports = router;
