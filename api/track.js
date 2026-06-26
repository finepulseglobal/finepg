const crypto = require('crypto');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || '11Gm1Nq1M03yEVy1QpH5Tv3d79VCzhNWSrngHdscxAN8';
const SHEET_RANGE = process.env.GOOGLE_SHEET_RANGE || 'Sheet1!A:L';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

const FALLBACK_SHIPMENTS = {
  DEMO123: {
    serialNumber: '001',
    trackingId: 'DEMO123',
    customerName: 'Sample Customer',
    customerPhone: '+2348133420527',
    customerEmail: 'support@finepg.com',
    origin: 'Lagos, Nigeria',
    destination: 'Abuja, Nigeria',
    status: 'In Transit',
    currentLocation: 'Ibadan Hub',
    estimatedDelivery: '2026-06-30',
    lastUpdate: '2026-06-26 09:00',
    weight: '320 kg'
  },
  FPG1001: {
    serialNumber: '002',
    trackingId: 'FPG1001',
    customerName: 'Demo Shipper',
    customerPhone: '+2348020000000',
    customerEmail: 'demo@finepg.com',
    origin: 'Shanghai, China',
    destination: 'Lagos, Nigeria',
    status: 'Arrived at Destination',
    currentLocation: 'Apapa Port',
    estimatedDelivery: '2026-06-24',
    lastUpdate: '2026-06-23 18:00',
    weight: '450 kg'
  }
};

function base64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function normalizePrivateKey(key) {
  if (typeof key !== 'string' || !key.trim()) {
    throw new Error('Google service account private key is missing or invalid.');
  }
  return key.replace(/\\n/g, '\n').trim();
}

function createJwt(clientEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: clientEmail,
    scope: SHEETS_SCOPE,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now
  };

  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claim))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = signer
    .sign(normalizePrivateKey(privateKey), 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${unsigned}.${signature}`;
}

async function getAccessToken() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (typeof clientEmail !== 'string' || !clientEmail.trim() || typeof privateKey !== 'string' || !privateKey.trim()) {
    throw new Error('Missing Google service account environment variables.');
  }

  const assertion = createJwt(clientEmail, privateKey);
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });

  if (!response.ok) {
    throw new Error(`Google auth failed with status ${response.status}.`);
  }

  const payload = await response.json();
  return payload.access_token;
}

function normalizeHeader(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function maskEmail(value) {
  const email = String(value || '').trim();
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}***@${domain}`;
}

function maskPhone(value) {
  const phone = String(value || '').trim();
  if (phone.length < 7) return phone;
  return `${phone.slice(0, 4)}***${phone.slice(-4)}`;
}

function mapRow(headers, row) {
  return headers.reduce((acc, header, index) => {
    acc[normalizeHeader(header)] = row[index] || '';
    return acc;
  }, {});
}

async function getSheetValues(token, spreadsheetId, requestedRange) {
  const metadataUrl = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`);
  const metadataResponse = await fetch(metadataUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!metadataResponse.ok) {
    throw new Error(`Google Sheets metadata request failed with status ${metadataResponse.status}.`);
  }

  const metadata = await metadataResponse.json();
  const firstSheetTitle = metadata.sheets?.[0]?.properties?.title || 'Sheet1';
  const fallbackRange = `${firstSheetTitle}!A:L`;
  const normalizedRange = requestedRange
    ? (requestedRange.includes('!') ? requestedRange : `${firstSheetTitle}!${requestedRange}`)
    : fallbackRange;

  const encodedRange = normalizedRange.includes('!')
    ? `'${normalizedRange.split('!')[0].replace(/'/g, "")}'!${normalizedRange.split('!')[1]}`
    : normalizedRange;

  const sheetsUrl = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(encodedRange)}`);
  let sheetsResponse = await fetch(sheetsUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!sheetsResponse.ok && sheetsResponse.status === 400 && normalizedRange !== fallbackRange) {
    const encodedFallbackRange = `'${fallbackRange.split('!')[0].replace(/'/g, "")}'!${fallbackRange.split('!')[1]}`;
    const fallbackUrl = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(encodedFallbackRange)}`);
    sheetsResponse = await fetch(fallbackUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  if (!sheetsResponse.ok) {
    throw new Error(`Google Sheets request failed with status ${sheetsResponse.status}.`);
  }

  const data = await sheetsResponse.json();
  return { data, range: normalizedRange };
}

function publicShipment(row) {
  const showPrivateContacts = process.env.TRACKING_SHOW_PRIVATE_CONTACTS === 'true';

  return {
    serialNumber: row.s_n || row.sn || '',
    trackingId: row.tracking_id || '',
    customerName: row.customer_name || '',
    customerPhone: showPrivateContacts ? (row.customer_phone || '') : maskPhone(row.customer_phone || ''),
    customerEmail: showPrivateContacts ? (row.customer_email || '') : maskEmail(row.customer_email || ''),
    origin: row.origin || '',
    destination: row.destination || '',
    status: row.status || '',
    currentLocation: row.current_location || '',
    estimatedDelivery: row.estimated_delivery || '',
    lastUpdate: row.last_update || '',
    weight: row.weight || ''
  };
}

function getFallbackShipment(trackingId) {
  const normalized = String(trackingId || '').trim().toUpperCase();
  const shipment = FALLBACK_SHIPMENTS[normalized];
  return shipment ? { ...shipment, trackingId: normalized } : null;
}

async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed.' }));
    return;
  }

  const trackingId = String(req.query.tracking_id || '').trim();
  if (!/^[a-zA-Z0-9._-]{3,80}$/.test(trackingId)) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Enter a valid tracking ID.' }));
    return;
  }

  const fallbackShipment = getFallbackShipment(trackingId);

  try {
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      if (fallbackShipment) {
        res.statusCode = 200;
        res.end(JSON.stringify({ found: true, shipment: fallbackShipment }));
        return;
      }
    }

    const token = await getAccessToken();
    const { data } = await getSheetValues(token, SPREADSHEET_ID, SHEET_RANGE);
    const values = data.values || [];
    const [headers, ...rows] = values;

    if (!headers || !rows.length) {
      res.statusCode = 404;
      res.end(JSON.stringify({ found: false, error: 'No shipment records are available yet. Please try again shortly.', code: 'empty_source' }));
      return;
    }

    const match = rows
      .map((row) => mapRow(headers, row))
      .find((row) => String(row.tracking_id || '').trim().toLowerCase() === trackingId.toLowerCase());

    if (!match) {
      res.statusCode = 404;
      res.end(JSON.stringify({ found: false, error: 'We could not find a shipment for that tracking ID yet. Please verify the number or try again shortly.', code: 'not_found' }));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ found: true, shipment: publicShipment(match) }));
  } catch (error) {
    console.error(error);
    if (fallbackShipment) {
      res.statusCode = 200;
      res.end(JSON.stringify({ found: true, shipment: fallbackShipment }));
      return;
    }
    res.statusCode = 503;
    res.end(JSON.stringify({ found: false, error: 'Tracking service is temporarily unavailable. Please try again shortly.', code: 'service_unavailable' }));
  }
}

handler.getFallbackShipment = getFallbackShipment;
module.exports = handler;
