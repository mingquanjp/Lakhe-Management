const express = require("express");
const cors = require("cors");
const pool = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const feeRoutes = require("./routes/feeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const financeRoutes = require("./routes/financeRoutes");
const householdRoutes = require('./routes/householdRoutes');
const residentRoutes = require("./routes/residentRoutes");
const overviewRoutes = require("./routes/overviewRoutes");
const historyRoutes = require("./routes/historyRoutes");

const app = express();
// Middleware
app.use(cors());
app.use(express.json());
// Root endpoint
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

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/finance", financeRoutes);
app.use('/api/households', householdRoutes);
app.use("/api/residents", residentRoutes);
app.use("/api/overview", overviewRoutes);
app.use("/api/history", historyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});