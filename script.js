/* ============================================================
   RAAS Enterprise — script.js
   ============================================================ */

'use strict';

/* ── DOM Ready ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initCounters();
  initActiveNavLinks();
  initContactForm();
  initSmoothScroll();
});

/* ── 1. Sticky Navbar ────────────────────────────────────── */
function initNavbar() {
  const header = document.querySelector('.header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

/* ── 2. Mobile Hamburger Menu ────────────────────────────── */
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-menu a');

  if (!hamburger || !mobileMenu) return;

  const toggle = (forceClose = false) => {
    const isOpen = hamburger.classList.contains('open');
    if (forceClose || isOpen) {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    } else {
      hamburger.classList.add('open');
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  hamburger.addEventListener('click', () => toggle());

  // Close on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggle(true));
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') toggle(true);
  });
}

/* ── 3. Smooth Scroll ────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ── 4. Scroll Animations (IntersectionObserver) ─────────── */
function initScrollAnimations() {
  const elements = document.querySelectorAll(
    '.fade-in, .slide-left, .slide-right'
  );
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Optionally unobserve after first trigger
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach(el => observer.observe(el));
}

/* ── 5. Animated Number Counters ─────────────────────────── */
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.counter);
    const duration = parseInt(el.dataset.duration || '2000', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
    const start = performance.now();

    const update = (now) => {
      const elapsed = Math.min((now - start) / duration, 1);
      const progress = easeOutQuart(elapsed);
      const current = (target * progress).toFixed(decimals);
      el.textContent = prefix + current + suffix;
      if (elapsed < 1) requestAnimationFrame(update);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    };
    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  counters.forEach(el => observer.observe(el));
}

/* ── 6. Active Nav Link on Scroll ────────────────────────── */
function initActiveNavLinks() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const headerHeight = () =>
    document.querySelector('.header')?.offsetHeight || 80;

  const setActive = () => {
    const scrollY = window.scrollY;
    let current = '';

    sections.forEach(section => {
      const top = section.offsetTop - headerHeight() - 60;
      const bottom = top + section.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        current = '#' + section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === current);
    });
  };

  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
}

/* ── 7. Contact Form Handler (Formspree) ─────────────────── */
function initContactForm() {
  const form = document.querySelector('#contact-form');
  const successMsg = document.querySelector('.form-success');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    const spinIcon = `<svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Sending...`;

    submitBtn.innerHTML = spinIcon;
    submitBtn.disabled = true;

    const action = form.getAttribute('action');
    const data = new FormData(form);

    try {
      // If no real Formspree endpoint yet, skip the fetch and show success
      const isPlaceholder = !action || action.includes('YOUR_FORM_ID');

      if (!isPlaceholder) {
        const res = await fetch(action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' },
        });
        if (!res.ok) throw new Error('Network error');
      } else {
        // Placeholder: simulate a short delay so the UX feels real
        await new Promise(r => setTimeout(r, 900));
      }

      form.style.display = 'none';
      if (successMsg) successMsg.classList.add('visible');
    } catch {
      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled = false;
      alert('Something went wrong. Please email us directly at shubham46sharma@gmail.com');
    }
  });
}

/* ── Spinning loader keyframe added via JS ───────────────── */
(function addSpinStyle() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    .spin { animation: spin 0.8s linear infinite; }
  `;
  document.head.appendChild(style);
})();
