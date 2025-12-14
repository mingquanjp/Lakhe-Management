CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff'))
);

CREATE TABLE households (
    household_id SERIAL PRIMARY KEY, 
    household_code VARCHAR(20) UNIQUE NOT NULL,
    head_of_household_id INT,
    address VARCHAR(100) NOT NULL,
    date_created DATE DEFAULT CURRENT_DATE,
    deleted_at TIMESTAMP DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'MovedOut', 'Temporary'))
);

CREATE TABLE residents (
    resident_id SERIAL PRIMARY KEY,
    household_id INT NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    nickname VARCHAR(50),
    dob DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female')),
    place_of_birth VARCHAR(255),
    place_of_origin VARCHAR(255),
    ethnicity VARCHAR(50),
    occupation VARCHAR(100),
    workplace VARCHAR(255),
    identity_card_number VARCHAR(20) UNIQUE,
    identity_card_date DATE,
    identity_card_place VARCHAR(100),
    registration_date DATE DEFAULT CURRENT_DATE,
    previous_address VARCHAR(255),
    relationship_to_head VARCHAR(50) NOT NULL,
    notes TEXT,
    temp_home_address VARCHAR(255),
    temp_start_date DATE,
    temp_end_date DATE,
    temp_reason TEXT,
    deleted_at TIMESTAMP DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'Permanent' CHECK (status IN ('Permanent', 'MovedOut', 'Deceased', 'Temporary')),
    CONSTRAINT fk_household FOREIGN KEY (household_id) REFERENCES households(household_id),
    CONSTRAINT check_temporary_logic CHECK (
        (status = 'Temporary' AND temp_start_date IS NOT NULL AND temp_end_date IS NOT NULL)
        OR (status <> 'Temporary')
    )
);

ALTER TABLE households
ADD CONSTRAINT fk_head_of_household
FOREIGN KEY (head_of_household_id) REFERENCES residents(resident_id);

CREATE TABLE temporary_absences (
    absence_id SERIAL PRIMARY KEY, 
    resident_id INT NOT NULL,
    destination_address VARCHAR(255),
    reason TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    CONSTRAINT fk_absent_resident FOREIGN KEY (resident_id) REFERENCES residents(resident_id)
);

CREATE TABLE change_history (
    history_id SERIAL PRIMARY KEY, 
    household_id INT NOT NULL,
    resident_id INT,
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('Split', 'MoveOut', 'Death', 'NewBirth', 'Added', 'Removed')),
    changed_by_user_id INT NOT NULL,
    CONSTRAINT fk_history_household FOREIGN KEY (household_id) REFERENCES households(household_id),
    CONSTRAINT fk_history_resident FOREIGN KEY (resident_id) REFERENCES residents(resident_id),
    CONSTRAINT fk_history_user FOREIGN KEY (changed_by_user_id) REFERENCES users(user_id)
);

CREATE TABLE fees (
    fee_id SERIAL PRIMARY KEY,
    fee_name VARCHAR(100) NOT NULL,
    fee_type VARCHAR(20) NOT NULL CHECK (fee_type IN ('Mandatory', 'Voluntary')),
    amount BIGINT CHECK (amount >= 0),
    start_date DATE NOT NULL,
    end_date DATE
);

CREATE TABLE payment_history (
    payment_id SERIAL PRIMARY KEY,
    fee_id INT NOT NULL,
    household_id INT NOT NULL, 
    amount_paid BIGINT NOT NULL CHECK (amount_paid >= 0),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    collected_by_user_id INT NOT NULL,
    notes TEXT,
    CONSTRAINT fk_payment_fee FOREIGN KEY (fee_id) REFERENCES fees(fee_id),
    CONSTRAINT fk_payment_household FOREIGN KEY (household_id) REFERENCES households(household_id),
    CONSTRAINT fk_payment_user FOREIGN KEY (collected_by_user_id) REFERENCES users(user_id)
);