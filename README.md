# Fine Pulse Global Limited

Website for Fine Pulse Global Limited, a transportation and logistics company.

## Overview
This is a static HTML5 template customized for Fine Pulse Global Limited.

## Contact form SMTP (PHPMailer)

To improve email deliverability, the project supports PHPMailer with SMTP. Install dependencies with Composer:

```bash
composer install
```

Copy `smtp_config.example.php` to `smtp_config.php` and fill in your SMTP credentials. The `contact_process.php` will use PHPMailer automatically when `vendor/autoload.php` is present, otherwise it will fall back to PHP `mail()`.

If you don't have Composer on your server, you can still use `mail()` but SMTP is recommended for production.
