const pool = require("../config/database");

const logChange = async (client, householdId, residentId, changeType, userId) => {
  if (!userId) return; 
  const query = `
    INSERT INTO change_history (household_id, resident_id, change_type, changed_by_user_id)
    VALUES ($1, $2, $3, $4)
  `;
  await client.query(query, [householdId, residentId, changeType, userId]);
};

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
        CONCAT(r.first_name, ' ', r.last_name) as owner_name,
        r.identity_card_number as owner_cccd,
        (SELECT COUNT(*) 
         FROM residents res 
         WHERE res.household_id = h.household_id 
           AND res.deleted_at IS NULL
        ) as member_count
      FROM households h
      LEFT JOIN residents r ON h.head_of_household_id = r.resident_id
      WHERE h.status = 'Active' 
        AND h.deleted_at IS NULL
      ORDER BY h.household_id ASC
    `;

    const result = await pool.query(query);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const createHousehold = async (req, res) => {
  const client = await pool.connect();

  try {
    console.log("---- BẮT ĐẦU TẠO HỘ KHẨU ----");
    const { household_code, address, members } = req.body;
    const currentUserId = req.user ? req.user.user_id : null; 

    if (!household_code || !address) {
      return res.status(400).json({ success: false, message: "Thiếu Mã hộ hoặc Địa chỉ" });
    }

    await client.query("BEGIN");

    const checkDup = await client.query(
      "SELECT household_code FROM households WHERE household_code = $1",
      [household_code]
    );
    if (checkDup.rows.length > 0) {
      throw new Error(`Mã hộ khẩu "${household_code}" đã tồn tại!`);
    }

    const insertHouseInfo = `
      INSERT INTO households (household_code, address, status, date_created) 
      VALUES ($1, $2, 'Active', CURRENT_DATE) 
      RETURNING household_id
    `;
    const houseRes = await client.query(insertHouseInfo, [household_code, address]);
    const newHouseholdId = houseRes.rows[0].household_id;

    let headId = null;

    if (members && members.length > 0) {
      for (const member of members) {
        if (!member.name || member.name.trim() === "") continue;

        const nameParts = member.name.trim().split(" ");
        const lastName = nameParts.pop() || member.name;
        const firstName = nameParts.join(" ") || "";
        const birthDate = member.dob && member.dob !== "" ? member.dob : null;

        const insertMemberQuery = `
          INSERT INTO residents (
            household_id, first_name, last_name, nickname, dob, gender, 
            place_of_birth, place_of_origin, ethnicity, occupation, workplace, 
            identity_card_number, identity_card_date, identity_card_place, 
            registration_date, previous_address, relationship_to_head, notes, status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
          RETURNING resident_id
        `;

        const memberValues = [
          newHouseholdId, firstName, lastName, null, birthDate, member.gender || "Male",
          member.place_of_birth || null, null, member.ethnicity || null, member.occupation || null, null,
          member.cccd || null, null, null, new Date(), null, member.relation || "Thành viên", null, "Permanent",
        ];

        const memberRes = await client.query(insertMemberQuery, memberValues);
        const newMemberId = memberRes.rows[0].resident_id;

        if (member.relation === "Chủ hộ") {
          headId = newMemberId;
        }
      }
    }

    if (headId) {
      await client.query(
        "UPDATE households SET head_of_household_id = $1 WHERE household_id = $2",
        [headId, newHouseholdId]
      );
    }

    if (currentUserId) {
      await logChange(client, newHouseholdId, null, 'Added', currentUserId);
    }

    await client.query("COMMIT");
    console.log("-> Tạo thành công!");

    res.status(201).json({
      success: true,
      message: "Thêm hộ khẩu thành công!",
      data: { household_id: newHouseholdId },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(400).json({ success: false, message: error.message || "Lỗi server" });
  } finally {
    client.release();
  }
};

const deleteHousehold = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const currentUserId = req.user ? req.user.user_id : null; 

    await client.query("BEGIN");

    const checkQuery = await client.query(
      "SELECT * FROM households WHERE household_id = $1 AND deleted_at IS NULL", 
      [id]
    );
    
    if (checkQuery.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Không tìm thấy hộ khẩu hoặc đã bị xóa" });
    }

    const now = new Date();

    await client.query(
      "UPDATE households SET deleted_at = $1, status = 'MovedOut' WHERE household_id = $2",
      [now, id]
    );

    await client.query(
      "UPDATE residents SET deleted_at = $1, status = 'MovedOut' WHERE household_id = $2",
      [now, id]
    );

    if (currentUserId) {
        await logChange(client, id, null, 'Removed', currentUserId); 
    }

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Đã xóa hộ khẩu thành công (Dữ liệu được lưu trữ ẩn).",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi xóa hộ khẩu:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi xóa: " + error.message });
  } finally {
    client.release();
  }
};

const splitHousehold = async (req, res) => {
  const client = await pool.connect();
  try {
    const { original_household_id, new_households } = req.body;
    const currentUserId = req.user ? req.user.user_id : null;

    console.log("--- BẮT ĐẦU TÁCH HỘ ---");
    if (!new_households || new_households.length === 0) {
      return res.status(400).json({ success: false, message: "Dữ liệu tách hộ không hợp lệ" });
    }

    await client.query("BEGIN");

    if (currentUserId) {
      await logChange(client, original_household_id, null, 'Split', currentUserId);
    }

    for (const household of new_households) {
      const checkDup = await client.query(
        "SELECT household_code FROM households WHERE household_code = $1",
        [household.household_code]
      );
      if (checkDup.rows.length > 0) {
        throw new Error(`Mã hộ ${household.household_code} đã tồn tại!`);
      }

      const insertHouse = `
        INSERT INTO households (household_code, address, status, date_created)
        VALUES ($1, $2, 'Active', NOW())
        RETURNING household_id
      `;
      const houseRes = await client.query(insertHouse, [household.household_code, household.address]);
      const newHouseholdId = houseRes.rows[0].household_id;

      if (household.owner_id) {
        await client.query(
          `UPDATE residents SET household_id = $1, relationship_to_head = 'Chủ hộ' WHERE resident_id = $2`,
          [newHouseholdId, household.owner_id]
        );
        await client.query(
          "UPDATE households SET head_of_household_id = $1 WHERE household_id = $2",
          [household.owner_id, newHouseholdId]
        );
      }

      for (const member of household.members || []) {
        await client.query(
          `UPDATE residents SET household_id = $1, relationship_to_head = $2 WHERE resident_id = $3`,
          [newHouseholdId, member.relation, member.resident_id]
        );
      }

      if (currentUserId) {
        await logChange(client, newHouseholdId, null, 'Added', currentUserId);
      }
    }

    const countRes = await client.query(
      "SELECT COUNT(*) FROM residents WHERE household_id = $1",
      [original_household_id]
    );
    const remainingMembers = parseInt(countRes.rows[0].count, 10);

    if (remainingMembers === 0) {
      console.log(`-> Hộ cũ (ID: ${original_household_id}) đã rỗng. Tiến hành xóa...`);
      await client.query("DELETE FROM change_history WHERE household_id = $1", [original_household_id]);
      
      await client.query("UPDATE households SET head_of_household_id = NULL WHERE household_id = $1", [original_household_id]);
      await client.query("DELETE FROM households WHERE household_id = $1", [original_household_id]);
    } else {
      console.log(`-> Hộ cũ (ID: ${original_household_id}) còn ${remainingMembers} nhân khẩu, KHÔNG xóa.`);
    }

    await client.query("COMMIT");
    res.json({ success: true, message: "Tách hộ khẩu thành công!" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi tách hộ:", error);
    res.status(400).json({ success: false, message: error.message || "Lỗi server" });
  } finally {
    client.release();
  }
};

const getTemporaryHouseholds = async (req, res) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT 
        h.household_id as id,
        h.household_code as code,
        h.address,
        h.date_created,
        CONCAT(r.first_name, ' ', r.last_name) as owner,
        r.identity_card_number as owner_cccd,
        (
          SELECT COUNT(*)::int 
          FROM residents res 
          WHERE res.household_id = h.household_id 
          AND res.deleted_at IS NULL
        ) as members
      FROM households h
      LEFT JOIN residents r ON h.head_of_household_id = r.resident_id
      WHERE h.status = 'Temporary'
    `;

    const values = [];
    if (search) {
      query += ` 
        AND (
          h.household_code ILIKE $1 
          OR CONCAT(r.first_name, ' ', r.last_name) ILIKE $1
          OR r.identity_card_number ILIKE $1
        )
      `;
      values.push(`%${search.trim()}%`);
    }

    query += ` ORDER BY h.household_id DESC`;

    const result = await pool.query(query, values);

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Lỗi lấy danh sách hộ tạm trú:", error);
    res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
  }
};

const getTemporaryHouseholdById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        h.household_id, h.household_code, h.address, h.date_created,
        r.first_name, r.last_name, r.dob, r.gender, 
        r.identity_card_number as cccd,
        r.temp_start_date, r.temp_end_date, r.temp_reason
      FROM households h
      LEFT JOIN residents r ON h.head_of_household_id = r.resident_id
      WHERE h.household_id = $1 AND h.status = 'Temporary'
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy hộ khẩu này" });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Lỗi lấy chi tiết:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const createTemporaryHousehold = async (req, res) => {
  const client = await pool.connect();
  try {
    console.log("---- TẠO HỘ TẠM TRÚ ----");
    const { household_code, address, start_date, end_date, reason, owner, members } = req.body;
    const currentUserId = req.user ? req.user.user_id : null;

    if (!household_code || !address || !owner || !start_date) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc" });
    }

    await client.query("BEGIN");

    const checkDup = await client.query("SELECT household_code FROM households WHERE household_code = $1", [household_code]);
    if (checkDup.rows.length > 0) throw new Error(`Mã hộ "${household_code}" đã tồn tại!`);

    const insertHouse = `
      INSERT INTO households (household_code, address, status, date_created) 
      VALUES ($1, $2, 'Temporary', CURRENT_DATE) 
      RETURNING household_id
    `;
    const houseRes = await client.query(insertHouse, [household_code, address]);
    const newHouseholdId = houseRes.rows[0].household_id;

    const nameParts = owner.name.trim().split(" ");
    const lastName = nameParts.pop() || owner.name;
    const firstName = nameParts.join(" ");

    const insertResidentQuery = `
      INSERT INTO residents (
        household_id, first_name, last_name, dob, gender,
        identity_card_number, relationship_to_head, status,
        temp_home_address, temp_start_date, temp_end_date, temp_reason, registration_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Temporary', $8, $9, $10, $11, CURRENT_DATE)
      RETURNING resident_id
    `;

    const ownerValues = [
      newHouseholdId, firstName, lastName, owner.dob || null, owner.gender || 'Male',
      owner.cccd || null, 'Chủ hộ', 
      address, start_date, end_date, reason
    ];
    
    const ownerRes = await client.query(insertResidentQuery, ownerValues);
    const newOwnerId = ownerRes.rows[0].resident_id;

    await client.query("UPDATE households SET head_of_household_id = $1 WHERE household_id = $2", [newOwnerId, newHouseholdId]);

    if (members && members.length > 0) {
      for (const mem of members) {
        if (!mem.name) continue;

        const mNameParts = mem.name.trim().split(" ");
        const mLastName = mNameParts.pop() || mem.name;
        const mFirstName = mNameParts.join(" ");

        const memValues = [
          newHouseholdId, mFirstName, mLastName, mem.dob || null, mem.gender || 'Male',
          mem.cccd || null, mem.relation || 'Thành viên',
          address, start_date, end_date, reason
        ];

        await client.query(insertResidentQuery, memValues);
      }
    }

    if (currentUserId) {
      await logChange(client, newHouseholdId, null, 'Added', currentUserId);
    }

    await client.query("COMMIT");
    res.status(201).json({ success: true, message: "Đăng ký tạm trú thành công" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi tạo tạm trú:", error);
    res.status(400).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

const getHouseholdById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Lấy thông tin hộ khẩu
    const householdQuery = `
      SELECT 
        h.*,
        CONCAT(r.first_name, ' ', r.last_name) as owner_name
      FROM households h
      LEFT JOIN residents r ON h.head_of_household_id = r.resident_id
      WHERE h.household_id = $1 AND h.deleted_at IS NULL
    `;
    const householdResult = await pool.query(householdQuery, [id]);

    if (householdResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy hộ khẩu" });
    }

    // 2. Lấy danh sách thành viên
    const residentsQuery = `
      SELECT * FROM residents 
      WHERE household_id = $1 AND deleted_at IS NULL
    `;
    const residentsResult = await pool.query(residentsQuery, [id]);

    res.status(200).json({
      success: true,
      household: householdResult.rows[0],
      residents: residentsResult.rows
    });
  } catch (error) {
    console.error("Lỗi lấy chi tiết hộ khẩu:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

module.exports = {
  getHouseholds,
  getHouseholdById,
  createHousehold,
  deleteHousehold,
  splitHousehold,
  getTemporaryHouseholds,
  getTemporaryHouseholdById,
  createTemporaryHousehold,
};