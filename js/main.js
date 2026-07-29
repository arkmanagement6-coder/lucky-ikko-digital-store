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

  // 5. PRE-SELECT SERVICE FROM URL QUERY PARAMETER
  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = urlParams.get('service');
  const serviceSelect = document.getElementById('requestedService');
  if (serviceSelect && serviceParam) {
    if (serviceParam === 'SEO') serviceSelect.value = 'SEO Services';
    else if (serviceParam === 'PaidAds') serviceSelect.value = 'Paid Ads';
    else if (serviceParam === 'GoogleListing') serviceSelect.value = 'Google Listing';
    else if (serviceParam === 'PRServices') serviceSelect.value = 'PR Services';
  }

  // 6. CONTACT FORM INTERACTION
  const contactForm = document.getElementById('agencyContactForm');
  if (contactForm) {
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
