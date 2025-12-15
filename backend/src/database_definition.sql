-- 1. Bảng Users (Cán bộ quản lý)
-- Dùng full_name như đã thống nhất
CREATE TABLE users
(
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    -- Tên đăng nhập
    password VARCHAR(255) NOT NULL,
    -- Mật khẩu
    full_name VARCHAR(100) NOT NULL,
    -- Họ và tên
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff'))
    -- 'admin', 'staff'
);

-- 2. Bảng Households (Hộ khẩu)
CREATE TABLE households
(
    household_id SERIAL PRIMARY KEY,
    household_code VARCHAR(20) UNIQUE NOT NULL,
    -- Số sổ hộ khẩu
    head_of_household_id INT,
    -- Chủ hộ
    address VARCHAR(100) NOT NULL,
    -- Địa chỉ
    date_created DATE DEFAULT CURRENT_DATE,
    -- Ngày tạo
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'MovedOut'))
    -- 'Active', 'MovedOut'
);

-- 3. Bảng Residents (Nhân khẩu)
CREATE TABLE residents
(
    resident_id SERIAL PRIMARY KEY,
    household_id INT NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    -- Họ (Ví dụ: Nguyễn)
    last_name VARCHAR(50) NOT NULL,
    -- Tên (Ví dụ: An)
    nickname VARCHAR(50),
    -- Tên gọi
    dob DATE NOT NULL,
    -- Ngày sinh
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female')),
    -- 'Male', 'Female'
    place_of_birth VARCHAR(255),
    -- Nơi sinh
    place_of_origin VARCHAR(255),
    -- Nguyên quán
    ethnicity VARCHAR(50),
    -- Dân tộc
    occupation VARCHAR(100),
    -- Nghề nghiệp
    workplace VARCHAR(255),
    -- Nơi làm việc
    identity_card_number VARCHAR(20) UNIQUE,
    -- CMND/CCCD
    identity_card_date DATE,
    -- Ngày cấp
    identity_card_place VARCHAR(100),
    -- Nơi cấp
    registration_date DATE DEFAULT CURRENT_DATE,
    -- Ngày đăng ký thường trú
    previous_address VARCHAR(255),
    -- Địa chỉ trước
    relationship_to_head VARCHAR(50) NOT NULL,
    -- Quan hệ với chủ hộ
    notes TEXT,
    -- Ghi chú
    status VARCHAR(20) DEFAULT 'Permanent' CHECK (status IN ('Permanent', 'MovedOut', 'Deceased')) ,
    -- 'Permanent', 'MovedOut', 'Deceased'

    -- Tạo khóa ngoại liên kết với bảng Households
    CONSTRAINT fk_household 
        FOREIGN KEY (household_id) 
        REFERENCES households(household_id)
);

-- 4. CẬP NHẬT: Thêm khóa ngoại cho Chủ Hộ (Xử lý mối quan hệ 1-1 đại diện)
ALTER TABLE households
ADD CONSTRAINT fk_head_of_household
FOREIGN KEY (head_of_household_id) 
REFERENCES residents(resident_id);

-- 5. Bảng Temporary_Residents (Tạm trú)
CREATE TABLE temporary_residents
(
    temp_resident_id SERIAL PRIMARY KEY,
    host_household_id INT NOT NULL,
    -- Chủ hộ
    first_name VARCHAR(50) NOT NULL,
    -- Họ
    last_name VARCHAR(50) NOT NULL,
    -- Tên
    identity_card_number VARCHAR(20),
    -- CMND/CCCD
    dob DATE,
    -- Ngày sinh
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),
    -- 'Male', 'Female'
    home_address VARCHAR(255),
    -- Địa chỉ thường trú ở quê
    reason TEXT,
    -- Lý do
    start_date DATE NOT NULL,
    -- Ngày bắt đầu
    end_date DATE NOT NULL,
    -- Ngày kết thúc

    CONSTRAINT fk_host_household
        FOREIGN KEY (host_household_id)
        REFERENCES households(household_id)
);

-- 6. Bảng Temporary_Absences (Tạm vắng)
CREATE TABLE temporary_absences
(
    absence_id SERIAL PRIMARY KEY,
    resident_id INT NOT NULL,
    -- Nhân khẩu
    destination_address VARCHAR(255),
    -- Nơi chuyển đến tạm thời
    reason TEXT,
    -- Lý do
    start_date DATE NOT NULL,
    -- Ngày bắt đầu
    end_date DATE,
    -- Ngày kết thúc

    CONSTRAINT fk_absent_resident
        FOREIGN KEY (resident_id)
        REFERENCES residents(resident_id)
);

-- 7. Bảng Change_History (Lịch sử biến động)
-- Bảng Log ghi lại ai làm gì, thay đổi hộ nào
CREATE TABLE change_history
(
    history_id SERIAL PRIMARY KEY,
    household_id INT NOT NULL,
    -- Hộ khẩu
    resident_id INT,
    -- Nhân khẩu
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Ngày thay đổi
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('Split', 'MoveOut', 'Death', 'NewBirth', 'UpdateInfo', 'Other')),
    -- 'Split', 'MoveOut', 'Death', 'NewBirth', 'UpdateInfo'
    changed_by_user_id INT NOT NULL,
    -- Người thực hiện thay đổi

    CONSTRAINT fk_history_household FOREIGN KEY (household_id) REFERENCES households(household_id),
    CONSTRAINT fk_history_resident FOREIGN KEY (resident_id) REFERENCES residents(resident_id),
    CONSTRAINT fk_history_user FOREIGN KEY (changed_by_user_id) REFERENCES users(user_id)
);

-- 8. Bảng Fees (Danh mục khoản thu)
CREATE TABLE fees
(
    fee_id SERIAL PRIMARY KEY,
    fee_name VARCHAR(100) NOT NULL,
    -- Tên khoản thu 'Phí vệ sinh 2024', 'Ủng hộ bão lụt'
    fee_type VARCHAR(20) NOT NULL CHECK (fee_type IN ('Mandatory', 'Voluntary')),
    -- 'Mandatory', 'Voluntary'
    amount DECIMAL(15, 2),
    -- Số tiền (NULL nếu là tự nguyện đóng góp tùy tâm)
    start_date DATE NOT NULL,
    -- Ngày bắt đầu
    end_date DATE
    -- Ngày kết thúc
);

-- 9. Bảng Payment_History (Lịch sử nộp tiền - Bảng trung gian N-N)
CREATE TABLE payment_history
(
    payment_id SERIAL PRIMARY KEY,
    fee_id INT NOT NULL,
    household_id INT NOT NULL,
    amount_paid BIGINT NOT NULL,
    -- Số tiền nộp
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Ngày nộp
    collected_by_user_id INT NOT NULL,
    -- Cán bộ thu tiền
    notes TEXT,
    -- Ghi chú

    CONSTRAINT fk_payment_fee FOREIGN KEY (fee_id) REFERENCES fees(fee_id),
    CONSTRAINT fk_payment_household FOREIGN KEY (household_id) REFERENCES households(household_id),
    CONSTRAINT fk_payment_user FOREIGN KEY (collected_by_user_id) REFERENCES users(user_id)
);