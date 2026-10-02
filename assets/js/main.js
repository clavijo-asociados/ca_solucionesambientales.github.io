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

const video = document.getElementById('landscape-video');
if (video) {
  const section = video.closest('.vision');
  const panel = section.querySelector('.vision-video');
  const close = section.querySelector('.close-video');
  const errorMessage = section.querySelector('.video-error');
  const source = video.querySelector('source');
  let trigger;
  const hideVideo = () => {
    video.pause();
    panel.hidden = true;
    section.classList.remove('is-playing');
    if (trigger) trigger.focus({ preventScroll: true });
  };
  section.querySelectorAll('[data-play-video]').forEach(button => button.addEventListener('click', async () => {
    trigger = button;
    if (!source.getAttribute('src')) { source.src = source.dataset.src; video.load(); }
    panel.hidden = false;
    section.classList.add('is-playing');
    errorMessage.hidden = true;
    close.focus({ preventScroll: true });
    try { await video.play(); } catch (_) { errorMessage.hidden = false; }
  }));
  const showVideoError = () => { errorMessage.hidden = false; };
  video.addEventListener('error', showVideoError);
  source.addEventListener('error', showVideoError);
  close.addEventListener('click', hideVideo);
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) hideVideo(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
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
