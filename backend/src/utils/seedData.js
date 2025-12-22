const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function seedData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log(' Bắt đầu seed dữ liệu...\n');

    // ===== 1. TẠO USERS (Admin + Staff) =====
    console.log('👤 Tạo users...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    const users = [
      ['admin', hashedPassword, 'Nguyễn Văn Quản', 'admin'],
      ['staff1', hashedPassword, 'Trần Thị Mai Anh', 'staff'],
      ['staff2', hashedPassword, 'Lê Văn Bình', 'staff']
    ];

    for (const user of users) {
      await client.query(
        `INSERT INTO users (username, password, full_name, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (username) DO NOTHING`,
        user
      );
    }
    console.log('✅ Đã tạo 3 users (1 admin + 2 staff)\n');

    // ===== 2. TẠO HỘ KHẨU =====
    console.log('🏠 Tạo hộ khẩu...');
    const households = [
      ['HK001', 'Số 12, Ngõ 15, Đường Giải Phóng, Phường Bách Khoa, Quận Hai Bà Trưng'],
      ['HK002', 'Số 8, Ngõ 22, Đường Trần Đại Nghĩa, Phường Bách Khoa, Quận Hai Bà Trưng'],
      ['HK003', 'Số 5, Ngõ 9, Đường Nguyễn Trãi, Phường Thanh Xuân Nam, Quận Thanh Xuân'],
      ['HK004', 'Số 20, Ngõ 7, Đường Lê Lợi, Phường Bến Nghé, Quận 1'],
      ['HK005', 'Số 14, Ngõ 3, Đường Hùng Vương, Phường Láng Hạ, Quận Đống Đa'],
      ['HK006', 'Số 30, Ngõ 11, Đường Bà Triệu, Phường Hàng Bài, Quận Hoàn Kiếm'],
      ['HK007', 'Số 25, Ngõ 18, Đường Hai Bà Trưng, Phường Bến Nghé, Quận 1'],
      ['HK008', 'Số 7, Ngõ 5, Đường Lý Thường Kiệt, Phường Trần Hưng Đạo, Quận 1'],
      ['HK009', 'Số 16, Ngõ 28, Đường Hoàng Quốc Việt, Phường Nghĩa Đô, Quận Cầu Giấy'],
      ['HK010', 'Số 33, Ngõ 42, Đường Láng, Phường Láng Thượng, Quận Đống Đa']
    ];

    for (const household of households) {
      await client.query(
        `INSERT INTO households (household_code, address, status, date_created)
         VALUES ($1, $2, 'Active', '2023-01-15')
         ON CONFLICT (household_code) DO NOTHING`,
        household
      );
    }
    console.log('✅ Đã tạo 10 hộ khẩu\n');

    // ===== 3. TẠO CƯ DÂN (Chủ hộ + Thành viên) =====
    console.log('👨‍👩‍👧‍👦 Tạo cư dân...');
    
    // Chủ hộ với đầy đủ thông tin
    const headResidents = [
      [1, 'Nguyễn', 'Văn Hùng', 'Hùng', '1975-03-20', 'Male', 'Hà Nội', 'Hà Nội', 'Kinh', 'Kỹ sư xây dựng', 'Công ty CP Xây dựng Hòa Bình', '001075012345', '2015-06-15', 'Công an TP Hà Nội', 'Chủ hộ'],
      [2, 'Trần', 'Thị Lan Hương', 'Hương', '1980-06-15', 'Female', 'Hải Phòng', 'Nam Định', 'Kinh', 'Giáo viên', 'Trường THPT Chu Văn An', '001080034567', '2016-03-20', 'Công an TP Hà Nội', 'Chủ hộ'],
      [3, 'Lê', 'Minh Tuấn', 'Tuấn', '1978-11-10', 'Male', 'Thanh Hóa', 'Thanh Hóa', 'Kinh', 'Bác sĩ', 'Bệnh viện Bạch Mai', '001078056789', '2014-09-10', 'Công an TP Hà Nội', 'Chủ hộ'],
      [4, 'Phạm', 'Thu Hà', 'Hà', '1982-04-25', 'Female', 'Hà Nội', 'Bắc Ninh', 'Kinh', 'Kế toán trưởng', 'Công ty TNHH Việt Nam', '001082023456', '2017-01-15', 'Công an TP Hà Nội', 'Chủ hộ'],
      [5, 'Hoàng', 'Đức Nam', 'Nam', '1976-09-08', 'Male', 'Hưng Yên', 'Hưng Yên', 'Kinh', 'Giám đốc kinh doanh', 'Tập đoàn FPT', '001076045678', '2015-11-20', 'Công an TP Hà Nội', 'Chủ hộ'],
      [6, 'Vũ', 'Thị Thanh Thu', 'Thu', '1985-12-30', 'Female', 'Hà Nội', 'Hà Nội', 'Kinh', 'Luật sư', 'Văn phòng luật sư Minh Khuê', '001085067890', '2018-05-10', 'Công an TP Hà Nội', 'Chủ hộ'],
      [7, 'Đặng', 'Quang Tuấn', 'Tuấn', '1979-07-14', 'Male', 'Nghệ An', 'Nghệ An', 'Kinh', 'Kiến trúc sư', 'Công ty CP Kiến trúc Việt', '001079078901', '2016-08-25', 'Công an TP Hà Nội', 'Chủ hộ'],
      [8, 'Bùi', 'Thị Nga', 'Nga', '1983-02-18', 'Female', 'Hà Nội', 'Thái Bình', 'Kinh', 'Nhân viên ngân hàng', 'Ngân hàng Vietcombank', '001083089012', '2017-12-05', 'Công an TP Hà Nội', 'Chủ hộ'],
      [9, 'Trịnh', 'Văn Long', 'Long', '1981-05-22', 'Male', 'Quảng Ninh', 'Quảng Ninh', 'Kinh', 'Lập trình viên', 'Công ty TNHH Viettel', '001081090123', '2016-10-15', 'Công an TP Hà Nội', 'Chủ hộ'],
      [10, 'Phan', 'Thị Ánh Tuyết', 'Tuyết', '1984-08-12', 'Female', 'Hà Nội', 'Vĩnh Phúc', 'Kinh', 'Dược sĩ', 'Nhà thuốc Phương Đông', '001084091234', '2018-02-20', 'Công an TP Hà Nội', 'Chủ hộ']
    ];

    for (const resident of headResidents) {
      const result = await client.query(
        `INSERT INTO residents (
          household_id, first_name, last_name, nickname, dob, gender, 
          place_of_birth, place_of_origin, ethnicity, occupation, workplace,
          identity_card_number, identity_card_date, identity_card_place,
          relationship_to_head, status, registration_date
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'Permanent', '2023-01-15')
         RETURNING resident_id`,
        resident
      );

      // Gán làm chủ hộ
      if (result.rows.length > 0) {
        await client.query(
          `UPDATE households SET head_of_household_id = $1 WHERE household_id = $2`,
          [result.rows[0].resident_id, resident[0]]
        );
      }
    }

    // Thành viên gia đình (vợ/chồng, con, ông bà)
    const familyMembers = [
      // Hộ HK001 - 4 người
      [1, 'Nguyễn', 'Thị Huệ', 'Huệ', '1977-05-12', 'Female', 'Hà Nội', 'Hà Nội', 'Kinh', 'Nội trợ', null, '001077012346', '2015-06-15', 'Công an TP Hà Nội', 'Vợ'],
      [1, 'Nguyễn', 'Minh Anh', 'Anh', '2005-08-20', 'Male', 'Hà Nội', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường THPT Chu Văn An', null, null, null, 'Con trai'],
      [1, 'Nguyễn', 'Thùy Linh', 'Linh', '2010-03-15', 'Female', 'Hà Nội', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường THCS Giảng Võ', null, null, null, 'Con gái'],
      
      // Hộ HK002 - 3 người
      [2, 'Trần', 'Văn Cường', 'Cường', '1978-09-05', 'Male', 'Hải Phòng', 'Nam Định', 'Kinh', 'Kỹ sư cơ khí', 'Công ty CP Cơ khí Hà Nội', '001078034568', '2016-03-20', 'Công an TP Hà Nội', 'Chồng'],
      [2, 'Trần', 'Khánh Nhi', 'Nhi', '2008-12-10', 'Female', 'Hà Nội', 'Nam Định', 'Kinh', 'Học sinh', 'Trường THCS Trần Phú', null, null, null, 'Con gái'],
      
      // Hộ HK003 - 5 người (gia đình lớn có ông bà)
      [3, 'Lê', 'Thị Phương', 'Phương', '1980-07-22', 'Female', 'Thanh Hóa', 'Thanh Hóa', 'Kinh', 'Y tá', 'Bệnh viện Việt Đức', '001080056790', '2014-09-10', 'Công an TP Hà Nội', 'Vợ'],
      [3, 'Lê', 'Hoàng Khải', 'Khải', '2006-11-08', 'Male', 'Hà Nội', 'Thanh Hóa', 'Kinh', 'Học sinh', 'Trường THPT Trần Phú', null, null, null, 'Con trai'],
      [3, 'Lê', 'Bảo My', 'My', '2012-04-18', 'Female', 'Hà Nội', 'Thanh Hóa', 'Kinh', 'Học sinh', 'Trường Tiểu học Kim Liên', null, null, null, 'Con gái'],
      [3, 'Lê', 'Văn Sơn', null, '1950-02-10', 'Male', 'Thanh Hóa', 'Thanh Hóa', 'Kinh', 'Nghỉ hưu', null, '001050011111', '2010-01-10', 'Công an tỉnh Thanh Hóa', 'Bố'],
      
      // Hộ HK004 - 2 người
      [4, 'Phạm', 'Minh Đông', 'Đông', '1981-01-30', 'Male', 'Bắc Ninh', 'Bắc Ninh', 'Kinh', 'Quản lý dự án', 'Công ty CP Đầu tư Hạ tầng', '001081023457', '2017-01-15', 'Công an TP Hà Nội', 'Chồng'],
      
      // Hộ HK005 - 4 người
      [5, 'Hoàng', 'Thị Thanh Ly', 'Ly', '1978-10-15', 'Female', 'Hưng Yên', 'Hưng Yên', 'Kinh', 'Kinh doanh', 'Cửa hàng thời trang Thanh Ly', '001078045679', '2015-11-20', 'Công an TP Hà Nội', 'Vợ'],
      [5, 'Hoàng', 'Minh Long', 'Long', '2007-06-25', 'Male', 'Hà Nội', 'Hưng Yên', 'Kinh', 'Học sinh', 'Trường THCS Giảng Võ', null, null, null, 'Con trai'],
      [5, 'Hoàng', 'Phương Anh', 'Anh', '2012-09-14', 'Female', 'Hà Nội', 'Hưng Yên', 'Kinh', 'Học sinh', 'Trường Tiểu học Nguyễn Du', null, null, null, 'Con gái'],
      
      // Hộ HK006 - 5 người (hộ lớn)
      [6, 'Vũ', 'Quang Hải', 'Hải', '1983-03-08', 'Male', 'Hà Nội', 'Hà Nội', 'Kinh', 'Kỹ sư IT', 'Công ty TNHH FPT Software', '001083067891', '2018-05-10', 'Công an TP Hà Nội', 'Chồng'],
      [6, 'Vũ', 'Minh An', 'An', '2009-09-12', 'Female', 'Hà Nội', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường THCS Lê Quý Đôn', null, null, null, 'Con gái'],
      [6, 'Vũ', 'Đức Bảo', 'Bảo', '2013-02-20', 'Male', 'Hà Nội', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường Tiểu học Đinh Tiên Hoàng', null, null, null, 'Con trai'],
      [6, 'Vũ', 'Hồng Cúc', 'Cúc', '2015-11-05', 'Female', 'Hà Nội', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường Mầm non Sao Mai', null, null, null, 'Con gái'],
      
      // Hộ HK007 - 3 người
      [7, 'Đặng', 'Thị Huyền', 'Huyền', '1981-08-28', 'Female', 'Nghệ An', 'Nghệ An', 'Kinh', 'Nhân viên văn phòng', 'Công ty CP Tư vấn xây dựng', '001081078902', '2016-08-25', 'Công an TP Hà Nội', 'Vợ'],
      [7, 'Đặng', 'Quang Đức', 'Đức', '2010-05-16', 'Male', 'Hà Nội', 'Nghệ An', 'Kinh', 'Học sinh', 'Trường THCS Nguyễn Trãi', null, null, null, 'Con trai'],
      
      // Hộ HK008 - 2 người
      [8, 'Bùi', 'Văn Sơn', 'Sơn', '2011-07-22', 'Male', 'Hà Nội', 'Thái Bình', 'Kinh', 'Học sinh', 'Trường THCS Chu Văn An', null, null, null, 'Con trai'],
      
      // Hộ HK009 - 4 người
      [9, 'Trịnh', 'Thị Hương', 'Hương', '1983-11-18', 'Female', 'Quảng Ninh', 'Quảng Ninh', 'Kinh', 'Nhân viên marketing', 'Công ty CP Truyền thông Viettel', '001083090124', '2016-10-15', 'Công an TP Hà Nội', 'Vợ'],
      [9, 'Trịnh', 'Hoàng Nam', 'Nam', '2008-03-25', 'Male', 'Hà Nội', 'Quảng Ninh', 'Kinh', 'Học sinh', 'Trường THCS Cầu Giấy', null, null, null, 'Con trai'],
      [9, 'Trịnh', 'Ngọc Mai', 'Mai', '2013-07-30', 'Female', 'Hà Nội', 'Quảng Ninh', 'Kinh', 'Học sinh', 'Trường Tiểu học Nghĩa Đô', null, null, null, 'Con gái'],
      
      // Hộ HK010 - 3 người
      [10, 'Phan', 'Quốc Dũng', 'Dũng', '1982-06-08', 'Male', 'Vĩnh Phúc', 'Vĩnh Phúc', 'Kinh', 'Kỹ sư điện', 'Công ty Điện lực Hà Nội', '001082091235', '2018-02-20', 'Công an TP Hà Nội', 'Chồng'],
      [10, 'Phan', 'Thu Hiền', 'Hiền', '2010-10-12', 'Female', 'Hà Nội', 'Vĩnh Phúc', 'Kinh', 'Học sinh', 'Trường THCS Đống Đa', null, null, null, 'Con gái']
    ];

    for (const member of familyMembers) {
      await client.query(
        `INSERT INTO residents (
          household_id, first_name, last_name, nickname, dob, gender,
          place_of_birth, place_of_origin, ethnicity, occupation, workplace,
          identity_card_number, identity_card_date, identity_card_place,
          relationship_to_head, status, registration_date
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'Permanent', '2023-01-15')`,
        member
      );
    }

    // Thêm 1 hộ tạm trú
    await client.query(
      `INSERT INTO households (household_code, address, status, date_created)
       VALUES ('HK011', 'Số 40, Ngõ 25, Đường Trần Hưng Đạo, Phường Hàng Bạc, Quận Hoàn Kiếm', 'Temporary', '2024-11-01')
       ON CONFLICT (household_code) DO NOTHING`
    );

    const tempResidentResult = await client.query(
      `INSERT INTO residents (
        household_id, first_name, last_name, nickname, dob, gender,
        place_of_birth, place_of_origin, ethnicity, occupation, workplace,
        identity_card_number, identity_card_date, identity_card_place,
        relationship_to_head, status, 
        temp_home_address, temp_start_date, temp_end_date, temp_reason,
        registration_date
      )
       VALUES (11, 'Đỗ', 'Thanh Tâm', 'Tâm', '1990-05-20', 'Male',
               'Đà Nẵng', 'Đà Nẵng', 'Kinh', 'Nhân viên IT', 'Công ty TNHH Samsung Electronics',
               '001990045555', '2020-08-15', 'Công an TP Đà Nẵng',
               'Chủ hộ', 'Temporary',
               'Số 15, Ngõ 8, Đường Lê Duẩn, Quận Hải Châu, TP Đà Nẵng',
               '2024-11-01', '2025-04-30', 'Công tác dài hạn tại Hà Nội',
               '2024-11-01')
       RETURNING resident_id`
    );

    await client.query(
      `UPDATE households SET head_of_household_id = $1 WHERE household_id = 11`,
      [tempResidentResult.rows[0].resident_id]
    );

    // Thêm vợ cho hộ tạm trú
    await client.query(
      `INSERT INTO residents (
        household_id, first_name, last_name, nickname, dob, gender,
        place_of_birth, place_of_origin, ethnicity, occupation, workplace,
        identity_card_number, identity_card_date, identity_card_place,
        relationship_to_head, status,
        temp_home_address, temp_start_date, temp_end_date, temp_reason,
        registration_date
      )
       VALUES (11, 'Đỗ', 'Thị Loan', 'Loan', '1992-08-15', 'Female',
               'Đà Nẵng', 'Quảng Nam', 'Kinh', 'Nhân viên văn phòng', 'Công ty TNHH Samsung Electronics',
               '001992056666', '2020-08-15', 'Công an TP Đà Nẵng',
               'Vợ', 'Temporary',
               'Số 15, Ngõ 8, Đường Lê Duẩn, Quận Hải Châu, TP Đà Nẵng',
               '2024-11-01', '2025-04-30', 'Theo chồng công tác',
               '2024-11-01')`
    );

    console.log('✅ Đã tạo 41 cư dân (10 chủ hộ thường trú + 29 thành viên + 2 cư dân tạm trú)\n');

    // ===== 4. TẠO KHOẢN THU =====
    console.log('💰 Tạo khoản thu...');
    const fees = [
      // Phí bắt buộc
      ['Phí vệ sinh tháng 11/2024', 'Mandatory', 50000, '2024-11-01', '2024-11-30'],
      ['Phí vệ sinh tháng 12/2024', 'Mandatory', 50000, '2024-12-01', '2024-12-31'],
      ['Phí vệ sinh tháng 1/2025', 'Mandatory', 50000, '2025-01-01', '2025-01-31'],
      ['Phí bảo vệ quý 4/2024', 'Mandatory', 120000, '2024-10-01', '2024-12-31'],
      ['Phí quản lý chung cư quý 4/2024', 'Mandatory', 200000, '2024-10-01', '2024-12-31'],
      ['Phí giữ xe tháng 12/2024', 'Mandatory', 80000, '2024-12-01', '2024-12-31'],
      ['Phí điện nước tháng 12/2024', 'Mandatory', 350000, '2024-12-01', '2024-12-31'],
      ['Phí Internet tháng 12/2024', 'Mandatory', 200000, '2024-12-01', '2024-12-31'],
      
      // Phí tự nguyện
      ['Ủng hộ Tết Trung thu cho trẻ em', 'Voluntary', null, '2024-08-15', '2024-09-15'],
      ['Quỹ từ thiện bão lụt miền Trung', 'Voluntary', null, '2024-10-01', '2024-11-30'],
      ['Ủng hộ Tết Nguyên Đán 2025', 'Voluntary', null, '2024-12-15', '2025-01-31'],
      ['Quỹ hỗ trợ người nghèo', 'Voluntary', null, '2024-11-01', '2024-12-31']
    ];

    for (const fee of fees) {
      await client.query(
        `INSERT INTO fees (fee_name, fee_type, amount, start_date, end_date)
         VALUES ($1, $2, $3, $4, $5)`,
        fee
      );
    }
    console.log('✅ Đã tạo 12 khoản thu (8 bắt buộc + 4 tự nguyện)\n');

    // ===== 5. TẠO LỊCH SỬ THANH TOÁN =====
    console.log('📝 Tạo lịch sử thanh toán...');
    
    // Lấy user_id của staff
    const staffUsers = await client.query(`SELECT user_id FROM users WHERE role = 'staff' ORDER BY user_id LIMIT 2`);
    const staff1_id = staffUsers.rows[0].user_id;
    const staff2_id = staffUsers.rows[1].user_id;

    const payments = [
      // Phí vệ sinh tháng 11 (fee_id = 1) - hầu hết đã đóng
      [1, 1, 50000, staff1_id, '2024-11-05', null],
      [1, 2, 50000, staff1_id, '2024-11-06', null],
      [1, 3, 50000, staff2_id, '2024-11-07', null],
      [1, 4, 50000, staff2_id, '2024-11-08', null],
      [1, 5, 50000, staff1_id, '2024-11-09', null],
      [1, 6, 50000, staff1_id, '2024-11-10', null],
      [1, 7, 50000, staff2_id, '2024-11-12', null],
      [1, 8, 50000, staff2_id, '2024-11-13', null],
      [1, 9, 50000, staff1_id, '2024-11-14', null],
      // HK010 chưa đóng
      
      // Phí vệ sinh tháng 12 (fee_id = 2) - một số đã đóng
      [2, 1, 50000, staff1_id, '2024-12-03', null],
      [2, 2, 50000, staff1_id, '2024-12-04', null],
      [2, 3, 50000, staff2_id, '2024-12-05', null],
      [2, 5, 50000, staff1_id, '2024-12-07', null],
      [2, 6, 50000, staff2_id, '2024-12-08', null],
      [2, 9, 50000, staff1_id, '2024-12-10', null],
      // HK004, HK007, HK008, HK010 chưa đóng
      
      // Phí bảo vệ quý 4 (fee_id = 4) - đã đóng một nửa
      [4, 1, 120000, staff2_id, '2024-10-15', null],
      [4, 2, 120000, staff2_id, '2024-10-16', null],
      [4, 4, 120000, staff1_id, '2024-10-20', null],
      [4, 6, 120000, staff1_id, '2024-10-22', null],
      [4, 8, 120000, staff2_id, '2024-10-25', null],
      
      // Phí quản lý chung cư quý 4 (fee_id = 5)
      [5, 1, 200000, staff1_id, '2024-10-10', null],
      [5, 3, 200000, staff2_id, '2024-10-12', null],
      [5, 5, 200000, staff1_id, '2024-10-15', null],
      [5, 7, 200000, staff2_id, '2024-10-18', null],
      [5, 9, 200000, staff1_id, '2024-10-20', null],
      
      // Phí giữ xe tháng 12 (fee_id = 6)
      [6, 1, 80000, staff1_id, '2024-12-02', null],
      [6, 2, 80000, staff1_id, '2024-12-03', null],
      [6, 4, 80000, staff2_id, '2024-12-06', null],
      [6, 6, 80000, staff2_id, '2024-12-07', null],
      [6, 8, 80000, staff1_id, '2024-12-09', null],
      
      // Phí điện nước tháng 12 (fee_id = 7)
      [7, 1, 350000, staff1_id, '2024-12-05', null],
      [7, 2, 320000, staff1_id, '2024-12-06', null],
      [7, 3, 380000, staff2_id, '2024-12-07', null],
      [7, 5, 340000, staff2_id, '2024-12-08', null],
      [7, 6, 420000, staff1_id, '2024-12-09', 'Gia đình đông người'],
      
      // Phí Internet tháng 12 (fee_id = 8)
      [8, 1, 200000, staff1_id, '2024-12-03', null],
      [8, 3, 200000, staff2_id, '2024-12-04', null],
      [8, 5, 200000, staff1_id, '2024-12-06', null],
      [8, 7, 200000, staff2_id, '2024-12-07', null],
      
      // Ủng hộ Tết Trung thu (fee_id = 9) - tự nguyện
      [9, 1, 200000, staff1_id, '2024-08-20', 'Ủng hộ 200k'],
      [9, 2, 100000, staff1_id, '2024-08-22', 'Ủng hộ 100k'],
      [9, 3, 150000, staff2_id, '2024-08-25', null],
      [9, 5, 100000, staff2_id, '2024-09-01', null],
      [9, 6, 300000, staff1_id, '2024-08-28', 'Ủng hộ nhiệt tình'],
      [9, 9, 150000, staff2_id, '2024-09-05', null],
      
      // Quỹ từ thiện bão lụt (fee_id = 10)
      [10, 1, 500000, staff1_id, '2024-10-05', 'Đóng góp từ thiện'],
      [10, 2, 300000, staff1_id, '2024-10-06', null],
      [10, 3, 200000, staff2_id, '2024-10-08', null],
      [10, 6, 400000, staff2_id, '2024-10-10', null],
      [10, 7, 350000, staff1_id, '2024-10-12', null],
      [10, 9, 250000, staff2_id, '2024-10-15', null],
      
      // Ủng hộ Tết (fee_id = 11)
      [11, 1, 300000, staff1_id, '2024-12-20', null],
      [11, 3, 200000, staff2_id, '2024-12-22', null],
      [11, 5, 250000, staff1_id, '2024-12-23', null],
      [11, 7, 200000, staff2_id, '2024-12-24', null],
      
      // Quỹ hỗ trợ người nghèo (fee_id = 12)
      [12, 1, 150000, staff1_id, '2024-11-10', null],
      [12, 3, 100000, staff2_id, '2024-11-12', null],
      [12, 6, 200000, staff1_id, '2024-11-15', null],
      [12, 9, 100000, staff2_id, '2024-11-18', null]
    ];

    for (const payment of payments) {
      await client.query(
        `INSERT INTO payment_history (fee_id, household_id, amount_paid, collected_by_user_id, payment_date, notes)
         VALUES ($1, $2, $3, $4, $5::timestamp, $6)`,
        payment
      );
    }
    console.log('✅ Đã tạo 66 bản ghi thanh toán\n');

    await client.query('COMMIT');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SEED DATA THÀNH CÔNG!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 TỔNG KẾT:');
    console.log('   - 3 users (1 admin + 2 staff)');
    console.log('   - 11 hộ khẩu (10 thường trú + 1 tạm trú)');
    console.log('   - 41 cư dân (có đầy đủ thông tin CCCD, nghề nghiệp)');
    console.log('   - 12 khoản thu (8 bắt buộc + 4 tự nguyện)');
    console.log('   - 66 bản ghi thanh toán');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔐 THÔNG TIN ĐĂNG NHẬP:');
    console.log('   Admin:  username: admin   | password: 123456');
    console.log('   Staff1: username: staff1  | password: 123456');
    console.log('   Staff2: username: staff2  | password: 123456');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi seed dữ liệu:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
  }
}

seedData();