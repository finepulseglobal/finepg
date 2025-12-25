<?php
// Simple test script to verify form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "Form submitted successfully!\n";
    echo "Data received:\n";
    foreach ($_POST as $key => $value) {
        echo "$key: " . htmlspecialchars($value) . "\n";
    }
} else {
    echo "No POST data received";
}
?>