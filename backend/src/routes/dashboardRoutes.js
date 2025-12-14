const express = require("express");
const router = express.Router();
const { getPopulationStats } = require("../controllers/dashboardController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

// Route to get population dashboard statistics
// Protected route, accessible only by admin
router.get("/population", verifyToken, requireAdmin, getPopulationStats);

module.exports = router;
