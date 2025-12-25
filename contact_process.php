<?php

// contact_process.php
// Enhanced: supports PHPMailer via Composer (preferred) with SMTP, otherwise falls back to mail()

// Use POST only
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	http_response_code(405);
	echo 'Method Not Allowed';
	exit;
}

function has_header_injection($str) {
	return preg_match('/[\r\n]/', $str);
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

// basic validation
if (empty($name) || empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($message)) {
	http_response_code(400);
	echo 'Please complete required fields.';
	exit;
}

// protect against header injection
if (has_header_injection($name) || has_header_injection($email) || has_header_injection($subject_field)) {
	http_response_code(400);
	echo 'Invalid input.';
	exit;
}

// prepare email content
$to = 'info@sendpg.com';
$mailSubject = 'Website message: ' . ($subject_field ?: 'Quote Request');

$body = '<html><body>';
$body .= '<h2>New message from FinePulse website</h2>';
$body .= '<p><strong>Name:</strong> ' . htmlspecialchars($name) . '</p>';
$body .= '<p><strong>Email:</strong> ' . htmlspecialchars($email) . '</p>';
if ($number) $body .= '<p><strong>Contact Number:</strong> ' . htmlspecialchars($number) . '</p>';
if ($subject_field) $body .= '<p><strong>Service:</strong> ' . htmlspecialchars($subject_field) . '</p>';
if ($departure) $body .= '<p><strong>City of Departure:</strong> ' . htmlspecialchars($departure) . '</p>';
if ($arrival) $body .= '<p><strong>City of Arrival:</strong> ' . htmlspecialchars($arrival) . '</p>';
if ($weight) $body .= '<p><strong>KG/CBM:</strong> ' . htmlspecialchars($weight) . '</p>';
$body .= '<hr>';
$body .= '<p>' . nl2br(htmlspecialchars($message)) . '</p>';
$body .= '</body></html>';

// Try to send via PHPMailer if available (composer autoload)
$sent = false;
$error = null;
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
	require __DIR__ . '/vendor/autoload.php';
	// load optional SMTP config if present
	$smtpCfg = [];
	if (file_exists(__DIR__ . '/smtp_config.php')) {
		$smtpCfg = include __DIR__ . '/smtp_config.php';
	}
	try {
		$mail = new PHPMailer\PHPMailer\PHPMailer(true);
		// SMTP if configured
		if (!empty($smtpCfg)) {
			$mail->isSMTP();
			$mail->Host = $smtpCfg['host'] ?? '';
			$mail->SMTPAuth = $smtpCfg['smtp_auth'] ?? true;
			$mail->Username = $smtpCfg['username'] ?? '';
			$mail->Password = $smtpCfg['password'] ?? '';
			$mail->SMTPSecure = $smtpCfg['encryption'] ?? ($smtpCfg['port'] == 465 ? 'ssl' : 'tls');
			$mail->Port = $smtpCfg['port'] ?? 587;
		}
		// From and Reply-To
		$mail->setFrom($smtpCfg['from_email'] ?? 'no-reply@finepg.com', $smtpCfg['from_name'] ?? 'FinePulse Website');
		$mail->addReplyTo($email, $name);
		$mail->addAddress($to);
		$mail->isHTML(true);
		$mail->Subject = $mailSubject;
		$mail->Body = $body;
		$mail->AltBody = strip_tags(str_replace('<br>', "\n", $body));
		$sent = $mail->send();
	} catch (Exception $e) {
		$error = $e->getMessage();
		$sent = false;
	}
}

// Fallback to mail() if PHPMailer not available or send failed
if (!$sent) {
	$headers = "From: " . $email . "\r\n";
	$headers .= "Reply-To: " . $email . "\r\n";
	$headers .= "MIME-Version: 1.0\r\n";
	$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
	$sent = mail($to, $mailSubject, $body, $headers);
}

if ($sent) {
	echo 'OK';
} else {
	http_response_code(500);
	if (!empty($error)) {
		// Don't leak internal errors in production; useful for local debug.
		echo 'Failed to send message. ' . htmlspecialchars($error);
	} else {
		echo 'Failed to send message.';
	}
}

?>