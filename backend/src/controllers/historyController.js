const pool = require('../config/database');

const getHouseholdHistory = async (req, res) => {
  try {
    const { householdId } = req.params;

    const query = `
      SELECT 
        ch.history_id,
        ch.change_date,
        ch.change_type,
        u.full_name as changed_by,
        r.first_name,
        r.last_name
      FROM change_history ch
      LEFT JOIN users u ON ch.changed_by_user_id = u.user_id
      LEFT JOIN residents r ON ch.resident_id = r.resident_id
      WHERE ch.household_id = $1
      ORDER BY ch.change_date DESC
    `;

    const result = await pool.query(query, [householdId]);

    console.log(`Fetched history for household ${householdId}: ${result.rows.length} records`);

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy lịch sử',
      error: error.message // Send error details to frontend for debugging
    });
  }
};

module.exports = {
  getHouseholdHistory
};
