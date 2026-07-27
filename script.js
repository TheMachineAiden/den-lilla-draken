const button = document.querySelector('[data-read-story]');
const note = document.querySelector('#listen-note');
if (!('speechSynthesis' in window)) { button.hidden = true; note.hidden = true; } else {
  const story = [...document.querySelectorAll('.story p, .story h2')].filter((el) => !el.classList.contains('page-number') && !el.classList.contains('listen-note')).map((el) => el.textContent.trim()).join('. ');
  button.addEventListener('click', () => {
    if (speechSynthesis.speaking) { speechSynthesis.cancel(); button.setAttribute('aria-pressed', 'false'); button.innerHTML = '<span aria-hidden="true">◖</span> Läs högt'; note.textContent = 'Uppläsningen är pausad.'; return; }
    const utterance = new SpeechSynthesisUtterance(story); utterance.lang = 'sv-SE'; utterance.rate = .82;
    utterance.onend = () => { button.setAttribute('aria-pressed', 'false'); button.innerHTML = '<span aria-hidden="true">◖</span> Läs högt'; note.textContent = 'Tryck för att få sagan uppläst.'; };
    speechSynthesis.speak(utterance); button.setAttribute('aria-pressed', 'true'); button.innerHTML = '<span aria-hidden="true">■</span> Stoppa uppläsning'; note.textContent = 'Sagan läses långsamt på svenska.';
  });
}
