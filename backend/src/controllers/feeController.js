const pool = require("../config/database");

// Lấy danh sách tất cả khoản thu
const getAllFees = async (req, res) => {
  try {
    const query = `
      SELECT 
        fee_id,
        fee_name,
        fee_type,
        amount,
        start_date,
        end_date
      FROM fees
      ORDER BY start_date DESC
    `;
    const result = await pool.query(query);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách khoản thu:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Lấy thống kê cho một khoản thu cụ thể
const getFeeStatistics = async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy thông tin khoản thu
    const feeQuery = await pool.query(
      "SELECT * FROM fees WHERE fee_id = $1",
      [id]
    );
    if (feeQuery.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy khoản thu" 
      });
    }

    const fee = feeQuery.rows[0];

    // Tổng tiền đã thu
    const totalPaidQuery = await pool.query(
      `SELECT COALESCE(SUM(amount_paid), 0) as total_paid 
       FROM payment_history 
       WHERE fee_id = $1`,
      [id]
    );
    const totalPaid = parseInt(totalPaidQuery.rows[0].total_paid);

    // Tổng số hộ khẩu phải nộp phí này (dựa trên logic thời gian)
    const totalHouseholdsQuery = await pool.query(
      `SELECT COUNT(DISTINCT h.household_id) as total 
       FROM households h
       LEFT JOIN residents r ON h.head_of_household_id = r.resident_id
       WHERE h.status IN ('Active', 'Temporary')
         AND (
           -- Hộ thường trú: chỉ tính nếu fee bắt đầu sau ngày hộ chuyển đến
           (h.status = 'Active' AND r.status = 'Permanent' AND $1 >= h.date_created)
           OR
           -- Hộ tạm trú: chỉ tính nếu fee nằm trong khoảng thời gian tạm trú
           (r.status = 'Temporary' 
            AND r.temp_start_date IS NOT NULL 
            AND r.temp_end_date IS NOT NULL
            AND $1 <= r.temp_end_date
            AND ($2::DATE IS NULL OR $2::DATE >= r.temp_start_date))
         )`,
      [fee.start_date, fee.end_date]
    );
    const totalHouseholds = parseInt(totalHouseholdsQuery.rows[0].total);

    // Tổng tiền dự kiến (chỉ tính cho phí bắt buộc)
    let expectedTotal = 0;
    if (fee.fee_type === 'Mandatory' && fee.amount) {
      expectedTotal = totalHouseholds * fee.amount;
    }

    // Số hộ đã nộp
    const paidHouseholdsQuery = await pool.query(
      `SELECT COUNT(DISTINCT household_id) as paid_count 
       FROM payment_history 
       WHERE fee_id = $1`,
      [id]
    );
    const paidHouseholds = parseInt(paidHouseholdsQuery.rows[0].paid_count);

    // Số hộ chưa nộp
    const unpaidHouseholds = totalHouseholds - paidHouseholds;

    res.status(200).json({
      success: true,
      data: {
        fee: fee,
        statistics: {
          total_paid: totalPaid,
          expected_total: expectedTotal,
          paid_households: paidHouseholds,
          unpaid_households: unpaidHouseholds > 0 ? unpaidHouseholds : 0,
          total_households: totalHouseholds
        }
      }
    });
  } catch (error) {
    console.error("Lỗi lấy thống kê khoản thu:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Lấy danh sách hộ với trạng thái nộp phí cho một khoản thu
const getHouseholdPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      WITH fee_info AS (
        SELECT fee_id, start_date, end_date
        FROM fees
        WHERE fee_id = $1
      )
      SELECT 
        h.household_id,
        h.household_code,
        h.address,
        h.date_created,
        h.status as household_status,
        r.first_name,
        r.last_name,
        r.status as resident_status,
        r.temp_start_date,
        r.temp_end_date,
        CONCAT(r.first_name, ' ', r.last_name) as owner_name,
        CASE 
          WHEN ph.payment_id IS NOT NULL THEN 'paid'
          ELSE 'unpaid'
        END as status,
        ph.amount_paid,
        ph.payment_date
      FROM households h
      LEFT JOIN residents r ON h.head_of_household_id = r.resident_id
      LEFT JOIN payment_history ph ON h.household_id = ph.household_id AND ph.fee_id = $1
      CROSS JOIN fee_info f
      WHERE h.status IN ('Active', 'Temporary')
        AND (
          -- Hộ thường trú: chỉ tính phí nếu fee bắt đầu sau ngày hộ chuyển đến
          (h.status = 'Active' AND r.status = 'Permanent' AND f.start_date >= h.date_created)
          OR
          -- Hộ tạm trú: chỉ tính phí nếu fee nằm trong khoảng thời gian tạm trú
          (r.status = 'Temporary' 
           AND r.temp_start_date IS NOT NULL 
           AND r.temp_end_date IS NOT NULL
           AND f.start_date <= r.temp_end_date
           AND (f.end_date IS NULL OR f.end_date >= r.temp_start_date))
        )
      ORDER BY h.household_code ASC
    `;

    const result = await pool.query(query, [id]);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Lỗi lấy trạng thái nộp phí:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Lấy lịch sử nộp phí của một hộ khẩu
const getHouseholdPaymentHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy thông tin hộ và chủ hộ để kiểm tra logic thời gian
    const householdQuery = await pool.query(
      `SELECT 
        h.household_id,
        h.date_created,
        h.status as household_status,
        r.status as resident_status,
        r.temp_start_date,
        r.temp_end_date
       FROM households h
       LEFT JOIN residents r ON h.head_of_household_id = r.resident_id
       WHERE h.household_id = $1`,
      [id]
    );

    if (householdQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hộ khẩu"
      });
    }

    const household = householdQuery.rows[0];

    // Lấy tất cả khoản thu phù hợp với thời gian của hộ
    const query = `
      SELECT 
        f.fee_id,
        f.fee_name,
        f.fee_type,
        f.start_date,
        f.end_date,
        f.amount as required_amount,
        COALESCE(ph.amount_paid, 0) as paid_amount,
        ph.payment_date,
        ph.notes,
        CASE 
          WHEN ph.payment_id IS NOT NULL THEN 'paid'
          WHEN f.fee_type = 'Voluntary' AND ph.payment_id IS NULL THEN 'optional'
          ELSE 'owing'
        END as status
      FROM fees f
      LEFT JOIN payment_history ph ON f.fee_id = ph.fee_id AND ph.household_id = $1
      WHERE (
        -- Hộ thường trú: chỉ hiển thị phí bắt đầu sau ngày hộ chuyển đến
        ($2 = 'Active' AND $3 = 'Permanent' AND f.start_date >= $4::DATE)
        OR
        -- Hộ tạm trú: chỉ hiển thị phí trong khoảng thời gian tạm trú
        ($3 = 'Temporary' 
         AND $5::DATE IS NOT NULL 
         AND $6::DATE IS NOT NULL
         AND f.start_date <= $6::DATE
         AND (f.end_date IS NULL OR f.end_date >= $5::DATE))
      )
      ORDER BY f.start_date DESC
    `;

    const result = await pool.query(query, [
      id,
      household.household_status,
      household.resident_status,
      household.date_created,
      household.temp_start_date,
      household.temp_end_date
    ]);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Lỗi lấy lịch sử nộp phí:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Lấy danh sách nhân khẩu của một hộ
const getHouseholdResidents = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        r.resident_id,
        CONCAT(r.first_name, ' ', r.last_name) as full_name,
        r.dob,
        r.gender,
        r.relationship_to_head,
        r.status as residence_status,
        r.temp_start_date,
        r.temp_end_date,
        ta.destination_address as absence_destination,
        ta.start_date as absence_start_date,
        ta.end_date as absence_end_date
      FROM residents r
      LEFT JOIN temporary_absences ta ON r.resident_id = ta.resident_id
      WHERE r.household_id = $1
      ORDER BY 
        CASE WHEN r.relationship_to_head = 'Chủ hộ' THEN 0 ELSE 1 END,
        r.resident_id ASC
    `;

    const result = await pool.query(query, [id]);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách nhân khẩu:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Tạo record thanh toán mới
const createPayment = async (req, res) => {
  try {
    const { fee_id, household_id, amount_paid, notes } = req.body;

    // Lấy user_id từ token (giả sử đã verify token)
    const collected_by_user_id = req.user?.userId || 1;

    if (!fee_id || !household_id || !amount_paid) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc (fee_id, household_id, amount_paid)"
      });
    }

    // Kiểm tra xem đã có record thanh toán chưa
    const existingPayment = await pool.query(
      `SELECT payment_id FROM payment_history 
       WHERE fee_id = $1 AND household_id = $2`,
      [fee_id, household_id]
    );

    if (existingPayment.rows.length > 0) {
      // Update số tiền nếu đã có record
      const updateQuery = `
        UPDATE payment_history 
        SET amount_paid = amount_paid + $1, 
            payment_date = CURRENT_TIMESTAMP,
            notes = COALESCE($2, notes)
        WHERE fee_id = $3 AND household_id = $4
        RETURNING *
      `;
      const result = await pool.query(updateQuery, [
        amount_paid, notes, fee_id, household_id
      ]);

      return res.status(200).json({
        success: true,
        message: "Cập nhật thanh toán thành công",
        data: result.rows[0]
      });
    }

    // Insert mới nếu chưa có
    const insertQuery = `
      INSERT INTO payment_history (fee_id, household_id, amount_paid, collected_by_user_id, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      fee_id, household_id, amount_paid, collected_by_user_id, notes
    ]);

    res.status(201).json({
      success: true,
      message: "Tạo thanh toán thành công",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Lỗi tạo thanh toán:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Tạo khoản thu mới
const createFee = async (req, res) => {
  try {
    const { fee_name, fee_type, amount, start_date, end_date } = req.body;

    if (!fee_name || !fee_type || !start_date) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc (fee_name, fee_type, start_date)"
      });
    }

    const query = `
      INSERT INTO fees (fee_name, fee_type, amount, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(query, [
      fee_name, fee_type, amount || null, start_date, end_date || null
    ]);

    res.status(201).json({
      success: true,
      message: "Tạo khoản thu thành công",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Lỗi tạo khoản thu:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Xóa khoản thu
const deleteFee = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query("BEGIN");

    // Xóa payment history liên quan trước
    await client.query("DELETE FROM payment_history WHERE fee_id = $1", [id]);

    // Xóa fee
    const result = await client.query(
      "DELETE FROM fees WHERE fee_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khoản thu"
      });
    }

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Xóa khoản thu thành công"
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi xóa khoản thu:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  } finally {
    client.release();
  }
};

// Lấy thống kê tổng hợp tất cả khoản thu
const getOverallStatistics = async (req, res) => {
  try {
    // Tổng tiền đã thu (tất cả khoản thu)
    const totalPaidQuery = await pool.query(
      `SELECT COALESCE(SUM(amount_paid), 0) as total_paid FROM payment_history`
    );
    const totalPaid = parseInt(totalPaidQuery.rows[0].total_paid);

    // Tổng tiền dự kiến (tính cho từng khoản phí bắt buộc với số hộ phù hợp)
    const expectedQuery = await pool.query(
      `SELECT COALESCE(SUM(fee_expected), 0) as expected_total
       FROM (
         SELECT 
           f.fee_id,
           f.amount * COUNT(DISTINCT h.household_id) as fee_expected
         FROM fees f
         CROSS JOIN households h
         LEFT JOIN residents r ON h.head_of_household_id = r.resident_id
         WHERE f.fee_type = 'Mandatory' 
           AND f.amount IS NOT NULL
           AND h.status IN ('Active', 'Temporary')
           AND (
             -- Hộ thường trú: chỉ tính nếu fee bắt đầu sau ngày hộ chuyển đến
             (h.status = 'Active' AND r.status = 'Permanent' AND f.start_date >= h.date_created)
             OR
             -- Hộ tạm trú: chỉ tính nếu fee nằm trong khoảng thời gian tạm trú
             (r.status = 'Temporary' 
              AND r.temp_start_date IS NOT NULL 
              AND r.temp_end_date IS NOT NULL
              AND f.start_date <= r.temp_end_date
              AND (f.end_date IS NULL OR f.end_date >= r.temp_start_date))
           )
         GROUP BY f.fee_id, f.amount
       ) as fee_calculations`
    );
    const expectedTotal = parseInt(expectedQuery.rows[0].expected_total) || 0;

    // Tổng số hộ khẩu (bao gồm cả Active và Temporary)
    const totalHouseholdsQuery = await pool.query(
      "SELECT COUNT(*) as total FROM households WHERE status IN ('Active', 'Temporary')"
    );
    const totalHouseholds = parseInt(totalHouseholdsQuery.rows[0].total);

    // Số khoản thu đang hoạt động
    const activeFeesQuery = await pool.query(
      "SELECT COUNT(*) as count FROM fees WHERE end_date >= CURRENT_DATE OR end_date IS NULL"
    );
    const activeFees = parseInt(activeFeesQuery.rows[0].count);

    res.status(200).json({
      success: true,
      data: {
        total_paid: totalPaid,
        expected_total: expectedTotal,
        total_households: totalHouseholds,
        active_fees: activeFees
      }
    });
  } catch (error) {
    console.error("Lỗi lấy thống kê tổng hợp:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Lấy danh sách tất cả hộ khẩu với tóm tắt thanh toán
const getAllHouseholdsWithPaymentSummary = async (req, res) => {
  try {
    const query = `
      WITH household_payments AS (
        SELECT 
          household_id,
          SUM(amount_paid) as total_paid
        FROM payment_history
        GROUP BY household_id
      ),
      household_members AS (
        SELECT 
          household_id,
          COUNT(*) as member_count
        FROM residents
        GROUP BY household_id
      ),
      unpaid_mandatory AS (
        SELECT 
          h.household_id,
          COUNT(f.fee_id) as unpaid_count
        FROM households h
        CROSS JOIN fees f
        LEFT JOIN residents r ON h.head_of_household_id = r.resident_id
        LEFT JOIN payment_history ph ON ph.fee_id = f.fee_id AND ph.household_id = h.household_id
        WHERE f.fee_type = 'Mandatory' 
          AND ph.payment_id IS NULL
          AND h.status IN ('Active', 'Temporary')
          AND (
            -- Hộ thường trú: chỉ tính phí nếu fee bắt đầu sau ngày hộ chuyển đến
            (h.status = 'Active' AND r.status = 'Permanent' AND f.start_date >= h.date_created)
            OR
            -- Hộ tạm trú: chỉ tính phí nếu fee nằm trong khoảng thời gian tạm trú
            (r.status = 'Temporary' 
             AND r.temp_start_date IS NOT NULL 
             AND r.temp_end_date IS NOT NULL
             AND f.start_date <= r.temp_end_date
             AND (f.end_date IS NULL OR f.end_date >= r.temp_start_date))
          )
        GROUP BY h.household_id
      )
      SELECT 
        h.household_id,
        h.household_code,
        h.address,
        h.date_created,
        h.status as household_status,
        r.first_name,
        r.last_name,
        r.status as resident_status,
        r.temp_start_date,
        r.temp_end_date,
        CONCAT(r.first_name, ' ', r.last_name) as owner_name,
        COALESCE(hm.member_count, 0) as member_count,
        COALESCE(hp.total_paid, 0) as total_paid,
        COALESCE(um.unpaid_count, 0) as unpaid_mandatory_fees,
        CASE 
          WHEN COALESCE(um.unpaid_count, 0) > 0 THEN 'owing'
          ELSE 'paid'
        END as status
      FROM households h
      LEFT JOIN residents r ON h.head_of_household_id = r.resident_id
      LEFT JOIN household_payments hp ON h.household_id = hp.household_id
      LEFT JOIN household_members hm ON h.household_id = hm.household_id
      LEFT JOIN unpaid_mandatory um ON h.household_id = um.household_id
      WHERE h.status IN ('Active', 'Temporary')
      ORDER BY h.household_code ASC
    `;

    const result = await pool.query(query);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách hộ khẩu:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

module.exports = {
  getAllFees,
  getFeeStatistics,
  getHouseholdPaymentStatus,
  getHouseholdPaymentHistory,
  getHouseholdResidents,
  createPayment,
  createFee,
  deleteFee,
  getOverallStatistics,
  getAllHouseholdsWithPaymentSummary
};
