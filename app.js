(() => {
  'use strict';
  const opening = document.querySelector('#opening');
  const main = document.querySelector('#contenido');
  const openButton = document.querySelector('#open-invitation');
  const audio = document.querySelector('#music');
  const audioControl = document.querySelector('#audio-control');
  const audioToggle = document.querySelector('#audio-toggle');
  const audioLabel = document.querySelector('#audio-label');
  const audioIcon = document.querySelector('#audio-icon');
  const audioStatus = document.querySelector('#audio-status');
  const volume = document.querySelector('#volume');
  const dialog = document.querySelector('#rsvp-dialog');
  const rsvpOpen = document.querySelector('#rsvp-open');
  const formStatus = document.querySelector('#form-status');
  const rsvpFormUrl = String(window.VIDA180_CONFIG?.rsvpFormUrl || '').trim();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('.optional-logo').forEach(image => {
    const showIfValid = () => { if (image.naturalWidth > 0) image.hidden = false; };
    image.addEventListener('load', showIfValid);
    image.addEventListener('error', () => { image.hidden = true; });
    if (image.complete) showIfValid();
  });

  main.inert = true;
  audio.volume = Number(volume.value);
  const syncAudio = () => {
    const playing = !audio.paused;
    audioToggle.setAttribute('aria-pressed', String(playing));
    audioToggle.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
    audioIcon.textContent = playing ? 'Ⅱ' : '▶';
    audioLabel.textContent = playing ? 'PAUSAR' : 'MÚSICA';
  };
  const showAudioError = () => {
    audioStatus.textContent = 'No se pudo reproducir la música. Compruebe que el archivo de audio esté disponible e inténtelo de nuevo.';
    syncAudio();
  };
  const playAudio = () => {
    audioStatus.textContent = '';
    const result = audio.play();
    if (result && typeof result.catch === 'function') result.catch(showAudioError);
  };
  audio.addEventListener('error', showAudioError);
  audio.addEventListener('play', syncAudio);
  audio.addEventListener('pause', syncAudio);
  audio.addEventListener('ended', syncAudio);
  audioToggle.addEventListener('click', () => audio.paused ? playAudio() : audio.pause());
  volume.addEventListener('input', () => { audio.volume = Number(volume.value); });

  function openInvitation() {
    if (opening.classList.contains('is-open')) return;
    opening.classList.add('is-open');
    openButton.disabled = true;
    audioControl.hidden = false;
    playAudio(); // This call stays inside the user's activation gesture.
    window.setTimeout(() => {
      opening.classList.add('closing-screen');
      main.inert = false;
      main.focus({ preventScroll: true });
      window.setTimeout(() => { opening.hidden = true; }, reduceMotion.matches ? 0 : 900);
    }, reduceMotion.matches ? 0 : 1050);
  }
  openButton.addEventListener('click', openInvitation);
  document.querySelector('.skip-link').addEventListener('click', event => {
    if (!opening.hidden && !opening.classList.contains('closing-screen')) {
      event.preventDefault();
      openInvitation();
    }
  });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else revealItems.forEach(item => item.classList.add('visible'));

  rsvpOpen.addEventListener('click', () => {
    if (rsvpFormUrl && /^(https:\/\/docs\.google\.com\/forms\/d\/e\/|https:\/\/forms\.gle\/)/.test(rsvpFormUrl)) {
      window.open(rsvpFormUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    formStatus.textContent = 'La confirmación de asistencia estará disponible en cuanto el colegio active su formulario. Por favor, vuelva a consultar este enlace próximamente.';
    formStatus.classList.remove('success');
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  });
  const closeDialog = () => {
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else dialog.removeAttribute('open');
    rsvpOpen.focus();
  };
  dialog.querySelector('.dialog-close').addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });
})();
