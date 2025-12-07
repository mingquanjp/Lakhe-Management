const pool = require('../config/database');

// Lấy danh sách hộ khẩu
const getHouseholds = async (req, res) => {
  try {
    const query = `
      SELECT 
        h.household_id,
        h.household_code,
        h.address,
        h.date_created,
        h.status,
        h.head_of_household_id,
        CONCAT(r.last_name, ' ', r.first_name) as owner_name,
        r.identity_card_number as owner_cccd
      FROM households h
      LEFT JOIN residents r ON h.head_of_household_id = r.resident_id
      ORDER BY h.household_id ASC
    `;
        
    const result = await pool.query(query);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching households:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách hộ khẩu'
    });
  }
};

module.exports = {
  getHouseholds,
};