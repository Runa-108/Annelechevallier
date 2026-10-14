/* Oiseau de l'accueil : il traverse la photo de l'atelier, se pose sur le
   linteau de la fenêtre, puis ouvre le portrait d'Anne quand on clique dessus.
   Le point d'atterrissage est exprimé en fractions de la photo d'origine
   (0 = bord gauche/haut, 1 = bord droit/bas) : modifiez PERCHOIR pour le déplacer. */
(function () {
  var R = (window.REGLAGES && window.REGLAGES.oiseau) || {};
  var PERCHOIR = { x: R.x != null ? R.x : 0.62, y: R.y != null ? R.y : 0.275 };  // réglable dans l'éditeur
  var DUREE_VOL = 2600;                    // ms
  var DELAI = 900;                         // ms avant l'arrivée

  var hero = document.querySelector('.hero');
  var photo = hero && hero.querySelector('img');
  var bird = document.getElementById('oiseau');
  var panel = document.getElementById('portrait-anne');
  if (!hero || !photo || !bird || !panel) return;
  if (R.actif === false) return;   // oiseau désactivé dans l'éditeur

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var perched = false;

  // Position du perchoir en pixels, compte tenu du recadrage « cover » de la photo
  function cible() {
    var W = hero.clientWidth, H = photo.clientHeight || hero.clientHeight;
    var iw = photo.naturalWidth || 16, ih = photo.naturalHeight || 9;
    var s = Math.max(W / iw, H / ih);
    var dw = iw * s, dh = ih * s;
    var ox = (W - dw) * 0.5, oy = (H - dh) * 0.35;   // object-position: center 35%
    return { x: ox + PERCHOIR.x * dw, y: oy + PERCHOIR.y * dh };
  }

  function placer(x, y, angle) {
    bird.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-100%) rotate(' + (angle || 0) + 'deg)';
  }

  function poser() {
    perched = true;
    var c = cible();
    placer(c.x, c.y, 0);
    bird.classList.remove('vole');
    bird.classList.add('pose');
    bird.hidden = false;
  }

  function voler() {
    var c = cible();
    var W = hero.clientWidth;
    var p0 = { x: W + 80, y: -40 };                       // arrive du coin haut droit
    var p1 = { x: (W + c.x) / 2 + 40, y: c.y - 160 };       // point de contrôle (arc)
    var t0 = null;
    bird.hidden = false;
    bird.classList.add('vole');
    function ease(t) { return 1 - Math.pow(1 - t, 3); }
    function step(ts) {
      if (!t0) t0 = ts;
      var t = Math.min(1, (ts - t0) / DUREE_VOL), e = ease(t);
      c = cible();                                         // suit les redimensionnements
      var x = (1 - e) * (1 - e) * p0.x + 2 * (1 - e) * e * p1.x + e * e * c.x;
      var y = (1 - e) * (1 - e) * p0.y + 2 * (1 - e) * e * p1.y + e * e * c.y;
      var angle = t < 0.8 ? -8 : -8 + (t - 0.8) / 0.2 * 20; // se redresse à l'atterrissage
      if (t > 0.85) bird.classList.add('freine');
      placer(x, y, angle);
      if (t < 1) requestAnimationFrame(step);
      else { bird.classList.remove('freine'); poser(); bird.classList.add('arrive'); }
    }
    requestAnimationFrame(step);
  }

  function demarrer() {
    if (reduce) { poser(); return; }
    setTimeout(voler, DELAI);
  }
  if (photo.complete) demarrer(); else photo.addEventListener('load', demarrer);

  window.addEventListener('resize', function () {
    if (perched) { var c = cible(); placer(c.x, c.y, 0); }
  });

  // ---- fenêtre du portrait ----
  var lastFocus = null;
  function ouvrir() {
    lastFocus = document.activeElement;
    panel.hidden = false;
    document.body.classList.add('lb-lock');
    requestAnimationFrame(function () { panel.classList.add('ouvert'); });
    panel.querySelector('.pa-fermer').focus();
  }
  function fermer() {
    panel.classList.remove('ouvert');
    document.body.classList.remove('lb-lock');
    setTimeout(function () { panel.hidden = true; }, reduce ? 0 : 250);
    if (lastFocus) lastFocus.focus();
  }
  bird.addEventListener('click', function () {
    bird.classList.remove('arrive');
    ouvrir();
  });
  panel.querySelector('.pa-fermer').addEventListener('click', fermer);
  panel.addEventListener('click', function (e) { if (e.target === panel) fermer(); });
  document.addEventListener('keydown', function (e) {
    if (panel.hidden) return;
    if (e.key === 'Escape') fermer();
    else if (e.key === 'Tab') {   // garde le focus dans la fenêtre
      var f = panel.querySelectorAll('button, a[href]');
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();
