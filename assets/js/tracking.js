// Google Sheets tracking system
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRmDozHqFEhBIGZrqgERJO6KN9bycXwyTYFD1eKswfa3PnO22N6b-QFx08Ll-V7SCfYkNcRsWCGB2FM/pub?gid=0&single=true&output=csv';

async function trackShipment() {
    const trackingId = document.getElementById('trackingNumber').value.trim();
    
    if (!trackingId) {
        alert('Please enter a tracking ID');
        return;
    }

    // Show loading
    const trackBtn = document.querySelector('.track-btn');
    const originalText = trackBtn.textContent;
    trackBtn.textContent = 'Tracking...';
    trackBtn.disabled = true;

    try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();
        const data = parseCSV(csvText);
        
        const shipment = data.find(row => 
            row.tracking_id && row.tracking_id.toLowerCase() === trackingId.toLowerCase()
        );

        if (shipment) {
            displayTrackingResults(shipment);
        } else {
            displayNotFound(trackingId);
        }
    } catch (error) {
        console.error('Tracking error:', error);
        displayError();
    } finally {
        trackBtn.textContent = originalText;
        trackBtn.disabled = false;
    }
}

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            data.push(row);
        }
    }
    return data;
}

function displayTrackingResults(shipment) {
    const resultsHtml = `
        <div class="tracking-info">
            <div class="row">
                <div class="col-md-6">
                    <h6><strong>Tracking ID:</strong></h6>
                    <p>${shipment.tracking_id || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    <h6><strong>Status:</strong></h6>
                    <p><span class="badge badge-${getStatusColor(shipment.status)}">${shipment.status || 'N/A'}</span></p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <h6><strong>Origin:</strong></h6>
                    <p>${shipment.origin || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    <h6><strong>Destination:</strong></h6>
                    <p>${shipment.destination || 'N/A'}</p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <h6><strong>Ship Date:</strong></h6>
                    <p>${shipment.ship_date || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    <h6><strong>Expected Delivery:</strong></h6>
                    <p>${shipment.expected_delivery || 'N/A'}</p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <h6><strong>Current Location:</strong></h6>
                    <p>${shipment.current_location || 'N/A'}</p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <h6><strong>Notes:</strong></h6>
                    <p>${shipment.notes || 'No additional information available'}</p>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('trackingResults').innerHTML = resultsHtml;
    $('#trackingModal').modal('show');
}

function displayNotFound(trackingId) {
    const resultsHtml = `
        <div class="alert alert-warning">
            <h5><i class="fas fa-exclamation-triangle"></i> Tracking ID Not Found</h5>
            <p>We couldn't find any shipment with tracking ID: <strong>${trackingId}</strong></p>
            <p>Please check your tracking ID and try again, or contact our support team for assistance.</p>
        </div>
    `;
    
    document.getElementById('trackingResults').innerHTML = resultsHtml;
    $('#trackingModal').modal('show');
}

function displayError() {
    const resultsHtml = `
        <div class="alert alert-danger">
            <h5><i class="fas fa-exclamation-circle"></i> Tracking System Error</h5>
            <p>We're experiencing technical difficulties with our tracking system. Please try again later or contact our support team.</p>
        </div>
    `;
    
    document.getElementById('trackingResults').innerHTML = resultsHtml;
    $('#trackingModal').modal('show');
}

function getStatusColor(status) {
    if (!status) return 'secondary';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('delivered')) return 'success';
    if (statusLower.includes('transit') || statusLower.includes('shipping')) return 'primary';
    if (statusLower.includes('processing') || statusLower.includes('preparing')) return 'warning';
    if (statusLower.includes('delayed') || statusLower.includes('issue')) return 'danger';
    return 'info';
}

// Allow Enter key to trigger tracking
document.addEventListener('DOMContentLoaded', function() {
    const trackingInput = document.getElementById('trackingNumber');
    if (trackingInput) {
        trackingInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                trackShipment();
            }
        });
    }
});