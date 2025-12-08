const pool = require('../config/database');
/**
 * Lấy danh sách tất cả hộ khẩu
 * GET /api/households
 */
const getAllHouseholds = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        h.household_id,
        h.household_code,
        h.address,
        h.date_created,
        h.status,
        CONCAT(r.first_name, ' ', r.last_name) as head_name,
        (SELECT COUNT(*) FROM residents WHERE household_id = h.household_id AND status = 'Permanent') as member_count
       FROM households h
       LEFT JOIN residents r ON h.head_of_household_id = r.resident_id
       WHERE h.status = 'Active'
       ORDER BY h.household_code`
    );

    res.json({
      success: true,
      total: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting households:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách hộ khẩu',
      error: error.message
    });
  }
};

/**
 * Lấy chi tiết một hộ khẩu
 * GET /api/households/:householdId
 */
const getHouseholdById = async (req, res) => {
  try {
    const { householdId } = req.params;

    const result = await pool.query(
      `SELECT 
        h.household_id,
        h.household_code,
        h.address,
        h.date_created,
        h.status,
        CONCAT(r.first_name, ' ', r.last_name) as head_name,
        r.resident_id as head_id
       FROM households h
       LEFT JOIN residents r ON h.head_of_household_id = r.resident_id
       WHERE h.household_id = $1`,
      [householdId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hộ khẩu'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting household:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin hộ khẩu',
      error: error.message
    });
  }
};

/**
 * Tạo hộ khẩu mới
 * POST /api/households
 */
const createHousehold = async (req, res) => {
  try {
    const { household_code, address } = req.body;

    // Validation
    if (!household_code || !address) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: household_code, address'
      });
    }

    // Kiểm tra trùng household_code
    const existingHousehold = await pool.query(
      'SELECT household_id FROM households WHERE household_code = $1',
      [household_code]
    );

    if (existingHousehold.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Số hộ khẩu đã tồn tại'
      });
    }

    const result = await pool.query(
      `INSERT INTO households (household_code, address, status)
       VALUES ($1, $2, 'Active')
       RETURNING *`,
      [household_code, address]
    );

    res.status(201).json({
      success: true,
      message: 'Tạo hộ khẩu thành công',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating household:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo hộ khẩu',
      error: error.message
    });
  }
};

/**
 * Cập nhật hộ khẩu
 * PUT /api/households/:householdId
 */
const updateHousehold = async (req, res) => {
  try {
    const { householdId } = req.params;
    const { household_code, address, status } = req.body;

    // Kiểm tra hộ khẩu có tồn tại không
    const existingHousehold = await pool.query(
      'SELECT * FROM households WHERE household_id = $1',
      [householdId]
    );

    if (existingHousehold.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hộ khẩu'
      });
    }

    // Nếu thay đổi household_code, kiểm tra trùng
    if (household_code && household_code !== existingHousehold.rows[0].household_code) {
      const duplicateCheck = await pool.query(
        'SELECT household_id FROM households WHERE household_code = $1 AND household_id != $2',
        [household_code, householdId]
      );

      if (duplicateCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Số hộ khẩu đã tồn tại'
        });
      }
    }

    const result = await pool.query(
      `UPDATE households 
       SET household_code = COALESCE($1, household_code),
           address = COALESCE($2, address),
           status = COALESCE($3, status)
       WHERE household_id = $4
       RETURNING *`,
      [household_code, address, status, householdId]
    );

    res.json({
      success: true,
      message: 'Cập nhật hộ khẩu thành công',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating household:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật hộ khẩu',
      error: error.message
    });
  }
};

/**
 * Xóa hộ khẩu (soft delete - chuyển status thành MovedOut)
 * DELETE /api/households/:householdId
 */
const deleteHousehold = async (req, res) => {
  try {
    const { householdId } = req.params;

    // Kiểm tra hộ khẩu có tồn tại không
    const existingHousehold = await pool.query(
      'SELECT * FROM households WHERE household_id = $1',
      [householdId]
    );

    if (existingHousehold.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hộ khẩu'
      });
    }

    // Soft delete - chuyển status thành MovedOut
    const result = await pool.query(
      `UPDATE households 
       SET status = 'MovedOut'
       WHERE household_id = $1
       RETURNING *`,
      [householdId]
    );

    res.json({
      success: true,
      message: 'Xóa hộ khẩu thành công',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting household:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa hộ khẩu',
      error: error.message
    });
  }
};

module.exports = {
  getAllHouseholds,
  getHouseholdById,
  createHousehold,
  updateHousehold,
  deleteHousehold
};