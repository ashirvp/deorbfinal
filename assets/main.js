(function () {
  // scroll progress bar
  var progress = document.getElementById('scrollProgress');
  function onScrollProgress() {
    var h = document.documentElement;
    var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progress.style.width = scrolled + '%';
  }
  window.addEventListener('scroll', onScrollProgress, { passive: true });
  onScrollProgress();

  // nav solidify on scroll
  var nav = document.getElementById('nav');
  function onScroll() { nav.classList.toggle('solid', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // mobile menu
  var burger = document.getElementById('burger'), menu = document.getElementById('mobileMenu');
  burger.addEventListener('click', function () {
    var open = burger.classList.toggle('open');
    menu.classList.toggle('show');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      burger.classList.remove('open');
      menu.classList.remove('show');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  // reveal on scroll
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: .15, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // count-up stats
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var counters = document.querySelectorAll('[data-count]');
  var counterIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      counterIo.unobserve(e.target);
      var target = parseInt(e.target.getAttribute('data-count'), 10);
      if (prefersReduced) { e.target.textContent = target; return; }
      var start = null;
      var duration = 1200;
      function step(ts) {
        if (!start) start = ts;
        var pct = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - pct, 3);
        e.target.textContent = Math.round(eased * target);
        if (pct < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: .6 });
  counters.forEach(function (el) { counterIo.observe(el); });

  // contact form
  var form = document.getElementById('briefForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      this.style.display = 'none';
      document.getElementById('sentMsg').style.display = 'block';
    });
  }
})();
