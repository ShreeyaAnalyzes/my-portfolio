'use strict';

// ── Navbar: scroll class + active link ──
const navbar   = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');
const sections = document.querySelectorAll('section[id]');

const backToTop = document.getElementById('back-to-top');

function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  backToTop.classList.toggle('visible', window.scrollY > 400);

  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Hamburger menu ──
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMenu.classList.toggle('open');
  document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
});

// Close menu on link click
navMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── Scroll-fade-in observer ──
const fadeEls = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach(el => observer.observe(el));

// ── Animate progress bars when learning section enters view ──
const lpFills = document.querySelectorAll('.lp-fill');
const learnObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      lpFills.forEach(fill => {
        const target = fill.style.width;
        fill.style.width = '0';
        requestAnimationFrame(() => {
          fill.style.transition = 'width 1.2s cubic-bezier(.4,0,.2,1)';
          fill.style.width = target;
        });
      });
      learnObs.disconnect();
    }
  });
}, { threshold: 0.3 });

const learningSection = document.getElementById('learning');
if (learningSection) learnObs.observe(learningSection);

// ── Animate stat counters in hero ──
function animateCounter(el, target, suffix, duration) {
  let start = null;
  const isDecimal = String(target).includes('.');
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = eased * target;
    el.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statNums = document.querySelectorAll('.stat-num');
let countersStarted = false;

const heroObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !countersStarted) {
    countersStarted = true;
    const configs = [
      { target: 7,  suffix: '+' },
      { target: 6,  suffix: '' },
      { target: 50, suffix: '%' },
    ];
    statNums.forEach((el, i) => {
      if (configs[i]) animateCounter(el, configs[i].target, configs[i].suffix, 1400);
    });
  }
}, { threshold: 0.5 });

const heroSection = document.getElementById('hero');
if (heroSection) heroObs.observe(heroSection);

// ── Contact form ──
const form   = document.getElementById('contact-form');
const status = document.getElementById('form-status');

form.addEventListener('submit', e => {
  e.preventDefault();

  const name    = form.querySelector('#cf-name').value.trim();
  const email   = form.querySelector('#cf-email').value.trim();
  const message = form.querySelector('#cf-message').value.trim();

  if (!name || !email || !message) {
    showStatus('Please fill in all required fields.', 'error');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showStatus('Please enter a valid email address.', 'error');
    return;
  }

  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>&nbsp; Sending…';

  fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: { 'Accept': 'application/json' }
  })
  .then(res => {
    if (res.ok) {
      showStatus('Message sent! I\'ll be in touch within 24 hours.', 'success');
      form.reset();
    } else {
      showStatus('Something went wrong. Please email me directly at shreya.bhise@gmail.com', 'error');
    }
  })
  .catch(() => {
    showStatus('Could not send. Please email me directly at shreya.bhise@gmail.com', 'error');
  })
  .finally(() => {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i>&nbsp; Send Message';
  });
});

function showStatus(msg, type) {
  status.textContent = msg;
  status.className   = 'form-status ' + type;
  setTimeout(() => { status.textContent = ''; status.className = 'form-status'; }, 6000);
}

// ── Smooth nav link clicks (fallback for older browsers) ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = target.getBoundingClientRect().top + window.scrollY - (navbar.offsetHeight + 8);
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});
