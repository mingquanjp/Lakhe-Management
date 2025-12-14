const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login controller
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt for:', username);

    // Validate input
    if (!username || !password) {
      console.log('Missing username or password');
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu'
      });
    }

    // Find user by username
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

    // Generate JWT token
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

    // Return success response
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

module.exports = {
  login
};
