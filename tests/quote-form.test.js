const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

test('location helper fills the selected field with the sender location instead of opening a new tab', () => {
  const html = `<!doctype html>
  <html>
    <body>
      <form id="contactForm" novalidate>
        <div class="quote-wizard__panel is-active" data-step-panel="1">
          <input id="cfCbm" name="cbm" required>
          <input id="cfLength" name="length">
          <input id="cfWidth" name="width">
          <input id="cfHeight" name="height">
        </div>
        <div class="quote-wizard__panel" data-step-panel="2" hidden>
          <input id="cfPickupLocation" name="pickupLocation" required>
          <input id="cfDeliveryLocation" name="deliveryLocation" required>
          <button type="button" class="contact-form__input-action" data-location-action="pickup">Pickup</button>
          <button type="button" class="contact-form__input-action" data-location-action="delivery">Delivery</button>
        </div>
        <div class="quote-wizard__panel" data-step-panel="3" hidden>
          <select id="cfPickupType" name="pickupType" required>
            <option value="">Select</option>
            <option value="finepickup">FinePickup</option>
          </select>
          <select id="cfInsurance" name="insurance" required>
            <option value="">Select</option>
            <option value="yes">Yes</option>
          </select>
        </div>
        <div class="quote-wizard__panel" data-step-panel="4" hidden>
          <input id="cfName" name="name" required>
          <input id="cfEmail" name="email" type="email" required>
          <input id="cfPhone" name="phone" required>
          <textarea id="cfNotes" name="notes"></textarea>
        </div>
        <div class="quote-wizard__step is-active"></div>
        <div class="quote-wizard__step"></div>
        <div class="quote-wizard__step"></div>
        <div class="quote-wizard__step"></div>
        <div class="quote-wizard__progress-bar"></div>
        <div id="cbmCalcNote"></div>
        <div id="quoteSummary"></div>
        <div id="quoteResult" hidden></div>
        <div id="cfConfirm" hidden></div>
        <button type="button" class="contact-form__back" data-step-action="prev" disabled>Previous</button>
        <button type="button" class="contact-form__next" data-step-action="next">Next Step</button>
      </form>
    </body>
  </html>`;

  const dom = new JSDOM(html, { url: 'http://localhost/contact.html' });
  const { window } = dom;
  const { document } = window;

  window.gtag = () => {};
  window.open = () => { throw new Error('should not open a new tab'); };
  window.matchMedia = () => ({ matches: false, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {} });
  window.location.assign = () => {};
  window.location.href = 'http://localhost/contact.html';
  window.navigator.geolocation = {
    getCurrentPosition(success) {
      success({ coords: { latitude: 6.5244, longitude: 3.3792 } });
    }
  };

  global.window = window;
  global.document = document;
  global.localStorage = window.localStorage;
  global.window.localStorage = window.localStorage;
  global.navigator = window.navigator;
  global.location = window.location;

  const script = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'main.js'), 'utf8');
  window.eval(script);

  const form = document.getElementById('contactForm');
  const pickupButton = form.querySelector('[data-location-action="pickup"]');
  pickupButton.click();

  const pickupInput = document.getElementById('cfPickupLocation');
  assert.ok(pickupInput.value.includes('Lagos') || pickupInput.value.includes('6.5244') || pickupInput.value.includes('Current location'), 'pickup location should be filled from geolocation');
});

test('quote form submission creates a quote and prepares the mailto flow', () => {
  const html = `<!doctype html>
  <html>
    <body>
      <form id="contactForm" novalidate>
        <div class="quote-wizard__panel is-active" data-step-panel="1">
          <input id="cfCbm" name="cbm" required>
          <input id="cfLength" name="length">
          <input id="cfWidth" name="width">
          <input id="cfHeight" name="height">
        </div>
        <div class="quote-wizard__panel" data-step-panel="2" hidden>
          <input id="cfPickupLocation" name="pickupLocation" required>
          <input id="cfDeliveryLocation" name="deliveryLocation" required>
          <button type="button" class="contact-form__input-action" data-location-action="pickup">Pickup</button>
          <button type="button" class="contact-form__input-action" data-location-action="delivery">Delivery</button>
        </div>
        <div class="quote-wizard__panel" data-step-panel="3" hidden>
          <select id="cfPickupType" name="pickupType" required>
            <option value="">Select</option>
            <option value="finepickup">FinePickup</option>
          </select>
          <select id="cfInsurance" name="insurance" required>
            <option value="">Select</option>
            <option value="yes">Yes</option>
          </select>
        </div>
        <div class="quote-wizard__panel" data-step-panel="4" hidden>
          <input id="cfName" name="name" required>
          <input id="cfEmail" name="email" type="email" required>
          <input id="cfPhone" name="phone" required>
          <textarea id="cfNotes" name="notes"></textarea>
        </div>
        <div class="quote-wizard__step is-active"></div>
        <div class="quote-wizard__step"></div>
        <div class="quote-wizard__step"></div>
        <div class="quote-wizard__step"></div>
        <div class="quote-wizard__progress-bar"></div>
        <div id="cbmCalcNote"></div>
        <div id="quoteSummary"></div>
        <div id="quoteResult" hidden></div>
        <div id="cfConfirm" hidden></div>
        <button type="button" class="contact-form__back" data-step-action="prev" disabled>Previous</button>
        <button type="button" class="contact-form__next" data-step-action="next">Next Step</button>
      </form>
    </body>
  </html>`;

  const dom = new JSDOM(html, { url: 'http://localhost/contact.html' });
  const { window } = dom;
  const { document } = window;

  window.gtag = () => {};
  window.open = () => {};
  window.matchMedia = () => ({ matches: false, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {} });
  window.location.assign = () => {};
  window.location.href = 'http://localhost/contact.html';

  global.window = window;
  global.document = document;
  global.localStorage = window.localStorage;
  global.window.localStorage = window.localStorage;
  global.navigator = window.navigator;
  global.location = window.location;

  const script = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'main.js'), 'utf8');
  window.eval(script);

  const form = document.getElementById('contactForm');
  const nextButton = form.querySelector('[data-step-action="next"]');

  document.getElementById('cfCbm').value = '1.5';
  nextButton.click();

  document.getElementById('cfPickupLocation').value = 'Lagos';
  document.getElementById('cfDeliveryLocation').value = 'Guangzhou';
  nextButton.click();

  document.getElementById('cfPickupType').value = 'finepickup';
  document.getElementById('cfInsurance').value = 'yes';
  nextButton.click();

  document.getElementById('cfName').value = 'Jane Doe';
  document.getElementById('cfEmail').value = 'jane@example.com';
  document.getElementById('cfPhone').value = '+2348000000000';
  form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));

  const stored = JSON.parse(window.localStorage.getItem('finepulseLastQuote'));
  const result = document.getElementById('quoteResult');
  const confirm = document.getElementById('cfConfirm');

  assert.ok(stored, 'quote should be saved to localStorage');
  assert.equal(stored.name, 'Jane Doe');
  assert.equal(stored.email, 'jane@example.com');
  assert.ok(result.hidden === false, 'quote result should be shown');
  assert.ok(confirm.hidden === false, 'confirmation should be shown');
  assert.ok(window.__lastMailto && window.__lastMailto.startsWith('mailto:'), 'submit should prepare a mailto action');
});
