(function () {
  'use strict';

  /* Mobile nav */
  const burger  = document.querySelector('.finepulse-nav__burger');
  const panel   = document.getElementById('navMobilePanel');
  const overlay = document.querySelector('.finepulse-nav__mobile-overlay');
  const closeBtn = document.querySelector('.finepulse-nav__mobile-close');

  function openMobile() {
    panel.classList.add('is-open');
    overlay.classList.add('is-visible');
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMobile() {
    panel.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (burger) burger.addEventListener('click', openMobile);
  if (closeBtn) closeBtn.addEventListener('click', closeMobile);
  if (overlay) overlay.addEventListener('click', closeMobile);

  /* Mobile sub-menu toggle */
  document.querySelectorAll('.finepulse-nav__mobile-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sub = btn.nextElementSibling;
      const isOpen = sub.classList.contains('is-open');
      sub.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* Close mobile nav on link click */
  document.querySelectorAll('.finepulse-nav__mobile-link:not(.finepulse-nav__mobile-toggle), .finepulse-nav__mobile-sublink').forEach((link) => {
    link.addEventListener('click', closeMobile);
  });

  /* Keyboard: close mobile nav on Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel && panel.classList.contains('is-open')) closeMobile();
  });

  /* Optional countdown timer */
  const countdown = document.getElementById('csCountdown');
  if (countdown) {
    const launch = new Date('2026-09-01T00:00:00').getTime();

    function pad(n) {
      return String(n).padStart(2, '0');
    }

    function tick() {
      const now  = Date.now();
      const diff = launch - now;

      if (diff <= 0) {
        document.getElementById('csDays').textContent    = '00';
        document.getElementById('csHours').textContent   = '00';
        document.getElementById('csMinutes').textContent = '00';
        document.getElementById('csSeconds').textContent = '00';
        return;
      }

      const days    = Math.floor(diff / 86400000);
      const hours   = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000)  / 60000);
      const seconds = Math.floor((diff % 60000)    / 1000);

      document.getElementById('csDays').textContent    = pad(days);
      document.getElementById('csHours').textContent   = pad(hours);
      document.getElementById('csMinutes').textContent = pad(minutes);
      document.getElementById('csSeconds').textContent = pad(seconds);
    }

    tick();
    setInterval(tick, 1000);
  }

  /* Optional notify form */
  const csForm = document.getElementById('csNotifyForm');
  if (csForm) {
    csForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = csForm.querySelector('#csEmail');
      const note  = document.getElementById('csFormNote');
      if (!input.value || !input.checkValidity()) {
        note.textContent = 'Please enter a valid email address.';
        return;
      }
      note.textContent = 'You are on the list. We will be in touch.';
      input.value = '';
    });
  }

  /* Mask public contact details */
  function maskPublicContactDetails() {
    document.querySelectorAll('a[href^="mailto:"]').forEach(function (link) {
      const href = link.getAttribute('href');
      if (href && href.toLowerCase().indexOf('finepg.com') !== -1) {
        link.setAttribute('href', 'contact.html');
        link.textContent = 'Contact via request form';
      }
    });

    document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
      link.setAttribute('href', 'contact.html');
      link.textContent = 'Available on request';
    });

    document.querySelectorAll('span, p, li, div, a').forEach(function (element) {
      const text = element.textContent || '';
      if (text.includes('No 6. Hollandia Way') || text.includes('Ajao Estate') || text.includes('+86 134 1117 9135') || text.includes('+234 813 342 0527') || text.includes('info@finepg.com')) {
        if (element.tagName.toLowerCase() === 'a') {
          element.setAttribute('href', 'contact.html');
          element.textContent = 'Contact via request form';
        } else {
          element.textContent = element.textContent.replace(/No 6\. Hollandia Way[^\n]*/gi, 'Location shared upon request');
          element.textContent = element.textContent.replace(/\+86 134 1117 9135[^\n]*/gi, 'Phone available on request');
          element.textContent = element.textContent.replace(/\+234 813 342 0527[^\n]*/gi, 'Phone available on request');
          element.textContent = element.textContent.replace(/info@finepg\.com/gi, 'Contact via request form');
          element.textContent = element.textContent.replace(/Ajao Estate/gi, 'requested location');
        }
      }
    });

    document.querySelectorAll('script[type="application/ld+json"]').forEach(function (script) {
      try {
        const original = script.textContent || '';
        let updated = original.replace(/"email":"[^"]*"/gi, '"email":"contact@finepg.com"');
        updated = updated.replace(/"telephone":"[^"]*"/gi, '"telephone":"[REDACTED]"');
        updated = updated.replace(/"streetAddress":"[^"]*"/gi, '"streetAddress":"[REDACTED]"');
        updated = updated.replace(/"addressLocality":"[^"]*"/gi, '"addressLocality":"[REDACTED]"');
        updated = updated.replace(/"addressCountry":"[^"]*"/gi, '"addressCountry":"[REDACTED]"');
        if (updated !== original) {
          script.textContent = updated;
        }
      } catch (error) {
        // Ignore malformed JSON-LD blocks.
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', maskPublicContactDetails);
  } else {
    maskPublicContactDetails();
  }

  /* Quote calculator (contact.html) */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const wizardPanels = Array.from(contactForm.querySelectorAll('.quote-wizard__panel'));
    const wizardSteps = Array.from(contactForm.querySelectorAll('.quote-wizard__step'));
    const stepButtons = Array.from(contactForm.querySelectorAll('[data-step-action]'));
    const quoteSummary = document.getElementById('quoteSummary');
    const confirm = document.getElementById('cfConfirm');
    const quoteResult = document.getElementById('quoteResult');
    const locationButtons = Array.from(contactForm.querySelectorAll('[data-location-action]'));
    const progressBar = contactForm.querySelector('.quote-wizard__progress-bar');
    const cbmNote = document.getElementById('cbmCalcNote');
    const cbmField = contactForm.querySelector('#cfCbm');

    function getFields() {
      return {
        name: contactForm.querySelector('#cfName'),
        email: contactForm.querySelector('#cfEmail'),
        phone: contactForm.querySelector('#cfPhone'),
        pickupLocation: contactForm.querySelector('#cfPickupLocation'),
        deliveryLocation: contactForm.querySelector('#cfDeliveryLocation'),
        cbm: contactForm.querySelector('#cfCbm'),
        length: contactForm.querySelector('#cfLength'),
        width: contactForm.querySelector('#cfWidth'),
        height: contactForm.querySelector('#cfHeight'),
        pickupType: contactForm.querySelector('#cfPickupType'),
        insurance: contactForm.querySelector('#cfInsurance'),
        notes: contactForm.querySelector('#cfNotes')
      };
    }

    function clearErrors() {
      const fields = getFields();
      Object.values(fields).forEach(function (field) {
        if (field && field.classList) field.classList.remove('is-invalid');
      });
    }

    function updateSummary() {
      if (!quoteSummary) return;
      const fields = getFields();
      const cbmValue = fields.cbm && fields.cbm.value ? parseFloat(fields.cbm.value).toFixed(1) : '—';
      const pickupLocation = fields.pickupLocation && fields.pickupLocation.value ? fields.pickupLocation.value.trim() : '—';
      const deliveryLocation = fields.deliveryLocation && fields.deliveryLocation.value ? fields.deliveryLocation.value.trim() : '—';
      const pickupType = fields.pickupType && fields.pickupType.value ? (fields.pickupType.value === 'finepickup' ? 'FinePickup (we collect)' : 'Self delivery') : '—';
      const insurance = fields.insurance && fields.insurance.value ? (fields.insurance.value === 'yes' ? 'Yes' : 'No') : '—';
      quoteSummary.innerHTML = [
        '<div class="quote-wizard__summary-item"><span>CBM</span><strong>' + cbmValue + '</strong></div>',
        '<div class="quote-wizard__summary-item"><span>Pickup</span><strong>' + pickupLocation + '</strong></div>',
        '<div class="quote-wizard__summary-item"><span>Delivery</span><strong>' + deliveryLocation + '</strong></div>',
        '<div class="quote-wizard__summary-item"><span>Pickup type</span><strong>' + pickupType + '</strong></div>',
        '<div class="quote-wizard__summary-item"><span>Insurance</span><strong>' + insurance + '</strong></div>'
      ].join('');
    }

    function trackEvent(action, label, value) {
      if (window.gtag) {
        window.gtag('event', action, {
          event_category: 'Quote Wizard',
          event_label: label,
          value: value
        });
      }
    }

    function updateProgress(step) {
      if (progressBar) {
        progressBar.style.width = ((step / 4) * 100) + '%';
      }
    }

    function updateStepNavigation(step) {
      contactForm.querySelectorAll('.contact-form__back').forEach(function (button) {
        const canGoBack = step > 1;
        button.disabled = !canGoBack;
        button.hidden = !canGoBack;
      });
    }

    function getActivePanel() {
      return contactForm.querySelector('.quote-wizard__panel.is-active') || contactForm.querySelector('.quote-wizard__panel[data-step-panel="1"]') || contactForm.querySelector('.quote-wizard__panel:not([hidden])');
    }

    function showStep(step) {
      const currentActive = getActivePanel();
      const currentStep = currentActive ? Number(currentActive.getAttribute('data-step-panel')) : 1;
      const nextPanel = contactForm.querySelector('.quote-wizard__panel[data-step-panel="' + step + '"]');

      if (currentActive && nextPanel && currentStep !== step) {
        currentActive.classList.remove('is-active');
        currentActive.hidden = true;
        window.setTimeout(function () {
          nextPanel.classList.add('is-active');
          nextPanel.hidden = false;
        }, 40);
      } else if (nextPanel) {
        nextPanel.classList.add('is-active');
        nextPanel.hidden = false;
      }

      wizardPanels.forEach(function (panel) {
        if (Number(panel.getAttribute('data-step-panel')) !== step) {
          panel.classList.remove('is-active');
        }
      });

      wizardSteps.forEach(function (stepItem, index) {
        const stepNumber = index + 1;
        stepItem.classList.toggle('is-active', stepNumber === step);
        stepItem.classList.toggle('is-complete', stepNumber < step);
      });

      updateProgress(step);
      updateStepNavigation(step);

      if (step === 4) {
        updateSummary();
      }
    }

    function calculateCbmFromDimensions(fields) {
      const length = parseFloat(fields.length && fields.length.value ? fields.length.value : '0');
      const width = parseFloat(fields.width && fields.width.value ? fields.width.value : '0');
      const height = parseFloat(fields.height && fields.height.value ? fields.height.value : '0');
      if ([length, width, height].some(function (value) { return Number.isNaN(value) || value <= 0; })) {
        return null;
      }
      return (length * width * height) / 1000000;
    }

    function updateCbmHelper(estimatedCbm) {
      if (!cbmNote) return;
      if (estimatedCbm !== null) {
        cbmNote.textContent = 'Estimated CBM: ' + estimatedCbm.toFixed(2) + ' m³ from the dimensions you entered.';
        cbmNote.classList.add('is-active');
      } else {
        cbmNote.textContent = 'We will calculate CBM as length × width × height ÷ 1,000,000 when dimensions are provided.';
        cbmNote.classList.remove('is-active');
      }
    }

    function applyDerivedCbm() {
      const fields = getFields();
      const dimensionsCbm = calculateCbmFromDimensions(fields);
      const isManualCbm = fields.cbm && fields.cbm.dataset.manual === 'true';

      if (dimensionsCbm !== null && !isManualCbm) {
        fields.cbm.value = dimensionsCbm.toFixed(2);
        updateCbmHelper(dimensionsCbm);
      } else if (dimensionsCbm === null) {
        updateCbmHelper(null);
      } else if (cbmField && cbmField.value && cbmField.value.trim()) {
        updateCbmHelper(null);
      }
    }

    function validateStep(step, showErrors) {
      const fields = getFields();
      if (showErrors !== false) {
        clearErrors();
      }
      let isValid = true;

      if (step === 1) {
        const cbmValue = fields.cbm && fields.cbm.value ? parseFloat(fields.cbm.value) : NaN;
        const dimensionsCbm = calculateCbmFromDimensions(fields);

        if (!fields.cbm || !fields.cbm.checkValidity()) {
          fields.cbm.classList.add('is-invalid');
          isValid = false;
        } else if ((Number.isNaN(cbmValue) || cbmValue <= 0) && dimensionsCbm === null) {
          fields.cbm.classList.add('is-invalid');
          isValid = false;
        } else if (!Number.isNaN(cbmValue) && cbmValue > 0) {
          fields.cbm.value = cbmValue.toFixed(2);
          fields.cbm.dataset.manual = 'true';
        } else if (dimensionsCbm !== null) {
          fields.cbm.value = dimensionsCbm.toFixed(2);
          fields.cbm.dataset.manual = 'false';
        }
      }

      if (step === 2) {
        if (!fields.pickupLocation || !fields.pickupLocation.checkValidity()) {
          fields.pickupLocation.classList.add('is-invalid');
          isValid = false;
        }
        if (!fields.deliveryLocation || !fields.deliveryLocation.checkValidity()) {
          fields.deliveryLocation.classList.add('is-invalid');
          isValid = false;
        }
      }

      if (step === 3) {
        if (!fields.pickupType || !fields.pickupType.checkValidity()) {
          fields.pickupType.classList.add('is-invalid');
          isValid = false;
        }
        if (!fields.insurance || !fields.insurance.checkValidity()) {
          fields.insurance.classList.add('is-invalid');
          isValid = false;
        }
      }

      if (step === 4) {
        const requiredContactFields = [fields.name, fields.email, fields.phone];
        requiredContactFields.forEach(function (field) {
          if (field && !field.checkValidity()) {
            field.classList.add('is-invalid');
            isValid = false;
          }
        });
      }

      if (!isValid && showErrors !== false) {
        contactForm.reportValidity();
      }

      return isValid;
    }

    locationButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        const target = button.getAttribute('data-location-action');
        const input = target === 'pickup' ? contactForm.querySelector('#cfPickupLocation') : contactForm.querySelector('#cfDeliveryLocation');
        if (!input) return;

        trackEvent('quote_location_helper', target, 1);

        const fillLocation = function (value) {
          if (!value) return;
          input.value = value;
          input.classList.add('is-valid');
          if (window && window.Event) {
            input.dispatchEvent(new window.Event('input', { bubbles: true }));
          } else {
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        };

        if (navigator.geolocation && typeof navigator.geolocation.getCurrentPosition === 'function') {
          navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position && position.coords && position.coords.latitude;
            const lng = position && position.coords && position.coords.longitude;
            if (lat !== undefined && lng !== undefined) {
              fillLocation('Current location (' + lat.toFixed(4) + ', ' + lng.toFixed(4) + ')');
              return;
            }
            fillLocation('Current location');
          }, function () {
            fillLocation('Current location');
          });
          return;
        }

        fillLocation('Current location');
      });
    });

    if (cbmField) {
      cbmField.addEventListener('input', function () {
        cbmField.dataset.manual = cbmField.value.trim() ? 'true' : 'false';
        if (!cbmField.value.trim()) {
          applyDerivedCbm();
        }
      });
    }

    [contactForm.querySelector('#cfLength'), contactForm.querySelector('#cfWidth'), contactForm.querySelector('#cfHeight')].forEach(function (input) {
      if (input) {
        input.addEventListener('input', applyDerivedCbm);
      }
    });

    stepButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        const action = button.getAttribute('data-step-action');
        const currentActivePanel = getActivePanel();
        const currentStep = currentActivePanel ? Number(currentActivePanel.getAttribute('data-step-panel')) : 1;
        if (action === 'next') {
          if (validateStep(currentStep)) {
            trackEvent('quote_step_advanced', 'Step ' + (currentStep + 1), currentStep + 1);
            showStep(currentStep + 1);
          }
        } else if (action === 'prev') {
          trackEvent('quote_step_back', 'Step ' + (currentStep - 1), currentStep - 1);
          showStep(currentStep - 1);
        }
      });
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const fields = getFields();
      clearErrors();

      let hasError = false;
      const requiredSteps = [1, 2, 3, 4];
      const stepValidity = requiredSteps.map(function (step) {
        return validateStep(step, false);
      });

      const cbmValue = parseFloat(fields.cbm.value);
      const cbmValid = !Number.isNaN(cbmValue) && cbmValue > 0;
      if (!cbmValid) {
        fields.cbm.classList.add('is-invalid');
        hasError = true;
      }

      if (stepValidity.some(function (isValid) { return !isValid; })) {
        hasError = true;
      }

      if (hasError) {
        const firstInvalidStep = stepValidity.findIndex(function (isValid) {
          return !isValid;
        });
        const targetStep = firstInvalidStep === -1 ? 1 : firstInvalidStep + 1;
        showStep(targetStep);
        validateStep(targetStep, true);
        return;
      }

      const pickupTypeLabel = fields.pickupType.value === 'finepickup' ? 'FinePickup (we collect)' : 'Self delivery';
      const insuranceLabel = fields.insurance.value === 'yes' ? 'Yes' : 'No';
      const pickupLocation = fields.pickupLocation.value.trim();
      const deliveryLocation = fields.deliveryLocation.value.trim();
      const routeMultiplier = /china|usa|canada|ghana|europe|uk|dubai/i.test(pickupLocation + ' ' + deliveryLocation) ? 1.25 : 1;
      const baseFreight = Math.round(cbmValue * 95 * routeMultiplier);
      const pickupFee = fields.pickupType.value === 'finepickup' ? 20 : 6;
      const insuranceFee = fields.insurance.value === 'yes' ? Math.round(baseFreight * 0.03) : 0;
      const handlingFee = 18;
      const total = baseFreight + pickupFee + insuranceFee + handlingFee;
      trackEvent('quote_submitted', 'Quote generated', total);

      const booking = {
        name: fields.name.value.trim(),
        email: fields.email.value.trim(),
        phone: fields.phone.value.trim(),
        pickupLocation: pickupLocation,
        deliveryLocation: deliveryLocation,
        cbm: cbmValue.toFixed(1),
        pickupType: pickupTypeLabel,
        insurance: insuranceLabel,
        notes: fields.notes.value.trim() || 'No additional notes provided.'
      };

      const bodyLines = [
        'FinePulse Quote Request',
        '',
        'Client Name: ' + booking.name,
        'Email: ' + booking.email,
        'Phone: ' + booking.phone,
        'Pickup Location: ' + booking.pickupLocation,
        'Delivery Location: ' + booking.deliveryLocation,
        'CBM: ' + booking.cbm,
        'Pickup Type: ' + booking.pickupType,
        'Insurance: ' + booking.insurance,
        'Shipment Notes: ' + booking.notes,
        '',
        'Estimated Quote Breakdown:',
        'Base Freight: USD ' + baseFreight,
        'Pickup Handling: USD ' + pickupFee,
        'Insurance: USD ' + insuranceFee,
        'Processing Fee: USD ' + handlingFee,
        'Estimated Total: USD ' + total,
        '',
        'Payment Process: Manual payment after quote confirmation. FinePulse will reply with the final cost and payment instructions.',
        'Submitted from: ' + window.location.href
      ];

      const subject = 'FinePulse Quote Request - ' + booking.name + ' - CBM ' + booking.cbm;
      const clientMailto = 'mailto:' + encodeURIComponent(booking.email) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(bodyLines.join('\n'));
      const adminMailto = 'mailto:book-ings@finepg.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(bodyLines.join('\n'));

      quoteResult.hidden = false;
      quoteResult.innerHTML = [
        '<h4 class="quote-calculator__title">Estimated quote ready</h4>',
        '<div class="quote-calculator__amount">USD ' + total + '</div>',
        '<ul class="quote-calculator__breakdown">',
        '<li><span>Base freight</span><strong>USD ' + baseFreight + '</strong></li>',
        '<li><span>Pickup handling</span><strong>USD ' + pickupFee + '</strong></li>',
        '<li><span>Insurance</span><strong>USD ' + insuranceFee + '</strong></li>',
        '<li><span>Processing fee</span><strong>USD ' + handlingFee + '</strong></li>',
        '</ul>',
        '<p class="quote-calculator__note">This is an indicative estimate. FinePulse will reply with the final cost and manual payment steps by email.</p>'
      ].join('');

      localStorage.setItem('finepulseLastQuote', JSON.stringify({
        ...booking,
        total: total,
        generatedAt: new Date().toISOString()
      }));

      confirm.hidden = false;
      confirm.textContent = 'Your estimate is ready. We have prepared emails for you and our logistics team.';

      function navigateToUrl(url) {
        if (!url) return;

        try {
          if (window) {
            window.__lastMailto = url;
          }
        } catch (error) {
          // Ignore storage failures.
        }

        const link = document.createElement('a');
        link.href = url;
        link.style.display = 'none';
        link.setAttribute('rel', 'noopener noreferrer');
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      navigateToUrl(clientMailto);
      window.setTimeout(function () {
        window.open(adminMailto, '_blank', 'noopener,noreferrer');
      }, 200);
    });

    showStep(1);
  }

})();

// Independent FinePulse live assistance chat
(function () {
  const ADVISOR_EMAIL = 'book-ings@finepg.com';
  const WHATSAPP_NUMBER = '2348133420527';
  const STORAGE_KEY = 'finepulseSupportCases';
  const CHAT_STATE_KEY = 'finepulseLiveAssistantState';

  const knowledgeBase = [
    {
      keywords: ['track', 'tracking', 'shipment id', 'tracking id', 'where is my cargo', 'where is my shipment'],
      reply: 'You can track a shipment with your Tracking ID on the tracking result page. The result shows status, origin, destination, current location, estimated delivery, last update, and shipment weight.',
      links: [{ label: 'Track shipment', href: 'track-result.html' }]
    },
    {
      keywords: ['quote', 'price', 'cost', 'rate', 'booking', 'book', 'ship now'],
      reply: 'For a freight quote, FinePulse needs your route, cargo type, weight or CBM, pickup location, destination, and preferred service. The booking form can send the details to the team by email and WhatsApp.',
      links: [{ label: 'Request a quote', href: 'contact.html' }]
    },
    {
      keywords: ['china', 'alibaba', 'supplier', 'guangzhou', 'yiwu'],
      reply: 'FinePulse supports shipping from China to Nigeria, including supplier cargo, procurement coordination, consolidation, air or sea freight, customs support, and Nigeria-side delivery.',
      links: [{ label: 'China to Nigeria shipping', href: 'shipping-from-china-to-nigeria.html' }]
    },
    {
      keywords: ['usa', 'america', 'united states'],
      reply: 'FinePulse supports USA to Nigeria cargo for personal effects, e-commerce orders, retail stock, and commercial freight by air or sea depending on urgency and cargo size.',
      links: [{ label: 'USA to Nigeria shipping', href: 'shipping-from-usa-to-nigeria.html' }]
    },
    {
      keywords: ['canada', 'toronto', 'ontario'],
      reply: 'FinePulse supports Canada to Nigeria shipments including boxes, pallets, business cargo, and family relocation cargo with documentation-led handling.',
      links: [{ label: 'Canada to Nigeria shipping', href: 'shipping-from-canada-to-nigeria.html' }]
    },
    {
      keywords: ['ghana', 'accra', 'cross border'],
      reply: 'FinePulse supports Ghana to Nigeria cross-border cargo movement, with route coordination, cargo handoff, and Nigeria-side logistics support.',
      links: [{ label: 'Ghana to Nigeria shipping', href: 'shipping-from-ghana-to-nigeria.html' }]
    },
    {
      keywords: ['custom', 'clearing', 'clearance', 'duty', 'paar', 'form m', 'port', 'apapa', 'airport'],
      reply: 'FinePulse assists with customs clearing in Nigeria, including document review, classification support, duty guidance, clearance handoff, and delay-risk control.',
      links: [{ label: 'Customs clearing Nigeria', href: 'customs-clearing-nigeria.html' }]
    },
    {
      keywords: ['procurement', 'source', 'sourcing', 'buy goods', 'supplier verification', 'cargo forwarding'],
      reply: 'FinePulse combines procurement and cargo forwarding so importers can source, verify, consolidate, document, and move supplier cargo through one accountable workflow.',
      links: [{ label: 'Procurement and cargo forwarding', href: 'procurement-cargo-forwarding.html' }]
    },
    {
      keywords: ['air freight', 'air cargo', 'urgent', 'express', 'fast'],
      reply: 'Air freight is best for urgent, high-value, sample, or time-sensitive cargo. FinePulse can help plan air cargo movement into Nigeria with customs and delivery support.',
      links: [{ label: 'Air freight Nigeria', href: 'air-freight-nigeria.html' }]
    },
    {
      keywords: ['sea freight', 'ocean', 'container', 'fcl', 'lcl', 'bulk'],
      reply: 'Sea freight is useful for larger commercial shipments, FCL, LCL, and consolidated cargo where cost control matters more than speed.',
      links: [{ label: 'Sea freight Nigeria', href: 'sea-freight-nigeria.html' }]
    },
    {
      keywords: ['road freight', 'truck', 'delivery', 'haulage', 'inland'],
      reply: 'Road freight helps with inland movement, regional cargo handoff, and destination delivery after port, airport, warehouse, or border clearance.',
      links: [{ label: 'Road freight Nigeria', href: 'road-freight-nigeria.html' }]
    },
    {
      keywords: ['warehouse', 'warehousing', 'distribution', 'storage', 'dispatch', 'pick', 'pack'],
      reply: 'FinePulse supports warehousing and distribution in Nigeria, including storage, staging, pick and pack, dispatch, and retail cargo handling.',
      links: [{ label: 'Warehousing and distribution', href: 'warehousing-distribution-nigeria.html' }]
    },
    {
      keywords: ['career', 'job', 'apply', 'intern', 'nysc', 'linkedin'],
      reply: 'FinePulse career openings are currently focused on intern and NYSC opportunities. Applications go through the official FinePulse LinkedIn company page.',
      links: [{ label: 'Careers', href: 'careers.html' }, { label: 'FinePulse LinkedIn', href: 'https://linkedin.com/company/thisisfinepg' }]
    },
    {
      keywords: ['office', 'address', 'location', 'visit'],
      reply: 'FinePulse can share the office location directly through the contact request form once you reach out.',
      links: [{ label: 'Contact FinePulse', href: 'contact.html' }]
    },
    {
      keywords: ['email', 'phone', 'contact', 'call', 'whatsapp'],
      reply: 'FinePulse can be contacted through the request form, and the team will reply with the preferred contact method.',
      links: [{ label: 'Contact page', href: 'contact.html' }]
    },
    {
      keywords: ['blog', 'guide', 'learn', 'article', 'faq'],
      reply: 'The FinePulse blog covers air freight, customs clearing, procurement, shipping from China, USA and Canada, landed cost, forwarder fees, first-time shipping concerns, and AfCFTA trade corridors.',
      links: [{ label: 'Read the blog', href: 'blog.html' }, { label: 'FAQ', href: 'faq.html' }]
    }
  ];

  const quickReplies = [
    'I need a freight quote',
    'Track my shipment',
    'Customs clearing help',
    'Shipping from China',
    'Procurement support',
    'Talk to an advisor'
  ];

  const state = {
    open: false,
    step: 'name',
    profile: { name: '', email: '', phone: '' },
    problem: '',
    caseId: '',
    transcript: []
  };

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
    });
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
  }

  function isValidPhone(value) {
    const digits = String(value || '').replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  }

  function generateCaseId() {
    const now = new Date();
    const stamp = now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return 'FP-' + stamp + '-' + random;
  }

  function findKnowledgeReply(message) {
    const text = String(message || '').toLowerCase();
    const match = knowledgeBase.find(function (item) {
      return item.keywords.some(function (keyword) {
        return text.includes(keyword);
      });
    });
    if (match) return match;
    return {
      reply: 'I can help with freight quotes, shipment tracking, customs clearing, China/USA/Canada/Ghana shipping, procurement, air freight, sea freight, road freight, warehousing, careers, and FinePulse contact details.',
      links: [{ label: 'Explore services', href: 'services.html' }, { label: 'Request a quote', href: 'contact.html' }]
    };
  }

  function saveCase() {
    const cases = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    cases.unshift({
      caseId: state.caseId,
      profile: state.profile,
      problem: state.problem,
      transcript: state.transcript,
      page: window.location.href,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases.slice(0, 10)));
  }

  function persistState() {
    localStorage.setItem(CHAT_STATE_KEY, JSON.stringify({
      step: state.step,
      profile: state.profile,
      problem: state.problem,
      caseId: state.caseId,
      transcript: state.transcript.slice(-30)
    }));
  }

  function restoreState() {
    try {
      const saved = JSON.parse(localStorage.getItem(CHAT_STATE_KEY) || '{}');
      if (!saved || !saved.transcript) return;
      state.step = saved.step || 'name';
      state.profile = Object.assign(state.profile, saved.profile || {});
      state.problem = saved.problem || '';
      state.caseId = saved.caseId || '';
      state.transcript = saved.transcript || [];
    } catch (err) {
      localStorage.removeItem(CHAT_STATE_KEY);
    }
  }

  function transcriptText() {
    const lines = [
      'FinePulse Support Case',
      '',
      'Case ID: ' + state.caseId,
      'Name: ' + state.profile.name,
      'Email: ' + state.profile.email,
      'Phone: ' + state.profile.phone,
      'Problem: ' + state.problem,
      'Submitted from: ' + window.location.href,
      '',
      'Chat Transcript:'
    ];
    state.transcript.forEach(function (entry) {
      lines.push('[' + entry.role.toUpperCase() + '] ' + entry.text);
    });
    return lines.join('\n');
  }

  function advisorMailto() {
    return 'mailto:' + ADVISOR_EMAIL +
      '?subject=' + encodeURIComponent('FinePulse Support Case ' + state.caseId + ' - ' + state.profile.name) +
      '&body=' + encodeURIComponent(transcriptText());
  }

  function customerMailto() {
    return 'mailto:' + state.profile.email +
      '?subject=' + encodeURIComponent('Your FinePulse Support Case ' + state.caseId) +
      '&body=' + encodeURIComponent(transcriptText());
  }

  function advisorWhatsapp() {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(transcriptText());
  }

  function createWidget() {
    const widget = document.createElement('section');
    widget.className = 'fp-chat';
    widget.setAttribute('aria-label', 'FinePulse live assistance chat');
    widget.innerHTML = [
      '<button class="fp-chat__launcher" type="button" aria-label="Open FinePulse assistant" aria-expanded="false">',
      '  <span class="fp-chat__launcher-mark" aria-hidden="true"><img src="assets/img/logo.png" alt="" class="fp-chat__launcher-logo" width="38" height="38" loading="lazy" decoding="async"></span>',
      '  <span class="fp-chat__launcher-text">Live Assistance</span>',
      '</button>',
      '<div class="fp-chat__panel" aria-hidden="true">',
      '  <div class="fp-chat__head">',
      '    <div><div class="fp-chat__eyebrow">FinePulse Assistant</div><h2 class="fp-chat__title">How can we help?</h2></div>',
      '    <button class="fp-chat__close" type="button" aria-label="Close FinePulse assistant">&times;</button>',
      '  </div>',
      '  <div class="fp-chat__body" role="log" aria-live="polite" aria-relevant="additions"></div>',
      '  <div class="fp-chat__quick" aria-label="Quick questions"></div>',
      '  <form class="fp-chat__form">',
      '    <label class="visually-hidden" for="fpChatInput">Message FinePulse assistant</label>',
      '    <input class="fp-chat__input" id="fpChatInput" type="text" autocomplete="off" placeholder="Type your message..." required>',
      '    <button class="fp-chat__send" type="submit">Send</button>',
      '  </form>',
      '</div>'
    ].join('');
    document.body.appendChild(widget);
    return widget;
  }

  const widget = createWidget();
  const launcher = widget.querySelector('.fp-chat__launcher');
  const panel = widget.querySelector('.fp-chat__panel');
  const closeBtn = widget.querySelector('.fp-chat__close');
  const body = widget.querySelector('.fp-chat__body');
  const form = widget.querySelector('.fp-chat__form');
  const input = widget.querySelector('.fp-chat__input');
  const quick = widget.querySelector('.fp-chat__quick');

  function scrollBody() {
    body.scrollTop = body.scrollHeight;
  }

  function renderLinks(links) {
    if (!links || !links.length) return '';
    return '<div class="fp-chat__links">' + links.map(function (link) {
      const external = /^https?:\/\//i.test(link.href);
      return '<a href="' + escapeHtml(link.href) + '"' + (external ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + escapeHtml(link.label) + '</a>';
    }).join('') + '</div>';
  }

  function addMessage(role, text, links) {
    state.transcript.push({ role: role, text: text, at: new Date().toISOString() });
    const row = document.createElement('div');
    row.className = 'fp-chat__message fp-chat__message--' + role;
    row.innerHTML = '<div class="fp-chat__bubble">' + escapeHtml(text) + renderLinks(links) + '</div>';
    body.appendChild(row);
    persistState();
    scrollBody();
  }

  function renderQuickReplies() {
    quick.innerHTML = quickReplies.map(function (label) {
      return '<button type="button" class="fp-chat__chip">' + escapeHtml(label) + '</button>';
    }).join('');
  }

  function renderTranscript() {
    body.innerHTML = '';
    state.transcript.forEach(function (entry) {
      const row = document.createElement('div');
      row.className = 'fp-chat__message fp-chat__message--' + entry.role;
      row.innerHTML = '<div class="fp-chat__bubble">' + escapeHtml(entry.text) + '</div>';
      body.appendChild(row);
    });
    scrollBody();
  }

  function setPlaceholder() {
    const labels = {
      name: 'Enter your full name',
      email: 'Enter your email address',
      phone: 'Enter your phone number',
      problem: 'Tell us what you need help with',
      chat: 'Ask about freight, customs, tracking, or routes'
    };
    input.placeholder = labels[state.step] || labels.chat;
    input.type = state.step === 'email' ? 'email' : 'text';
  }

  function showCaseActions() {
    const actions = document.createElement('div');
    actions.className = 'fp-chat__case-actions';
    actions.innerHTML = [
      '<a class="fp-chat__case-link" href="' + advisorMailto() + '">Forward to advisor</a>',
      '<a class="fp-chat__case-link" href="' + advisorWhatsapp() + '" target="_blank" rel="noopener noreferrer">Send on WhatsApp</a>',
      '<a class="fp-chat__case-link" href="' + customerMailto() + '">Email me a copy</a>'
    ].join('');
    body.appendChild(actions);
    scrollBody();
  }

  function openChat() {
    state.open = true;
    widget.classList.add('is-open');
    launcher.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    input.focus();
    if (!state.transcript.length) {
      addMessage('bot', 'Good day. I am the FinePulse live assistant. I can help with our services, shipping routes, customs, procurement, careers, blog guides, and support handoff. Please enter your full name to begin.');
    }
    setPlaceholder();
  }

  function closeChat() {
    state.open = false;
    widget.classList.remove('is-open');
    launcher.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
  }

  function createCase() {
    state.caseId = generateCaseId();
    saveCase();
    addMessage('bot', 'Thank you. Your FinePulse support case ID is ' + state.caseId + '. I have prepared your chat transcript so an advisor can reach out using your email and phone number.');
    showCaseActions();
    const answer = findKnowledgeReply(state.problem);
    addMessage('bot', answer.reply, answer.links);
    addMessage('bot', 'You can keep asking questions here. For fastest human follow-up, use Forward to advisor or Send on WhatsApp above.');
    state.step = 'chat';
    persistState();
    setPlaceholder();
  }

  function handleUserMessage(message) {
    const value = String(message || '').trim();
    if (!value) return;
    addMessage('user', value);

    if (state.step === 'name') {
      if (value.length < 2) {
        addMessage('bot', 'Please enter your full name so we can address the support case properly.');
        return;
      }
      state.profile.name = value;
      state.step = 'email';
      addMessage('bot', 'Thank you, ' + state.profile.name + '. What email address should we use for your case update?');
      setPlaceholder();
      return;
    }

    if (state.step === 'email') {
      if (!isValidEmail(value)) {
        addMessage('bot', 'Please enter a valid email address, for example name@example.com.');
        return;
      }
      state.profile.email = value;
      state.step = 'phone';
      addMessage('bot', 'Got it. Please enter your phone or WhatsApp number so an advisor can reach you.');
      setPlaceholder();
      return;
    }

    if (state.step === 'phone') {
      if (!isValidPhone(value)) {
        addMessage('bot', 'Please enter a valid phone number with at least 7 digits.');
        return;
      }
      state.profile.phone = value;
      state.step = 'problem';
      addMessage('bot', 'Thanks. Please describe the issue or shipment need. Include route, cargo type, tracking ID, urgency, or any customs concern if relevant.');
      setPlaceholder();
      return;
    }

    if (state.step === 'problem') {
      if (value.length < 8) {
        addMessage('bot', 'Please share a little more detail so the advisor understands the issue.');
        return;
      }
      state.problem = value;
      createCase();
      return;
    }

    const answer = findKnowledgeReply(value);
    addMessage('bot', answer.reply, answer.links);
  }

  launcher.addEventListener('click', function () {
    if (widget.classList.contains('is-open')) {
      closeChat();
    } else {
      openChat();
    }
  });

  closeBtn.addEventListener('click', closeChat);

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const value = input.value.trim();
    input.value = '';
    handleUserMessage(value);
  });

  quick.addEventListener('click', function (event) {
    const chip = event.target.closest('.fp-chat__chip');
    if (!chip) return;
    if (state.step !== 'chat') {
      addMessage('bot', 'I can help with "' + chip.textContent + '". First, please complete your name, email, phone number, and issue so I can create a support case for advisor follow-up.');
      input.focus();
      return;
    }
    handleUserMessage(chip.textContent);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && widget.classList.contains('is-open')) closeChat();
  });

  restoreState();
  renderQuickReplies();
  renderTranscript();
  setPlaceholder();
})();

// Widget Tab Switcher + CBM Calculator
(function () {
  const btnTrack = document.getElementById('btnTabTrack');
  const btnCBM   = document.getElementById('btnTabCBM');
  const tabTrack = document.getElementById('tabTrack');
  const tabCBM   = document.getElementById('tabCBM');
  const headerTitle = document.getElementById('widgetHeaderTitle');
  const headerMeta  = document.getElementById('widgetHeaderMeta');

  if (!btnTrack || !btnCBM) return;

  function switchTab(active, inactive, activePanel, inactivePanel, title, meta) {
    active.classList.add('is-active');
    active.setAttribute('aria-selected', 'true');
    inactive.classList.remove('is-active');
    inactive.setAttribute('aria-selected', 'false');
    activePanel.removeAttribute('hidden');
    inactivePanel.setAttribute('hidden', '');
    headerTitle.textContent = title;
    headerMeta.textContent  = meta;
  }

  btnTrack.addEventListener('click', function () {
    switchTab(btnTrack, btnCBM, tabTrack, tabCBM, 'Track Your Shipment', 'Real-time visibility');
  });

  btnCBM.addEventListener('click', function () {
    switchTab(btnCBM, btnTrack, tabCBM, tabTrack, 'CBM Calculator', 'Volume & weight estimator');
  });

  // CBM Calculation
  const calcBtn   = document.getElementById('cbmCalcBtn');
  const cbmResult = document.getElementById('cbmResult');
  const cbmValue  = document.getElementById('cbmResultValue');

  if (calcBtn) {
    calcBtn.addEventListener('click', function () {
      const l = parseFloat(document.getElementById('cbmLength').value) || 0;
      const w = parseFloat(document.getElementById('cbmWidth').value)  || 0;
      const h = parseFloat(document.getElementById('cbmHeight').value) || 0;
      const q = parseFloat(document.getElementById('cbmQty').value)    || 1;
      const cbm = (l / 100) * (w / 100) * (h / 100) * q;
      cbmValue.textContent = cbm.toFixed(4) + ' m³';
      cbmResult.removeAttribute('hidden');
    });
  }
})();

// Shipment tracking search and result page
(function () {
  const homepageInput = document.getElementById('homepageTrackingInput');
  const homepageButton = document.getElementById('homepageTrackingButton');

  function cleanTrackingId(value) {
    return String(value || '').trim();
  }

  if (homepageInput && homepageButton) {
    homepageButton.addEventListener('click', function (event) {
      event.preventDefault();
      const trackingId = cleanTrackingId(homepageInput.value);
      if (!trackingId) {
        homepageInput.focus();
        homepageInput.classList.add('is-invalid');
        return;
      }
      window.location.href = 'track-result.html?tracking_id=' + encodeURIComponent(trackingId);
    });

    homepageInput.addEventListener('input', function () {
      homepageInput.classList.remove('is-invalid');
    });

    homepageInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') homepageButton.click();
    });
  }

  const resultForm = document.getElementById('trackingResultForm');
  const resultInput = document.getElementById('trackingResultInput');
  const loading = document.getElementById('trackingLoading');
  const error = document.getElementById('trackingError');
  const info = document.getElementById('trackingInfo');
  const card = document.getElementById('trackingCard');

  if (!resultForm || !resultInput) return;

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || '-';
  }

  function hideAllStates() {
    if (loading) loading.hidden = true;
    if (error) error.hidden = true;
    if (info) info.hidden = true;
    if (card) card.hidden = true;
  }

  function showLoading() {
    hideAllStates();
    if (loading) loading.hidden = false;
  }

  function showInfo(title, message) {
    hideAllStates();
    if (info) {
      info.hidden = false;
      const titleEl = info.querySelector('h2');
      const textEl = info.querySelector('p');
      if (titleEl) titleEl.textContent = title || 'Need help finding a shipment?';
      if (textEl) textEl.textContent = message || 'Use the tracking number from your booking, bill of lading, or confirmation email. New shipments can take a few minutes to appear.';
    }
  }

  function showError(message, hint) {
    hideAllStates();
    if (error) {
      error.hidden = false;
      const text = error.querySelector('p');
      const combinedMessage = [message || 'Confirm the tracking ID and try again. If you still need help, contact FinePulse support.', hint].filter(Boolean).join(' ');
      if (text) text.textContent = combinedMessage;
    }
  }

  function showShipment(shipment) {
    hideAllStates();
    if (card) card.hidden = false;

    setText('trackingIdTitle', shipment.trackingId);
    setText('trackingStatus', shipment.status);
    setText('trackingOrigin', shipment.origin);
    setText('trackingDestination', shipment.destination);
    setText('trackingSerial', shipment.serialNumber);
    setText('trackingCustomerName', shipment.customerName);
    setText('trackingCustomerPhone', shipment.customerPhone);
    setText('trackingCustomerEmail', shipment.customerEmail);
    setText('trackingCurrentLocation', shipment.currentLocation);
    setText('trackingEstimatedDelivery', shipment.estimatedDelivery);
    setText('trackingLastUpdate', shipment.lastUpdate);
    setText('trackingWeight', shipment.weight);
  }

  async function loadShipment(trackingId) {
    showLoading();
    try {
      const response = await fetch('/api/track?tracking_id=' + encodeURIComponent(trackingId), {
        headers: { Accept: 'application/json' }
      });
      const payload = await response.json();
      if (!response.ok || !payload.found) {
        const hint = payload.code === 'service_unavailable'
          ? 'Please try again in a few minutes or contact support if the issue continues.'
          : 'Please verify the tracking ID and try again.';
        showError(payload.error || 'Tracking ID not found.', hint);
        return;
      }
      showShipment(payload.shipment);
    } catch (err) {
      showError('Tracking service is temporarily unavailable. Please try again later.');
    }
  }

  resultForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const trackingId = cleanTrackingId(resultInput.value);
    if (!trackingId) {
      resultInput.focus();
      resultInput.classList.add('is-invalid');
      return;
    }
    resultInput.classList.remove('is-invalid');
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('tracking_id', trackingId);
    window.history.replaceState({}, '', nextUrl);
    loadShipment(trackingId);
  });

  const initialTrackingId = cleanTrackingId(new URLSearchParams(window.location.search).get('tracking_id'));
  if (initialTrackingId) {
    resultInput.value = initialTrackingId;
    loadShipment(initialTrackingId);
  } else {
    showInfo('Need a tracking ID?', 'Use the tracking number from your booking, bill of lading, or confirmation email. New shipments can take a few minutes to appear.');
  }
})();

// Mobile bottom nav active state
(function () {
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  const items = Array.from(document.querySelectorAll('.mobile-bottom-nav__item'));
  const matches = items.filter(el => {
    const href = el.getAttribute('href');
    if (!href) return false;
    const targetFile = href.split('/').pop() || 'index.html';
    return targetFile === currentFile;
  });
  const activeItem = matches.find(el => !el.classList.contains('mobile-bottom-nav__item--send')) || matches[0];

  items.forEach(el => {
    const isCurrent = el === activeItem;
    el.classList.toggle('is-active', isCurrent);
    if (isCurrent) {
      el.setAttribute('aria-current', 'page');
    } else {
      el.removeAttribute('aria-current');
    }
  });
})();

// Sticky nav glassmorphism on scroll
(function () {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  window.addEventListener('scroll', function () {
    nav.classList.toggle('is-scrolled', window.scrollY > 60);
  }, { passive: true });
})();

// ============================================================
// VIBES — Scroll animations, counters, particles, cursor glow
// ============================================================
(function () {

  // 1. Scroll-triggered entrance animations
  const animEls = document.querySelectorAll('[data-animate]');
  if (animEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.delay || 0;
          setTimeout(() => el.classList.add('is-visible'), parseInt(delay));
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.12 });
    animEls.forEach(el => observer.observe(el));
  } else {
    animEls.forEach(el => el.classList.add('is-visible'));
  }

  // 2. Number counter animation
  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = Math.floor(ease * target);
      const display = target >= 1000 ? Math.floor(val / 1000) : val;
      el.innerHTML = display + '<sup>' + suffix.replace('K', '') + '</sup>';
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counters = document.querySelectorAll('.counter');
  if (counters.length && 'IntersectionObserver' in window) {
    const cObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => cObs.observe(el));
  }

  // 3. Hero particle canvas
  const canvas = document.getElementById('heroParticles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function Particle() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 1.5 + 0.4;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.6 + 0.2;
    }

    function init() {
      resize();
      particles = Array.from({ length: 80 }, () => new Particle());
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(246,129,44,${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener('resize', init);
  }

  // 4. Cursor glow (desktop only)
  if (window.matchMedia('(pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    document.addEventListener('mousemove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    });
  }

})();
