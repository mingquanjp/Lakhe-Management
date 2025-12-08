const pool = require('../config/database');

// 1. Create new resident (Thêm mới nhân khẩu - Sinh con hoặc chuyển đến)
const createResident = async (req, res) => {
  try {
    const {
      household_id,
      first_name,
      last_name,
      nickname,
      dob,
      gender,
      place_of_birth,
      place_of_origin,
      ethnicity,
      occupation,
      workplace,
      identity_card_number,
      identity_card_date,
      identity_card_place,
      registration_date,
      previous_address,
      relationship_to_head,
      notes,
      status // 'Permanent', 'MovedOut', 'Deceased'
    } = req.body;

    // Basic validation
    if (!household_id || !first_name || !last_name || !dob || !gender || !relationship_to_head) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập các trường bắt buộc: household_id, first_name, last_name, dob, gender, relationship_to_head'
      });
    }

    const query = `
      INSERT INTO residents (
        household_id, first_name, last_name, nickname, dob, gender,
        place_of_birth, place_of_origin, ethnicity, occupation, workplace,
        identity_card_number, identity_card_date, identity_card_place,
        registration_date, previous_address, relationship_to_head, notes, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `;

    const values = [
      household_id, first_name, last_name, nickname, dob, gender,
      place_of_birth, place_of_origin, ethnicity, occupation, workplace,
      identity_card_number, identity_card_date, identity_card_place,
      registration_date || new Date(), previous_address, relationship_to_head, notes, status || 'Permanent'
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Thêm nhân khẩu thành công',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating resident:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thêm nhân khẩu',
      error: error.message
    });
  }
};

// 2. Get all residents (Lấy danh sách nhân khẩu)
const getAllResidents = async (req, res) => {
  try {
    const { household_id, status, search } = req.query;
    
    let query = `
      SELECT r.*, h.household_code 
      FROM residents r
      LEFT JOIN households h ON r.household_id = h.household_id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (household_id) {
      query += ` AND r.household_id = $${paramCount}`;
      values.push(household_id);
      paramCount++;
    }

    if (status) {
      query += ` AND r.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    if (search) {
      query += ` AND (r.first_name ILIKE $${paramCount} OR r.last_name ILIKE $${paramCount} OR r.identity_card_number ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY r.resident_id DESC`;

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting residents:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách nhân khẩu',
      error: error.message
    });
  }
};

// 3. Get resident detail (Xem chi tiết nhân khẩu)
const getResidentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT r.*, h.household_code, h.address as household_address
      FROM residents r
      LEFT JOIN households h ON r.household_id = h.household_id
      WHERE r.resident_id = $1
    `;
    
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân khẩu'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting resident detail:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin nhân khẩu',
      error: error.message
    });
  }
};

// 4. Update resident (Sửa thông tin nhân khẩu)
const updateResident = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Filter out fields that shouldn't be updated directly or handle them specifically if needed
    // For simplicity, we'll construct a dynamic update query
    
    const allowedUpdates = [
      'first_name', 'last_name', 'nickname', 'dob', 'gender',
      'place_of_birth', 'place_of_origin', 'ethnicity', 'occupation', 'workplace',
      'identity_card_number', 'identity_card_date', 'identity_card_place',
      'registration_date', 'previous_address', 'relationship_to_head', 'notes', 'status'
    ];

    const keys = Object.keys(updates).filter(key => allowedUpdates.includes(key));
    
    if (keys.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có dữ liệu hợp lệ để cập nhật'
      });
    }

    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [id, ...keys.map(key => updates[key])];

    const query = `
      UPDATE residents
      SET ${setClause}
      WHERE resident_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân khẩu để cập nhật'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating resident:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật nhân khẩu',
      error: error.message
    });
  }
};

// 5. Delete resident (Xóa nhân khẩu - Hard delete)
const deleteResident = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if resident exists and if they are a head of household
    const checkQuery = `
      SELECT r.resident_id, h.head_of_household_id 
      FROM residents r
      LEFT JOIN households h ON r.resident_id = h.head_of_household_id
      WHERE r.resident_id = $1
    `;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân khẩu'
      });
    }

    if (checkResult.rows[0].head_of_household_id) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa chủ hộ. Vui lòng thay đổi chủ hộ trước khi xóa.'
      });
    }

    const deleteQuery = 'DELETE FROM residents WHERE resident_id = $1 RETURNING *';
    const result = await pool.query(deleteQuery, [id]);

    res.status(200).json({
      success: true,
      message: 'Xóa nhân khẩu thành công',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting resident:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa nhân khẩu',
      error: error.message
    });
  }
};

// 6. Register Temporary Residence (Đăng ký tạm trú)
const registerTemporaryResidence = async (req, res) => {
  try {
    const {
      host_household_id,
      first_name,
      last_name,
      identity_card_number,
      dob,
      gender,
      home_address,
      reason,
      start_date,
      end_date
    } = req.body;

    if (!host_household_id || !first_name || !last_name || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin bắt buộc'
      });
    }

    const query = `
      INSERT INTO temporary_residents (
        host_household_id, first_name, last_name, identity_card_number,
        dob, gender, home_address, reason, start_date, end_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      host_household_id, first_name, last_name, identity_card_number,
      dob, gender, home_address, reason, start_date, end_date
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Đăng ký tạm trú thành công',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error registering temporary residence:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký tạm trú',
      error: error.message
    });
  }
};

// 7. Register Temporary Absence (Đăng ký tạm vắng)
const registerTemporaryAbsence = async (req, res) => {
  try {
    const {
      resident_id,
      destination_address,
      reason,
      start_date,
      end_date
    } = req.body;

    if (!resident_id || !start_date) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập resident_id và ngày bắt đầu'
      });
    }

    const query = `
      INSERT INTO temporary_absences (
        resident_id, destination_address, reason, start_date, end_date
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [resident_id, destination_address, reason, start_date, end_date];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Đăng ký tạm vắng thành công',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error registering temporary absence:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký tạm vắng',
      error: error.message
    });
  }
};

// 8. Declare Death (Khai tử)
const declareDeath = async (req, res) => {
  try {
    const { id } = req.params; // resident_id
    const { death_date, notes } = req.body;

    if (!death_date) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập ngày mất'
      });
    }

    const query = `
      UPDATE residents
      SET status = 'Deceased',
          notes = COALESCE(notes, '') || ' | Mất ngày: ' || $2 || '. ' || COALESCE($3, '')
      WHERE resident_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, death_date, notes]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân khẩu'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Khai tử thành công',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error declaring death:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi khai tử',
      error: error.message
    });
  }
};

// 9. Get expiring temporary residents (Lấy ds tạm trú sắp hết hạn)
const getExpiringTemporaryResidents = async (req, res) => {
  try {
    const { days } = req.query; // Number of days from now
    const daysLimit = parseInt(days) || 30; // Default 30 days

    const query = `
      SELECT tr.*, h.household_code, h.address as host_address
      FROM temporary_residents tr
      JOIN households h ON tr.host_household_id = h.household_id
      WHERE tr.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + interval '${daysLimit} days'
      ORDER BY tr.end_date ASC
    `;

    const result = await pool.query(query);

    res.status(200).json({
      success: true,
      message: `Danh sách tạm trú sắp hết hạn trong ${daysLimit} ngày tới`,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting expiring temporary residents:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách tạm trú sắp hết hạn',
      error: error.message
    });
  }
};

module.exports = {
  createResident,
  getAllResidents,
  getResidentById,
  updateResident,
  deleteResident,
  registerTemporaryResidence,
  registerTemporaryAbsence,
  declareDeath,
  getExpiringTemporaryResidents
};