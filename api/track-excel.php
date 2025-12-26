<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$trackingId = $_GET['tracking_id'] ?? '';

if (empty($trackingId)) {
    echo json_encode(['error' => 'Tracking ID required']);
    exit;
}

// Sample tracking data (replace with your Google Sheets when published)
$sampleData = [
    'FPG001234567' => [
        'trackingId' => 'FPG001234567',
        'status' => 'In Transit',
        'location' => 'Dubai, UAE',
        'estimatedDelivery' => '2024-02-15',
        'lastUpdate' => '2024-01-20 16:45',
        'customerName' => 'John Doe',
        'origin' => 'Shanghai, China',
        'destination' => 'Lagos, Nigeria',
        'weight' => '25.5 kg',
        'serviceType' => 'Air Freight',
        'events' => [
            ['date' => '2024-01-15 09:30', 'location' => 'Shanghai, China', 'status' => 'Package picked up', 'description' => 'Shipment collected from sender'],
            ['date' => '2024-01-16 14:20', 'location' => 'Shanghai Port', 'status' => 'Departed origin facility', 'description' => 'Package left origin country'],
            ['date' => '2024-01-18 08:15', 'location' => 'Dubai, UAE', 'status' => 'In transit', 'description' => 'Package in transit hub'],
            ['date' => '2024-01-20 16:45', 'location' => 'Dubai, UAE', 'status' => 'Customs clearance', 'description' => 'Processing customs documentation']
        ]
    ],
    'FPG001234568' => [
        'trackingId' => 'FPG001234568',
        'status' => 'Delivered',
        'location' => 'Abuja, Nigeria',
        'estimatedDelivery' => '2024-01-20',
        'lastUpdate' => '2024-01-20 14:15',
        'customerName' => 'Jane Smith',
        'origin' => 'Guangzhou, China',
        'destination' => 'Abuja, Nigeria',
        'weight' => '15.3 kg',
        'serviceType' => 'Sea Freight',
        'events' => [
            ['date' => '2024-01-10 10:00', 'location' => 'Guangzhou, China', 'status' => 'Package picked up', 'description' => 'Shipment collected from sender'],
            ['date' => '2024-01-12 15:30', 'location' => 'Lagos Port', 'status' => 'Arrived destination country', 'description' => 'Package arrived in Nigeria'],
            ['date' => '2024-01-15 09:00', 'location' => 'Lagos, Nigeria', 'status' => 'Customs cleared', 'description' => 'Customs clearance completed'],
            ['date' => '2024-01-18 11:30', 'location' => 'Abuja, Nigeria', 'status' => 'Out for delivery', 'description' => 'Package out for final delivery'],
            ['date' => '2024-01-20 14:15', 'location' => 'Abuja, Nigeria', 'status' => 'Delivered', 'description' => 'Package successfully delivered']
        ]
    ]
];

// Try Google Sheets first, fallback to sample data
$sheetUrl = 'https://docs.google.com/spreadsheets/d/11Gm1Nq1M03yEVy1QpH5Tv3d79VCzhNWSrngHdscxAN8/export?format=csv&gid=0';
$csvData = @file_get_contents($sheetUrl);

if ($csvData && strpos($csvData, 'Tracking_ID') !== false) {
    // Parse CSV data
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
    
    if ($trackingData) {
        $response = [
            'trackingId' => $trackingData['Tracking_ID'],
            'status' => $trackingData['Status'],
            'location' => $trackingData['Current_Location'],
            'estimatedDelivery' => $trackingData['Estimated_Delivery'],
            'lastUpdate' => $trackingData['Last_Update'],
            'customerName' => $trackingData['Customer_Name'] ?? '',
            'origin' => $trackingData['Origin'] ?? '',
            'destination' => $trackingData['Destination'] ?? '',
            'weight' => $trackingData['Weight'] ?? '',
            'serviceType' => $trackingData['Service_Type'] ?? '',
            'events' => []
        ];
        
        // Parse tracking events
        if (!empty($trackingData['Events'])) {
            $events = json_decode($trackingData['Events'], true);
            if ($events) {
                $response['events'] = $events;
            }
        }
        
        echo json_encode($response);
        exit;
    }
}

// Fallback to sample data
if (isset($sampleData[strtoupper($trackingId)])) {
    echo json_encode($sampleData[strtoupper($trackingId)]);
} else {
    echo json_encode(['error' => 'Tracking ID not found. Try: FPG001234567 or FPG001234568']);
}
?>