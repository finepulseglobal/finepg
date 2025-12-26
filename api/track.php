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

$trackingId = $_GET['tracking_id'] ?? '';

if (empty($trackingId)) {
    echo json_encode(['error' => 'Tracking ID required']);
    exit;
}

// Get shipment data
$stmt = $pdo->prepare("SELECT * FROM shipments WHERE tracking_id = ?");
$stmt->execute([$trackingId]);
$shipment = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$shipment) {
    echo json_encode(['error' => 'Tracking ID not found']);
    exit;
}

// Get tracking events
$stmt = $pdo->prepare("SELECT * FROM tracking_events WHERE tracking_id = ? ORDER BY event_date DESC");
$stmt->execute([$trackingId]);
$events = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Return tracking data
echo json_encode([
    'trackingId' => $shipment['tracking_id'],
    'status' => $shipment['current_status'],
    'location' => $shipment['current_location'],
    'estimatedDelivery' => $shipment['estimated_delivery'],
    'lastUpdate' => $shipment['updated_at'],
    'events' => $events
]);
?>