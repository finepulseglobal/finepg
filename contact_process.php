<?php

// contact_process.php
// Modified to redirect to WhatsApp instead of sending email

// Use POST only
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	http_response_code(405);
	echo 'Method Not Allowed';
	exit;
}

// collect and sanitize inputs
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$subject_field = isset($_POST['subject']) ? trim($_POST['subject']) : '';
$number = isset($_POST['number']) ? trim($_POST['number']) : '';
$departure = isset($_POST['departure']) ? trim($_POST['departure']) : '';
$arrival = isset($_POST['arrival']) ? trim($_POST['arrival']) : '';
$weight = isset($_POST['weight']) ? trim($_POST['weight']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';
$extra_service = isset($_POST['extra_service']) ? trim($_POST['extra_service']) : '';

// basic validation
if (empty($name) || empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($message)) {
	http_response_code(400);
	echo 'Please complete required fields.';
	exit;
}

// Prepare WhatsApp message
$whatsapp_message = "*New Quote Request from Website*\n\n";
$whatsapp_message .= "*Name:* $name\n";
$whatsapp_message .= "*Email:* $email\n";
if ($number) $whatsapp_message .= "*Contact Number:* $number\n";
if ($subject_field) $whatsapp_message .= "*Service:* $subject_field\n";
if ($departure) $whatsapp_message .= "*City of Departure:* $departure\n";
if ($arrival) $whatsapp_message .= "*City of Arrival:* $arrival\n";
if ($weight) $whatsapp_message .= "*KG/CBM:* $weight\n";
if ($extra_service) $whatsapp_message .= "*Extra Service:* $extra_service\n";
$whatsapp_message .= "\n*Message:*\n$message";

// URL encode the message for WhatsApp
$encoded_message = urlencode($whatsapp_message);

// WhatsApp number (replace with your actual WhatsApp number)
$whatsapp_number = '8613411179135';

// Create WhatsApp URL
$whatsapp_url = "https://wa.me/$whatsapp_number?text=$encoded_message";

// Return the WhatsApp URL to JavaScript
echo json_encode(['status' => 'success', 'whatsapp_url' => $whatsapp_url]);

?>