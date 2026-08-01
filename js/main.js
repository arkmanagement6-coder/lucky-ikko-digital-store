document.addEventListener('DOMContentLoaded', () => {
  // 1. STICKY HEADER ON SCROLL
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('header-active');
    } else {
      header.classList.remove('header-active');
    }
  });

  // 2. MOBILE MENU DRAWER TOGGLE
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking nav links on mobile
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // 3. SET ACTIVE LINK BASED ON CURRENT PAGE
  const currentPath = window.location.pathname;
  const page = currentPath.substring(currentPath.lastIndexOf('/') + 1);
  const menuLinks = document.querySelectorAll('.nav-link');

  menuLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (page === linkHref || (page === '' && linkHref === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 4. SCROLL REVEAL EFFECT (Using Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal');
  const revealOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Once revealed, no need to track it anymore
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => {
    revealOnScroll.observe(el);
  });

  // 5. SABPAISA PAYMENT GATEWAY INTEGRATION
  const SABPAISA_CONFIG = {
    clientCode: 'ARKM1',
    apiKey: 'sp_P4FN07lSTKNxqbLdT2SN5ZvKCzBTxasI0PgsMaM7_Og',
    secretKey: 'sec_C-0PTD_nPJ2Q4j7JDGDqhmqQLYyNEXTLkiJgp_dAAMU',
    initUrl: 'https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1',
    merchantName: 'ARK Management',
    brandName: 'ARK Digital'
  };

  // Build and Inject SabPaisa Payment Modal DOM
  function initSabPaisaModal() {
    if (document.getElementById('spPaymentModalOverlay')) return;

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'spPaymentModalOverlay';
    modalOverlay.className = 'sp-modal-overlay';
    modalOverlay.innerHTML = `
      <div class="sp-modal-container">
        <div class="sp-modal-header">
          <div>
            <div class="sp-modal-title">
              <h3>SabPaisa Checkout</h3>
            </div>
            <span class="sp-badge">Client ID: ${SABPAISA_CONFIG.clientCode} | ${SABPAISA_CONFIG.merchantName}</span>
          </div>
          <button type="button" class="sp-close-btn" id="spModalCloseBtn">&times;</button>
        </div>
        <div class="sp-modal-body">
          <div class="sp-summary-card">
            <div class="sp-summary-row">
              <span>Selected Campaign Plan</span>
              <strong id="spModalPlanName" style="color:#fff;">Organic SEO Services</strong>
            </div>
            <div class="sp-summary-row">
              <span>Merchant Entity</span>
              <span>${SABPAISA_CONFIG.merchantName}</span>
            </div>
            <div class="sp-summary-row total">
              <span>Total Amount Payable</span>
              <span class="price-val" id="spModalPlanPrice">₹999</span>
            </div>
          </div>

          <div class="sp-merchant-info">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span>Verified Merchant: <strong>${SABPAISA_CONFIG.merchantName}</strong> (${SABPAISA_CONFIG.brandName})</span>
          </div>

          <form id="spCheckoutForm">
            <div class="form-group" style="margin-bottom: 1rem;">
              <label style="display:block; font-size:0.85rem; color:var(--text-muted); margin-bottom:0.4rem;">Payer Name *</label>
              <input type="text" id="spPayerName" class="form-control" placeholder="e.g. Rohan Sharma" required style="width:100%; padding:0.75rem; background:rgba(255,255,255,0.05); border:1px solid var(--border-light); color:#fff; border-radius:8px;">
            </div>
            <div class="form-group" style="margin-bottom: 1rem;">
              <label style="display:block; font-size:0.85rem; color:var(--text-muted); margin-bottom:0.4rem;">Email Address *</label>
              <input type="email" id="spPayerEmail" class="form-control" placeholder="e.g. client@domain.com" required style="width:100%; padding:0.75rem; background:rgba(255,255,255,0.05); border:1px solid var(--border-light); color:#fff; border-radius:8px;">
            </div>
            <div class="form-group" style="margin-bottom: 1.5rem;">
              <label style="display:block; font-size:0.85rem; color:var(--text-muted); margin-bottom:0.4rem;">Mobile Number *</label>
              <input type="tel" id="spPayerMobile" class="form-control" placeholder="e.g. 9876543210" required maxlength="10" style="width:100%; padding:0.75rem; background:rgba(255,255,255,0.05); border:1px solid var(--border-light); color:#fff; border-radius:8px;">
            </div>

            <button type="submit" class="sp-pay-submit-btn" id="spPaySubmitBtn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <span>Proceed to Pay via SabPaisa</span>
            </button>
          </form>

          <div class="sp-security-footer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span>256-Bit SSL Secured Payment via SabPaisa Gateway</span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalOverlay);

    // Modal Close Listeners
    const closeBtn = document.getElementById('spModalCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
      });
    }
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });

    // Form Submit Handler
    const checkoutForm = document.getElementById('spCheckoutForm');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const payerName = document.getElementById('spPayerName').value.trim();
        const payerEmail = document.getElementById('spPayerEmail').value.trim();
        const payerMobile = document.getElementById('spPayerMobile').value.trim();
        const currentAmount = modalOverlay.getAttribute('data-price') || '999';
        const currentPlan = modalOverlay.getAttribute('data-plan') || 'Campaign Plan';

        if (!payerName || !payerEmail || !payerMobile) {
          alert('Please enter your Name, Email, and Mobile number to proceed with payment.');
          return;
        }

        if (payerMobile.length < 10) {
          alert('Please enter a valid 10-digit mobile number.');
          return;
        }

        const submitBtn = document.getElementById('spPaySubmitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Connecting to SabPaisa Gateway...';

        // Generate unique client transaction ID
        const clientTxnId = `ARKM1_TXN_${Date.now()}`;

        // Create SabPaisa Gateway POST form dynamically
        const sabPaisaForm = document.createElement('form');
        sabPaisaForm.method = 'POST';
        sabPaisaForm.action = SABPAISA_CONFIG.initUrl;
        sabPaisaForm.style.display = 'none';

        const fields = {
          clientCode: SABPAISA_CONFIG.clientCode,
          apiKey: SABPAISA_CONFIG.apiKey,
          secretKey: SABPAISA_CONFIG.secretKey,
          clientTxnId: clientTxnId,
          amount: currentAmount,
          payerName: payerName,
          payerEmail: payerEmail,
          payerMobile: payerMobile,
          payerAddress: 'India',
          callbackUrl: window.location.origin + window.location.pathname,
          channelId: 'W',
          userType: 'Client',
          mcc: '5968'
        };

        for (const [key, value] of Object.entries(fields)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          sabPaisaForm.appendChild(input);
        }

        document.body.appendChild(sabPaisaForm);

        setTimeout(() => {
          sabPaisaForm.submit();
        }, 800);
      });
    }
  }

  // Window launcher function
  window.openSabPaisaCheckout = function(planName, planPrice) {
    initSabPaisaModal();
    const overlay = document.getElementById('spPaymentModalOverlay');
    if (overlay) {
      document.getElementById('spModalPlanName').textContent = planName;
      document.getElementById('spModalPlanPrice').textContent = '₹' + Number(planPrice).toLocaleString('en-IN');
      overlay.setAttribute('data-price', planPrice);
      overlay.setAttribute('data-plan', planName);
      overlay.classList.add('active');
    }
  };

  // Intercept pricing plan buttons across pages
  const pricingButtons = document.querySelectorAll('.pricing-btn');
  pricingButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const href = btn.getAttribute('href') || '';
      let planName = 'Organic SEO Services';
      let planPrice = 999;

      if (href.includes('SEO')) {
        planName = 'Organic SEO Services';
        planPrice = 999;
      } else if (href.includes('GoogleListing')) {
        planName = 'Google Listing Optimization';
        planPrice = 1999;
      } else if (href.includes('PaidAds')) {
        planName = 'ROI-Driven Paid Ads';
        planPrice = 4999;
      } else if (href.includes('PRServices')) {
        planName = 'Public Relations & PR Services';
        planPrice = 19999;
      }

      window.openSabPaisaCheckout(planName, planPrice);
    });
  });

  // 6. PRE-SELECT SERVICE FROM URL QUERY PARAMETER & AUTO OPEN IF PAY QUERY EXISTS
  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = urlParams.get('service');
  const serviceSelect = document.getElementById('requestedService');
  if (serviceSelect && serviceParam) {
    if (serviceParam === 'SEO') serviceSelect.value = 'SEO Services';
    else if (serviceParam === 'PaidAds') serviceSelect.value = 'Paid Ads';
    else if (serviceParam === 'GoogleListing') serviceSelect.value = 'Google Listing';
    else if (serviceParam === 'PRServices') serviceSelect.value = 'PR Services';
  }

  // 7. CONTACT FORM INTERACTION
  const contactForm = document.getElementById('agencyContactForm');
  if (contactForm) {
    // Add SabPaisa Pay Button to contact page if not present
    if (!document.getElementById('contactPayNowBtn')) {
      const payNowBtn = document.createElement('button');
      payNowBtn.type = 'button';
      payNowBtn.id = 'contactPayNowBtn';
      payNowBtn.className = 'btn';
      payNowBtn.style.cssText = 'width:100%; margin-top:1rem; padding:0.85rem; font-weight:700; background:linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); color:#07080e; border:none; border-radius:var(--radius-sm); cursor:pointer; font-size:0.95rem;';
      payNowBtn.innerHTML = '💳 Pay Campaign Retainer via SabPaisa Gateway';
      contactForm.appendChild(payNowBtn);

      payNowBtn.addEventListener('click', () => {
        const selected = serviceSelect ? serviceSelect.value : 'SEO Services';
        let planName = 'Organic SEO Services';
        let planPrice = 999;
        if (selected.includes('Paid')) { planName = 'ROI-Driven Paid Ads'; planPrice = 4999; }
        else if (selected.includes('Google')) { planName = 'Google Listing Optimization'; planPrice = 1999; }
        else if (selected.includes('PR')) { planName = 'Public Relations & PR Services'; planPrice = 19999; }
        
        window.openSabPaisaCheckout(planName, planPrice);
      });
    }

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('clientName').value.trim();
      const email = document.getElementById('clientEmail').value.trim();
      const phone = document.getElementById('clientPhone').value.trim();
      const service = document.getElementById('requestedService').value;
      const message = document.getElementById('clientMessage').value.trim();

      if (!name || !email || !message) {
        alert('Please fill out all required fields (Name, Email, and Message).');
        return;
      }

      // Simple email pattern check
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        alert('Please enter a valid email address.');
        return;
      }

      // Visual feedback for successful submit
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending Details...';

      setTimeout(() => {
        submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'; // Green gradient
        submitBtn.innerHTML = 'Message Sent Successfully!';
        
        // Reset form after delay
        setTimeout(() => {
          contactForm.reset();
          submitBtn.disabled = false;
          submitBtn.style.background = '';
          submitBtn.innerHTML = originalText;
        }, 3000);
      }, 1500);
    });
  }
});

