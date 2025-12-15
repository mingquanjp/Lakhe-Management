-- 1. Bảng Users (Cán bộ quản lý)
-- Dùng full_name như đã thống nhất
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL, -- Tên đăng nhập
    password VARCHAR(255) NOT NULL, -- Mật khẩu
    full_name VARCHAR(100) NOT NULL, -- Họ và tên
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff')) -- 'admin', 'staff'
);

-- 2. Bảng Households (Hộ khẩu)
CREATE TABLE households (
    household_id SERIAL PRIMARY KEY, 
    household_code VARCHAR(20) UNIQUE NOT NULL, -- Số sổ hộ khẩu
    head_of_household_id INT, -- Chủ hộ
    address VARCHAR(100) NOT NULL, -- Địa chỉ
    date_created DATE DEFAULT CURRENT_DATE, -- Ngày tạo
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'MovedOut', 'Temporary')) -- 'Active', 'MovedOut'
);

-- 3. Bảng Residents (Nhân khẩu)
CREATE TABLE residents (
    -- 1. Khóa
    resident_id SERIAL PRIMARY KEY,
    household_id INT NOT NULL,
    
    -- 2. Thông tin cá nhân
    first_name VARCHAR(50) NOT NULL, -- Họ (Ví dụ: Nguyễn)
    last_name VARCHAR(50) NOT NULL,  -- Tên (Ví dụ: An)
    nickname VARCHAR(50), -- Tên gọi
    dob DATE NOT NULL, -- Ngày sinh
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female')), -- 'Male', 'Female'
    -- 3. Quê quán
    place_of_birth VARCHAR(255), -- Nơi sinh
    place_of_origin VARCHAR(255), -- Nguyên quán
    ethnicity VARCHAR(50), -- Dân tộc
    -- 4. Nghề nghiệp
    occupation VARCHAR(100), -- Nghề nghiệp
    workplace VARCHAR(255), -- Nơi làm việc
    -- 5. Giấy tờ
    identity_card_number VARCHAR(20) UNIQUE, -- CMND/CCCD
    identity_card_date DATE, -- Ngày cấp
    identity_card_place VARCHAR(100), -- Nơi cấp
    -- 6. Thông tin thường trú
    registration_date DATE DEFAULT CURRENT_DATE, -- Ngày đăng ký thường trú
    previous_address VARCHAR(255), -- Địa chỉ trước
    relationship_to_head VARCHAR(50) NOT NULL, -- Quan hệ với chủ hộ
    notes TEXT, -- Ghi chú
    -- 7. Thông tin tạm trú
    temp_home_address VARCHAR(255), -- Địa chỉ tạm trú
    temp_start_date DATE, -- Ngày bắt đầu tạm trú
    temp_end_date DATE, -- Ngày kết thúc tạm trú
    temp_reason TEXT, -- Lý do tạm trú
    -- 8. Trạng thái
    status VARCHAR(20) DEFAULT 'Permanent' CHECK (status IN ('Permanent', 'MovedOut', 'Deceased', 'Temporary')) , -- 'Permanent', 'MovedOut', 'Deceased', 'Temporary'
    
    -- Tạo khóa ngoại liên kết với bảng Households
    CONSTRAINT fk_household 
        FOREIGN KEY (household_id) 
        REFERENCES households(household_id),

    -- 9. Kiểm tra logic tạm trú
    CONSTRAINT check_temporary_logic CHECK (
        (status = 'Temporary' AND temp_start_date IS NOT NULL AND temp_end_date IS NOT NULL)
        OR 
        (status <> 'Temporary') -- Nếu không phải tạm trú thì thoải mái
    )
);

-- 4. CẬP NHẬT: Thêm khóa ngoại cho Chủ Hộ (Xử lý mối quan hệ 1-1 đại diện)
ALTER TABLE households
ADD CONSTRAINT fk_head_of_household
FOREIGN KEY (head_of_household_id) 
REFERENCES residents(resident_id);


-- Thêm cột deleted_at cho Households
ALTER TABLE households 
ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;

-- Thêm cột deleted_at cho Residents
ALTER TABLE residents 
ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL; 

-- 5. Bảng Temporary_Absences (Tạm vắng)
CREATE TABLE temporary_absences (
    absence_id SERIAL PRIMARY KEY, 
    resident_id INT NOT NULL, -- Nhân khẩu
    destination_address VARCHAR(255), -- Nơi chuyển đến tạm thời
    reason TEXT, -- Lý do
    start_date DATE NOT NULL, -- Ngày bắt đầu
    end_date DATE, -- Ngày kết thúc
    
    CONSTRAINT fk_absent_resident
        FOREIGN KEY (resident_id)
        REFERENCES residents(resident_id)
);

-- 6. Bảng Change_History (Lịch sử biến động)
-- Bảng Log ghi lại ai làm gì, thay đổi hộ nào
CREATE TABLE change_history (
    history_id SERIAL PRIMARY KEY, 
    household_id INT NOT NULL, -- Hộ khẩu
    resident_id INT, -- Nhân khẩu
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Ngày thay đổi
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('Split', 'MoveOut', 'Death', 'NewBirth', 'Added', 'Removed')), -- 'Split', 'MoveOut', 'Death', 'NewBirth'
    changed_by_user_id INT NOT NULL, -- Người thực hiện thay đổi
    
    CONSTRAINT fk_history_household FOREIGN KEY (household_id) REFERENCES households(household_id),
    CONSTRAINT fk_history_resident FOREIGN KEY (resident_id) REFERENCES residents(resident_id),
    CONSTRAINT fk_history_user FOREIGN KEY (changed_by_user_id) REFERENCES users(user_id)
);

-- 7. Bảng Fees (Danh mục khoản thu)
CREATE TABLE fees (
    fee_id SERIAL PRIMARY KEY,
    fee_name VARCHAR(100) NOT NULL, -- Tên khoản thu 'Phí vệ sinh 2024', 'Ủng hộ bão lụt'
    fee_type VARCHAR(20) NOT NULL CHECK (fee_type IN ('Mandatory', 'Voluntary')), -- 'Mandatory', 'Voluntary'
    amount BIGINT CHECK (amount >= 0), -- Số tiền (NULL nếu là tự nguyện đóng góp tùy tâm)
    start_date DATE NOT NULL, -- Ngày bắt đầu
    end_date DATE -- Ngày kết thúc
);

-- 8. Bảng Payment_History (Lịch sử nộp tiền - Bảng trung gian N-N)
CREATE TABLE payment_history (
    payment_id SERIAL PRIMARY KEY,
    fee_id INT NOT NULL,
    household_id INT NOT NULL, 
    amount_paid BIGINT NOT NULL CHECK (amount_paid >= 0), -- Số tiền nộp
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Ngày nộp
    collected_by_user_id INT NOT NULL, -- Cán bộ thu tiền
    notes TEXT, -- Ghi chú
    
    CONSTRAINT fk_payment_fee FOREIGN KEY (fee_id) REFERENCES fees(fee_id),
    CONSTRAINT fk_payment_household FOREIGN KEY (household_id) REFERENCES households(household_id),
    CONSTRAINT fk_payment_user FOREIGN KEY (collected_by_user_id) REFERENCES users(user_id)
);