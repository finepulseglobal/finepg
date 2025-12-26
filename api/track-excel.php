<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$trackingId = $_GET['tracking_id'] ?? '';

if (empty($trackingId)) {
    echo json_encode(['error' => 'Tracking ID required']);
    exit;
}

// Google Sheets CSV URL (replace with your actual sheet URL)
// To get this URL: File > Publish to web > CSV format
$sheetUrl = 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0';

// Read CSV data
$csvData = @file_get_contents($sheetUrl);

if (!$csvData) {
    echo json_encode(['error' => 'Unable to fetch tracking data']);
    exit;
}

// Parse CSV
$lines = explode("\n", $csvData);
$headers = str_getcsv($lines[0]);

// Find tracking record
$trackingData = null;
for ($i = 1; $i < count($lines); $i++) {
    if (empty(trim($lines[$i]))) continue;
    
    $row = str_getcsv($lines[$i]);
    if (count($row) >= count($headers) && strtoupper($row[0]) === strtoupper($trackingId)) {
        $trackingData = array_combine($headers, $row);
        break;
    }
}

if (!$trackingData) {
    echo json_encode(['error' => 'Tracking ID not found']);
    exit;
}

// Format response
$response = [
    'trackingId' => $trackingData['Tracking_ID'],
    'status' => $trackingData['Status'],
    'location' => $trackingData['Current_Location'],
    'estimatedDelivery' => $trackingData['Estimated_Delivery'],
    'lastUpdate' => $trackingData['Last_Update'],
    'customerName' => $trackingData['Customer_Name'] ?? '',
    'origin' => $trackingData['Origin'] ?? '',
    'destination' => $trackingData['Destination'] ?? '',
    'events' => []
];

// Parse tracking events (stored as JSON in Events column)
if (!empty($trackingData['Events'])) {
    $events = json_decode($trackingData['Events'], true);
    if ($events) {
        $response['events'] = $events;
    }
}

echo json_encode($response);
?>