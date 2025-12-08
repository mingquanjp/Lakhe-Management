const pool = require('../config/database');

async function seedData() {
  try {
    console.log('Bat dau seed du lieu...\n');

    // 1. Tạo khoản thu
    console.log('Tao khoan thu...');
    const feeInserts = [
      ['Phi ve sinh thang 12/2024', 'Mandatory', 50000, '2024-12-01', '2024-12-31'],
      ['Ung ho bao lut mien Trung', 'Voluntary', null, '2024-12-01', '2025-01-31'],
      ['Phi quan ly chung cu Q4/2024', 'Mandatory', 100000, '2024-10-01', '2024-12-31']
    ];

    for (const fee of feeInserts) {
      await pool.query(
        `INSERT INTO fees (fee_name, fee_type, amount, start_date, end_date)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        fee
      );
    }
    console.log('Da tao 3 khoan thu\n');

    // 2. Tạo hộ khẩu mẫu
    console.log('Tao ho khau...');
    const householdInserts = [
      ['HK001', 'So 1, Ngo 10, Duong ABC'],
      ['HK002', 'So 2, Ngo 20, Duong DEF'],
      ['HK003', 'So 3, Ngo 30, Duong GHI']
    ];

    for (const household of householdInserts) {
      await pool.query(
        `INSERT INTO households (household_code, address, status)
         VALUES ($1, $2, 'Active')
         ON CONFLICT (household_code) DO NOTHING`,
        household
      );
    }
    console.log('Da tao 3 ho khau\n');
    // 3. Tạo cư dân (chủ hộ)
    console.log('Tao cu dan...');
    const residents = [
      [1, 'Nguyen', 'Van A', '1980-01-01', 'Male', 'Chu ho'],
      [2, 'Tran', 'Thi B', '1985-02-15', 'Female', 'Chu ho'],
      [3, 'Le', 'Van C', '1990-03-20', 'Male', 'Chu ho']
    ];

    for (const resident of residents) {
      const result = await pool.query(
        `INSERT INTO residents (household_id, first_name, last_name, dob, gender, relationship_to_head)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING
         RETURNING resident_id`,
        resident
      );

      // Gán làm chủ hộ
      if (result.rows.length > 0) {
        await pool.query(
          `UPDATE households SET head_of_household_id = $1 WHERE household_id = $2`,
          [result.rows[0].resident_id, resident[0]]
        );
      }
    }
    console.log('Da tao 3 cu dan\n');

    console.log('Seed du lieu thanh cong!');
    process.exit(0);
  } catch (error) {
    console.error('Loi seed du lieu:', error);
    process.exit(1);
  }
}

seedData();