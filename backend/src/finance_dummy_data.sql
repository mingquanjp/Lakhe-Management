DO $$
DECLARE 
    admin_id INT;
    h1_id INT; h2_id INT; h3_id INT;
    fee1_id INT; fee2_id INT;
BEGIN
    -- 1. Lấy ID của admin
    SELECT user_id INTO admin_id FROM users LIMIT 1;
    
    -- Lấy ID các hộ khẩu đã tạo (giả sử đã chạy script trước)
    SELECT household_id INTO h1_id FROM households WHERE household_code = 'HK001';
    SELECT household_id INTO h2_id FROM households WHERE household_code = 'HK002';
    SELECT household_id INTO h3_id FROM households WHERE household_code = 'HK003';

    -- 2. Tạo Khoản Thu (Fees)
    -- Khoản thu bắt buộc: Phí vệ sinh 2025
    INSERT INTO fees (fee_name, fee_type, amount, start_date, end_date) VALUES 
    ('Phí vệ sinh 2025', 'Mandatory', 60000, '2025-01-01', '2025-12-31') 
    RETURNING fee_id INTO fee1_id;

    -- Khoản thu tự nguyện: Quỹ vì người nghèo 2025
    INSERT INTO fees (fee_name, fee_type, amount, start_date, end_date) VALUES 
    ('Quỹ vì người nghèo 2025', 'Voluntary', NULL, '2025-01-01', '2025-12-31') 
    RETURNING fee_id INTO fee2_id;

    -- 3. Tạo Lịch sử nộp tiền (Payment History)
    -- Hộ 1 đóng phí vệ sinh (đóng đủ cả năm)
    INSERT INTO payment_history (fee_id, household_id, amount_paid, payment_date, collected_by_user_id) VALUES 
    (fee1_id, h1_id, 60000, '2025-01-15 10:00:00', admin_id);

    -- Hộ 2 đóng phí vệ sinh (đóng muộn vào tháng 2)
    INSERT INTO payment_history (fee_id, household_id, amount_paid, payment_date, collected_by_user_id) VALUES 
    (fee1_id, h2_id, 60000, '2025-02-20 14:30:00', admin_id);

    -- Hộ 3 chưa đóng phí vệ sinh (để test Unpaid)

    -- Hộ 1 ủng hộ quỹ người nghèo
    INSERT INTO payment_history (fee_id, household_id, amount_paid, payment_date, collected_by_user_id) VALUES 
    (fee2_id, h1_id, 200000, '2025-03-10 09:00:00', admin_id);

    -- Hộ 3 ủng hộ quỹ người nghèo
    INSERT INTO payment_history (fee_id, household_id, amount_paid, payment_date, collected_by_user_id) VALUES 
    (fee2_id, h3_id, 500000, '2025-04-05 16:00:00', admin_id);

END $$;
