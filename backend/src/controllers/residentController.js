const pool = require('../config/database');

const cleanValue = (val) => {
  if (val === '' || val === undefined || val === 'null') return null;
  return val;
};

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
      status, // 'Permanent', 'MovedOut', 'Deceased'
      change_type, // 'NewBirth' or 'MoveIn'
      temp_home_address,
      temp_start_date,
      temp_end_date,
      temp_reason
    } = req.body;

    // Basic validation
    if (!household_id || !first_name || !last_name || !dob || !gender || !relationship_to_head) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập các trường bắt buộc: household_id, first_name, last_name, dob, gender, relationship_to_head'
      });
    }

    // Helper to convert empty strings to null
    const cleanValue = (val) => (val === '' ? null : val);

    const query = `
      INSERT INTO residents (
        household_id, first_name, last_name, nickname, dob, gender,
        place_of_birth, place_of_origin, ethnicity, occupation, workplace,
        identity_card_number, identity_card_date, identity_card_place,
        registration_date, previous_address, relationship_to_head, notes, status,
        temp_home_address, temp_start_date, temp_end_date, temp_reason
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *
    `;

    const values = [
      household_id,
      first_name,
      last_name,
      cleanValue(nickname),
      dob,
      gender,
      cleanValue(place_of_birth),
      cleanValue(place_of_origin),
      cleanValue(ethnicity),
      cleanValue(occupation),
      cleanValue(workplace),
      cleanValue(identity_card_number),
      cleanValue(identity_card_date),
      cleanValue(identity_card_place),
      registration_date || new Date(),
      cleanValue(previous_address),
      relationship_to_head,
      cleanValue(notes),
      status || 'Permanent',
      cleanValue(temp_home_address),
      cleanValue(temp_start_date),
      cleanValue(temp_end_date),
      cleanValue(temp_reason)
    ];

    const result = await pool.query(query, values);
    const newResident = result.rows[0];

    // Log history
    try {
      // Map 'MoveIn' to 'Added', or default to 'NewBirth' if specified, else 'Added'
      const userId = req.user ? req.user.user_id : 1;
      let historyType = 'Added';
      if (change_type === 'NewBirth') historyType = 'NewBirth';

      await pool.query(
        `INSERT INTO change_history (household_id, resident_id, change_type, changed_by_user_id)
             VALUES ($1, $2, $3, $4)`,
        [household_id, newResident.resident_id, historyType, userId]
      );
    } catch (histError) {
      console.error('Error logging history:', histError);
    }

    res.status(201).json({
      success: true,
      message: 'Thêm nhân khẩu thành công',
      data: newResident
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
      WHERE 1=1 AND h.deleted_at IS NULL
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
      query += ` AND (
        r.first_name ILIKE $${paramCount} 
        OR r.last_name ILIKE $${paramCount} 
        OR (r.last_name || ' ' || r.first_name) ILIKE $${paramCount}
        OR (r.first_name || ' ' || r.last_name) ILIKE $${paramCount}
        OR r.identity_card_number ILIKE $${paramCount} 
        OR h.household_code ILIKE $${paramCount}
      )`;
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
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const updates = req.body;

    // Filter out fields that shouldn't be updated directly or handle them specifically if needed
    // For simplicity, we'll construct a dynamic update query

    const allowedUpdates = [
      'first_name', 'last_name', 'nickname', 'dob', 'gender',
      'place_of_birth', 'place_of_origin', 'ethnicity', 'occupation', 'workplace',
      'identity_card_number', 'identity_card_date', 'identity_card_place',
      'registration_date', 'previous_address', 'relationship_to_head', 'notes', 'status',
      'temp_home_address', 'temp_start_date', 'temp_end_date', 'temp_reason'
    ];

    const keys = Object.keys(updates).filter(key => allowedUpdates.includes(key));

    if (keys.length === 0) {
      client.release();
      return res.status(400).json({
        success: false,
        message: 'Không có dữ liệu hợp lệ để cập nhật'
      });
    }

    await client.query('BEGIN');

    // Check if updating relationship to 'Chủ hộ'
    if (updates.relationship_to_head === 'Chủ hộ') {
        // Get household_id for this resident
        const getHouseholdQuery = 'SELECT household_id FROM residents WHERE resident_id = $1';
        const householdRes = await client.query(getHouseholdQuery, [id]);
        
        if (householdRes.rows.length > 0) {
            const householdId = householdRes.rows[0].household_id;
            
            // Update household head pointer
            await client.query(
                'UPDATE households SET head_of_household_id = $1 WHERE household_id = $2',
                [id, householdId]
            );

            // Demote other 'Chủ hộ' to 'Thành viên' to ensure uniqueness
            await client.query(
                "UPDATE residents SET relationship_to_head = 'Thành viên' WHERE household_id = $1 AND resident_id != $2 AND relationship_to_head = 'Chủ hộ'",
                [householdId, id]
            );
        }
    }

    // Check if resident is head and status is changing to MovedOut/Deceased
    if (updates.status && ['MovedOut', 'Deceased', 'Đã chuyển đi', 'Đã qua đời'].includes(updates.status)) {

        const checkHeadQuery = `
            SELECT r.household_id, h.head_of_household_id 
            FROM residents r
            JOIN households h ON r.household_id = h.household_id
            WHERE r.resident_id = $1
        `;
        const checkHeadResult = await client.query(checkHeadQuery, [id]);
        
        if (checkHeadResult.rows.length > 0) {
            const { household_id, head_of_household_id } = checkHeadResult.rows[0];
            if (head_of_household_id === parseInt(id)) {
                 const findNewHeadQuery = `
                    SELECT resident_id FROM residents 
                    WHERE household_id = $1 
                    AND resident_id != $2
                    AND status IN ('Permanent', 'Temporary', 'Thường trú', 'Tạm trú')
                    AND deleted_at IS NULL
                    ORDER BY dob ASC
                    LIMIT 1
                `;
                const newHeadResult = await client.query(findNewHeadQuery, [household_id, id]);

                if (newHeadResult.rows.length > 0) {
                    const newHeadId = newHeadResult.rows[0].resident_id;
                    await client.query('UPDATE households SET head_of_household_id = $1 WHERE household_id = $2', [newHeadId, household_id]);
                    await client.query("UPDATE residents SET relationship_to_head = 'Chủ hộ' WHERE resident_id = $1", [newHeadId]);
                }
            }
        }
    }

    // Helper to convert empty strings to null
    const cleanValue = (val) => (val === '' ? null : val);

    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [id, ...keys.map(key => cleanValue(updates[key]))];

    const query = `
      UPDATE residents
      SET ${setClause}
      WHERE resident_id = $1
      RETURNING *
    `;

    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân khẩu để cập nhật'
      });
    }

    const updatedResident = result.rows[0];

    // Log history
    try {
      let changeType = 'UpdateInfo';
      const userId = req.user ? req.user.user_id : 1;

      if (updates.status) {
        if (updates.status === 'Deceased') changeType = 'Death';
        else if (updates.status === 'MovedOut') changeType = 'MoveOut';
      }

      await client.query(
        `INSERT INTO change_history (household_id, resident_id, change_type, changed_by_user_id)
             VALUES ($1, $2, $3, $4)`,
        [updatedResident.household_id, id, changeType, userId]
      );
    } catch (histError) {
      console.error('Error logging history:', histError);
    }

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: updatedResident
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating resident:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật nhân khẩu',
      error: error.message
    });
  } finally {
    client.release();
  }
};

// 5. Delete resident (Xóa nhân khẩu - Hard delete)
const deleteResident = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    // Check if resident exists and if they are a head of household
    const checkQuery = `
      SELECT r.resident_id, r.household_id, h.head_of_household_id 
      FROM residents r
      LEFT JOIN households h ON r.resident_id = h.head_of_household_id
      WHERE r.resident_id = $1
    `;
    const checkResult = await client.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      client.release();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân khẩu'
      });
    }

    if (checkResult.rows[0].head_of_household_id) {
      client.release();
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa chủ hộ. Vui lòng thay đổi chủ hộ trước khi xóa.'
      });
    }

    await client.query('BEGIN');

    // Delete related records in change_history
    await client.query('DELETE FROM change_history WHERE resident_id = $1', [id]);

    // Delete related records in temporary_absences
    await client.query('DELETE FROM temporary_absences WHERE resident_id = $1', [id]);

    // Hard delete resident
    const deleteQuery = "DELETE FROM residents WHERE resident_id = $1 RETURNING *";
    const result = await client.query(deleteQuery, [id]);
    const deletedResident = result.rows[0];

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Xóa nhân khẩu thành công',
      data: deletedResident
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting resident:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa nhân khẩu',
      error: error.message
    });
  } finally {
    client.release();
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
      home_address, // This will be mapped to place_of_origin (Quê quán)
      reason,
      start_date,
      end_date,
      occupation,
      workplace,
      email, // Not stored in DB currently
      phone,  // Not stored in DB currently
      relationship_to_head
    } = req.body;

    if (!first_name || !last_name || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin bắt buộc'
      });
    }

    // Insert into residents table with status = 'Temporary'
    // Mapping home_address (Quê quán) to place_of_origin
    // Mapping occupation, workplace
    const query = `
      INSERT INTO residents (
        household_id, first_name, last_name, identity_card_number,
        dob, gender, 
        place_of_origin, occupation, workplace,
        temp_reason, temp_start_date, temp_end_date,
        status, relationship_to_head, registration_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Temporary', $13, CURRENT_DATE)
      RETURNING *
    `;

    const values = [
      host_household_id, first_name, last_name, cleanValue(identity_card_number),
      dob, gender,
      cleanValue(home_address), cleanValue(occupation), cleanValue(workplace),
      cleanValue(reason), cleanValue(start_date), cleanValue(end_date),
      relationship_to_head || 'Tạm trú'
    ];

    const result = await pool.query(query, values);

    // Log history
    try {
      const userId = req.user ? req.user.user_id : 1;
      await pool.query(
        `INSERT INTO change_history (household_id, resident_id, change_type, changed_by_user_id)
             VALUES ($1, $2, 'Added', $3)`,
        [host_household_id, result.rows[0].resident_id, userId]
      );
    } catch (histError) {
      console.error('Error logging history:', histError);
    }

    res.status(201).json({
      success: true,
      message: 'Đăng ký tạm trú thành công',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error registering temporary residence:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký tạm trú: ' + error.message,
      error: error.message
    });
  }
};

// 7. Register Temporary Absence (Đăng ký tạm vắng)
const registerTemporaryAbsence = async (req, res) => {
  try {
    const {
      resident_id, // Accept resident_id directly
      first_name,
      last_name,
      dob,
      gender,
      identity_card_number,
      permanent_address,
      temporary_address,
      reason,
      start_date,
      end_date,
      absence_code // New field
    } = req.body;

    if (!first_name || !last_name || !start_date) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập resident_id và ngày bắt đầu'
      });
    }

    // 1. Find Resident ID first
    let residentId = resident_id || null;
    let householdId = null;

    // If resident_id is provided, verify it exists
    if (residentId) {
      const checkQuery = `SELECT resident_id, household_id FROM residents WHERE resident_id = $1`;
      const checkResult = await pool.query(checkQuery, [residentId]);
      if (checkResult.rows.length > 0) {
        householdId = checkResult.rows[0].household_id;
      } else {
        residentId = null; // Invalid ID, fall back to lookup
      }
    }

    // Try to find resident by identity_card_number if not found by ID
    if (!residentId && identity_card_number) {
      const residentQuery = `SELECT resident_id, household_id FROM residents WHERE identity_card_number = $1`;
      const residentResult = await pool.query(residentQuery, [identity_card_number]);
      if (residentResult.rows.length > 0) {
        residentId = residentResult.rows[0].resident_id;
        householdId = residentResult.rows[0].household_id;
      }
    }

    // If not found by ID card, try by name and dob
    if (!residentId) {
      const fullName = `${first_name} ${last_name}`.trim();
      console.log('Searching resident by Name/DOB:', { fullName, dob });

      // DEBUG: Check if we can find by name ONLY
      const nameCheck = await pool.query(`
          SELECT resident_id, first_name, last_name, dob 
          FROM residents 
          WHERE LOWER(TRIM(first_name || ' ' || last_name)) = LOWER(TRIM($1))
          OR LOWER(TRIM(last_name || ' ' || first_name)) = LOWER(TRIM($1))
       `, [fullName]);
      console.log('Found by name only:', nameCheck.rows.length, 'records');
      if (nameCheck.rows.length > 0) {
        console.log('First match DOB:', nameCheck.rows[0].dob);
      }

      // Check both combinations of first_name/last_name in DB against the full name provided
      // AND handle date comparison carefully
      // Note: We cast $2 to ::text explicitly in the second condition to avoid "operator does not exist: text = date"
      // because usage of $2::date elsewhere might cause PG to infer $2 as date type for the whole query.
      const residentQueryByName = `
          SELECT resident_id, household_id 
          FROM residents 
          WHERE (
            LOWER(TRIM(first_name || ' ' || last_name)) = LOWER(TRIM($1))
            OR
            LOWER(TRIM(last_name || ' ' || first_name)) = LOWER(TRIM($1))
          )
          AND (
            dob = $2::date 
            OR 
            TO_CHAR(dob, 'YYYY-MM-DD') = $2::text
          )
       `;

      const residentResultByName = await pool.query(residentQueryByName, [fullName, dob]);

      if (residentResultByName.rows.length > 0) {
        residentId = residentResultByName.rows[0].resident_id;
        householdId = residentResultByName.rows[0].household_id;
        console.log('Found resident by Name/DOB:', residentId);
      } else {
        console.log('Resident not found by Name/DOB');
      }
    }

    if (!residentId) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy nhân khẩu trong hệ thống. Đã tìm kiếm: Tên="${first_name} ${last_name}", Ngày sinh="${dob}", CCCD="${identity_card_number || 'Không có'}". Vui lòng kiểm tra chính xác họ tên (có dấu) và ngày sinh.`
      });
    }

    // 2. Insert into temporary_absences using resident_id
    // Note: temporary_absences table only has: id, resident_id, destination_address, reason, start_date, end_date
    const query = `
      INSERT INTO temporary_absences (
        resident_id, destination_address, reason, start_date, end_date
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      residentId,
      temporary_address, // Map temporary_address to destination_address
      reason,
      start_date,
      end_date
    ];

    const result = await pool.query(query, values);
    const newAbsence = result.rows[0];

    // Log history
    try {
      const userId = req.user ? req.user.user_id : 1;
      await pool.query(
        `INSERT INTO change_history (household_id, resident_id, change_type, changed_by_user_id)
           VALUES ($1, $2, 'MoveOut', $3)`,
        [householdId, residentId, userId]
      );
    } catch (histError) {
      console.error('Error logging history for temporary absence:', histError);
    }

    res.status(201).json({
      success: true,
      message: 'Đăng ký tạm vắng thành công',
      data: newAbsence
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
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params; // resident_id
    const { death_date, notes } = req.body;

    if (!death_date) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập ngày mất'
      });
    }

    // 1. Check if resident exists and get household info
    const checkRes = await client.query(
      'SELECT household_id FROM residents WHERE resident_id = $1',
      [id]
    );

    if (checkRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân khẩu'
      });
    }

    const householdId = checkRes.rows[0].household_id;

    // 2. Check if this resident is the Head of Household
    if (householdId) {
      const householdRes = await client.query(
        'SELECT head_of_household_id FROM households WHERE household_id = $1',
        [householdId]
      );

      if (householdRes.rows.length > 0 && householdRes.rows[0].head_of_household_id === parseInt(id)) {
        // Find a replacement (oldest member, excluding the one dying)
        const replacementRes = await client.query(
          `SELECT resident_id FROM residents 
           WHERE household_id = $1 AND resident_id != $2 AND status = 'Normal'
           ORDER BY dob ASC 
           LIMIT 1`,
          [householdId, id]
        );

        if (replacementRes.rows.length > 0) {
          const newHeadId = replacementRes.rows[0].resident_id;
          
          // Update household with new head
          await client.query(
            'UPDATE households SET head_of_household_id = $1 WHERE household_id = $2',
            [newHeadId, householdId]
          );

          // Update new head's relationship
          await client.query(
            "UPDATE residents SET relationship_to_head = 'Chủ hộ' WHERE resident_id = $1",
            [newHeadId]
          );
        } else {
           // No one left in household
           await client.query(
            'UPDATE households SET head_of_household_id = NULL WHERE household_id = $1',
            [householdId]
          );
        }
      }
    }

    // 3. Update status to Deceased
    const query = `
      UPDATE residents
      SET status = 'Deceased',
          notes = COALESCE(notes, '') || ' | Mất ngày: ' || $2 || '. ' || COALESCE($3, '')
      WHERE resident_id = $1
      RETURNING *
    `;

    const result = await client.query(query, [id, death_date, notes]);

    // 4. Log history
    try {
      await client.query(
        `INSERT INTO change_history (household_id, resident_id, change_type, changed_by_user_id)
             VALUES ($1, $2, 'Death', $3)`,
        [householdId, id, 1]
      );
    } catch (histError) {
      console.error('Error logging history:', histError);
    }

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Khai tử thành công',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error declaring death:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi khai tử',
      error: error.message
    });
  } finally {
    client.release();
  }
};

// 9. Get expiring temporary residents (Lấy ds tạm trú sắp hết hạn)
const getExpiringTemporaryResidents = async (req, res) => {
  try {
    const { days } = req.query; // Number of days from now
    const daysLimit = parseInt(days) || 30; // Default 30 days

    const query = `
      SELECT r.*, h.household_code, h.address as host_address
      FROM residents r
      JOIN households h ON r.household_id = h.household_id
      WHERE r.status = 'Temporary' 
      AND r.temp_end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + interval '${daysLimit} days'
      ORDER BY r.temp_end_date ASC
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

// 10. Get all temporary residents
const getTemporaryResidents = async (req, res) => {
  try {
    const query = `
      SELECT r.*, h.household_code, h.address as host_address
      FROM residents r
      LEFT JOIN households h ON r.household_id = h.household_id
      WHERE r.status = 'Temporary'
      ORDER BY r.temp_start_date DESC
    `;
    const result = await pool.query(query);
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting temporary residents:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 11. Get all temporary absences
const getTemporaryAbsences = async (req, res) => {
  try {
    // Join with residents table to get personal info if it's missing in temporary_absences
    // Note: temporary_absences might have direct columns (first_name, etc.) OR link via resident_id
    // We use COALESCE to prefer direct columns if they exist, otherwise fallback to residents table
    const query = `
      SELECT 
        ta.*,
        r.first_name,
        r.last_name,
        r.dob,
        r.gender,
        r.identity_card_number,
        h.address as permanent_address,
        ta.destination_address as temporary_address,
        h.household_code
      FROM temporary_absences ta
      LEFT JOIN residents r ON ta.resident_id = r.resident_id
      LEFT JOIN households h ON r.household_id = h.household_id
      ORDER BY ta.absence_id DESC
    `;
    const result = await pool.query(query);
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting temporary absences:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 12. Delete Temporary Absence
const deleteTemporaryAbsence = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.user_id : 1;

    // 1. Delete and get resident info
    const query = 'DELETE FROM temporary_absences WHERE absence_id = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bản ghi tạm vắng'
      });
    }

    const deletedRecord = result.rows[0];
    const residentId = deletedRecord.resident_id;

    // 2. Get household_id for history logging
    try {
      const residentRes = await pool.query('SELECT household_id FROM residents WHERE resident_id = $1', [residentId]);
      if (residentRes.rows.length > 0) {
        const householdId = residentRes.rows[0].household_id;

        // 3. Log to history
        await pool.query(
          `INSERT INTO change_history (household_id, resident_id, change_type, changed_by_user_id)
                 VALUES ($1, $2, 'UpdateInfo', $3)`,
          [householdId, residentId, userId]
        );
      }
    } catch (histError) {
      console.error('Error logging history for delete temporary absence:', histError);
    }

    res.status(200).json({
      success: true,
      message: 'Xóa bản ghi tạm vắng thành công',
      data: deletedRecord
    });
  } catch (error) {
    console.error('Error deleting temporary absence:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa tạm vắng',
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
  getExpiringTemporaryResidents,
  getTemporaryResidents,
  getTemporaryAbsences,
  deleteTemporaryAbsence
};