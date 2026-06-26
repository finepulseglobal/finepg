const test = require('node:test');
const assert = require('node:assert/strict');
const trackHandler = require('../api/track');

test('returns a fallback shipment for a known demo tracking ID', () => {
  const shipment = trackHandler.getFallbackShipment('DEMO123');
  assert.ok(shipment);
  assert.equal(shipment.trackingId, 'DEMO123');
  assert.equal(shipment.status, 'In Transit');
});
