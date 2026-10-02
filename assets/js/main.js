'use strict';
document.documentElement.classList.add('js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.getElementById('navigation');
function closeMenu(focus = false) {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
  if (focus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = navigation.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
});
navigation.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && navigation.classList.contains('is-open')) closeMenu(true); });
document.addEventListener('click', e => { if (!e.target.closest('.site-header')) closeMenu(); });
window.matchMedia('(min-width: 1051px)').addEventListener('change', e => { if (e.matches) closeMenu(); });

if (!reduceMotion.matches && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
reduceMotion.addEventListener('change', e => { if (e.matches) document.documentElement.classList.remove('motion'); });

const heroVideo = document.querySelector('.hero-video');
const heroMotionControl = document.querySelector('[data-hero-motion]');
if (heroVideo && heroMotionControl) {
  const heroSource = heroVideo.querySelector('source');
  const motionLabel = heroMotionControl.querySelector('[data-hero-motion-label]');
  const motionSymbol = heroMotionControl.querySelector('.hero-motion-symbol');
  let pausedByVisitor = reduceMotion.matches;

  const updateMotionControl = () => {
    const paused = heroVideo.paused;
    heroMotionControl.setAttribute('aria-pressed', String(paused));
    motionLabel.textContent = paused ? 'Reproducir video' : 'Pausar video';
    motionSymbol.textContent = paused ? '▶' : 'Ⅱ';
  };

  const enableVideo = async () => {
    heroVideo.hidden = false;
    heroMotionControl.hidden = false;
    if (reduceMotion.matches || pausedByVisitor) {
      heroVideo.pause();
      updateMotionControl();
      return;
    }
    try { await heroVideo.play(); } catch (_) { updateMotionControl(); }
  };

  heroVideo.addEventListener('canplay', enableVideo, { once: true });
  heroVideo.addEventListener('play', updateMotionControl);
  heroVideo.addEventListener('pause', updateMotionControl);
  const showHeroFallback = () => {
    heroVideo.hidden = true;
    heroMotionControl.hidden = true;
  };
  heroVideo.addEventListener('error', showHeroFallback);
  heroSource?.addEventListener('error', showHeroFallback);
  heroMotionControl.addEventListener('click', async () => {
    if (heroVideo.paused) {
      pausedByVisitor = false;
      try { await heroVideo.play(); } catch (_) { updateMotionControl(); }
      updateMotionControl();
    } else {
      pausedByVisitor = true;
      heroVideo.pause();
      updateMotionControl();
    }
  });
  reduceMotion.addEventListener('change', event => {
    if (event.matches) {
      pausedByVisitor = true;
      heroVideo.pause();
    }
    updateMotionControl();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) heroVideo.pause();
    else if (!pausedByVisitor && !reduceMotion.matches) heroVideo.play().catch(() => {});
  });
  if (heroVideo.error || heroVideo.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
    showHeroFallback();
  } else if (heroVideo.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    enableVideo();
  }
}

document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
  document.getElementById('servicio').value = link.dataset.service;
  closeMenu();
  document.getElementById('nombre').focus({ preventScroll: true });
}));

const form = document.getElementById('contact-form');
const nameField = document.getElementById('nombre');
const messageField = document.getElementById('mensaje');
const fallback = document.getElementById('email-fallback');
const status = document.getElementById('form-status');
form.querySelector('button[type="submit"]').disabled = false;
form.addEventListener('submit', event => {
  event.preventDefault();
  nameField.setCustomValidity(nameField.value.trim() ? '' : 'Escribe tu nombre.');
  messageField.setCustomValidity(messageField.value.trim().length >= 10 ? '' : 'Describe tu proyecto con al menos 10 caracteres.');
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const lines = ['Hola C&A, quisiera una evaluación de mi proyecto.',
    `Nombre: ${String(data.get('nombre')).trim()}`,
    ...(String(data.get('empresa')).trim() ? [`Organización: ${String(data.get('empresa')).trim()}`] : []),
    `Correo: ${String(data.get('email')).trim()}`,
    `Servicio: ${data.get('servicio')}`,
    `Proyecto: ${String(data.get('mensaje')).trim()}`];
  const url = `mailto:ambiental.cya@gmail.com?subject=${encodeURIComponent('Consulta · ' + data.get('servicio'))}&body=${encodeURIComponent(lines.join('\n'))}`;
  fallback.href = url;
  fallback.hidden = false;
  status.textContent = 'Consulta preparada. Revísala y envíala desde tu aplicación de correo. Si no se abrió, utiliza el enlace de abajo.';
  window.open(url, '_self');
});
form.addEventListener('input', event => {
  if (event.target === nameField || event.target === messageField) event.target.setCustomValidity('');
  fallback.hidden = true;
  status.textContent = '';
});
form.addEventListener('change', () => { fallback.hidden = true; status.textContent = ''; });
