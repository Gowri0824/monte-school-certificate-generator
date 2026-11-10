// Shared by index.html and the standalone certificate pages.
/* Shrinks the text of any Monté TC value that is too long for its line
   (down to a minimum of 6.5pt). Short values are left at the original size. */
function fitTcValues(root) {
  const cutOff = [];
  root.querySelectorAll('.tc-val').forEach(el => {
    let px = parseFloat(getComputedStyle(el).fontSize);
    const min = 6.5 * 96 / 72;
    const tooBig = () => el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
    while (tooBig() && px > min) {
      px -= 0.5;
      el.style.fontSize = px + 'px';
    }
    if (tooBig()) cutOff.push(el.getAttribute('data-field'));
  });
  if (cutOff.length) {
    alert('These values are too long for the certificate and are cut off:\n\n' +
      cutOff.join(', ') + '\n\nPlease go back and shorten them.');
  }
}
