const pool = require('../config/database');

/* 
Tạo khoản thu mới 
POST /api/fees
 */
const createFee = async (req, res) => {
  try {
    const { fee_name, fee_type, amount, start_date, end_date } = req.body;

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

    const result = await pool.query(
      `INSERT INTO fees (fee_name, fee_type, amount, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [fee_name, fee_type, amount, start_date, end_date]
    );

    res.status(201).json({
      success: true,
      message: 'Tạo khoản thu thành công',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating fee:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo khoản thu',
      error: error.message
    });
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
       WHERE fee_id = $1`,
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
  try {
    const { feeId } = req.params;
    const { fee_name, fee_type, amount, start_date, end_date } = req.body;

    // Kiểm tra khoản thu có tồn tại không
    const checkFee = await pool.query('SELECT * FROM fees WHERE fee_id = $1', [feeId]);
    
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

    const result = await pool.query(
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

    res.json({
      success: true,
      message: 'Cập nhật khoản thu thành công',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating fee:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật khoản thu',
      error: error.message
    });
  }
};

/**
 * Xóa khoản thu 
 * DELETE /api/fees/:feeId
 */
const deleteFee = async (req, res) => {
  try {
    const { feeId } = req.params;

    // Kiểm tra có thanh toán nào liên quan không
    const paymentCheck = await pool.query(
      'SELECT COUNT(*) FROM payment_history WHERE fee_id = $1',
      [feeId]
    );

    if (parseInt(paymentCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa khoản thu đã có lịch sử thanh toán. Hãy xóa thanh toán trước.'
      });
    }

    const result = await pool.query(
      'DELETE FROM fees WHERE fee_id = $1 RETURNING *',
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
      message: 'Xóa khoản thu thành công',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting fee:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa khoản thu',
      error: error.message
    });
  }
};


/**
 * Ghi nhận thanh toán
 * POST /api/payments
 */
const createPayment = async (req, res) => {
  try {
    const { fee_id, household_id, amount_paid, notes } = req.body;
    const collected_by_user_id = req.user.user_id;
    
    // Validation
    if (!fee_id || !household_id || !amount_paid) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: fee_id, household_id, amount_paid'
      });
    }

    // THÊM: Convert amount_paid thành integer (loại bỏ phần thập phân)
    const amountInteger = Math.round(parseFloat(amount_paid));

    // Kiểm tra khoản thu có tồn tại không
    const feeCheck = await pool.query('SELECT * FROM fees WHERE fee_id = $1', [fee_id]);
    if (feeCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khoản thu'
      });
    }

    // Kiểm tra hộ khẩu có tồn tại không
    const householdCheck = await pool.query('SELECT * FROM households WHERE household_id = $1', [household_id]);
    if (householdCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hộ khẩu'
      });
    }

    const result = await pool.query(
      `INSERT INTO payment_history (fee_id, household_id, amount_paid, collected_by_user_id, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [fee_id, household_id, amountInteger, collected_by_user_id, notes] // SỬA: dùng amountInteger
    );

    res.status(201).json({
      success: true,
      message: 'Ghi nhận thanh toán thành công',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi ghi nhận thanh toán',
      error: error.message
    });
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
 * GET /api/payments/household/:householdId
 */
const getHouseholdPaymentHistory = async (req, res) => {
  try {
    const { householdId } = req.params;

    const result = await pool.query(
      `SELECT 
        ph.payment_id,
        ph.amount_paid,
        ph.payment_date,
        ph.notes,
        f.fee_name,
        f.fee_type,
        u.full_name as collected_by
       FROM payment_history ph
       JOIN fees f ON ph.fee_id = f.fee_id
       JOIN users u ON ph.collected_by_user_id = u.user_id
       WHERE ph.household_id = $1
       ORDER BY ph.payment_date DESC`,
      [householdId]
    );

    res.json({
      success: true,
      total: result.rows.length,
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
 */
const getAllHouseholdsForFee = async (req, res) => {
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
        CONCAT(r.first_name, ' ', r.last_name) as head_name,
        (SELECT COUNT(*) FROM residents WHERE household_id = h.household_id AND status = 'Permanent') as member_count,
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
       WHERE h.status = 'Active'
       ORDER BY h.household_code`,
      [feeId]
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

module.exports = {
  // Fee management
  createFee,
  getAllFees,
  getFeeById,
  updateFee,
  deleteFee,
  
  // Payment management
  createPayment,
  getUnpaidHouseholds,
  getFeeSummary,
  getHouseholdPaymentHistory,
  getAllHouseholdsForFee
};