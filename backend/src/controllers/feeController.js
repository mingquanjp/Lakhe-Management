const pool = require('../config/database');

/* 
Tạo khoản thu mới 
POST /api/fees
 */
const createFee = async (req, res) => {
  const client = await pool.connect();
  try {
    const { fee_name, fee_type, amount, start_date, end_date } = req.body;
    const user_id = req.user?.user_id || req.user?.userId || 1;

    // Validation
    if (!fee_name || !fee_type || !start_date) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: fee_name, fee_type, start_date'
      });
    }

    // Kiểm tra fee_type hợp lệ
    if (!['Mandatory', 'Voluntary'].includes(fee_type)) {
      return res.status(400).json({
        success: false,
        message: 'fee_type phải là "Mandatory" hoặc "Voluntary"'
      });
    }

    // Nếu là Mandatory thì phải có amount
    if (fee_type === 'Mandatory' && !amount) {
      return res.status(400).json({
        success: false,
        message: 'Khoản thu bắt buộc phải có số tiền (amount)'
      });
    }

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO fees (fee_name, fee_type, amount, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [fee_name, fee_type, amount, start_date, end_date]
    );

    // GHI LOG VÀO change_history
    await client.query(
      `INSERT INTO change_history (change_date, change_type, changed_by_user_id, fee_id)
       VALUES (NOW(), 'CreateFee', $1, $2)`,
      [user_id, result.rows[0].fee_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Tạo khoản thu thành công',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating fee:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo khoản thu',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Lấy danh sách tất cả khoản thu
 * GET /api/fees
 */
const getAllFees = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        fee_id,
        fee_name,
        fee_type,
        amount,
        start_date,
        end_date,
        (SELECT COUNT(*) FROM payment_history WHERE fee_id = fees.fee_id) as total_payments,
        (SELECT COALESCE(SUM(amount_paid), 0) FROM payment_history WHERE fee_id = fees.fee_id) as total_collected,
        (SELECT COUNT(*) FROM households WHERE status = 'Active') as total_households
       FROM fees
       WHERE deleted_at IS NULL
       ORDER BY start_date DESC`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting fees:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách khoản thu',
      error: error.message
    });
  }
};

/**
 * Lấy chi tiết một khoản thu
 * GET /api/fees/:feeId
 */
const getFeeById = async (req, res) => {
  try {
    const { feeId } = req.params;

    const result = await pool.query(
      `SELECT 
        fee_id,
        fee_name,
        fee_type,
        amount,
        start_date,
        end_date
       FROM fees
       WHERE fee_id = $1 AND deleted_at IS NULL`,
      [feeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khoản thu'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting fee:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin khoản thu',
      error: error.message
    });
  }
};

/**
 * Cập nhật khoản thu 
 * PUT /api/fees/:feeId
 */
const updateFee = async (req, res) => {
  const client = await pool.connect();
  try {
    const { feeId } = req.params;
    const { fee_name, fee_type, amount, start_date, end_date } = req.body;
    const user_id = req.user?.user_id || req.user?.userId || 1;

    // Kiểm tra khoản thu có tồn tại không
    const checkFee = await client.query('SELECT * FROM fees WHERE fee_id = $1 AND deleted_at IS NULL', [feeId]);

    if (checkFee.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khoản thu'
      });
    }

    // Validation fee_type nếu có cập nhật
    if (fee_type && !['Mandatory', 'Voluntary'].includes(fee_type)) {
      return res.status(400).json({
        success: false,
        message: 'fee_type phải là "Mandatory" hoặc "Voluntary"'
      });
    }

    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE fees
       SET fee_name = COALESCE($1, fee_name),
           fee_type = COALESCE($2, fee_type),
           amount = COALESCE($3, amount),
           start_date = COALESCE($4, start_date),
           end_date = COALESCE($5, end_date)
       WHERE fee_id = $6
       RETURNING *`,
      [fee_name, fee_type, amount, start_date, end_date, feeId]
    );

    // GHI LOG VÀO change_history
    await client.query(
      `INSERT INTO change_history (change_date, change_type, changed_by_user_id, fee_id)
       VALUES (NOW(), 'UpdateFee', $1, $2)`,
      [user_id, feeId]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Cập nhật khoản thu thành công',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating fee:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật khoản thu',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Xóa khoản thu 
 * DELETE /api/fees/:feeId
 */
const deleteFee = async (req, res) => {
  const client = await pool.connect();
  try {
    const { feeId, id } = req.params;
    const feeIdToDelete = feeId || id;
    const user_id = req.user?.user_id || req.user?.userId || 1;

    await client.query("BEGIN");

    // Xóa payment history liên quan trước
    await client.query("DELETE FROM payment_history WHERE fee_id = $1", [feeIdToDelete]);

    // Xóa fee
    const result = await client.query(
      "DELETE FROM fees WHERE fee_id = $1 RETURNING *",
      [feeIdToDelete]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khoản thu'
      });
    }

    // GHI LOG VÀO change_history
    await client.query(
      `INSERT INTO change_history (change_date, change_type, changed_by_user_id,fee_id)
       VALUES (NOW(), 'DeleteFee', $1, $2)`,
      [user_id, feeIdToDelete],
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: 'Xóa khoản thu thành công',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error('Error deleting fee:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa khoản thu',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Ghi nhận thanh toán
 * POST /api/fees/payments
 */
const createPayment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { fee_id, household_id, amount_paid, notes, payment_date } = req.body;
    const collected_by_user_id = req.user?.user_id || req.user?.userId || 1;

    // Validation
    if (!fee_id || !household_id || !amount_paid) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: fee_id, household_id, amount_paid'
      });
    }

    // Convert amount_paid thành integer
    const amountInteger = Math.round(parseFloat(amount_paid));

    // Xử lý payment_date: nếu không có thì dùng ngày hiện tại
    const paymentDateValue = payment_date || new Date().toISOString().split('T')[0];

    await client.query('BEGIN');

    // Kiểm tra khoản thu có tồn tại không
    const feeCheck = await client.query('SELECT * FROM fees WHERE fee_id = $1', [fee_id]);
    if (feeCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khoản thu'
      });
    }

    // Kiểm tra hộ khẩu có tồn tại không
    const householdCheck = await client.query('SELECT * FROM households WHERE household_id = $1', [household_id]);
    if (householdCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hộ khẩu'
      });
    }

    // Kiểm tra xem đã có record thanh toán chưa
    const existingPayment = await client.query(
      `SELECT payment_id FROM payment_history 
       WHERE fee_id = $1 AND household_id = $2`,
      [fee_id, household_id]
    );

    if (existingPayment.rows.length > 0) {
      // Update số tiền nếu đã có record
      const updateQuery = `
        UPDATE payment_history 
        SET amount_paid = amount_paid + $1, 
            payment_date = $2::date, 
            notes = COALESCE($3, notes),
            collected_by_user_id = $4
        WHERE fee_id = $5 AND household_id = $6
        RETURNING *
      `;
      const result = await client.query(updateQuery, [
        amountInteger, paymentDateValue, notes, collected_by_user_id, fee_id, household_id
      ]);


      await client.query('COMMIT');

      return res.status(200).json({
        success: true,
        message: "Cập nhật thanh toán thành công",
        data: result.rows[0]
      });
    }

    // INSERT thanh toán mới
    const result = await client.query(
      `INSERT INTO payment_history (fee_id, household_id, amount_paid, collected_by_user_id, notes, payment_date)
       VALUES ($1, $2, $3, $4, $5, $6::date)
       RETURNING *`,
      [fee_id, household_id, amountInteger, collected_by_user_id, notes, paymentDateValue]
    );


    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Ghi nhận thanh toán thành công',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi ghi nhận thanh toán',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Cập nhật thông tin thanh toán
 * PUT /api/fees/payments/:paymentId
 */
const updatePayment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { paymentId } = req.params;
    const { amount_paid, notes, payment_date } = req.body;
    const updated_by_user_id = req.user?.user_id || req.user?.userId || 1;

    // Validation
    if (!amount_paid || amount_paid <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền phải lớn hơn 0'
      });
    }

    // Kiểm tra payment có tồn tại không
    const checkPayment = await client.query(
      'SELECT * FROM payment_history WHERE payment_id = $1',
      [paymentId]
    );

    if (checkPayment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bản ghi thanh toán'
      });
    }

    const household_id = checkPayment.rows[0].household_id;
    const amountInteger = Math.round(parseFloat(amount_paid));
    const paymentDateValue = payment_date || new Date().toISOString().split('T')[0];

    await client.query('BEGIN');

    // Update payment
    const result = await client.query(
      `UPDATE payment_history 
       SET amount_paid = $1,
           notes = $2,
           payment_date = $3::date,
           collected_by_user_id = $4
       WHERE payment_id = $5
       RETURNING *`,
      [amountInteger, notes, paymentDateValue, updated_by_user_id, paymentId]
    );



    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Cập nhật thanh toán thành công',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật thanh toán',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Xóa thanh toán (chuyển về trạng thái chưa nộp)
 * DELETE /api/fees/payments/:paymentId
 */
const deletePayment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { paymentId } = req.params;
    const user_id = req.user?.user_id || req.user?.userId || 1;

    // Kiểm tra payment có tồn tại không
    const checkPayment = await client.query(
      'SELECT * FROM payment_history WHERE payment_id = $1',
      [paymentId]
    );

    if (checkPayment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bản ghi thanh toán'
      });
    }

    const household_id = checkPayment.rows[0].household_id;

    await client.query('BEGIN');

    // Xóa payment
    const result = await client.query(
      'DELETE FROM payment_history WHERE payment_id = $1 RETURNING *',
      [paymentId]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Xóa thanh toán thành công. Hộ đã được chuyển về trạng thái chưa nộp.',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa thanh toán',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Lấy danh sách hộ CHƯA đóng tiền cho khoản thu
 * GET /api/fees/:feeId/unpaid-households
 */
const getUnpaidHouseholds = async (req, res) => {
  try {
    const { feeId } = req.params;

    // Kiểm tra khoản thu có tồn tại không
    const feeCheck = await pool.query('SELECT * FROM fees WHERE fee_id = $1', [feeId]);
    if (feeCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khoản thu'
      });
    }

    const result = await pool.query(
      `SELECT 
        h.household_id,
        h.household_code,
        h.address,
        CONCAT(r.first_name, ' ', r.last_name) as head_name
       FROM households h
       LEFT JOIN residents r ON h.head_of_household_id = r.resident_id
       WHERE h.status = 'Active'
         AND h.household_id NOT IN (
           SELECT household_id 
           FROM payment_history 
           WHERE fee_id = $1
         )
       ORDER BY h.household_code`,
      [feeId]
    );

    res.json({
      success: true,
      total: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting unpaid households:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách hộ chưa đóng',
      error: error.message
    });
  }
};

/**
 * Tổng hợp thống kê thu của một khoản thu
 * GET /api/fees/:feeId/summary
 */
const getFeeSummary = async (req, res) => {
  try {
    const { feeId } = req.params;

    // Lấy thông tin khoản thu
    const feeInfo = await pool.query('SELECT * FROM fees WHERE fee_id = $1', [feeId]);
    if (feeInfo.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khoản thu'
      });
    }

    const fee = feeInfo.rows[0];

    // Tổng số hộ active
    const totalHouseholds = await pool.query(
      `SELECT COUNT(*) FROM households WHERE status = 'Active'`
    );

    // Số hộ đã đóng
    const paidHouseholds = await pool.query(
      `SELECT COUNT(DISTINCT household_id) FROM payment_history WHERE fee_id = $1`,
      [feeId]
    );

    // Tổng tiền thu được
    const totalCollected = await pool.query(
      `SELECT COALESCE(SUM(amount_paid), 0) as total FROM payment_history WHERE fee_id = $1`,
      [feeId]
    );

    const total = parseInt(totalHouseholds.rows[0].count);
    const paid = parseInt(paidHouseholds.rows[0].count);
    const unpaid = total - paid;
    const collected = parseFloat(totalCollected.rows[0].total);
    const expected = fee.amount ? fee.amount * total : null;
    const collectionRate = total > 0 ? ((paid / total) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        fee_id: fee.fee_id,
        fee_name: fee.fee_name,
        fee_type: fee.fee_type,
        amount_per_household: fee.amount,
        start_date: fee.start_date,
        end_date: fee.end_date,
        total_households: total,
        paid_households: paid,
        unpaid_households: unpaid,
        total_collected: collected,
        expected_total: expected,
        collection_rate: `${collectionRate}%`
      }
    });
  } catch (error) {
    console.error('Error getting fee summary:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy tổng hợp khoản thu',
      error: error.message
    });
  }
};

/**
 * Lấy lịch sử thanh toán của một hộ khẩu
 * GET /api/payments/household/:householdId hoặc /api/fees/households/:id/payments
 */
const getHouseholdPaymentHistory = async (req, res) => {
  try {
    const { householdId, id } = req.params;
    const householdIdToUse = householdId || id;

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
      [householdIdToUse]
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
        ph.payment_id,
        ph.payment_date,
        ph.notes,
        u.full_name as collected_by,
        CASE 
          WHEN ph.payment_id IS NOT NULL THEN 'paid'
          WHEN f.fee_type = 'Voluntary' AND ph.payment_id IS NULL THEN 'optional'
          ELSE 'owing'
        END as status
      FROM fees f
      LEFT JOIN payment_history ph ON f.fee_id = ph.fee_id AND ph.household_id = $1
      LEFT JOIN users u ON ph.collected_by_user_id = u.user_id
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
      householdIdToUse,
      household.household_status,
      household.resident_status,
      household.date_created,
      household.temp_start_date,
      household.temp_end_date
    ]);

    res.json({
      success: true,
      total: result.rows.length,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting household payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy lịch sử thanh toán',
      error: error.message
    });
  }
};

/**
 * Lấy TOÀN BỘ danh sách hộ với thông tin thanh toán cho một khoản thu
 * GET /api/fees/:feeId/all-households
 * CHÚ Ý: Áp dụng logic temporal - chỉ lấy các hộ đủ điều kiện nộp phí
 */
const getAllHouseholdsForFee = async (req, res) => {
  try {
    const { feeId } = req.params;

    // Kiểm tra khoản thu có tồn tại không và lấy thông tin fee
    const feeCheck = await pool.query('SELECT * FROM fees WHERE fee_id = $1', [feeId]);
    if (feeCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khoản thu'
      });
    }

    const fee = feeCheck.rows[0];
    const result = await pool.query(
      `SELECT 
        h.household_id,
        h.household_code,
        h.address,
        CONCAT(r.first_name, ' ', r.last_name) as head_name,
        (SELECT COUNT(*) FROM residents WHERE household_id = h.household_id AND status = 'Permanent') as member_count,
        ph.payment_id,
        ph.amount_paid,
        ph.payment_date,
        ph.notes,
        CASE 
          WHEN ph.payment_id IS NOT NULL THEN 'Đã nộp'
          ELSE 'Chưa nộp'
        END as payment_status
       FROM households h
       LEFT JOIN residents r ON h.head_of_household_id = r.resident_id
       LEFT JOIN payment_history ph ON h.household_id = ph.household_id AND ph.fee_id = $1
       WHERE h.status IN ('Active', 'Temporary')
         AND (
           -- Hộ thường trú: chỉ tính nếu fee bắt đầu sau ngày hộ chuyển đến
           (h.status = 'Active' AND r.status = 'Permanent' AND $2::DATE >= h.date_created)
           OR
           -- Hộ tạm trú: chỉ tính nếu fee nằm trong khoảng thời gian tạm trú
           (h.status = 'Temporary' 
            AND r.status = 'Temporary'
            AND r.temp_start_date IS NOT NULL 
            AND r.temp_end_date IS NOT NULL
            AND $2::DATE <= r.temp_end_date
            AND ($3::DATE IS NULL OR $3::DATE >= r.temp_start_date))
         )
       ORDER BY h.household_code`,
      [feeId, fee.start_date, fee.end_date]
    );

    res.json({
      success: true,
      total: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting all households for fee:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách hộ',
      error: error.message
    });
  }
};

/**
 * Lấy thống kê cho một khoản thu cụ thể (với logic temporal)
 * GET /api/fees/:id/statistics
 */
const getFeeStatistics = async (req, res) => {
  try {
    const { feeId } = req.params;
    const id = feeId; // Alias để tương thích code bên dưới

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
           (h.status = 'Temporary' 
            AND r.status = 'Temporary'
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

    // Số hộ đã nộp (chỉ đếm các hộ đủ điều kiện theo temporal logic)
    const paidHouseholdsQuery = await pool.query(
      `SELECT COUNT(DISTINCT ph.household_id) as paid_count 
       FROM payment_history ph
       INNER JOIN households h ON ph.household_id = h.household_id
       LEFT JOIN residents r ON h.head_of_household_id = r.resident_id
       WHERE ph.fee_id = $1
         AND h.status IN ('Active', 'Temporary')
         AND (
           -- Hộ thường trú: chỉ tính nếu fee bắt đầu sau ngày hộ chuyển đến
           (h.status = 'Active' AND r.status = 'Permanent' AND $2::DATE >= h.date_created)
           OR
           -- Hộ tạm trú: chỉ tính nếu fee nằm trong khoảng thời gian tạm trú
           (h.status = 'Temporary' 
            AND r.status = 'Temporary'
            AND r.temp_start_date IS NOT NULL 
            AND r.temp_end_date IS NOT NULL
            AND $2::DATE <= r.temp_end_date
            AND ($3::DATE IS NULL OR $3::DATE >= r.temp_start_date))
         )`,
      [id, fee.start_date, fee.end_date]
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

/**
 * Lấy danh sách hộ với trạng thái nộp phí cho một khoản thu
 * GET /api/fees/:id/households
 */
const getHouseholdPaymentStatus = async (req, res) => {
  try {
    const { feeId } = req.params;
    const id = feeId; // Alias để tương thích code bên dưới

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
          (h.status = 'Temporary' 
           AND r.status = 'Temporary'
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

/**
 * Lấy danh sách nhân khẩu của một hộ
 * GET /api/fees/households/:id/residents
 */
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

/**
 * Lấy thống kê tổng hợp tất cả khoản thu
 * GET /api/fees/overall-statistics
 */
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
             -- Hộ tạm trú: chỉ tính nếu fee nằm trong khoảng thời gian tạm trú của resident
             (h.status = 'Temporary' 
              AND r.status = 'Temporary'
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

/**
 * Lấy danh sách tất cả hộ khẩu với tóm tắt thanh toán
 * GET /api/fees/all-households
 */
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
            -- Hộ tạm trú: chỉ tính nếu fee nằm trong khoảng thời gian tạm trú
            (h.status = 'Temporary' 
             AND r.status = 'Temporary'
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
  // Fee management
  createFee,
  getAllFees,
  getFeeById,
  updateFee,
  deleteFee,

  // Payment management
  createPayment,
  updatePayment,
  deletePayment,
  getUnpaidHouseholds,
  getFeeSummary,
  getHouseholdPaymentHistory,
  getAllHouseholdsForFee,

  // Extended statistics & queries
  getFeeStatistics,
  getHouseholdPaymentStatus,
  getHouseholdResidents,
  getOverallStatistics,
  getAllHouseholdsWithPaymentSummary
};