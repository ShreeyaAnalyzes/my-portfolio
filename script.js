'use strict';

/* ══════════════════════════════
   SCROLL PROGRESS + NAV + BACK-TO-TOP
══════════════════════════════ */
const navbar    = document.getElementById('navbar');
const backToTop = document.getElementById('back-to-top');
const progress  = document.getElementById('scroll-progress');
const navLinks  = document.querySelectorAll('.nav-links a:not(.nav-cta)');
const sections  = document.querySelectorAll('section[id]');

function onScroll() {
  const sy   = window.scrollY;
  const docH = document.documentElement.scrollHeight - window.innerHeight;

  navbar.classList.toggle('scrolled', sy > 20);
  backToTop.classList.toggle('visible', sy > 400);
  if (progress) progress.style.width = (sy / docH * 100) + '%';

  let current = '';
  sections.forEach(s => { if (sy >= s.offsetTop - 130) current = s.id; });
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ══════════════════════════════
   HAMBURGER
══════════════════════════════ */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('nav-links');

function closeMenu() {
  hamburger.classList.remove('open');
  navMenu.classList.remove('open');
  document.body.style.overflow = '';
}
hamburger.addEventListener('click', () => {
  const isOpen = navMenu.classList.contains('open');
  isOpen ? closeMenu() : (hamburger.classList.add('open'), navMenu.classList.add('open'), document.body.style.overflow = 'hidden');
});
navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

/* ══════════════════════════════
   SMOOTH SCROLL
══════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight - 8, behavior: 'smooth' });
  });
});

/* ══════════════════════════════
   CUSTOM CURSOR
══════════════════════════════ */
const cursorDot  = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');

if (cursorDot && cursorRing && window.matchMedia('(hover: hover)').matches) {
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.body.classList.add('has-custom-cursor');

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
  });

  (function ringLoop() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    cursorRing.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
    requestAnimationFrame(ringLoop);
  })();

  document.querySelectorAll('a, button, .proj-card, .tl-card, .learn-card, .skill-cat, .about-card').forEach(el => {
    el.addEventListener('mouseenter', () => { cursorDot.classList.add('expanded'); cursorRing.classList.add('expanded'); });
    el.addEventListener('mouseleave', () => { cursorDot.classList.remove('expanded'); cursorRing.classList.remove('expanded'); });
  });

  document.addEventListener('mouseleave', () => { cursorDot.style.opacity = '0'; cursorRing.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursorDot.style.opacity = '1'; cursorRing.style.opacity = '1'; });
}

/* ══════════════════════════════
   PARTICLE CANVAS
══════════════════════════════ */
const canvas = document.getElementById('particle-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const COUNT = 72, MAX_DIST = 130;
  let particles = [];

  function resizeCanvas() {
    canvas.width  = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }

  class Particle {
    constructor() {
      this.x  = Math.random() * canvas.width;
      this.y  = Math.random() * canvas.height;
      this.vx = (Math.random() - .5) * .38;
      this.vy = (Math.random() - .5) * .38;
      this.r  = Math.random() * 1.4 + .4;
      this.a  = Math.random() * .45 + .1;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(123,184,212,${this.a})`;
      ctx.fill();
    }
  }

  function init() { particles = Array.from({ length: COUNT }, () => new Particle()); }

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(123,184,212,${.13 * (1 - d / MAX_DIST)})`;
          ctx.lineWidth = .6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  }

  new ResizeObserver(() => { resizeCanvas(); init(); }).observe(canvas.parentElement);
  resizeCanvas(); init(); frame();
}

/* ══════════════════════════════
   TYPEWRITER
══════════════════════════════ */
const twEl = document.getElementById('typewriter-text');
if (twEl) {
  const phrases = [
    'Turning Data Into Decisions',
    'Building Analytics You Can Trust',
    'Making Complex Data Simple',
    'Driving Insights That Matter',
  ];
  let pi = 0, ci = 0, deleting = false;

  function typewrite() {
    const phrase = phrases[pi];
    if (!deleting) {
      twEl.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; return setTimeout(typewrite, 2400); }
      setTimeout(typewrite, 72);
    } else {
      twEl.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; return setTimeout(typewrite, 450); }
      setTimeout(typewrite, 38);
    }
  }
  setTimeout(typewrite, 900);
}

/* ══════════════════════════════
   FADE-IN + SECTION HEADER REVEAL
══════════════════════════════ */
const fadeObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); fadeObs.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => fadeObs.observe(el));

const headerObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); headerObs.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('.section-header').forEach(el => headerObs.observe(el));

/* ══════════════════════════════
   LEARNING PROGRESS BARS
══════════════════════════════ */
const lpFills = document.querySelectorAll('.lp-fill');
new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting) return;
  lpFills.forEach(fill => {
    const target = fill.style.width;
    fill.style.width = '0';
    requestAnimationFrame(() => {
      fill.style.transition = 'width 1.4s cubic-bezier(.4,0,.2,1)';
      fill.style.width = target;
    });
  });
}, { threshold: 0.3 }).observe(document.getElementById('learning') || document.body);

/* ══════════════════════════════
   STAT COUNTERS
══════════════════════════════ */
function animateCounter(el, target, suffix, dur) {
  let start = null;
  (function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target) + suffix;
    if (p < 1) requestAnimationFrame(step);
  })(performance.now());
}

let countersStarted = false;
new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !countersStarted) {
    countersStarted = true;
    const cfg = [{ t: 7, s: '+' }, { t: 6, s: '' }, { t: 50, s: '%' }];
    document.querySelectorAll('.stat-num').forEach((el, i) => { if (cfg[i]) animateCounter(el, cfg[i].t, cfg[i].s, 1500); });
  }
}, { threshold: 0.5 }).observe(document.getElementById('hero') || document.body);

/* ══════════════════════════════
   3D CARD TILT
══════════════════════════════ */
document.querySelectorAll('.proj-card, .tl-card, .learn-card, .about-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - .5;
    const y = (e.clientY - r.top)  / r.height - .5;
    card.style.transition = 'transform .05s ease, border-color .3s, box-shadow .3s';
    card.style.transform  = `perspective(900px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform .5s ease, border-color .3s, box-shadow .3s';
    card.style.transform  = '';
  });
});

/* ══════════════════════════════
   BUTTON RIPPLE
══════════════════════════════ */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});

/* ══════════════════════════════
   CONTACT FORM (FORMSPREE)
══════════════════════════════ */
const form   = document.getElementById('contact-form');
const fStatus = document.getElementById('form-status');

form.addEventListener('submit', e => {
  e.preventDefault();
  const name    = form.querySelector('#cf-name').value.trim();
  const email   = form.querySelector('#cf-email').value.trim();
  const message = form.querySelector('#cf-message').value.trim();

  if (!name || !email || !message) return showStatus('Please fill in all required fields.', 'error');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showStatus('Please enter a valid email address.', 'error');

  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>&nbsp; Sending…';

  fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
    .then(res => {
      if (res.ok) { showStatus("Message sent! I'll be in touch within 24 hours.", 'success'); form.reset(); }
      else showStatus('Something went wrong. Email shreya.bhise@gmail.com directly.', 'error');
    })
    .catch(() => showStatus('Could not send. Email shreya.bhise@gmail.com directly.', 'error'))
    .finally(() => { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i>&nbsp; Send Message'; });
});

function showStatus(msg, type) {
  fStatus.textContent = msg;
  fStatus.className   = 'form-status ' + type;
  setTimeout(() => { fStatus.textContent = ''; fStatus.className = 'form-status'; }, 6000);
}
