const express = require("express");
const cors = require("cors");
const pool = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const financeRoutes = require("./routes/financeRoutes");
const { verifyToken, requireAdmin } = require("./middleware/authMiddleware");
const householdRoutes = require('./routes/householdRoutes');
const residentRoutes = require("./routes/residentRoutes");
const feeRoutes = require('./routes/feeRoutes');


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
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Auth routes
app.use("/api/auth", authRoutes);
// Dashboard routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/finance", financeRoutes);

// Example protected route - requires valid JWT token
app.get("/api/test-protected", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Bạn đã truy cập route được bảo vệ thành công!",
    user: req.user,
  });
});

// Example admin-only route
app.get("/api/test-admin", verifyToken, requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: "Chào mừng Admin!",
    user: req.user,
  });
});

app.use('/api/households', householdRoutes); 
app.use("/api/residents", residentRoutes);
app.use('/api/fees', feeRoutes);


app.listen(5000, () => {
  console.log("Server running on port 5000");
});
