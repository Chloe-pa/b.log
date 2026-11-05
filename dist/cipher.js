(() => {
'use strict';
const alphabet = [...'abcdefghijklmnopqrstuvwxyz', '-'];
const chosen = Array(6).fill('-');
const machine = document.querySelector('#cipher');
const rows = document.querySelector('#cipher-rows');
const spine = document.querySelector('.cipher-spine');
const status = document.querySelector('#cipher-status');
let opening = null;
spine.innerHTML = chosen.map((_, i) => `<span class="cipher-letter" data-slot="${i}">${String(i + 1).padStart(2, '0')}</span>`).join('');
rows.innerHTML = chosen.map((_, row) => `<div class="cipher-row" role="group" aria-label="${row + 1}번째 글자">${alphabet.map((letter, column) => `<button type="button" class="cipher-key" data-row="${row}" data-letter="${letter}" tabindex="${column === 0 ? 0 : -1}" aria-label="${row + 1}번째 글자 ${letter === '-' ? '지우기' : letter}" aria-pressed="false">${letter}</button>`).join('')}</div>`).join('');
function cancelOpening() { clearTimeout(opening); opening = null; machine.classList.remove('unlocked'); }
function pick(row, letter) {
  cancelOpening();
  chosen[row] = letter;
  const slot = spine.children[row];
  slot.textContent = letter === '-' ? String(row + 1).padStart(2, '0') : letter;
  slot.classList.toggle('filled', letter !== '-');
  const buttons = [...rows.children[row].children];
  buttons.forEach(button => {
    const active = button.dataset.letter === letter && letter !== '-';
    button.classList.toggle('selected', active);
    button.setAttribute('aria-pressed', String(active));
    button.tabIndex = button.dataset.letter === (letter === '-' ? 'a' : letter) ? 0 : -1;
  });
  const count = chosen.filter(c => c !== '-').length;
  const word = chosen.join('');
  status.textContent = count ? `${chosen.map(c => c === '-' ? '·' : c).join(' ')} / ${count} of 6` : '한 줄에 한 글자. 위에서 아래로.';
  const match = Object.keys(window.MENUS).find(keyword => keyword.padEnd(6, '-') === word);
  if (match) {
    status.textContent = `${match.split('').join(' ')} — 문이 열려요.`;
    machine.querySelector('.cipher-heading > span:first-child').dataset.found = `${match}, found.`;
    machine.classList.add('unlocked');
    opening = setTimeout(() => {
      opening = null;
      if (chosen.join('') === match.padEnd(6, '-') && !location.hash) location.hash = match;
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650);
  } else if (count === 6) status.textContent = `${word} — 아직 열리지 않은 단어예요.`;
}
function focusKey(row, letter) {
  const button = [...rows.children[row].children].find(b => b.dataset.letter === letter);
  button.focus({ preventScroll: true });
  const scroller = document.querySelector('.cipher-scroll');
  const left = button.offsetLeft;
  if (left < scroller.scrollLeft) scroller.scrollLeft = left;
  else if (left + button.offsetWidth > scroller.scrollLeft + scroller.clientWidth) scroller.scrollLeft = left + button.offsetWidth - scroller.clientWidth;
}
rows.addEventListener('click', event => {
  const key = event.target.closest('.cipher-key');
  if (key) pick(Number(key.dataset.row), key.dataset.letter);
});
rows.addEventListener('keydown', event => {
  const key = event.target.closest('.cipher-key');
  if (!key || event.altKey || event.ctrlKey || event.metaKey) return;
  const row = Number(key.dataset.row), column = alphabet.indexOf(key.dataset.letter);
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    if (event.key === 'ArrowLeft') focusKey(row, alphabet[(column + 26) % 27]);
    if (event.key === 'ArrowRight') focusKey(row, alphabet[(column + 1) % 27]);
    if (event.key === 'ArrowUp') focusKey(Math.max(0, row - 1), key.dataset.letter);
    if (event.key === 'ArrowDown') focusKey(Math.min(5, row + 1), key.dataset.letter);
    if (event.key === 'Home') focusKey(row, 'a');
    if (event.key === 'End') focusKey(row, '-');
  } else if (/^[a-z-]$/i.test(event.key)) {
    event.preventDefault();
    pick(row, event.key.toLowerCase());
    focusKey(Math.min(5, row + 1), chosen[Math.min(5, row + 1)] === '-' ? 'a' : chosen[Math.min(5, row + 1)]);
  } else if (event.key === 'Backspace') {
    event.preventDefault();
    const target = chosen[row] === '-' ? Math.max(0, row - 1) : row;
    pick(target, '-'); focusKey(target, 'a');
  }
});
document.querySelector('#cipher-reset').addEventListener('click', () => {
  chosen.forEach((_, row) => pick(row, '-'));
});
window.addEventListener('hashchange', () => { if (location.hash) cancelOpening(); });
})();
