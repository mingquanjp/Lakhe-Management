const pool = require("../config/database");

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
        r.identity_card_number as owner_cccd,
        (SELECT COUNT(*) FROM residents res WHERE res.household_id = h.household_id) as member_count
      FROM households h
      LEFT JOIN residents r ON h.head_of_household_id = r.resident_id
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

    if (!household_code || !address) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu Mã hộ hoặc Địa chỉ" });
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
    const houseRes = await client.query(insertHouseInfo, [
      household_code,
      address,
    ]);
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
            status
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
            $11, $12, $13, $14, $15, $16, $17, $18, $19
          )
          RETURNING resident_id
        `;

        const memberValues = [
          newHouseholdId, // $1: household_id
          firstName, // $2: first_name
          lastName, // $3: last_name
          null, // $4: nickname
          birthDate, // $5: dob
          member.gender || "Male", // $6: gender
          member.place_of_birth || null, // $7: place_of_birth
          null, // $8: place_of_origin
          member.ethnicity || null, // $9: ethnicity
          member.occupation || null, // $10: occupation
          null, // $11: workplace
          member.cccd || null, // $12: identity_card_number
          null, // $13: identity_card_date
          null, // $14: identity_card_place
          new Date(), // $15: registration_date
          null, // $16: previous_address
          member.relation || "Thành viên", // $17: relationship_to_head
          null, // $18: notes
          "Permanent", // $19: status
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

    await client.query("COMMIT");
    console.log("-> Tạo thành công!");

    res.status(201).json({
      success: true,
      message: "Thêm hộ khẩu thành công!",
      data: { household_id: newHouseholdId },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  } finally {
    client.release();
  }
};

const deleteHousehold = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query("BEGIN");

    const checkQuery = await client.query(
      "SELECT * FROM households WHERE household_id = $1",
      [id]
    );
    if (checkQuery.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy hộ khẩu" });
    }

    await client.query(
      "UPDATE households SET head_of_household_id = NULL WHERE household_id = $1",
      [id]
    );

    // Xóa các ràng buộc khóa ngoại
    await client.query("DELETE FROM change_history WHERE household_id = $1", [id]);

    await client.query("DELETE FROM residents WHERE household_id = $1", [id]);

    await client.query("DELETE FROM households WHERE household_id = $1", [id]);

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Đã xóa hộ khẩu và các thành viên liên quan.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi xóa hộ khẩu:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa: " + error.message,
    });
  } finally {
    client.release();
  }
};

const splitHousehold = async (req, res) => {
  const client = await pool.connect();
  try {
    const { original_household_id, new_households } = req.body;

    console.log("--- BẮT ĐẦU TÁCH HỘ ---");
    if (!new_households || new_households.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Dữ liệu tách hộ không hợp lệ" });
    }

    await client.query("BEGIN");

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
      const houseRes = await client.query(insertHouse, [
        household.household_code,
        household.address,
      ]);
      const newHouseholdId = houseRes.rows[0].household_id;

      if (household.owner_id) {
        await client.query(
          `
            UPDATE residents
            SET household_id = $1,
                relationship_to_head = 'Chu ho' -- hoặc 'Chủ hộ' tùy cậu
            WHERE resident_id = $2
          `,
          [newHouseholdId, household.owner_id]
        );

        await client.query(
          "UPDATE households SET head_of_household_id = $1 WHERE household_id = $2",
          [household.owner_id, newHouseholdId]
        );
      }

      for (const member of household.members || []) {
        await client.query(
          `
            UPDATE residents
            SET household_id = $1,
                relationship_to_head = $2
            WHERE resident_id = $3
          `,
          [newHouseholdId, member.relation, member.resident_id]
        );
      }
    }

    const countRes = await client.query(
      "SELECT COUNT(*) FROM residents WHERE household_id = $1",
      [original_household_id]
    );
    const remainingMembers = parseInt(countRes.rows[0].count, 10);

    if (remainingMembers === 0) {
      console.log(
        `-> Hộ cũ (ID: ${original_household_id}) đã rỗng. Tiến hành xóa...`
      );

      // Xóa các ràng buộc khóa ngoại trước khi xóa hộ
      await client.query("DELETE FROM change_history WHERE household_id = $1", [
        original_household_id,
      ]);
      
      await client.query(
        "UPDATE households SET head_of_household_id = NULL WHERE household_id = $1",
        [original_household_id]
      );

      await client.query("DELETE FROM households WHERE household_id = $1", [
        original_household_id,
      ]);
    } else {
      console.log(
        `-> Hộ cũ (ID: ${original_household_id}) còn ${remainingMembers} nhân khẩu, KHÔNG xóa.`
      );
    }

    await client.query("COMMIT");
    res.json({ success: true, message: "Tách hộ khẩu thành công!" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi tách hộ:", error);
    res
      .status(400)
      .json({ success: false, message: error.message || "Lỗi server" });
  } finally {
    client.release();
  }
};

const getHouseholdById = async (req, res) => {
    const { id } = req.params;
    try {
        const householdQuery = `
            SELECT 
                h.*,
                (r.first_name || ' ' || r.last_name) as owner_name
            FROM households h
            LEFT JOIN residents r ON h.head_of_household_id = r.resident_id
            WHERE h.household_id = $1
        `;
        const householdResult = await pool.query(householdQuery, [id]);

        if (householdResult.rows.length === 0) {
            return res.status(404).json({ message: 'Household not found' });
        }

        const residentsQuery = `
            SELECT * FROM residents 
            WHERE household_id = $1
            ORDER BY resident_id ASC
        `;
        const residentsResult = await pool.query(residentsQuery, [id]);

        res.json({
            household: householdResult.rows[0],
            residents: residentsResult.rows
        });
    } catch (error) {
        console.error('Error getting household details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const changeHeadOfHousehold = async (req, res) => {
  const client = await pool.connect();
  try {
    const { household_id, new_head_id, reason, change_date } = req.body;

    if (!household_id || !new_head_id) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc" });
    }

    await client.query("BEGIN");

    // 1. Get current head
    const currentHeadRes = await client.query(
      "SELECT head_of_household_id FROM households WHERE household_id = $1",
      [household_id]
    );
    
    if (currentHeadRes.rows.length === 0) {
      throw new Error("Không tìm thấy hộ khẩu");
    }
    
    const oldHeadId = currentHeadRes.rows[0].head_of_household_id;

    // 2. Update household's head
    await client.query(
      "UPDATE households SET head_of_household_id = $1 WHERE household_id = $2",
      [new_head_id, household_id]
    );

    // 3. Update relationships
    // Set new head's relation to 'Chủ hộ'
    await client.query(
      "UPDATE residents SET relationship_to_head = 'Chủ hộ' WHERE resident_id = $1",
      [new_head_id]
    );

    // Set old head's relation to 'Thành viên' (or ask user, but for now default to Member)
    if (oldHeadId && oldHeadId !== new_head_id) {
      await client.query(
        "UPDATE residents SET relationship_to_head = 'Thành viên' WHERE resident_id = $1",
        [oldHeadId]
      );
    }

    // 4. Log history (optional, but consistent with user request)
    // Log for new head
    // Note: change_history schema might need adjustment if we want to log 'ChangeHead' specifically, 
    // but we can use 'Other' or just rely on the fact that it's a change.
    // For now, let's skip explicit history logging here unless requested, or add a generic log if possible.
    
    await client.query("COMMIT");
    res.json({ success: true, message: "Thay đổi chủ hộ thành công" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error changing head:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

module.exports = {
  getHouseholds,
  getHouseholdById,
  createHousehold,
  deleteHousehold,
  splitHousehold,
  changeHeadOfHousehold
};
