/* ================================================================================
SCRIPT TẠO DỮ LIỆU MẪU (STRICT PAYMENT LOGIC)
Database: PostgreSQL
Update:
  1. Áp dụng logic lọc khoản thu chặt chẽ cho Hộ thường trú & Tạm trú (theo yêu cầu).
  2. Fix lỗi tính toán ngày tháng (Date Cast Error).
  3. Giữ nguyên toàn bộ logic Change History đầy đủ.
================================================================================
*/

-- Xóa dữ liệu cũ
TRUNCATE TABLE payment_history, temporary_absences, change_history, fees, households, residents, users RESTART IDENTITY CASCADE;

-- 1. TẠO USERS
INSERT INTO users (username, password, full_name, role) VALUES 
('admin', 'hashed_pass_123', 'Nguyễn Quản Trị', 'admin'),
('staff01', 'hashed_pass_123', 'Lê Thu Ngân', 'staff'),
('staff02', 'hashed_pass_123', 'Trần Văn Kiểm', 'staff');

-- 2. KHỐI LOGIC CHÍNH: TẠO HỘ, CƯ DÂN VÀ LOG HISTORY
DO $$
DECLARE 
    -- Các mảng tên
    ho_array text[] := ARRAY['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
    dem_array_nam text[] := ARRAY['Văn', 'Hữu', 'Đức', 'Thành', 'Công', 'Minh', 'Quốc', 'Thế', 'Mạnh', 'Tuấn'];
    dem_array_nu text[] := ARRAY['Thị', 'Thu', 'Phương', 'Thanh', 'Mỹ', 'Ngọc', 'Hồng', 'Mai', 'Khánh', 'Diệu'];
    ten_array_nam text[] := ARRAY['Hùng', 'Cường', 'Dũng', 'Nam', 'Trung', 'Hiếu', 'Nghĩa', 'Quân', 'Bình', 'Long', 'Phúc', 'Vinh', 'Sơn', 'Tùng'];
    ten_array_nu text[] := ARRAY['Hoa', 'Lan', 'Huệ', 'Cúc', 'Trang', 'Tuyết', 'Nhung', 'Hương', 'Thảo', 'Ly', 'Quyên', 'Vân', 'Anh', 'Hằng'];
    
    -- Biến tạm
    v_household_id INT;
    v_head_id INT;
    v_resident_id INT;
    v_num_households INT := 450;
    v_current_household INT;
    v_num_members INT;
    v_member_idx INT;
    
    -- Biến random
    v_rand_ho text;
    v_rand_dem text;
    v_rand_ten text;
    v_gender text;
    v_dob DATE;
    v_address text;
    v_date_created DATE;
    v_household_status text;
    v_history_type text;
    
    -- Biến logic gia đình
    v_head_dob DATE;
    
    -- Biến sửa lỗi Temporary logic
    v_temp_start DATE;
    v_temp_end DATE;
    v_temp_reason text;
BEGIN
    
    FOR v_current_household IN 1..v_num_households LOOP
        
        -- A. Random ngày và status
        v_date_created := DATE '2020-01-01' + (random() * (NOW()::DATE - DATE '2020-01-01'))::INT;
        
        IF random() < 0.05 THEN v_household_status := 'MovedOut';
        ELSIF random() < 0.10 THEN v_household_status := 'Temporary';
        ELSE v_household_status := 'Active';
        END IF;

        IF v_household_status = 'Temporary' THEN
            v_temp_start := v_date_created;
            v_temp_end := v_date_created + INTERVAL '12 months';
            v_temp_reason := 'Lao động thời vụ/Thuê nhà';
        ELSE
            v_temp_start := NULL;
            v_temp_end := NULL;
            v_temp_reason := NULL;
        END IF;

        -- B. Insert Hộ
        v_address := 'Số ' || floor(random()*100 + 1)::text || ', Ngõ ' || floor(random()*20 + 1)::text || ', Phường La Khê';

        INSERT INTO households (household_code, address, date_created, status)
        VALUES ('HK' || lpad(v_current_household::text, 5, '0'), v_address, v_date_created, v_household_status)
        RETURNING household_id INTO v_household_id;

        -- C. TẠO CHỦ HỘ
        v_rand_ho := ho_array[floor(random() * array_length(ho_array, 1) + 1)];
        IF random() > 0.3 THEN v_gender := 'Male'; v_rand_dem := dem_array_nam[floor(random() * array_length(dem_array_nam, 1) + 1)]; v_rand_ten := ten_array_nam[floor(random() * array_length(ten_array_nam, 1) + 1)];
        ELSE v_gender := 'Female'; v_rand_dem := dem_array_nu[floor(random() * array_length(dem_array_nu, 1) + 1)]; v_rand_ten := ten_array_nu[floor(random() * array_length(ten_array_nu, 1) + 1)];
        END IF;
        
        v_head_dob := v_date_created - (floor(random() * 50 + 25) || ' years')::interval;

        INSERT INTO residents (
            household_id, first_name, last_name, dob, gender, place_of_origin, relationship_to_head, registration_date, status, identity_card_number,
            temp_start_date, temp_end_date, temp_reason
        )
        VALUES (
            v_household_id, v_rand_ho, v_rand_dem || ' ' || v_rand_ten, v_head_dob, v_gender, 'Hà Nội', 'Chủ hộ', v_date_created, 
            CASE WHEN v_household_status = 'Temporary' THEN 'Temporary' ELSE 'Permanent' END,
            'CCCD' || floor(random()*100000000000)::text,
            v_temp_start, v_temp_end, v_temp_reason 
        ) RETURNING resident_id INTO v_head_id;

        UPDATE households SET head_of_household_id = v_head_id WHERE household_id = v_household_id;

        -- [HISTORY]
        INSERT INTO change_history (household_id, resident_id, change_date, change_type, changed_by_user_id)
        VALUES (v_household_id, v_head_id, v_date_created, 'ChangeHeadOfHousehold', 1);
        
        INSERT INTO change_history (household_id, resident_id, change_date, change_type, changed_by_user_id)
        VALUES (v_household_id, v_head_id, v_date_created, 'Added', 1);

        -- D. TẠO THÀNH VIÊN
        v_num_members := floor(random() * 5); 
        
        FOR v_member_idx IN 1..v_num_members LOOP
            IF v_member_idx = 1 AND random() > 0.2 THEN -- Vợ/Chồng
                IF v_gender = 'Male' THEN v_gender := 'Female'; v_rand_dem := dem_array_nu[floor(random() * array_length(dem_array_nu, 1) + 1)]; v_rand_ten := ten_array_nu[floor(random() * array_length(ten_array_nu, 1) + 1)];
                ELSE v_gender := 'Male'; v_rand_dem := dem_array_nam[floor(random() * array_length(dem_array_nam, 1) + 1)]; v_rand_ten := ten_array_nam[floor(random() * array_length(ten_array_nam, 1) + 1)];
                END IF;
                v_dob := v_head_dob + (floor(random()*10 - 5) || ' years')::interval;
                
                INSERT INTO residents (household_id, first_name, last_name, dob, gender, place_of_origin, relationship_to_head, registration_date, status, temp_start_date, temp_end_date, temp_reason)
                VALUES (v_household_id, v_rand_ho, v_rand_dem || ' ' || v_rand_ten, v_dob, v_gender, 'Hà Nội', 'Vợ/Chồng', v_date_created, 
                        CASE WHEN v_household_status = 'Temporary' THEN 'Temporary' ELSE 'Permanent' END,
                        v_temp_start, v_temp_end, v_temp_reason)
                RETURNING resident_id INTO v_resident_id;

                INSERT INTO change_history (household_id, resident_id, change_date, change_type, changed_by_user_id)
                VALUES (v_household_id, v_resident_id, v_date_created, 'Added', 1);
            
            ELSE -- Con
                IF random() > 0.5 THEN v_gender := 'Male'; v_rand_dem := dem_array_nam[floor(random() * array_length(dem_array_nam, 1) + 1)]; v_rand_ten := ten_array_nam[floor(random() * array_length(ten_array_nam, 1) + 1)];
                ELSE v_gender := 'Female'; v_rand_dem := dem_array_nu[floor(random() * array_length(dem_array_nu, 1) + 1)]; v_rand_ten := ten_array_nu[floor(random() * array_length(ten_array_nu, 1) + 1)];
                END IF;
                v_dob := v_head_dob + (floor(random()*15 + 20) || ' years')::interval;
                IF v_dob > NOW() THEN v_dob := NOW() - '1 month'::interval; END IF;

                INSERT INTO residents (household_id, first_name, last_name, dob, gender, place_of_origin, relationship_to_head, registration_date, status, temp_start_date, temp_end_date, temp_reason)
                VALUES (v_household_id, v_rand_ho, v_rand_dem || ' ' || v_rand_ten, v_dob, v_gender, 'Hà Nội', 'Con', v_date_created, 
                        CASE WHEN v_household_status = 'Temporary' THEN 'Temporary' ELSE 'Permanent' END,
                        v_temp_start, v_temp_end, v_temp_reason)
                RETURNING resident_id INTO v_resident_id;

                IF v_dob > v_date_created THEN v_history_type := 'NewBirth'; ELSE v_history_type := 'Added'; END IF;
                
                INSERT INTO change_history (household_id, resident_id, change_date, change_type, changed_by_user_id)
                VALUES (v_household_id, v_resident_id, GREATEST(v_dob, v_date_created), v_history_type, 1);
            END IF;
        END LOOP;
    END LOOP;

    -- 3. TẠO SINH VIÊN
    FOR i IN 1..200 LOOP
        v_household_id := floor(random() * v_num_households + 1);
        v_rand_ho := ho_array[floor(random() * array_length(ho_array, 1) + 1)];
        IF random() > 0.5 THEN v_gender := 'Male'; v_rand_dem := dem_array_nam[floor(random() * array_length(dem_array_nam, 1) + 1)]; v_rand_ten := ten_array_nam[floor(random() * array_length(ten_array_nam, 1) + 1)];
        ELSE v_gender := 'Female'; v_rand_dem := dem_array_nu[floor(random() * array_length(dem_array_nu, 1) + 1)]; v_rand_ten := ten_array_nu[floor(random() * array_length(ten_array_nu, 1) + 1)];
        END IF;
        v_dob := NOW() - (floor(random()*6 + 18) || ' years')::interval; 
        v_date_created := DATE '2023-01-01' + (random() * (NOW()::DATE - DATE '2023-01-01'))::INT;

        INSERT INTO residents (household_id, first_name, last_name, dob, gender, place_of_origin, relationship_to_head, registration_date, status, occupation, 
                               temp_start_date, temp_end_date, temp_reason)
        VALUES (v_household_id, v_rand_ho, v_rand_dem || ' ' || v_rand_ten, v_dob, v_gender, 'Nghệ An', 'Khách thuê', v_date_created, 'Temporary', 'Sinh viên',
                v_date_created, v_date_created + INTERVAL '1 year', 'Học Đại Học')
        RETURNING resident_id INTO v_resident_id;

        INSERT INTO change_history (household_id, resident_id, change_date, change_type, changed_by_user_id)
        VALUES (v_household_id, v_resident_id, v_date_created, 'Added', 2);
    END LOOP;

END $$;

-- 4. XỬ LÝ EDGE CASE: NGƯỜI ĐÃ MẤT
WITH deceased_people AS (
    UPDATE residents 
    SET status = 'Deceased', 
        deleted_at = NOW() - (floor(random()*365) || ' days')::interval,
        notes = 'Mất do bệnh già'
    WHERE resident_id IN (SELECT resident_id FROM residents WHERE status <> 'Temporary' ORDER BY random() LIMIT 30)
    RETURNING resident_id, household_id, deleted_at
)
INSERT INTO change_history (household_id, resident_id, change_date, change_type, changed_by_user_id)
SELECT household_id, resident_id, deleted_at, 'Death', 1
FROM deceased_people;

-- 5. TẠO DANH MỤC KHOẢN THU
WITH inserted_fees AS (
    INSERT INTO fees (fee_name, fee_type, amount, start_date, end_date) VALUES
    ('Phí vệ sinh 2023', 'Mandatory', 72000, '2023-01-01', '2023-12-31'),
    ('Phí an ninh 2023', 'Mandatory', 60000, '2023-01-01', '2023-12-31'),
    ('Quỹ vì người nghèo 2023', 'Voluntary', NULL, '2023-03-01', '2023-06-30'),
    ('Phí vệ sinh 2024', 'Mandatory', 72000, '2024-01-01', '2024-12-31'),
    ('Phí an ninh 2024', 'Mandatory', 60000, '2024-01-01', '2024-12-31'),
    ('Ủng hộ bão lụt miền Trung 2024', 'Voluntary', NULL, '2024-09-01', '2024-10-30'),
    ('Phí vệ sinh 2025', 'Mandatory', 80000, '2025-01-01', '2025-12-31'),
    ('Tết thiếu nhi 2025', 'Voluntary', NULL, '2025-05-01', '2025-06-01')
    RETURNING fee_id, start_date
)
INSERT INTO change_history (change_date, change_type, changed_by_user_id)
SELECT start_date, 'CreateFee', 1
FROM inserted_fees;

-- 6. TẠO LỊCH SỬ NỘP TIỀN (STRICT LOGIC THEO YÊU CẦU CỦA BẠN)
DO $$
DECLARE
    rec_fee RECORD;
    rec_house RECORD;
    v_amount BIGINT;
    v_pay_date TIMESTAMP;
    v_is_poor BOOLEAN;
    v_min_pay_date DATE;
    v_max_pay_date DATE;
BEGIN
    FOR rec_fee IN SELECT * FROM fees LOOP
        
        -- [LOGIC CHÍNH] JOIN hộ với chủ hộ để lấy thông tin tạm trú/thường trú
        -- Chỉ lặp qua các hộ thỏa mãn điều kiện logic bạn đưa ra
        FOR rec_house IN 
            SELECT h.household_id, h.status as h_status, h.date_created, 
                   r.temp_start_date, r.temp_end_date
            FROM households h
            JOIN residents r ON h.head_of_household_id = r.resident_id
            WHERE 
                -- Logic 1: Hộ Active (Thường trú) - Phí bắt đầu SAU ngày tạo hộ
                (h.status = 'Active' AND rec_fee.start_date >= h.date_created)
                OR
                -- Logic 2: Hộ Temporary (Tạm trú) - Phí nằm trong khoảng thời gian tạm trú
                (h.status = 'Temporary' 
                 AND r.temp_start_date IS NOT NULL 
                 AND r.temp_end_date IS NOT NULL
                 -- Phí bắt đầu trước khi hết hạn tạm trú
                 AND rec_fee.start_date <= r.temp_end_date
                 -- Phí kết thúc (hoặc chưa kết thúc) phải sau ngày bắt đầu tạm trú (có giao thoa)
                 AND (rec_fee.end_date IS NULL OR rec_fee.end_date >= r.temp_start_date)
                )
        LOOP
            v_is_poor := (random() < 0.1);
            
            -- Tính ngày nộp tiền hợp lý (Không được nộp trước khi chuyển đến hoặc trước khi đợt phí bắt đầu)
            IF rec_house.h_status = 'Active' THEN
                v_min_pay_date := GREATEST(rec_fee.start_date, rec_house.date_created);
            ELSE
                v_min_pay_date := GREATEST(rec_fee.start_date, rec_house.temp_start_date);
            END IF;

            -- Hạn chót nộp = 1 tháng sau khi kết thúc đợt phí, hoặc hôm nay
            v_max_pay_date := LEAST((rec_fee.end_date + INTERVAL '1 month')::DATE, CURRENT_DATE);

            -- Kiểm tra an toàn: Ngày nộp phải <= Hạn chót
            IF v_min_pay_date <= v_max_pay_date THEN
                
                -- Tạo dữ liệu
                IF rec_fee.fee_type = 'Mandatory' THEN
                    IF random() < 0.95 THEN
                        v_pay_date := v_min_pay_date + (random() * (v_max_pay_date - v_min_pay_date))::INT;
                        
                        INSERT INTO payment_history (fee_id, household_id, amount_paid, payment_date, collected_by_user_id)
                        VALUES (rec_fee.fee_id, rec_house.household_id, rec_fee.amount, v_pay_date, (CASE WHEN random() > 0.5 THEN 2 ELSE 3 END));
                    END IF;
                ELSE -- Voluntary
                    IF NOT v_is_poor AND random() < 0.4 THEN
                        v_amount := (floor(random() * 5 + 1) * 50000);
                        v_pay_date := v_min_pay_date + (random() * (v_max_pay_date - v_min_pay_date))::INT;
                        
                        INSERT INTO payment_history (fee_id, household_id, amount_paid, payment_date, collected_by_user_id, notes)
                        VALUES (rec_fee.fee_id, rec_house.household_id, v_amount, v_pay_date, (CASE WHEN random() > 0.5 THEN 2 ELSE 3 END), 'Tự nguyện');
                    END IF;
                END IF;

            END IF; -- End check min <= max
        END LOOP;
    END LOOP;
END $$;

-- 7. TẠO TẠM VẮNG -> UPDATE STATUS -> LOG 'MOVEOUT'
WITH inserted_absences AS (
    INSERT INTO temporary_absences (resident_id, destination_address, reason, start_date, end_date)
    SELECT resident_id, 'Khu công nghiệp Bắc Ninh', 'Đi làm xa', NOW() - INTERVAL '3 months', NOW() + INTERVAL '3 months'
    FROM residents
    WHERE status = 'Permanent' AND random() < 0.02 
    RETURNING resident_id, start_date
),
updated_residents AS (
    UPDATE residents
    SET status = 'MovedOut'
    WHERE resident_id IN (SELECT resident_id FROM inserted_absences)
    RETURNING household_id, resident_id
)
INSERT INTO change_history (household_id, resident_id, change_date, change_type, changed_by_user_id)
SELECT u.household_id, u.resident_id, ia.start_date, 'MoveOut', 2
FROM updated_residents u
JOIN inserted_absences ia ON u.resident_id = ia.resident_id;

-- 8. GIẢ LẬP CÁC TRƯỜNG HỢP CÒN LẠI 
DO $$
DECLARE
    v_h_id INT;
    v_r_id INT;
    v_new_h_id INT;
    i INT;
BEGIN
    -- 8.1. REMOVED
    FOR v_r_id IN SELECT resident_id FROM residents WHERE status = 'Permanent' LIMIT 5 LOOP
        UPDATE residents SET status = 'MovedOut' WHERE resident_id = v_r_id RETURNING household_id INTO v_h_id;
        INSERT INTO change_history (household_id, resident_id, change_date, change_type, changed_by_user_id)
        VALUES (v_h_id, v_r_id, NOW(), 'Removed', 1);
    END LOOP;

    -- 8.2. SPLIT (Tách hộ)
    FOR i IN 1..3 LOOP
        SELECT household_id INTO v_h_id FROM residents GROUP BY household_id HAVING count(*) > 3 LIMIT 1;
        SELECT resident_id INTO v_r_id FROM residents WHERE household_id = v_h_id AND relationship_to_head <> 'Chủ hộ' LIMIT 1;
        
        IF v_r_id IS NOT NULL THEN
            INSERT INTO change_history (household_id, change_date, change_type, changed_by_user_id)
            VALUES (v_h_id, NOW(), 'Split', 1);
            
            INSERT INTO households (household_code, address, head_of_household_id, status)
            VALUES ('HK-SPLIT-' || i, 'Nhà tách ' || i, v_r_id, 'Active') RETURNING household_id INTO v_new_h_id;
            
            UPDATE residents SET household_id = v_new_h_id, relationship_to_head = 'Chủ hộ' WHERE resident_id = v_r_id;
            
            INSERT INTO change_history (household_id, resident_id, change_date, change_type, changed_by_user_id)
            VALUES (v_new_h_id, v_r_id, NOW(), 'ChangeHeadOfHousehold', 1);
        END IF;
    END LOOP;

    -- 8.3. UPDATE FEE & DELETE FEE
    UPDATE fees SET amount = 75000 WHERE fee_name = 'Phí vệ sinh 2023';
    INSERT INTO change_history (change_date, change_type, changed_by_user_id) VALUES (NOW(), 'UpdateFee', 1);

    UPDATE fees SET deleted_at = NOW() WHERE fee_name = 'Ủng hộ bão lụt miền Trung 2024';
    INSERT INTO change_history (change_date, change_type, changed_by_user_id) VALUES (NOW(), 'DeleteFee', 1);
END $$;

-- CHECK DATA
SELECT 'Households' as table_name, count(*) as total FROM households
UNION ALL
SELECT 'Residents (Total)', count(*) FROM residents
UNION ALL
SELECT 'Payment History (Strict Logic)', count(*) FROM payment_history
UNION ALL
SELECT 'History: ' || change_type, count(*) FROM change_history GROUP BY change_type;