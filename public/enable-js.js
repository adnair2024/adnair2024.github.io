// Tiny blocking script: marks the page as script-enabled and picks the initial
// workspace before first paint, so there is no flash of the stacked no-JS layout.
(function () {
  var d = document.documentElement;
  var h = location.hash.slice(1);
  d.classList.add('js');
  d.dataset.ws = h === 'projects' || h === 'blog' ? h : 'home';
})();
