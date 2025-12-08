const bcrypt = require('bcryptjs');
const pool = require('../config/database');

/**
 * Create a new user with hashed password
 * Usage: node src/utils/createUser.js
 */
async function createUser() {
  try {
    // User data to create
    const username = process.argv[2] || 'nhatminhjp';
    const password = process.argv[3] || 'Minh@123';
    const full_name = process.argv[4] || 'Nguyễn-Nhật-Minh';
    const role = process.argv[5] || 'admin';

    // Validate role
    if (!['admin', 'staff'].includes(role)) {
      console.error('Role phải là "admin" hoặc "staff"');
      process.exit(1);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into database
    const result = await pool.query(
      'INSERT INTO users (username, password, full_name, role) VALUES ($1, $2, $3, $4) RETURNING user_id, username, full_name, role',
      [username, hashedPassword, full_name, role]
    );

    console.log('✅ User created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('User ID:', result.rows[0].user_id);
    console.log('Username:', result.rows[0].username);
    console.log('Full Name:', result.rows[0].full_name);
    console.log('Role:', result.rows[0].role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    process.exit(0);
  } catch (error) {
    if (error.code === '23505') {
      console.error('Username đã tồn tại!');
    } else {
      console.error('Error creating user:', error.message);
    }
    process.exit(1);
  }
}

// Show usage if --help flag is provided
if (process.argv.includes('--help')) {
  console.log('');
  console.log('Usage: node src/utils/createUser.js [username] [password] [full_name] [role]');
  console.log('');
  console.log('Arguments:');
  console.log('  username   - Tên đăng nhập (default: nhatminhjp)');
  console.log('  password   - Mật khẩu (default: Minh@123)');
  console.log('  full_name  - Họ và tên (default: Nguyễn-Nhật-Minh)');
  console.log('  role       - Vai trò: admin hoặc staff (default: admin)');
  console.log('');
  console.log('Examples:');
  console.log('  node src/utils/createUser.js');
  console.log('  node src/utils/createUser.js admin mypassword "Nguyen Van A" admin');
  console.log('  node src/utils/createUser.js staff1 staff123 "Nguyen Thi B" staff');
  console.log('');
  process.exit(0);
}

createUser();
