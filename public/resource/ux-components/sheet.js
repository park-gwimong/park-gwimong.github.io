/* UX 컴포넌트 사전: 모든 시트가 함께 쓰는 동작.
   - <head> 에서 바로 불러 .js / .embed 클래스를 렌더링 전에 붙인다.
   - 임베드(?embed)되면 블로그의 테마 토글을 따라가고, iframe 높이를 내용에 맞춘다.
   - 칸이 화면에 들어오면 예시를 한 번 재생하고, 칸을 누르면 다시 재생한다. */
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var embed = /[?&]embed(=|&|$)/.test(location.search);

  if (embed) {
    root.classList.add('embed');
    try {
      var hostRoot = window.parent.document.documentElement;
      if (hostRoot !== root) {
        var sync = function () {
          var th = hostRoot.getAttribute('data-theme');
          if (th) root.setAttribute('data-theme', th);
        };
        sync();
        new MutationObserver(sync).observe(hostRoot, { attributes: true, attributeFilter: ['data-theme'] });
      }
    } catch (e) {}
  }

  document.addEventListener('DOMContentLoaded', function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.tile'));

    function open(tile, delay) {
      clearTimeout(tile.__timer);
      tile.__timer = setTimeout(function () { tile.classList.add('is-open'); }, delay || 0);
    }
    function replay(tile, delay) {
      tile.classList.remove('is-open');
      open(tile, 480 + (delay || 0));
    }

    tiles.forEach(function (tile) {
      var stage = tile.querySelector('.stage');
      if (!stage) return;
      stage.addEventListener('click', function () { replay(tile); });
      stage.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); replay(tile); }
      });
    });

    var all = document.getElementById('replay-all');
    if (all) all.addEventListener('click', function () {
      tiles.forEach(function (tile, i) { replay(tile, i * 120); });
    });

    if (reduce || !('IntersectionObserver' in window)) {
      tiles.forEach(function (tile) { tile.classList.add('is-open'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          open(entry.target, 150 + (tiles.indexOf(entry.target) % 3) * 120);
        });
      }, { threshold: 0.35 });
      tiles.forEach(function (tile) { io.observe(tile); });
    }

    if (embed) {
      try {
        var frame = window.frameElement;
        if (frame) {
          var fit = function () { frame.style.height = Math.ceil(document.body.getBoundingClientRect().height) + 'px'; };
          fit();
          if ('ResizeObserver' in window) new ResizeObserver(fit).observe(document.body);
          else window.addEventListener('resize', fit);
        }
      } catch (e) {}
    }
  });
})();
