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
  document.querySelectorAll('.reveal, .line-draw').forEach(function (el) { io.observe(el); });

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

  // hardware showcase: sync sticky product shot + thumbs to whichever chapter
  // sits closest to the reference line — deterministic, unlike threshold-based
  // IntersectionObserver where several short paragraphs can all cross at once.
  var hwFrame = document.getElementById('hwFrame');
  var hwChapters = document.querySelectorAll('.hw-chapter');
  var hwThumbs = document.querySelectorAll('.hw-thumb');
  var hwActiveIndex = -1;
  function setActiveChapter(index) {
    index = String(index);
    if (index === hwActiveIndex) return;
    hwActiveIndex = index;
    hwChapters.forEach(function (c) { c.classList.toggle('active', c.getAttribute('data-chapter') === index); });
    hwThumbs.forEach(function (t) { t.classList.toggle('active', t.getAttribute('data-chapter') === index); });
    if (hwFrame) hwFrame.className = 'hardware-frame tilt-3d rot-' + index;
  }
  function updateHwChapter() {
    if (!hwChapters.length) return;
    var lineY = window.innerHeight * 0.45;
    var bestIdx = 0, bestDist = Infinity;
    hwChapters.forEach(function (c, i) {
      var r = c.getBoundingClientRect();
      var dist = Math.abs((r.top + r.height / 2) - lineY);
      if (dist < bestDist) { bestDist = dist; bestIdx = i; }
    });
    setActiveChapter(bestIdx);
  }
  hwThumbs.forEach(function (t) {
    t.addEventListener('click', function () {
      var idx = t.getAttribute('data-chapter');
      var target = document.querySelector('.hw-chapter[data-chapter="' + idx + '"]');
      if (target) target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'center' });
      setActiveChapter(idx);
    });
  });

  // pointer-driven 3D tilt (desktop, fine-pointer only)
  if (window.matchMedia('(pointer: fine)').matches && !prefersReduced) {
    document.querySelectorAll('.tilt-3d').forEach(function (el) {
      var max = el.classList.contains('hardware-frame') ? 0 : 5; // hardware frame uses scroll-driven rotation instead
      if (max === 0) return;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - .5;
        var py = (e.clientY - r.top) / r.height - .5;
        el.style.transform = 'perspective(900px) rotateX(' + (-py * max) + 'deg) rotateY(' + (px * max) + 'deg)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  // glass-card spotlight: track pointer position for the radial-gradient glow
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.glass-card').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  // parallax: hero radar drift + deployment photo drift, batched into one rAF loop
  var radarStage = document.querySelector('.radar-stage');
  var deployImg = document.getElementById('deployImg');
  var deployMedia = document.querySelector('.deploy-media');
  var ticking = false;
  function updateParallax() {
    ticking = false;
    updateHwChapter();
    if (prefersReduced) return;
    var vh = window.innerHeight;
    if (radarStage) {
      var heroRect = radarStage.closest('.hero').getBoundingClientRect();
      var shift = Math.max(-40, Math.min(40, heroRect.top * -0.08));
      radarStage.style.transform = 'translateY(' + shift.toFixed(1) + 'px)';
    }
    if (deployImg && deployMedia) {
      var rect = deployMedia.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < vh) {
        var progress = (vh - rect.top) / (vh + rect.height);
        var shift2 = (progress - 0.5) * 70;
        deployImg.style.setProperty('--parallax', shift2.toFixed(1) + 'px');
      }
    }
  }
  function requestParallax() {
    if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
  }
  window.addEventListener('scroll', requestParallax, { passive: true });
  window.addEventListener('resize', requestParallax);
  updateParallax();
})();
