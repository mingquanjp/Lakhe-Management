const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login controller
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt for:', username);

    if (!username || !password) {
      console.log('Missing username or password');
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu'
      });
    }

    const result = await pool.query(
      'SELECT user_id, username, password, full_name, role FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      console.log('User not found:', username);
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    const user = result.rows[0];
    console.log('User found:', user.username);

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        full_name: user.full_name,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        full_name: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi đăng nhập. Vui lòng thử lại sau.'
    });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_id, username, full_name, role 
       FROM users 
       ORDER BY user_id DESC`
    );

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách tài khoản'
    });
  }
};

// Create new user (admin only)
const createUser = async (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;

    // Validate input
    if (!username || !password || !full_name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin'
      });
    }

    if (!['admin', 'staff'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Vai trò không hợp lệ'
      });
    }

    // Check if username exists
    const existingUser = await pool.query(
      'SELECT user_id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập đã tồn tại'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (username, password, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, username, full_name, role`,
      [username, hashedPassword, full_name, role]
    );

    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản thành công',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo tài khoản'
    });
  }
};

// Update user (admin only)
const updateUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { full_name, role, password } = req.body;

    if (!full_name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin'
      });
    }

    if (!['admin', 'staff'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Vai trò không hợp lệ'
      });
    }

    let query;
    let params;

    if (password) {
      // Update with new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      query = `UPDATE users 
               SET full_name = $1, role = $2, password = $3
               WHERE user_id = $4
               RETURNING user_id, username, full_name, role`;
      params = [full_name, role, hashedPassword, user_id];
    } else {
      // Update without password
      query = `UPDATE users 
               SET full_name = $1, role = $2
               WHERE user_id = $3
               RETURNING user_id, username, full_name, role`;
      params = [full_name, role, user_id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật tài khoản thành công',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật tài khoản'
    });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id } = req.params;

    // Prevent deleting yourself
    if (parseInt(user_id) === req.user.user_id) {
      client.release();
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa tài khoản của chính mình'
      });
    }

    await client.query('BEGIN');

    // Check if user exists
    const checkUser = await client.query(
      'SELECT user_id FROM users WHERE user_id = $1',
      [user_id]
    );

    if (checkUser.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản'
      });
    }

    // Reassign all change_history records to the current admin user
    await client.query(
      'UPDATE change_history SET changed_by_user_id = $1 WHERE changed_by_user_id = $2',
      [req.user.user_id, user_id]
    );

    // Reassign all payment_history records to the current admin user
    await client.query(
      'UPDATE payment_history SET collected_by_user_id = $1 WHERE collected_by_user_id = $2',
      [req.user.user_id, user_id]
    );

    // Delete the user
    await client.query(
      'DELETE FROM users WHERE user_id = $1',
      [user_id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Xóa tài khoản thành công'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa tài khoản: ' + error.message
    });
  } finally {
    client.release();
  }
};

module.exports = {
  login,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};
