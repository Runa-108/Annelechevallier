/* Menu mobile + visionneuse d'images (sans dépendance) */
(function () {
  // ---- menu mobile ----
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });
  }

  // ---- visionneuse ----
  var links = Array.prototype.slice.call(document.querySelectorAll('a.lb'));
  if (!links.length) return;

  var box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Visionneuse d’images');
  box.innerHTML =
    '<span class="lb-count" aria-live="polite"></span>' +
    '<figure><img alt=""><figcaption></figcaption></figure>' +
    '<button class="lb-btn lb-close" aria-label="Fermer">×</button>' +
    '<button class="lb-btn lb-prev" aria-label="Image précédente">‹</button>' +
    '<button class="lb-btn lb-next" aria-label="Image suivante">›</button>';
  document.body.appendChild(box);

  var img = box.querySelector('img');
  var cap = box.querySelector('figcaption');
  var count = box.querySelector('.lb-count');
  var prevBtn = box.querySelector('.lb-prev');
  var nextBtn = box.querySelector('.lb-next');
  var current = 0, lastFocus = null;
  var single = links.length < 2;
  prevBtn.hidden = nextBtn.hidden = single;

  function show(i) {
    current = (i + links.length) % links.length;
    var a = links[current];
    var thumb = a.querySelector('img');
    img.src = a.getAttribute('href');
    img.alt = thumb ? thumb.alt : '';
    cap.textContent = a.getAttribute('data-caption') || '';
    count.textContent = single ? '' : (current + 1) + ' / ' + links.length;
    // précharge les voisines
    [current + 1, current - 1].forEach(function (j) {
      var n = links[(j + links.length) % links.length];
      if (n) { var p = new Image(); p.src = n.getAttribute('href'); }
    });
  }
  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    box.classList.add('open');
    document.body.classList.add('lb-lock');
    box.querySelector('.lb-close').focus();
  }
  function close() {
    box.classList.remove('open');
    document.body.classList.remove('lb-lock');
    img.removeAttribute('src');
    if (lastFocus) lastFocus.focus();
  }

  links.forEach(function (a, i) {
    a.addEventListener('click', function (e) { e.preventDefault(); open(i); });
  });
  box.querySelector('.lb-close').addEventListener('click', close);
  prevBtn.addEventListener('click', function () { show(current - 1); });
  nextBtn.addEventListener('click', function () { show(current + 1); });
  box.addEventListener('click', function (e) { if (e.target === box || e.target.tagName === 'FIGURE') close(); });

  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft' && !single) show(current - 1);
    else if (e.key === 'ArrowRight' && !single) show(current + 1);
    else if (e.key === 'Tab') { // garde le focus dans la visionneuse
      var f = Array.prototype.filter.call(box.querySelectorAll('button'), function (b) { return !b.hidden; });
      var idx = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(idx + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });

  // balayage sur mobile
  var x0 = null;
  box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (x0 === null || single) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();
