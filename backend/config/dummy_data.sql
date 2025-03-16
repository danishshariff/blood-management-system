-- Dummy data for blood stock
INSERT INTO blood_stock (bank_id, blood_group, quantity_available) VALUES
(1, 'A+', 50),
(1, 'A-', 30),
(1, 'B+', 45),
(1, 'B-', 25),
(1, 'O+', 60),
(1, 'O-', 40),
(1, 'AB+', 20),
(1, 'AB-', 15);

-- Dummy data for donations (assuming user_id 1 is a donor and bank_id 1 exists)
INSERT INTO donations (donor_id, blood_group, quantity, donation_date, bank_id, status) VALUES
(1, 'A+', 1, CURRENT_DATE - INTERVAL '100 days', 1, 'completed'),
(1, 'A+', 1, CURRENT_DATE - INTERVAL '200 days', 1, 'completed'),
(1, 'A+', 1, CURRENT_DATE - INTERVAL '300 days', 1, 'completed'),
(2, 'B+', 1, CURRENT_DATE - INTERVAL '50 days', 1, 'completed'),
(2, 'B+', 1, CURRENT_DATE - INTERVAL '150 days', 1, 'completed');

-- Dummy data for blood requests
INSERT INTO blood_requests (requester_id, blood_group, quantity, urgency, reason, bank_id, status) VALUES
(2, 'A+', 2, 'urgent', 'Surgery requirement', 1, 'pending'),
(3, 'O+', 1, 'normal', 'Regular transfusion', 1, 'pending'),
(4, 'B-', 3, 'emergency', 'Accident case', 1, 'fulfilled');

-- Dummy data for direct requests
INSERT INTO direct_requests (requester_name, contact_no, blood_group, quantity, reason, bank_id, status) VALUES
('John Doe', '1234567890', 'AB+', 2, 'Emergency surgery', 1, 'pending'),
('Jane Smith', '9876543210', 'O-', 1, 'Cancer treatment', 1, 'pending'); 