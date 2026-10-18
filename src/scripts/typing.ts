const FLAG = 'typed-intro';
const START_MS = 450;
const CHAR_MS = 95;

function alreadyPlayed(): boolean {
  try {
    return sessionStorage.getItem(FLAG) === '1';
  } catch {
    return false;
  }
}

function markPlayed() {
  try {
    sessionStorage.setItem(FLAG, '1');
  } catch {
    /* storage unavailable: animation may replay, which is harmless */
  }
}

export function initTyping() {
  const h1 = document.getElementById('name');
  const real = h1?.querySelector('.name-real');
  const typed = h1?.querySelector('.name-typed');
  if (!h1 || !real || !typed) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || alreadyPlayed()) return;
  // Only play if the hero is on screen (hidden when landing on another workspace).
  if (h1.getClientRects().length === 0) return;

  markPlayed();
  const full = real.textContent ?? '';
  h1.classList.add('is-typing');
  let i = 0;
  const step = () => {
    i++;
    typed.textContent = full.slice(0, i);
    if (i < full.length) setTimeout(step, CHAR_MS);
    else {
      h1.classList.remove('is-typing');
      typed.textContent = '';
    }
  };
  setTimeout(step, START_MS);
}
