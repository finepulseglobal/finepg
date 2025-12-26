# Excel-Based Tracking System Setup

## Step 1: Create Google Sheet
1. Go to Google Sheets (sheets.google.com)
2. Create a new spreadsheet
3. Name it "FinePulse Tracking Data"

## Step 2: Set Up Columns
Add these column headers in Row 1:
- A1: Tracking_ID
- B1: Customer_Name  
- C1: Origin
- D1: Destination
- E1: Status
- F1: Current_Location
- G1: Estimated_Delivery
- H1: Last_Update
- I1: Events

## Step 3: Add Sample Data
Copy data from tracking-template.csv into your sheet

## Step 4: Publish Sheet
1. File > Publish to web
2. Select "Entire Document" 
3. Choose "Comma-separated values (.csv)"
4. Click "Publish"
5. Copy the generated URL

## Step 5: Update API
1. Open api/track-excel.php
2. Replace YOUR_SHEET_ID with your actual sheet ID from the URL
3. Example: https://docs.google.com/spreadsheets/d/1ABC123.../export?format=csv&gid=0

## Column Descriptions:
- **Tracking_ID**: Unique shipment identifier (FPG001234567)
- **Customer_Name**: Customer's full name
- **Origin**: Shipping origin location
- **Destination**: Final delivery location  
- **Status**: Current status (Processing, In Transit, Delivered, etc.)
- **Current_Location**: Current shipment location
- **Estimated_Delivery**: Expected delivery date (YYYY-MM-DD)
- **Last_Update**: Last update timestamp (YYYY-MM-DD HH:MM)
- **Events**: JSON array of tracking events

## Events Format:
```json
[
  {"date":"2024-01-15 09:30","location":"Shanghai, China","status":"Package picked up"},
  {"date":"2024-01-16 14:20","location":"Shanghai Port","status":"Departed origin facility"}
]
```

## Benefits:
- Easy to manage via Excel/Google Sheets
- No database setup required
- Real-time updates when sheet is modified
- Admin can update from anywhere
- Automatic backup via Google Drive