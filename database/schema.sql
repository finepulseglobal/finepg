-- FinePulse Global Tracking Database Schema

CREATE DATABASE finepg_tracking;
USE finepg_tracking;

-- Main shipments table
CREATE TABLE shipments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tracking_id VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(100),
    customer_phone VARCHAR(20),
    origin VARCHAR(100),
    destination VARCHAR(100),
    current_status ENUM('Processing', 'In Transit', 'Customs Clearance', 'Out for Delivery', 'Delivered', 'Exception') DEFAULT 'Processing',
    current_location VARCHAR(100),
    estimated_delivery DATE,
    weight DECIMAL(10,2),
    dimensions VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tracking events table (timeline history)
CREATE TABLE tracking_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tracking_id VARCHAR(50),
    event_date DATETIME,
    location VARCHAR(100),
    status VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tracking_id) REFERENCES shipments(tracking_id) ON DELETE CASCADE
);

-- Sample data
INSERT INTO shipments (tracking_id, customer_name, customer_phone, origin, destination, current_status, current_location, estimated_delivery, weight) VALUES
('FPG001234567', 'John Doe', '+2348012345678', 'Shanghai, China', 'Lagos, Nigeria', 'In Transit', 'Dubai, UAE', '2024-02-15', 25.50),
('FPG001234568', 'Jane Smith', '+2349087654321', 'Guangzhou, China', 'Abuja, Nigeria', 'Delivered', 'Abuja, Nigeria', '2024-01-20', 15.30);

INSERT INTO tracking_events (tracking_id, event_date, location, status, description) VALUES
('FPG001234567', '2024-01-15 09:30:00', 'Shanghai, China', 'Package picked up', 'Shipment collected from sender'),
('FPG001234567', '2024-01-16 14:20:00', 'Shanghai Port', 'Departed origin facility', 'Package left origin country'),
('FPG001234567', '2024-01-18 08:15:00', 'Dubai, UAE', 'In transit', 'Package in transit hub'),
('FPG001234567', '2024-01-20 16:45:00', 'Dubai, UAE', 'Customs clearance', 'Processing customs documentation'),

('FPG001234568', '2024-01-10 10:00:00', 'Guangzhou, China', 'Package picked up', 'Shipment collected from sender'),
('FPG001234568', '2024-01-12 15:30:00', 'Lagos Port', 'Arrived destination country', 'Package arrived in Nigeria'),
('FPG001234568', '2024-01-15 09:00:00', 'Lagos, Nigeria', 'Customs cleared', 'Customs clearance completed'),
('FPG001234568', '2024-01-18 11:30:00', 'Abuja, Nigeria', 'Out for delivery', 'Package out for final delivery'),
('FPG001234568', '2024-01-20 14:15:00', 'Abuja, Nigeria', 'Delivered', 'Package successfully delivered');