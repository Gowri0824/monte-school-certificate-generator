/* ================================================================
   shared/page.js — used by every certificate page in certificates/
   1. Reads the form values sent by index.html (in the page address after '#d=').
      If none were sent (page opened directly) it shows the page's CERT_SAMPLE.
   2. Writes each value into the element with the matching data-field name.
   3. Shrinks values that are too long for their line (fit-values.js).
   4. Makes the "Edit Details" link return to the form with the values kept.
================================================================ */
(function () {
  'use strict';
  var body = document.body;
  var certId = body.getAttribute('data-cert-id');
  var data = window.CERT_SAMPLE || {};
  var usingSample = true;

  var m = location.hash.match(/[#&]d=([^&]*)/);
  if (m) {
    try { data = JSON.parse(decodeURIComponent(m[1])); usingSample = false; } catch (e) { /* keep sample */ }
  }

  var cert = document.querySelector('.certificate');
  cert.querySelectorAll('[data-field]').forEach(function (el) {
    el.textContent = data[el.getAttribute('data-field')] || '';
  });
  if (typeof fitTcValues === 'function') fitTcValues(cert);

  var back = document.getElementById('ct-back');
  if (back) {
    back.href = body.getAttribute('data-home') + '#edit=' + encodeURIComponent(certId) +
      (usingSample ? '' : '&d=' + encodeURIComponent(JSON.stringify(data)));
  }
  var note = document.getElementById('ct-sample');
  if (note && usingSample) note.textContent = ' · sample data';
})();

/* ================================================================
   FIT TO SCREEN (phones / small screens) — screen only, printing is NOT affected.
   Shrinks the A4 certificate so the whole width fits the phone, and re-fits on rotate/resize.
================================================================ */
(function () {
  'use strict';
  var stage = document.querySelector('.cert-stage');
  var page = document.querySelector('.certificate');
  if (!stage || !page) return;

  function fit() {
    page.style.transform = '';
    page.style.transformOrigin = '';
    stage.style.height = '';
    stage.style.overflow = '';

    var vw = document.documentElement.clientWidth;
    var w = page.offsetWidth;
    var s = (vw - 16) / w;            // 8px gap on each side
    if (s >= 1) return;               // big screen: leave as is

    var box = page.querySelector('.bf-box');            // bonafide / study: show only the box, not empty paper
    var h = page.offsetHeight;

    page.style.transformOrigin = 'top left';
    page.style.transform = 'translate(8px, 0) scale(' + s + ')';
    stage.style.overflow = 'hidden';
    stage.style.height = (h * s + 40) + 'px';
  }

  fit();
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
})();

/* ================================================================
   PHONE TIP — shows which paper size to pick when saving a PDF on a phone.
   (Phones ignore the paper size written in the page, so the person must choose it.)
   Screen only: hidden when printing.
================================================================ */
(function () {
  'use strict';
  var cert = document.querySelector('.certificate');
  var stage = document.querySelector('.cert-stage');
  if (!cert || !stage || document.documentElement.clientWidth >= 700) return;
  var paper = cert.classList.contains('monte-tc-replica') ? 'Legal' : 'A4';
  var tip = document.createElement('div');
  tip.className = 'phone-tip no-print';
  tip.innerHTML = '<b>Saving PDF on phone:</b> tap Print / Save PDF &rarr; Destination: <b>Save as PDF</b> &rarr; ' +
    'Paper size: <b>' + paper + '</b> &rarr; Margins: <b>None</b> &rarr; Scale: <b>100%</b>';
  stage.parentNode.insertBefore(tip, stage);
})();