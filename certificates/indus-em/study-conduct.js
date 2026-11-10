/* Shrinks a typed value that is too long for its line (down to 8 pt).
   Runs after shared/page.js has filled the values. Used only by the Indus study & conduct certificate. */
(function () {
    'use strict';
    var cutOff = [];
    document.querySelectorAll('.bf-line').forEach(function (el) {
        var px = parseFloat(getComputedStyle(el).fontSize);
        var min = 8 * 96 / 72;
        var tooBig = function () { return el.scrollWidth > el.clientWidth + 1; };
        while (tooBig() && px > min) { px -= 0.5; el.style.fontSize = px + 'px'; }
        if (tooBig()) cutOff.push(el.getAttribute('data-field'));
    });
    if (cutOff.length) {
        alert('These values are too long for the certificate and are cut off:\n\n' +
            cutOff.join(', ') + '\n\nPlease go back and shorten them.');
    }
})();