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
