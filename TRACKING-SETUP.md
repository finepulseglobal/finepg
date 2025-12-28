# Google Sheets Tracking System Setup

## Required Google Sheets Structure

Your Google Spreadsheet should have the following columns (case-insensitive):

| Column Name | Description | Example |
|-------------|-------------|---------|
| tracking_id | Unique tracking identifier | FPG001, FPG002, etc. |
| status | Current shipment status | In Transit, Delivered, Processing |
| origin | Origin location | Guangzhou, China |
| destination | Destination location | Lagos, Nigeria |
| ship_date | Date shipped | 2024-01-15 |
| expected_delivery | Expected delivery date | 2024-02-20 |
| current_location | Current location | Dubai Port |
| notes | Additional information | Customs clearance in progress |

## Setup Instructions

1. **Create Google Spreadsheet**: Create a new Google Spreadsheet with the columns above
2. **Publish to Web**: 
   - Go to File → Share → Publish to web
   - Choose "Entire Document" and "Comma-separated values (.csv)"
   - Click "Publish"
   - Copy the published URL

3. **Update JavaScript**: Replace the SHEET_URL in `/assets/js/tracking.js` with your published CSV URL

## Sample Data

```
tracking_id,status,origin,destination,ship_date,expected_delivery,current_location,notes
FPG001,In Transit,Guangzhou China,Lagos Nigeria,2024-01-15,2024-02-20,Dubai Port,Customs clearance in progress
FPG002,Delivered,Shanghai China,Abuja Nigeria,2024-01-10,2024-02-15,Delivered,Package delivered successfully
FPG003,Processing,Shenzhen China,Port Harcourt Nigeria,2024-01-20,2024-02-25,Origin Facility,Preparing for shipment
```

## Status Options

Recommended status values for consistent styling:
- **Processing**: Initial stage
- **In Transit**: Currently shipping
- **Customs Clearance**: At customs
- **Out for Delivery**: Final delivery stage
- **Delivered**: Successfully delivered
- **Delayed**: Experiencing delays
- **Exception**: Issues requiring attention

## Notes

- The system is case-insensitive for tracking IDs
- Make sure your Google Sheet is publicly accessible via the published link
- Update the sheet regularly for real-time tracking
- The system will automatically parse CSV data and display results in a modal