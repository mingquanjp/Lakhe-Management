const express = require("express");
const cors = require("cors");
const pool = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const feeRoutes = require("./routes/feeRoutes"); 
const { verifyToken, requireAdmin } = require("./middleware/authMiddleware");
const householdRoutes = require("./routes/householdRoutes");
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running successfully!");
});

// Test database endpoint
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      success: true,
      message: "Database connected successfully!",
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message
    });
  }
});

// Test route - không cần auth
app.get("/api/test-fees", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM fees");
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Auth routes
app.use("/api/auth", authRoutes);

// Fee & Payment routes ← THÊM DÒNG NÀY
app.use("/api", feeRoutes);

// Example protected route - requires valid JWT token
app.get("/api/test-protected", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Bạn đã truy cập route được bảo vệ thành công!",
    user: req.user
  });
});

// Example admin-only route
app.get("/api/test-admin", verifyToken, requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: "Chào mừng Admin!",
    user: req.user
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
app.use("/api", householdRoutes);