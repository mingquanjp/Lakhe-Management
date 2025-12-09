const express = require("express");
const router = express.Router();
const {
  getFees,
  getFinanceStats,
} = require("../controllers/financeController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

// Get list of fees (dropdown)
router.get("/fees", verifyToken, requireAdmin, getFees);

// Get stats for a specific fee
router.get("/stats", verifyToken, requireAdmin, getFinanceStats);

module.exports = router;
