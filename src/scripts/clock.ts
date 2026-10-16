export function initClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const tick = () => {
    const d = new Date();
    el.textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    el.setAttribute('datetime', d.toISOString());
  };
  tick();
  setInterval(tick, 15_000);
}
