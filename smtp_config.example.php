<?php
// Copy this file to smtp_config.php and fill values for SMTP mail sending.
return [
    // SMTP host (e.g., smtp.gmail.com)
    'host' => 'smtp.example.com',
    // SMTP port (587 for TLS, 465 for SSL)
    'port' => 587,
    // encryption: 'tls' or 'ssl'
    'encryption' => 'tls',
    // SMTP authentication username
    'username' => 'your-smtp-user@example.com',
    // SMTP authentication password
    'password' => 'your-smtp-password',
    // whether to use SMTP auth (true/false)
    'smtp_auth' => true,
    // From address used when sending
    'from_email' => 'no-reply@finepg.com',
    'from_name' => 'FinePulse Website',
];
