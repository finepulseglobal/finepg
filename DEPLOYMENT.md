# FinePulse Production Deployment Checklist

This project is intentionally simple for launch: static pages, a Vercel serverless tracking API, Google Sheets as the tracking data source, and booking handoff through email plus WhatsApp.

## Vercel Environment Variables

Add these in Vercel under Project Settings -> Environment Variables:

```env
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=11Gm1Nq1M03yEVy1QpH5Tv3d79VCzhNWSrngHdscxAN8
GOOGLE_SHEET_RANGE=Sheet1!A:L
TRACKING_SHOW_PRIVATE_CONTACTS=false
```

Keep `TRACKING_SHOW_PRIVATE_CONTACTS=false` unless FinePulse wants customer phone numbers and emails visible on public tracking result pages.

## Google Sheet Setup

Share the tracking spreadsheet with the service account email from `GOOGLE_CLIENT_EMAIL`.

The sheet should keep this column order:

```text
S/N, Tracking_ID, Customer_Name, Customer Phone, Customer_Email, Origin, Destination, Status, Current_Location, Estimated_Delivery, Last_Update, Weight
```

The public tracking form searches by `Tracking_ID` only.

## Booking Form

The booking form currently opens:

- Email: `book-ings@finepg.com`
- WhatsApp: `+234 813 342 0527`

This keeps operations easy for launch. A database or CRM can be added later when volume increases.

## Live Assistance Chat

The floating FinePulse assistant is fully independent and runs from the site files only. It does not use a third-party chat provider.

Current launch behavior:

- Collects visitor name, email, and phone number.
- Asks for the support problem or shipment need.
- Generates a FinePulse support case ID.
- Answers common questions from the site knowledge base.
- Stores recent cases in the visitor browser through `localStorage`.
- Prepares advisor handoff by email and WhatsApp using the submitted transcript.
- Prepares a customer email copy using the visitor-provided email address.

Because no third-party service or SMTP server is connected, the browser cannot silently send email in the background. The visitor still needs to use the generated email or WhatsApp handoff action. A server-side mailer can be added later if FinePulse wants automatic delivery without user confirmation.

## SEO Launch Steps

After the production domain is live:

1. Verify `https://finepg.com/` in Google Search Console.
2. Submit `https://finepg.com/sitemap.xml`.
3. Confirm `https://finepg.com/robots.txt` is reachable.
4. Keep `track-result.html` excluded from indexing because it displays customer shipment lookup data.
5. Add GA4 only when FinePulse has a real Measurement ID. Do not publish a placeholder analytics ID.

## Final QA Before Launch

Check these manually on the live Vercel URL and production domain:

- Homepage quote form opens email and WhatsApp with the submitted details.
- Tracking form redirects to `track-result.html?tracking_id=...`.
- A valid tracking ID returns the correct Google Sheet row.
- An invalid tracking ID displays a clean not-found message.
- Footer links and navigation are consistent across pages.
- Mobile menu opens and closes correctly.
- Search Console can fetch the homepage, sitemap, and key service pages.
