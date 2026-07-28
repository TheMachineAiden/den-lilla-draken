const button = document.querySelector('[data-read-story]');
const note = document.querySelector('#listen-note');
const pages = [...document.querySelectorAll('.reader-page')];
const previousButton = document.querySelector('[data-previous-page]');
const nextButton = document.querySelector('[data-next-page]');
const readerStatus = document.querySelector('[data-reader-status]');
const editionInputs = [...document.querySelectorAll('input[name="edition"]')];
let currentPage = 0;
let pointerStart = null;
let selectedEdition = 'prose';

document.documentElement.classList.add('reader-ready');

function showPage(pageIndex, moveFocus = false) {
  const previousPage = currentPage;
  currentPage = Math.max(0, Math.min(pageIndex, pages.length - 1));
  pages.forEach((page, index) => { page.hidden = index !== currentPage; });
  const activePage = pages[currentPage];
  if (currentPage !== previousPage) {
    const direction = currentPage > previousPage ? 'is-turning-forward' : 'is-turning-back';
    activePage.classList.remove('is-turning-forward', 'is-turning-back');
    void activePage.offsetWidth;
    activePage.classList.add(direction);
  }
  previousButton.disabled = currentPage === 0;
  nextButton.disabled = currentPage === pages.length - 1;
  const spanish = selectedEdition === 'spanish';
  readerStatus.textContent = `${currentPage === 0 ? (spanish ? 'Portada' : 'Omslag') : `${spanish ? 'Página' : 'Sida'} ${currentPage}`} · ${currentPage + 1} ${spanish ? 'de' : 'av'} ${pages.length}`;
  if (moveFocus) {
    const heading = pages[currentPage].querySelector('h2');
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

previousButton.addEventListener('click', () => showPage(currentPage - 1, true));
nextButton.addEventListener('click', () => showPage(currentPage + 1, true));
pages.forEach((page) => {
  page.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  page.addEventListener('pointerup', (event) => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const distanceX = event.clientX - pointerStart.x;
    const distanceY = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(distanceX) < 52 || Math.abs(distanceX) < Math.abs(distanceY) * 1.35) return;
    if (distanceX < 0 && currentPage < pages.length - 1) showPage(currentPage + 1, true);
    if (distanceX > 0 && currentPage > 0) showPage(currentPage - 1, true);
  });
  page.addEventListener('pointercancel', () => { pointerStart = null; });
});
document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target.matches('button, a, input, textarea, select')) return;
  if (event.key === 'ArrowLeft' && currentPage > 0) { event.preventDefault(); showPage(currentPage - 1, true); }
  if (event.key === 'ArrowRight' && currentPage < pages.length - 1) { event.preventDefault(); showPage(currentPage + 1, true); }
});

showPage(0);

function storyForReading() {
  const editionText = [...document.querySelectorAll('.reader-page [data-edition-heading] [data-edition-text]:not([hidden]), .reader-page [data-edition-copy]:not([hidden]) p')];
  const text = editionText.length ? editionText : [...document.querySelectorAll('.reader-page h2, .reader-page .prose p')];
  return text
    .filter((el) => !el.classList.contains('page-number'))
    .map((el) => el.textContent.trim())
    .join('. ');
}

function setEdition(edition) {
  selectedEdition = edition;
  const spanish = edition === 'spanish';
  document.documentElement.lang = spanish ? 'es' : 'sv';
  document.querySelectorAll('[data-edition-copy]').forEach((copy) => {
    copy.hidden = copy.dataset.editionCopy !== edition;
  });
  document.querySelectorAll('[data-edition-text]').forEach((text) => {
    text.hidden = text.dataset.editionText !== edition;
  });
  previousButton.textContent = spanish ? '← Anterior' : '← Föregående';
  nextButton.textContent = spanish ? 'Siguiente →' : 'Nästa →';
  document.querySelector('.reader-hint').textContent = spanish
    ? 'Desliza el cuento, usa los botones o las flechas para pasar las páginas.'
    : 'Dra åt sidan på boken, använd knapparna eller piltangenterna för att bläddra.';
  if (!('speechSynthesis' in window && speechSynthesis.speaking)) {
    button.innerHTML = `<span aria-hidden="true">◖</span> ${spanish ? 'Leer en voz alta' : 'Läs högt'}`;
    note.textContent = spanish ? 'Pulsa para escuchar el cuento.' : 'Tryck för att få sagan uppläst.';
  }
  showPage(currentPage);
  if ('speechSynthesis' in window && speechSynthesis.speaking) {
    speechSynthesis.cancel();
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = `<span aria-hidden="true">◖</span> ${spanish ? 'Leer en voz alta' : 'Läs högt'}`;
    note.textContent = spanish ? 'La lectura se detuvo al cambiar de edición.' : 'Uppläsningen stoppades när lässättet byttes.';
  }
}

editionInputs.forEach((input) => input.addEventListener('change', () => {
  if (input.checked) setEdition(input.value);
}));

if (!('speechSynthesis' in window)) { button.hidden = true; note.hidden = true; } else {
  button.addEventListener('click', () => {
    const spanish = selectedEdition === 'spanish';
    if (speechSynthesis.speaking) { speechSynthesis.cancel(); button.setAttribute('aria-pressed', 'false'); button.innerHTML = `<span aria-hidden="true">◖</span> ${spanish ? 'Leer en voz alta' : 'Läs högt'}`; note.textContent = spanish ? 'La lectura está en pausa.' : 'Uppläsningen är pausad.'; return; }
    const utterance = new SpeechSynthesisUtterance(storyForReading()); utterance.lang = spanish ? 'es-ES' : 'sv-SE'; utterance.rate = selectedEdition === 'rhyme' ? .78 : .82;
    utterance.onend = () => { button.setAttribute('aria-pressed', 'false'); button.innerHTML = `<span aria-hidden="true">◖</span> ${spanish ? 'Leer en voz alta' : 'Läs högt'}`; note.textContent = spanish ? 'Pulsa para escuchar el cuento.' : 'Tryck för att få sagan uppläst.'; };
    speechSynthesis.speak(utterance); button.setAttribute('aria-pressed', 'true'); button.innerHTML = `<span aria-hidden="true">■</span> ${spanish ? 'Detener lectura' : 'Stoppa uppläsning'}`; note.textContent = spanish ? 'El cuento se lee despacio en español.' : 'Sagan läses långsamt på svenska.';
  });
}
