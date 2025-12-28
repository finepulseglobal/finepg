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
            ['event_date' => '2024-01-15 09:30', 'location' => 'Shanghai, China', 'status' => 'Package picked up', 'description' => 'Shipment collected from sender'],
            ['event_date' => '2024-01-16 14:20', 'location' => 'Shanghai Port', 'status' => 'Departed origin facility', 'description' => 'Package left origin country'],
            ['event_date' => '2024-01-18 08:15', 'location' => 'Dubai, UAE', 'status' => 'In transit', 'description' => 'Package in transit hub'],
            ['event_date' => '2024-01-20 16:45', 'location' => 'Dubai, UAE', 'status' => 'Customs clearance', 'description' => 'Processing customs documentation']
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
            ['event_date' => '2024-01-10 10:00', 'location' => 'Guangzhou, China', 'status' => 'Package picked up', 'description' => 'Shipment collected from sender'],
            ['event_date' => '2024-01-12 15:30', 'location' => 'Lagos Port', 'status' => 'Arrived destination country', 'description' => 'Package arrived in Nigeria'],
            ['event_date' => '2024-01-15 09:00', 'location' => 'Lagos, Nigeria', 'status' => 'Customs cleared', 'description' => 'Customs clearance completed'],
            ['event_date' => '2024-01-18 11:30', 'location' => 'Abuja, Nigeria', 'status' => 'Out for delivery', 'description' => 'Package out for final delivery'],
            ['event_date' => '2024-01-20 14:15', 'location' => 'Abuja, Nigeria', 'status' => 'Delivered', 'description' => 'Package successfully delivered']
        ]
    ]
];

// Try Google Sheets first, fallback to sample data
$sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRmDozHqFEhBIGZrqgERJO6KN9bycXwyTYFD1eKswfa3PnO22N6b-QFx08Ll-V7SCfYkNcRsWCGB2FM/pub?gid=0&single=true&output=csv';

function fetch_url_contents($url) {
    // Try file_get_contents first
    $data = @file_get_contents($url);
    if ($data !== false) return $data;

    // Fallback to cURL
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $data = curl_exec($ch);
        $err = curl_error($ch);
        // cURL handle is automatically closed when variable goes out of scope
        unset($ch);
        if ($data !== false && $data !== '') return $data;
    }
    return false;
}

$csvData = fetch_url_contents($sheetUrl);

if ($csvData && trim($csvData) !== '') {
    // Parse CSV and normalize headers to be forgiving of variations
    $lines = preg_split('/\r?\n/', trim($csvData));
    if (count($lines) > 0) {
        $rawHeaders = str_getcsv(array_shift($lines));
        $headers = [];
        foreach ($rawHeaders as $h) {
            $k = preg_replace('/[^A-Za-z0-9]/', '_', trim($h));
            $k = strtoupper($k);
            $headers[] = $k;
        }

        // Determine index of tracking id column (allow many header names)
        $trackingIdx = null;
        foreach ($headers as $i => $h) {
            if (in_array($h, ['TRACKING_ID', 'TRACKINGID', 'ID', 'TRACKING'])) { $trackingIdx = $i; break; }
        }

        // If no explicit column found, assume first column
        if ($trackingIdx === null) $trackingIdx = 0;

        $found = null;
        foreach ($lines as $line) {
            if (trim($line) === '') continue;
            $row = str_getcsv($line);
            if (!isset($row[$trackingIdx])) continue;
            if (strtoupper(trim($row[$trackingIdx])) === strtoupper(trim($trackingId))) {
                // Build associative row with normalized header keys
                $assoc = [];
                for ($i = 0; $i < count($headers); $i++) {
                    $assoc[$headers[$i]] = $row[$i] ?? '';
                }

                // Map to response fields (tolerant to header names)
                $response = [
                    'trackingId' => $assoc['TRACKING_ID'] ?? $assoc['ID'] ?? $assoc['TRACKINGID'] ?? $trackingId,
                    'status' => $assoc['STATUS'] ?? '',
                    'location' => $assoc['CURRENT_LOCATION'] ?? $assoc['LOCATION'] ?? '',
                    'estimatedDelivery' => $assoc['ESTIMATED_DELIVERY'] ?? '',
                    'lastUpdate' => $assoc['LAST_UPDATE'] ?? '',
                    'customerName' => $assoc['CUSTOMER_NAME'] ?? '',
                    'origin' => $assoc['ORIGIN'] ?? '',
                    'destination' => $assoc['DESTINATION'] ?? '',
                    'weight' => $assoc['WEIGHT'] ?? '',
                    'serviceType' => $assoc['SERVICE_TYPE'] ?? '',
                    'events' => []
                ];

                // Parse events if provided as JSON in a cell and normalize keys
                if (!empty($assoc['EVENTS'])) {
                    $events = json_decode($assoc['EVENTS'], true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($events)) {
                        $normalized = [];
                        foreach ($events as $ev) {
                            if (is_string($ev)) {
                                // if events are simple strings, wrap them
                                $normalized[] = ['event_date' => '', 'location' => '', 'status' => $ev, 'description' => ''];
                                continue;
                            }
                            if (!is_array($ev)) continue;
                            // convert common 'date' key to 'event_date' expected by front-end
                            if (isset($ev['event_date'])) {
                                // already correct
                            } elseif (isset($ev['date'])) {
                                $ev['event_date'] = $ev['date'];
                                unset($ev['date']);
                            }
                            $normalized[] = $ev;
                        }
                        $response['events'] = $normalized;
                    }
                }

                echo json_encode($response);
                exit;
            }
        }
    }
}

// Fallback to sample data
if (isset($sampleData[strtoupper($trackingId)])) {
    echo json_encode($sampleData[strtoupper($trackingId)]);
} else {
    echo json_encode(['error' => 'Tracking ID not found. Try: FPG001234567 or FPG001234568']);
}
?>