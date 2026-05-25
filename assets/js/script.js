/* =====================================================
   Soph'rologie SB — script principal
   ===================================================== */

(function () {
  'use strict';

  /* --------- Menu mobile --------- */
  const toggle = document.querySelector('.nav-toggle');
  const body = document.body;
  const header = document.querySelector('.site-header');
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

  /* --------- Smart navbar : cache le menu au scroll down, l'affiche au scroll up --------- */
  if (header) {
    let lastY = window.scrollY;
    let ticking = false;
    const THRESHOLD_TOP = 80;       // au-dessus de ce seuil → toujours visible
    const SCROLL_DELTA  = 6;         // évite les micro-mouvements

    const updateHeader = () => {
      const y = window.scrollY;
      const delta = y - lastY;

      // Ajoute l'ombre quand on a scrollé
      header.classList.toggle('scrolled', y > 8);

      if (y < THRESHOLD_TOP) {
        header.classList.remove('nav-hidden');
      } else if (Math.abs(delta) > SCROLL_DELTA) {
        // Ne pas cacher si le menu mobile est ouvert
        if (!body.classList.contains('nav-open')) {
          if (delta > 0) {
            // scroll vers le bas
            header.classList.add('nav-hidden');
          } else {
            // scroll vers le haut
            header.classList.remove('nav-hidden');
          }
        }
      }

      lastY = y;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
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

  /* --------- Formulaire de contact — Formspree (AJAX) --------- */
  const form   = document.getElementById(‘contactForm’);
  const status = document.getElementById(‘formStatus’);

  if (form && status) {
    form.addEventListener(‘submit’, async (e) => {
      e.preventDefault();

      /* --- Validation côté client --- */
      const data     = new FormData(form);
      const required = [‘firstname’, ‘lastname’, ‘email’, ‘message’];
      for (const f of required) {
        if (!data.get(f) || !String(data.get(f)).trim()) {
          status.textContent = ‘Merci de remplir tous les champs obligatoires.’;
          status.className   = ‘form-status error’;
          return;
        }
      }
      const email = String(data.get(‘email’)).trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.textContent = ‘Adresse e-mail invalide.’;
        status.className   = ‘form-status error’;
        return;
      }

      /* --- Envoi vers Formspree --- */
      const btn = form.querySelector(‘button[type="submit"]’);
      btn.disabled    = true;
      btn.textContent = ‘Envoi en cours…’;
      status.textContent = ‘’;
      status.className   = ‘form-status’;

      try {
        const response = await fetch(form.action, {
          method:  ‘POST’,
          body:    data,
          headers: { Accept: ‘application/json’ },
        });

        if (response.ok) {
          status.textContent = ‘✓ Message envoyé ! Sophie vous répondra sous 48h.’;
          status.className   = ‘form-status success’;
          form.reset();
        } else {
          const json = await response.json().catch(() => ({}));
          const msg  = (json.errors || []).map((err) => err.message).join(‘, ‘);
          status.textContent = msg || ‘Une erreur est survenue. Veuillez réessayer ou me contacter directement par email.’;
          status.className   = ‘form-status error’;
        }
      } catch (_) {
        status.textContent = ‘Impossible d’envoyer le message (vérifiez votre connexion).’;
        status.className   = ‘form-status error’;
      } finally {
        btn.disabled    = false;
        btn.textContent = ‘Envoyer ma demande’;
      }
    });
  }

  /* --------- Année courante dans le footer --------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* --------- Highlight du lien nav correspondant à la section visible --------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const linkBySection = new Map();
    navLinks.forEach((link) => {
      const id = link.getAttribute('href').slice(1);
      if (id) linkBySection.set(id, link);
    });

    const setActive = (id) => {
      navLinks.forEach((l) => l.classList.remove('active'));
      const link = linkBySection.get(id);
      if (link) link.classList.add('active');
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        // Trouve la section la plus visible parmi celles qui croisent
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length) {
          setActive(visible[0].target.id);
        }
      },
      {
        // déclenche quand la section occupe la zone centrale du viewport
        rootMargin: '-30% 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );
    sections.forEach((s) => sectionObserver.observe(s));
  }
})();
