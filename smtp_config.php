<?php
// SMTP configuration for FinePulse Global Limited
return [
    // SMTP host - using a generic SMTP service
    'host' => 'smtp.gmail.com',
    // SMTP port (587 for TLS, 465 for SSL)
    'port' => 587,
    // encryption: 'tls' or 'ssl'
    'encryption' => 'tls',
    // SMTP authentication username (replace with actual email)
    'username' => 'info@sendpg.com',
    // SMTP authentication password (replace with actual password)
    'password' => 'your-app-password-here',
    // whether to use SMTP auth (true/false)
    'smtp_auth' => true,
    // From address used when sending
    'from_email' => 'no-reply@sendpg.com',
    'from_name' => 'FinePulse Website',
];