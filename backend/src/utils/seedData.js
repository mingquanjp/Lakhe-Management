const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function seedData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🚀 Bat dau seed du lieu...\n');

    // ===== 1. TAO USERS (Admin + Staff) =====
    console.log('👤 Tao users...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    const users = [
      ['admin', hashedPassword, 'Nguyen Van Admin', 'admin'],
      ['staff1', hashedPassword, 'Tran Thi Mai', 'staff'],
      ['staff2', hashedPassword, 'Le Van Binh', 'staff']
    ];

    for (const user of users) {
      await client.query(
        `INSERT INTO users (username, password, full_name, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (username) DO NOTHING`,
        user
      );
    }
    console.log('✅ Da tao 3 users (1 admin + 2 staff)\n');

    // ===== 2. TAO HO KHAU =====
    console.log('🏠 Tao ho khau...');
    const households = [
      ['HK001', 'So 12, Ngo 15, Duong Giai Phong'],
      ['HK002', 'So 8, Ngo 22, Duong Tran Dai Nghia'],
      ['HK003', 'So 5, Ngo 9, Duong Nguyen Trai'],
      ['HK004', 'So 20, Ngo 7, Duong Le Loi'],
      ['HK005', 'So 14, Ngo 3, Duong Hung Vuong'],
      ['HK006', 'So 30, Ngo 11, Duong Ba Trieu'],
      ['HK007', 'So 25, Ngo 18, Duong Hai Ba Trung'],
      ['HK008', 'So 7, Ngo 5, Duong Ly Thuong Kiet']
    ];

    for (const household of households) {
      await client.query(
        `INSERT INTO households (household_code, address, status, date_created)
         VALUES ($1, $2, 'Active', '2023-01-15')
         ON CONFLICT (household_code) DO NOTHING`,
        household
      );
    }
    console.log('✅ Da tao 8 ho khau\n');

    // ===== 3. TAO CU DAN (Chu ho + Thanh vien) =====
    console.log('👨‍👩‍👧‍👦 Tao cu dan...');
    
    // Chu ho
    const headResidents = [
      [1, 'Nguyen', 'Van Hung', '1975-03-20', 'Male', 'Chu ho'],
      [2, 'Tran', 'Thi Lan', '1980-06-15', 'Female', 'Chu ho'],
      [3, 'Le', 'Van Minh', '1978-11-10', 'Male', 'Chu ho'],
      [4, 'Pham', 'Thi Hoa', '1982-04-25', 'Female', 'Chu ho'],
      [5, 'Hoang', 'Van Nam', '1976-09-08', 'Male', 'Chu ho'],
      [6, 'Vu', 'Thi Thu', '1985-12-30', 'Female', 'Chu ho'],
      [7, 'Dang', 'Van Tuan', '1979-07-14', 'Male', 'Chu ho'],
      [8, 'Bui', 'Thi Nga', '1983-02-18', 'Female', 'Chu ho']
    ];

    for (const resident of headResidents) {
      const result = await client.query(
        `INSERT INTO residents (household_id, first_name, last_name, dob, gender, relationship_to_head, status, registration_date)
         VALUES ($1, $2, $3, $4, $5, $6, 'Permanent', '2023-01-15')
         RETURNING resident_id`,
        resident
      );

      // Gan lam chu ho
      if (result.rows.length > 0) {
        await client.query(
          `UPDATE households SET head_of_household_id = $1 WHERE household_id = $2`,
          [result.rows[0].resident_id, resident[0]]
        );
      }
    }

    // Thanh vien gia dinh (vo/chong, con)
    const familyMembers = [
      // Ho HK001
      [1, 'Nguyen', 'Thi Hue', '1977-05-12', 'Female', 'Vo'],
      [1, 'Nguyen', 'Van Anh', '2005-08-20', 'Male', 'Con trai'],
      [1, 'Nguyen', 'Thi Linh', '2010-03-15', 'Female', 'Con gai'],
      
      // Ho HK002
      [2, 'Tran', 'Van Cuong', '1978-09-05', 'Male', 'Chong'],
      [2, 'Tran', 'Thi Nhi', '2008-12-10', 'Female', 'Con gai'],
      
      // Ho HK003
      [3, 'Le', 'Thi Phuong', '1980-07-22', 'Female', 'Vo'],
      [3, 'Le', 'Van Khai', '2006-11-08', 'Male', 'Con trai'],
      [3, 'Le', 'Thi My', '2012-04-18', 'Female', 'Con gai'],
      
      // Ho HK004
      [4, 'Pham', 'Van Dong', '1981-01-30', 'Male', 'Chong'],
      
      // Ho HK005
      [5, 'Hoang', 'Thi Ly', '1978-10-15', 'Female', 'Vo'],
      [5, 'Hoang', 'Van Long', '2007-06-25', 'Male', 'Con trai'],
      
      // Ho HK006 (ho lon)
      [6, 'Vu', 'Van Hai', '1983-03-08', 'Male', 'Chong'],
      [6, 'Vu', 'Thi An', '2009-09-12', 'Female', 'Con gai'],
      [6, 'Vu', 'Van Bao', '2013-02-20', 'Male', 'Con trai'],
      [6, 'Vu', 'Thi Cuc', '2015-11-05', 'Female', 'Con gai'],
      
      // Ho HK007
      [7, 'Dang', 'Thi Huyen', '1981-08-28', 'Female', 'Vo'],
      [7, 'Dang', 'Van Duc', '2010-05-16', 'Male', 'Con trai'],
      
      // Ho HK008
      [8, 'Bui', 'Van Son', '2011-07-22', 'Male', 'Con trai']
    ];

    for (const member of familyMembers) {
      await client.query(
        `INSERT INTO residents (household_id, first_name, last_name, dob, gender, relationship_to_head, status, registration_date)
         VALUES ($1, $2, $3, $4, $5, $6, 'Permanent', '2023-01-15')`,
        member
      );
    }

    // Them 1 ho tam tru
    await client.query(
      `INSERT INTO households (household_code, address, status, date_created)
       VALUES ('HK009', 'So 40, Ngo 25, Duong Tran Hung Dao', 'Temporary', '2024-11-01')
       ON CONFLICT (household_code) DO NOTHING`
    );

    const tempResidentResult = await client.query(
      `INSERT INTO residents (
        household_id, first_name, last_name, dob, gender, relationship_to_head, 
        status, temp_home_address, temp_start_date, temp_end_date, temp_reason, registration_date
      )
       VALUES (9, 'Do', 'Van Tam', '1990-05-20', 'Male', 'Chu ho', 
               'Temporary', 'So 15, Ngo 8, Duong Le Duan, Ha Noi', 
               '2024-11-01', '2025-04-30', 'Cong tac lau dai', '2024-11-01')
       RETURNING resident_id`
    );

    await client.query(
      `UPDATE households SET head_of_household_id = $1 WHERE household_id = 9`,
      [tempResidentResult.rows[0].resident_id]
    );

    console.log('✅ Da tao 27 cu dan (8 chu ho thuong tru + 18 thanh vien + 1 ho tam tru)\n');

    // ===== 4. TAO KHOAN THU =====
    console.log('💰 Tao khoan thu...');
    const fees = [
      // Phi bat buoc
      ['Phi ve sinh thang 11/2024', 'Mandatory', 50000, '2024-11-01', '2024-11-30'],
      ['Phi ve sinh thang 12/2024', 'Mandatory', 50000, '2024-12-01', '2024-12-31'],
      ['Phi ve sinh thang 1/2025', 'Mandatory', 50000, '2025-01-01', '2025-01-31'],
      ['Phi bao ve quy 4/2024', 'Mandatory', 120000, '2024-10-01', '2024-12-31'],
      ['Phi quan ly chung cu quy 4/2024', 'Mandatory', 200000, '2024-10-01', '2024-12-31'],
      ['Phi giu xe thang 12/2024', 'Mandatory', 80000, '2024-12-01', '2024-12-31'],
      
      // Phi tu nguyen
      ['Ung ho Tet Trung thu cho tre em', 'Voluntary', null, '2024-08-15', '2024-09-15'],
      ['Quy tu thien bao lut mien Trung', 'Voluntary', null, '2024-10-01', '2024-11-30'],
      ['Ung ho Tet Nguyen Dan 2025', 'Voluntary', null, '2024-12-15', '2025-01-31']
    ];

    for (const fee of fees) {
      await client.query(
        `INSERT INTO fees (fee_name, fee_type, amount, start_date, end_date)
         VALUES ($1, $2, $3, $4, $5)`,
        fee
      );
    }
    console.log('✅ Da tao 9 khoan thu (6 bat buoc + 3 tu nguyen)\n');

    // ===== 5. TAO LICH SU THANH TOAN =====
    console.log('📝 Tao lich su thanh toan...');
    
    // Lay user_id cua staff
    const staffUsers = await client.query(`SELECT user_id FROM users WHERE role = 'staff' ORDER BY user_id LIMIT 2`);
    const staff1_id = staffUsers.rows[0].user_id;
    const staff2_id = staffUsers.rows[1].user_id;

    const payments = [
      // Phi ve sinh thang 11 (fee_id = 1) - hau het da dong
      [1, 1, 50000, staff1_id, '2024-11-05', null],
      [1, 2, 50000, staff1_id, '2024-11-06', null],
      [1, 3, 50000, staff2_id, '2024-11-07', null],
      [1, 4, 50000, staff2_id, '2024-11-08', null],
      [1, 5, 50000, staff1_id, '2024-11-09', null],
      [1, 6, 50000, staff1_id, '2024-11-10', null],
      [1, 7, 50000, staff2_id, '2024-11-12', null],
      // HK008 chua dong
      
      // Phi ve sinh thang 12 (fee_id = 2) - mot so da dong
      [2, 1, 50000, staff1_id, '2024-12-03', null],
      [2, 2, 50000, staff1_id, '2024-12-04', null],
      [2, 3, 50000, staff2_id, '2024-12-05', null],
      [2, 5, 50000, staff1_id, '2024-12-07', null],
      [2, 6, 50000, staff2_id, '2024-12-08', null],
      // HK004, HK007, HK008 chua dong
      
      // Phi bao ve quy 4 (fee_id = 4) - da dong mot nua
      [4, 1, 120000, staff2_id, '2024-10-15', null],
      [4, 2, 120000, staff2_id, '2024-10-16', null],
      [4, 4, 120000, staff1_id, '2024-10-20', null],
      [4, 6, 120000, staff1_id, '2024-10-22', null],
      
      // Phi quan ly chung cu quy 4 (fee_id = 5)
      [5, 1, 200000, staff1_id, '2024-10-10', null],
      [5, 3, 200000, staff2_id, '2024-10-12', null],
      [5, 5, 200000, staff1_id, '2024-10-15', null],
      
      // Phi giu xe thang 12 (fee_id = 6)
      [6, 1, 80000, staff1_id, '2024-12-02', null],
      [6, 2, 80000, staff1_id, '2024-12-03', null],
      [6, 4, 80000, staff2_id, '2024-12-06', null],
      
      // Ung ho Tet Trung thu (fee_id = 7) - tu nguyen
      [7, 1, 200000, staff1_id, '2024-08-20', 'Ung ho 200k'],
      [7, 2, 100000, staff1_id, '2024-08-22', 'Ung ho 100k'],
      [7, 3, 150000, staff2_id, '2024-08-25', null],
      [7, 5, 100000, staff2_id, '2024-09-01', null],
      
      // Quy tu thien bao lut (fee_id = 8)
      [8, 1, 500000, staff1_id, '2024-10-05', 'Dong gop tu thien'],
      [8, 2, 300000, staff1_id, '2024-10-06', null],
      [8, 3, 200000, staff2_id, '2024-10-08', null],
      [8, 6, 400000, staff2_id, '2024-10-10', null],
      
      // Ung ho Tet (fee_id = 9)
      [9, 1, 300000, staff1_id, '2024-12-20', null],
      [9, 3, 200000, staff2_id, '2024-12-22', null]
    ];

    for (const payment of payments) {
      await client.query(
        `INSERT INTO payment_history (fee_id, household_id, amount_paid, collected_by_user_id, payment_date, notes)
         VALUES ($1, $2, $3, $4, $5::timestamp, $6)`,
        payment
      );
    }
    console.log('✅ Da tao 35 ban ghi thanh toan\n');

    await client.query('COMMIT');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SEED DATA THANH CONG!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 TONG KET:');
    console.log('   - 3 users (admin + 2 staff)');
    console.log('   - 9 ho khau (8 thuong tru + 1 tam tru)');
    console.log('   - 27 cu dan');
    console.log('   - 9 khoan thu (6 bat buoc + 3 tu nguyen)');
    console.log('   - 35 ban ghi thanh toan');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔐 THONG TIN DANG NHAP:');
    console.log('   Admin:  username: admin   | password: 123456');
    console.log('   Staff1: username: staff1  | password: 123456');
    console.log('   Staff2: username: staff2  | password: 123456');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Loi seed du lieu:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
  }
}

seedData();