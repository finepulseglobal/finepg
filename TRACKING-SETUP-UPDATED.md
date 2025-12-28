# Google Sheets Tracking System Setup

## Current Google Sheets Structure

Your Google Spreadsheet currently has these columns:

| Column Name | Description | Example |
|-------------|-------------|----------|
| S/N | Serial Number | 1, 2, 3 |
| Tracking_ID | Unique tracking identifier | FPG001234567 |
| Customer_Name | Customer name | JOHN DOE |
| Customer_Phone | Customer phone | 9015785967 |
| Customer_Email | Customer email | customer@email.com |
| Origin | Origin location | Guangzhou, China |
| Destination | Destination location | Lagos, Nigeria |
| Status | Current shipment status | In Transit, Delivered |
| Current_Location | Current location | Dubai Port |
| Estimated_Delivery | Expected delivery date | 2024-02-20 |
| Last_Update | Last update info | Package cleared customs |
| Weight | Package weight | 25kg |
| Dimensions | Package dimensions | 50x40x30cm |
| Service_Type | Service type | Air Freight, Sea Freight |
| Value | Package value | $500 |
| Events | Tracking events | JSON or text format |

## Testing

1. **Test Tracking ID**: Use `FPG001234567` to test the system
2. **Test Page**: Open `test-tracking.html` in your browser
3. **Live Site**: Test on your actual website

## Status Options

Recommended status values:
- **Processing**: Initial stage
- **In Transit**: Currently shipping  
- **Customs Clearance**: At customs
- **Out for Delivery**: Final delivery stage
- **Delivered**: Successfully delivered
- **Delayed**: Experiencing delays
- **Exception**: Issues requiring attention