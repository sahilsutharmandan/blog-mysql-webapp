-- Insert admin user
INSERT INTO users (name, email, password, role, status) VALUES
('Admin User', 'admin@example.com', '$2b$10$examplehashedpassword', 'admin', 'active');

-- Insert regular users
INSERT INTO users (name, email, password, role, status) VALUES
('John Doe', 'john@example.com', '$2b$10$examplehashedpassword', 'user', 'active'),
('Jane Smith', 'jane@example.com', '$2b$10$examplehashedpassword', 'user', 'active'),
('Bob Wilson', 'bob@example.com', '$2b$10$examplehashedpassword', 'user', 'inactive'),
('Alice Brown', 'alice@example.com', '$2b$10$examplehashedpassword', 'user', 'active'),
('Charlie Davis', 'charlie@example.com', '$2b$10$examplehashedpassword', 'user', 'suspended');

-- Insert more users with different statuses
INSERT INTO users (name, email, password, role, status) VALUES
('David Miller', 'david@example.com', '$2b$10$examplehashedpassword', 'user', 'active'),
('Emma Wilson', 'emma@example.com', '$2b$10$examplehashedpassword', 'user', 'inactive'),
('Frank Johnson', 'frank@example.com', '$2b$10$examplehashedpassword', 'user', 'active'),
('Grace Lee', 'grace@example.com', '$2b$10$examplehashedpassword', 'user', 'suspended'),
('Henry Taylor', 'henry@example.com', '$2b$10$examplehashedpassword', 'user', 'active'); 