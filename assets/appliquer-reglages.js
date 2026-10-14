/* Applique les réglages (polices, couleurs de l'oiseau) dès le chargement de la page. */
window.POLICES = {
  // titres
  "Cormorant Garamond": { type: "serif", axes: "ital,wght@0,400;0,500;0,600;1,400" },
  "Playfair Display":   { type: "serif", axes: "ital,wght@0,400;0,500;0,600;1,400" },
  "EB Garamond":        { type: "serif", axes: "ital,wght@0,400;0,500;0,600;1,400" },
  "Fraunces":           { type: "serif", axes: "ital,wght@0,400;0,500;0,600;1,400" },
  "Libre Baskerville":  { type: "serif", axes: "ital,wght@0,400;0,700;1,400" },
  "Lora":               { type: "serif", axes: "ital,wght@0,400;0,500;0,600;1,400" },
  "DM Serif Display":   { type: "serif", axes: "ital@0;1" },
  "Marcellus":          { type: "serif", axes: "" },
  "Josefin Sans":       { type: "sans",  axes: "ital,wght@0,400;0,600;1,400" },
  "Raleway":            { type: "sans",  axes: "ital,wght@0,400;0,500;0,600;1,400" },
  "Montserrat":         { type: "sans",  axes: "ital,wght@0,400;0,500;0,600;1,400" },
  // texte courant
  "Karla":              { type: "sans",  axes: "ital,wght@0,400;0,500;0,600;1,400" },
  "Source Sans 3":      { type: "sans",  axes: "ital,wght@0,400;0,600;1,400" },
  "Lato":               { type: "sans",  axes: "ital,wght@0,400;0,700;1,400" },
  "Work Sans":          { type: "sans",  axes: "ital,wght@0,400;0,500;0,600;1,400" },
  "Nunito Sans":        { type: "sans",  axes: "ital,wght@0,400;0,600;1,400" },
  "DM Sans":            { type: "sans",  axes: "ital,wght@0,400;0,500;0,600;1,400" },
  "Mulish":             { type: "sans",  axes: "ital,wght@0,400;0,600;1,400" },
  "Open Sans":          { type: "sans",  axes: "ital,wght@0,400;0,600;1,400" }
};

window.appliquerReglages = function (R, doc) {
  doc = doc || document;
  R = R || window.REGLAGES || {};
  var root = doc.documentElement;
  var P = R.polices || {};
  var titres = P.titres || "Cormorant Garamond", texte = P.texte || "Karla";
  function pile(nom) {
    var t = (window.POLICES[nom] || {}).type;
    return '"' + nom + '", ' + (t === "serif" ? 'Georgia, "Times New Roman", serif' : '"Helvetica Neue", Arial, sans-serif');
  }
  function famille(nom) {
    var a = (window.POLICES[nom] || {}).axes;
    return "family=" + nom.replace(/ /g, "+") + (a ? ":" + a : "");
  }
  var href = "https://fonts.googleapis.com/css2?" + famille(titres) +
    (texte !== titres ? "&" + famille(texte) : "") + "&display=swap";
  var link = doc.getElementById("polices-site");
  if (!link) {
    link = doc.createElement("link");
    link.id = "polices-site"; link.rel = "stylesheet";
    doc.head.appendChild(link);
  }
  if (link.getAttribute("href") !== href) link.setAttribute("href", href);
  root.style.setProperty("--serif", pile(titres));
  root.style.setProperty("--sans", pile(texte));

  var T = R.tailles || {};
  root.style.setProperty("--t-titres", T.titres || 1);
  root.style.setProperty("--t-texte", T.texte || 1);

  root.style.setProperty("--pa-taille", (R.portrait && R.portrait.taille) || 1);

  var C = (R.oiseau && R.oiseau.couleurs) || {};
  ["corps", "gorge", "aile", "rayure", "bec", "pattes"].forEach(function (k) {
    if (C[k]) root.style.setProperty("--o-" + k, C[k]);
  });
  if (R.oiseau && R.oiseau.taille) root.style.setProperty("--o-taille", R.oiseau.taille);
};
window.pileDePolice = function (nom) {
  var t = (window.POLICES[nom] || {}).type;
  return '"' + nom + '", ' + (t === "serif" ? 'Georgia, "Times New Roman", serif' : '"Helvetica Neue", Arial, sans-serif');
};
/* Polices choisies pour un texte précis (attribut data-police) */
window.chargerPolicesElements = function (doc) {
  doc = doc || document;
  var noms = {};
  doc.querySelectorAll("[data-police]").forEach(function (el) { noms[el.getAttribute("data-police")] = 1; });
  var liste = Object.keys(noms).filter(function (n) { return window.POLICES[n]; });
  var link = doc.getElementById("polices-extra");
  if (!liste.length) { if (link) link.remove(); return; }
  var href = "https://fonts.googleapis.com/css2?" + liste.map(function (n) {
    var a = window.POLICES[n].axes; return "family=" + n.replace(/ /g, "+") + (a ? ":" + a : "");
  }).join("&") + "&display=swap";
  if (!link) { link = doc.createElement("link"); link.id = "polices-extra"; link.rel = "stylesheet"; doc.head.appendChild(link); }
  if (link.getAttribute("href") !== href) link.setAttribute("href", href);
};
window.appliquerReglages();
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { window.chargerPolicesElements(); });
else window.chargerPolicesElements();
