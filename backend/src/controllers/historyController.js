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

const getHouseholdsWithHistory = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT 
        h.household_id, 
        h.household_code, 
        h.address, 
        h.owner_name,
        MAX(ch.change_date) as last_change_date
      FROM households h
      JOIN change_history ch ON h.household_id = ch.household_id
      LEFT JOIN residents r ON h.head_of_household_id = r.resident_id
      GROUP BY h.household_id, h.household_code, h.address, h.owner_name
      ORDER BY last_change_date DESC
    `;

    // Note: h.owner_name might not exist in households table if it's not denormalized.
    // Based on previous files, owner_name is usually fetched via join.
    // Let's check householdController.js getHouseholds query again.
    // It uses: CONCAT(r.first_name, ' ', r.last_name) as owner_name
    
    const correctedQuery = `
      SELECT DISTINCT 
        h.household_id, 
        h.household_code, 
        h.address, 
        CONCAT(r.first_name, ' ', r.last_name) as owner_name,
        MAX(ch.change_date) as last_change_date
      FROM households h
      JOIN change_history ch ON h.household_id = ch.household_id
      LEFT JOIN residents r ON h.head_of_household_id = r.resident_id
      GROUP BY h.household_id, h.household_code, h.address, r.first_name, r.last_name
      ORDER BY last_change_date DESC
    `;

    const result = await pool.query(correctedQuery);

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching households with history:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách hộ có biến động',
      error: error.message
    });
  }
};

module.exports = {
  getHouseholdHistory,
  getHouseholdsWithHistory
};
