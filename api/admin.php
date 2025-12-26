<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Database connection
$host = 'localhost';
$dbname = 'finepg_tracking';
$username = 'your_db_user';
$password = 'your_db_password';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$action = $_GET['action'] ?? '';

switch($action) {
    case 'add_shipment':
        $tracking_id = $_POST['tracking_id'] ?? '';
        $customer_name = $_POST['customer_name'] ?? '';
        $origin = $_POST['origin'] ?? '';
        $destination = $_POST['destination'] ?? '';
        $status = $_POST['status'] ?? 'Processing';
        $estimated_delivery = $_POST['estimated_delivery'] ?? '';
        
        if (empty($tracking_id) || empty($customer_name)) {
            echo json_encode(['error' => 'Required fields missing']);
            exit;
        }
        
        try {
            $stmt = $pdo->prepare("INSERT INTO shipments (tracking_id, customer_name, origin, destination, current_status, current_location, estimated_delivery) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$tracking_id, $customer_name, $origin, $destination, $status, $origin, $estimated_delivery]);
            
            // Add initial tracking event
            $stmt = $pdo->prepare("INSERT INTO tracking_events (tracking_id, event_date, location, status, description) VALUES (?, NOW(), ?, ?, ?)");
            $stmt->execute([$tracking_id, $origin, 'Shipment created', 'Shipment registered in system']);
            
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            echo json_encode(['error' => 'Failed to add shipment: ' . $e->getMessage()]);
        }
        break;
        
    case 'add_event':
        $tracking_id = $_POST['tracking_id'] ?? '';
        $location = $_POST['location'] ?? '';
        $status = $_POST['status'] ?? '';
        $event_date = $_POST['event_date'] ?? '';
        $description = $_POST['description'] ?? '';
        
        if (empty($tracking_id) || empty($location) || empty($status)) {
            echo json_encode(['error' => 'Required fields missing']);
            exit;
        }
        
        try {
            // Add tracking event
            $stmt = $pdo->prepare("INSERT INTO tracking_events (tracking_id, event_date, location, status, description) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$tracking_id, $event_date, $location, $status, $description]);
            
            // Update shipment current status and location
            $stmt = $pdo->prepare("UPDATE shipments SET current_status = ?, current_location = ?, updated_at = NOW() WHERE tracking_id = ?");
            $stmt->execute([$status, $location, $tracking_id]);
            
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            echo json_encode(['error' => 'Failed to add tracking event: ' . $e->getMessage()]);
        }
        break;
        
    default:
        echo json_encode(['error' => 'Invalid action']);
}
?>