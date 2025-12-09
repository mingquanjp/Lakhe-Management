const pool = require("../config/database");

// Get list of all fees for the dropdown
const getFees = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT fee_id, fee_name, fee_type, amount, start_date, end_date FROM fees ORDER BY start_date DESC"
    );
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching fees:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách khoản thu",
      error: error.message,
    });
  }
};

// Get statistics for a specific fee
const getFinanceStats = async (req, res) => {
  try {
    const { feeId } = req.query;

    if (!feeId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp feeId",
      });
    }

    // 1. Get Fee Details
    const feeQuery = await pool.query("SELECT * FROM fees WHERE fee_id = $1", [
      feeId,
    ]);
    if (feeQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khoản thu",
      });
    }
    const fee = feeQuery.rows[0];

    // 2. Get Total Households (Active)
    const totalHouseholdsQuery = await pool.query(
      "SELECT COUNT(*) FROM households WHERE status = 'Active'"
    );
    const totalHouseholds = parseInt(totalHouseholdsQuery.rows[0].count);

    // 3. Get Payment Stats
    // Total collected amount
    const totalCollectedQuery = await pool.query(
      "SELECT COALESCE(SUM(amount_paid), 0) as total FROM payment_history WHERE fee_id = $1",
      [feeId]
    );
    const totalCollected = parseInt(totalCollectedQuery.rows[0].total);

    // Count households that have paid
    const paidHouseholdsQuery = await pool.query(
      "SELECT COUNT(DISTINCT household_id) FROM payment_history WHERE fee_id = $1",
      [feeId]
    );
    const paidHouseholds = parseInt(paidHouseholdsQuery.rows[0].count);

    // Calculate Unpaid
    const unpaidHouseholds = totalHouseholds - paidHouseholds;

    // Calculate Expected Revenue
    let expectedRevenue = 0;
    if (fee.fee_type === "Mandatory") {
      expectedRevenue = totalHouseholds * parseInt(fee.amount);
    } else {
      // For voluntary, expected revenue is tricky.
      // Let's assume expected is at least what has been collected,
      // or maybe we don't show "expected" in the same way.
      // For now, let's set expected = totalCollected for voluntary to avoid confusion,
      // or maybe 0. Let's stick to logic: if voluntary, expected is undefined/dynamic.
      // But to fit the UI chart, let's use totalCollected as the baseline or maybe a target if we had one.
      // Let's just use totalCollected for now so the bar chart looks balanced, or 0.
      // Actually, usually voluntary funds have a target, but we don't have a target column.
      // Let's set it to totalCollected for now.
      expectedRevenue = totalCollected;
    }

    // 4. Line Chart Data (Revenue by Month)
    // We need to group payments by month for this fee
    const monthlyRevenueQuery = await pool.query(
      `
      SELECT 
        TO_CHAR(payment_date, 'Mon') as month_name,
        EXTRACT(MONTH FROM payment_date) as month_num,
        SUM(amount_paid) as total
      FROM payment_history
      WHERE fee_id = $1
      GROUP BY month_name, month_num
      ORDER BY month_num
    `,
      [feeId]
    );

    // Format data for Recharts (ensure all months are present or just return what we have)
    // The frontend expects Jan, Feb, Mar...
    // Let's map the result to the 12 months structure
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const lineChartData = months.map((month, index) => {
      const found = monthlyRevenueQuery.rows.find(
        (row) => parseInt(row.month_num) === index + 1
      );
      return {
        name: month,
        value: found ? parseInt(found.total) : 0,
      };
    });

    res.json({
      success: true,
      data: {
        feeInfo: fee,
        summary: {
          totalCollected,
          expectedRevenue,
          paidHouseholds,
          unpaidHouseholds,
          totalHouseholds,
        },
        charts: {
          line: lineChartData,
          pie: [
            { name: "Đã đóng", value: paidHouseholds },
            { name: "Chưa đóng", value: unpaidHouseholds },
          ],
          bar: [
            { name: "Đã thu", value: totalCollected },
            { name: "Dự kiến", value: expectedRevenue },
          ],
        },
      },
    });
  } catch (error) {
    console.error("Error fetching finance stats:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu thống kê tài chính",
      error: error.message,
    });
  }
};

module.exports = {
  getFees,
  getFinanceStats,
};
