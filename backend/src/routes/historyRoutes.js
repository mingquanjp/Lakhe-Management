const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

router.get('/households', historyController.getHouseholdsWithHistory);
router.get('/household/:householdId', historyController.getHouseholdHistory);

module.exports = router;
