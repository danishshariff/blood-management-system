-- Create Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    contact_no VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    blood_group VARCHAR(5), -- can be null for blood bank staff
    role VARCHAR(20) NOT NULL CHECK (role IN ('donor', 'blood_bank_staff')),
    age INTEGER NOT NULL CHECK (age >= 18),
    gender VARCHAR(10) NOT NULL,
    status VARCHAR(20),
    last_donation_date DATE, -- only for donor, can be null
    bank_id INTEGER REFERENCES blood_banks(bank_id),
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Add check constraint to ensure blood_group is NOT NULL for donors
    CONSTRAINT chk_donor_blood_group CHECK (
        (role = 'blood_bank_staff') OR 
        (role = 'donor' AND blood_group IS NOT NULL)
    )
);

-- Add comment to explain the constraint
COMMENT ON CONSTRAINT chk_donor_blood_group ON users IS 'Ensures blood_group is required for donors but optional for blood bank staff';

-- Create Blood Banks Table
CREATE TABLE blood_banks (
    bank_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contact_no VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    state VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Blood Stock Table
CREATE TABLE blood_stock (
    stock_id SERIAL PRIMARY KEY,
    bank_id INTEGER REFERENCES blood_banks(bank_id),
    blood_group VARCHAR(5) NOT NULL,
    quantity_available INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(bank_id, blood_group)
);

-- Create Donations Table
CREATE TABLE donations (
    donation_id SERIAL PRIMARY KEY,
    donor_id INTEGER REFERENCES users(user_id),
    blood_group VARCHAR(5) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    donation_date DATE NOT NULL,
    bank_id INTEGER REFERENCES blood_banks(bank_id),
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Blood Requests Table
CREATE TABLE blood_requests (
    request_id SERIAL PRIMARY KEY,
    requester_id INTEGER REFERENCES users(user_id),
    blood_group VARCHAR(5) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('normal', 'urgent', 'emergency')),
    reason TEXT NOT NULL,
    bank_id INTEGER REFERENCES blood_banks(bank_id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Direct Blood Requests Table
CREATE TABLE direct_requests (
    request_id SERIAL PRIMARY KEY,
    requester_name VARCHAR(100) NOT NULL,
    contact_no VARCHAR(20) NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reason TEXT NOT NULL,
    bank_id INTEGER REFERENCES blood_banks(bank_id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Notifications Table
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('donation', 'request', 'system')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_blood_group ON users(blood_group);
CREATE INDEX idx_blood_banks_location ON blood_banks(state, city);
CREATE INDEX idx_blood_stock_availability ON blood_stock(bank_id, blood_group);
CREATE INDEX idx_donations_donor ON donations(donor_id);
CREATE INDEX idx_blood_requests_status ON blood_requests(status);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- Sample Blood Groups for reference
COMMENT ON COLUMN users.blood_group IS 'Valid values: A+, A-, B+, B-, O+, O-, AB+, AB-';
COMMENT ON COLUMN blood_stock.blood_group IS 'Valid values: A+, A-, B+, B-, O+, O-, AB+, AB-'; 