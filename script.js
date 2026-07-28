const button = document.querySelector('[data-read-story]');
const note = document.querySelector('#listen-note');
const pages = [...document.querySelectorAll('.reader-page')];
const previousButton = document.querySelector('[data-previous-page]');
const nextButton = document.querySelector('[data-next-page]');
const readerStatus = document.querySelector('[data-reader-status]');
let currentPage = 0;

document.documentElement.classList.add('reader-ready');

function showPage(pageIndex, moveFocus = false) {
  currentPage = Math.max(0, Math.min(pageIndex, pages.length - 1));
  pages.forEach((page, index) => { page.hidden = index !== currentPage; });
  previousButton.disabled = currentPage === 0;
  nextButton.disabled = currentPage === pages.length - 1;
  readerStatus.textContent = `${currentPage === 0 ? 'Omslag' : `Sida ${currentPage}`} · ${currentPage + 1} av ${pages.length}`;
  if (moveFocus) {
    const heading = pages[currentPage].querySelector('h2');
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

previousButton.addEventListener('click', () => showPage(currentPage - 1, true));
nextButton.addEventListener('click', () => showPage(currentPage + 1, true));
document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target.matches('button, a, input, textarea, select')) return;
  if (event.key === 'ArrowLeft' && currentPage > 0) { event.preventDefault(); showPage(currentPage - 1, true); }
  if (event.key === 'ArrowRight' && currentPage < pages.length - 1) { event.preventDefault(); showPage(currentPage + 1, true); }
});

showPage(0);

if (!('speechSynthesis' in window)) { button.hidden = true; note.hidden = true; } else {
  const story = [...document.querySelectorAll('.reader-page p, .reader-page h2')].filter((el) => !el.classList.contains('page-number') && !el.classList.contains('listen-note')).map((el) => el.textContent.trim()).join('. ');
  button.addEventListener('click', () => {
    if (speechSynthesis.speaking) { speechSynthesis.cancel(); button.setAttribute('aria-pressed', 'false'); button.innerHTML = '<span aria-hidden="true">◖</span> Läs högt'; note.textContent = 'Uppläsningen är pausad.'; return; }
    const utterance = new SpeechSynthesisUtterance(story); utterance.lang = 'sv-SE'; utterance.rate = .82;
    utterance.onend = () => { button.setAttribute('aria-pressed', 'false'); button.innerHTML = '<span aria-hidden="true">◖</span> Läs högt'; note.textContent = 'Tryck för att få sagan uppläst.'; };
    speechSynthesis.speak(utterance); button.setAttribute('aria-pressed', 'true'); button.innerHTML = '<span aria-hidden="true">■</span> Stoppa uppläsning'; note.textContent = 'Sagan läses långsamt på svenska.';
  });
}
