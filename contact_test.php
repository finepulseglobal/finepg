<?php
// Test version - always returns success
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo 'Method Not Allowed';
    exit;
}

// Log the form data for debugging
error_log('Form submission test - Data: ' . print_r($_POST, true));

// Always return success for testing
echo 'OK';
?>