/* =====================================================
   Sophrologie & Sérénité — script principal
   ===================================================== */

(function () {
  'use strict';

  /* --------- Menu mobile --------- */
  const toggle = document.querySelector('.nav-toggle');
  const body = document.body;
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.querySelectorAll('.nav-links a').forEach((a) => {
      a.addEventListener('click', () => {
        body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* --------- Scroll reveal (Intersection Observer) --------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* --------- Formulaire de contact (validation + feedback) --------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (form && status) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const required = ['firstname', 'lastname', 'email', 'message'];
      for (const f of required) {
        if (!data.get(f) || !String(data.get(f)).trim()) {
          status.textContent = 'Merci de remplir tous les champs obligatoires.';
          status.style.color = '#B23A48';
          return;
        }
      }
      const email = String(data.get('email')).trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.textContent = 'Adresse email invalide.';
        status.style.color = '#B23A48';
        return;
      }

      status.style.color = '';
      status.textContent =
        'Merci pour votre message ! Je vous réponds sous 48h. (formulaire de démonstration — à connecter à un service d’envoi de mail)';
      form.reset();
    });
  }

  /* --------- Année courante dans le footer --------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
