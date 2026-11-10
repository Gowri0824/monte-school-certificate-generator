/* ================================================================
   script.js — School Certificate Generator
   Monté School & Indus EM School
================================================================ */

'use strict';

/* ───────────────────────────────────────────────────────────────
   STATE
─────────────────────────────────────────────────────────────── */
const state = {
  currentSchool: null,  // 'monte' | 'indus'
  currentCert: null,  // 'monte-tc' | 'monte-bonafide' | 'monte-sc' | 'indus-bonafide' | 'indus-sc'
  formData: {}     // persisted field values
};

/* ───────────────────────────────────────────────────────────────
   SCHOOL METADATA
─────────────────────────────────────────────────────────────── */
const SCHOOLS = {
  monte: { name: 'Monté School', board: 'CBSE / IGCSE Board' },
  indus: { name: 'Indus EM School', board: 'State Board' }
};

/* ───────────────────────────────────────────────────────────────
   CERTIFICATES THAT HAVE THEIR OWN PAGE
   For these, "Generate" opens the page below and sends it the form values.
   (Certificates not listed here still use the old in-page template.)
─────────────────────────────────────────────────────────────── */
const CERT_PAGES = {
  'monte-tc': 'certificates/monte-igcse/transfer-certificate.html',
  'monte-bonafide': 'certificates/monte-igcse/bonafide-certificate.html',
  'monte-sc': 'certificates/monte-igcse/study-conduct-certificate.html',
  'indus-bonafide': 'certificates/indus-em/bonafide-certificate.html',   // ← ADD THIS LINE
  'indus-sc': 'certificates/indus-em/study-conduct-certificate.html'
};

/* ───────────────────────────────────────────────────────────────
   CERTIFICATE MENU DEFINITIONS
─────────────────────────────────────────────────────────────── */
const CERT_MENU = {
  monte: [
    {
      id: 'monte-tc',
      icon: '📋',
      title: 'Transfer Certificate',
      desc: 'Official TC — 23-field CBSE format including conduct, subjects, promotion, attendance and more.'
    },
    {
      id: 'monte-bonafide',
      icon: '📄',
      title: 'Bonafide Certificate',
      desc: 'Certifies that the student is currently enrolled in Monté School.'
    },
    {
      id: 'monte-sc',
      icon: '📝',
      title: 'Study & Conduct Certificate',
      desc: 'Records the period of study and overall conduct during the student\'s tenure.'
    }
  ],
  indus: [
    {
      id: 'indus-bonafide',
      icon: '📄',
      title: 'Bonafide Certificate',
      desc: 'Certifies that the student is currently enrolled in Indus EM School.'
    },
    {
      id: 'indus-sc',
      icon: '📝',
      title: 'Study & Conduct Certificate',
      desc: 'Records the period of study and overall conduct during the student\'s tenure.'
    }
  ]
};

/* ───────────────────────────────────────────────────────────────
   FORM FIELD DEFINITIONS  (one array per certificate)
   Field types: text | number | select | textarea | _section
─────────────────────────────────────────────────────────────── */
const CERT_FIELDS = {

  /* ══════════ MONTÉ — TRANSFER CERTIFICATE ══════════ */
  'monte-tc': [
    { _section: 'Book / Serial / Admission Numbers' },
    { id: 'bookNo', label: 'Book No.', type: 'text', ph: '01', half: true },
    { id: 'slNo', label: 'Sl. No.', type: 'text', ph: '100', half: true },
    { id: 'admNo', label: 'Admission No.', type: 'text', ph: 'e.g. 207/2021-22', half: true, req: true },

    { _section: '1–5  Student Identification' },
    { id: 'studentName', label: '1. Name of the Pupil', type: 'text', req: true },
    { id: 'fatherName', label: "2. Father's / Guardian's Name", type: 'text', req: true },
    { id: 'motherName', label: "3. Mother's Name", type: 'text', req: true },
    { id: 'nationality', label: '4. Nationality', type: 'text', ph: 'e.g. INDIAN-HINDU-OC', req: true },
    { id: 'scst', label: '5. Whether SC or ST', type: 'text', ph: 'e.g. --- or OC', half: true },

    { _section: '6–8  Admission & Dates' },
    { id: 'dateOfAdmission', label: '6. Date of first admission with class', type: 'text', ph: 'e.g. 16/08/2021, III-CLASS', req: true, full: true },
    { id: 'dobFigures', label: '7a. Date of Birth (figures)', type: 'text', ph: 'e.g. 04/01/2014', req: true, half: true },
    { id: 'dobWords', label: '7b. Date of Birth (words)', type: 'text', ph: 'e.g. FOURTH – JANUARY – TWO THOUSAND FOURTEEN', req: true, full: true },
    { id: 'lastClassFig', label: '8a. Last class studied (figures)', type: 'text', ph: 'e.g. V-CLASS', req: true, half: true },
    { id: 'lastClassWrd', label: '8b. Last class studied (words)', type: 'text', ph: 'e.g. FIFTH CLASS', req: true, half: true },

    { _section: '9–11  Examination & Subjects' },
    { id: 'examResult', label: '9. Annual exam last taken with result', type: 'text', ph: 'e.g. PASSED', req: true, half: true },
    { id: 'failedInfo', label: '10. Whether failed (once/twice)', type: 'text', ph: 'e.g. --- or ONCE', half: true },
    {
      id: 'subjects', label: '11. Subjects Studied', type: 'textarea',
      ph: 'e.g. 1. ENGLISH  2. TELUGU  3. HINDI  4. MATHEMATICS  5. SCIENCE  6. SOCIAL SCIENCE  7. ICT',
      req: true, full: true
    },

    { _section: '12–14  Promotion & Fees' },
    { id: 'qualifiedPromo', label: '12a. Qualified for promotion to higher class', type: 'text', ph: 'e.g. YES, QUALIFIED', req: true },
    { id: 'nextClass', label: '12b. To which class (figure & words)', type: 'text', ph: 'e.g. VI-CLASS, (SIXTH)', req: true },
    { id: 'duesPaid', label: '13. School dues paid', type: 'text', ph: 'e.g. YES', req: true, half: true },
    { id: 'feeConcession', label: '14. Fee concession (if any)', type: 'text', ph: 'e.g. NO', half: true },

    { _section: '15–18  Attendance & Activities' },
    { id: 'totalWorkDays', label: '15. Total working days', type: 'number', ph: 'e.g. 220', req: true, half: true },
    { id: 'daysPresent', label: '16. Working days present', type: 'number', ph: 'e.g. 208', req: true, half: true },
    { id: 'nccScout', label: '17. NCC / Boy Scout / Girl Guide', type: 'text', ph: 'e.g. --- or BOY SCOUT' },
    { id: 'extracurricular', label: '18. Games / Extra-curricular', type: 'text', ph: 'e.g. --- or CRICKET, STATE LEVEL' },

    { _section: '19–23  Conduct, Dates & Remarks' },
    {
      id: 'conduct', label: '19. General Conduct',
      type: 'select', options: ['GOOD', 'VERY GOOD', 'EXCELLENT', 'SATISFACTORY', 'UNSATISFACTORY'], req: true, half: true
    },
    { id: 'dateOfApplication', label: '20. Date of Application', type: 'text', ph: 'e.g. 27/05/2024', req: true, half: true },
    { id: 'dateOfIssue', label: '21. Date of Issue', type: 'text', ph: 'e.g. 28/05/2024', req: true, half: true },
    { id: 'reasonForLeaving', label: '22. Reason for Leaving', type: 'text', ph: 'e.g. PARENT REQUEST', req: true },
    { id: 'remarks', label: '23. Any other Remarks', type: 'text', ph: 'e.g. NIL' }
  ],

  /* ══════════ MONTÉ — BONAFIDE CERTIFICATE ══════════ */
  'monte-bonafide': [
    { _section: 'Admission Number' },
    { id: 'admNo', label: 'Admission No.', type: 'text', ph: 'e.g. 207/2021-22', req: true, half: true },

    { _section: 'Student Details' },
    { id: 'studentName', label: 'Student Name', type: 'text', req: true },
    { id: 'fatherName', label: "Father's / Guardian's Name", type: 'text', req: true },

    { _section: 'Class & Academic Year' },
    { id: 'className', label: 'Class (e.g. XII)', type: 'text', req: true, half: true },
    { id: 'yearFrom', label: 'Academic Year — From', type: 'text', ph: 'e.g. 2026', req: true, half: true },
    { id: 'yearTo', label: 'Academic Year — To', type: 'text', ph: 'e.g. 2027', req: true, half: true },

    { _section: 'Date of Birth' },
    { id: 'dobFigures', label: 'Date of Birth (figures)', type: 'text', ph: 'e.g. 13/03/2010', req: true, half: true },
    { id: 'dobWords', label: 'Date of Birth (words)', type: 'text', ph: 'e.g. Thirteenth March Two Thousand Ten', req: true, full: true },

    { _section: 'Issue Date' },
    { id: 'dateOfIssue', label: 'Date of Issue', type: 'text', ph: 'e.g. 09/11/2026', req: true, half: true }
  ],

  /* ══════════ MONTÉ — STUDY & CONDUCT CERTIFICATE ══════════ */
  'monte-sc': [
    { _section: 'Admission Number' },
    { id: 'admNo', label: 'Admission No.', type: 'text', ph: 'e.g. 207/2021-22', req: true, half: true },

    { _section: 'Student Details' },
    { id: 'studentName', label: 'Student Name', type: 'text', req: true },
    { id: 'fatherName', label: "Father's Name", type: 'text', req: true },

    { _section: 'Study Period' },
    { id: 'classesStudied', label: 'Class / Classes studied', type: 'text', ph: 'e.g. VI to X', req: true, half: true },
    { id: 'academicYear', label: 'Academic Year', type: 'text', ph: 'e.g. 2022-23', req: true, half: true },
    { id: 'classJoined', label: 'Class at time of joining', type: 'text', ph: 'e.g. VI', req: true, half: true },
    { id: 'monthYearJoined', label: 'Month & Year of joining', type: 'text', ph: 'e.g. June, 2022', req: true, half: true },
    { id: 'monthYearLeft', label: 'Month & Year of leaving', type: 'text', ph: 'e.g. March, 2023', req: true, half: true },
    { id: 'classLeft', label: 'Class after completing', type: 'text', ph: 'e.g. X', req: true, half: true },
    { id: 'yearsOfStudy', label: 'Period of study (years)', type: 'text', ph: 'e.g. 1', req: true, half: true },

    { _section: 'Conduct & Date' },
    {
      id: 'conduct', label: 'Conduct during the period',
      type: 'select', options: ['satisfactory', 'good', 'very good', 'excellent'], req: true, half: true
    },
    { id: 'dateOfIssue', label: 'Date of Issue', type: 'text', ph: 'e.g. 09/11/2026', req: true, half: true }
  ],

  /* ══════════ INDUS EM — BONAFIDE CERTIFICATE ══════════ */
  'indus-bonafide': [
    { _section: 'Admission Number' },
    { id: 'admNo', label: 'Admission No.', type: 'text', ph: 'e.g. 3495/2021-22', req: true, half: true },

    { _section: 'Student Details' },
    { id: 'studentName', label: 'Student Name (Chi.)', type: 'text', req: true },
    { id: 'fatherName', label: "Father's / Guardian's Name", type: 'text', req: true },

    { _section: 'Class & Academic Year' },
    { id: 'className', label: 'Class (e.g. XII)', type: 'text', req: true, half: true },
    { id: 'yearFrom', label: 'Academic Year — From', type: 'text', ph: 'e.g. 2026', req: true, half: true },
    { id: 'yearTo', label: 'Academic Year — To', type: 'text', ph: 'e.g. 2027', req: true, half: true },

    { _section: 'Date of Birth' },
    { id: 'dobFigures', label: 'Date of Birth (figures)', type: 'text', ph: 'e.g. 13/03/2010', req: true, half: true },
    { id: 'dobWords', label: 'Date of Birth (words)', type: 'text', ph: 'e.g. Thirteenth March Two Thousand Ten', req: true, full: true },

    { _section: 'Issue Date' },
    { id: 'dateOfIssue', label: 'Date of Issue', type: 'text', ph: 'e.g. 09/11/2026', req: true, half: true }
  ],

  /* ══════════ INDUS EM — STUDY & CONDUCT CERTIFICATE ══════════ */
  'indus-sc': [
    { _section: 'Admission Number' },
    { id: 'admNo', label: 'Admission No.', type: 'text', ph: 'e.g. 3495/2021-22', req: true, half: true },

    { _section: 'Student Details' },
    { id: 'studentName', label: 'Student Name', type: 'text', req: true },
    { id: 'fatherName', label: "Father's Name", type: 'text', req: true },

    { _section: 'Study Period' },
    { id: 'classesStudied', label: 'Class / Classes studied', type: 'text', ph: 'e.g. VI to X', req: true, half: true },
    { id: 'academicYear', label: 'Academic Year', type: 'text', ph: 'e.g. 2022-23', req: true, half: true },
    { id: 'classJoined', label: 'Class at time of joining', type: 'text', ph: 'e.g. VI', req: true, half: true },
    { id: 'monthYearJoined', label: 'Month & Year of joining', type: 'text', ph: 'e.g. June, 2022', req: true, half: true },
    { id: 'monthYearLeft', label: 'Month & Year of leaving', type: 'text', ph: 'e.g. March, 2023', req: true, half: true },
    { id: 'classLeft', label: 'Class after completing', type: 'text', ph: 'e.g. X', req: true, half: true },
    { id: 'yearsOfStudy', label: 'Period of study (years)', type: 'text', ph: 'e.g. 1', req: true, half: true },

    { _section: 'Conduct & Date' },
    {
      id: 'conduct', label: 'Conduct during the period',
      type: 'select', options: ['satisfactory', 'good', 'very good', 'excellent'], req: true, half: true
    },
    { id: 'dateOfIssue', label: 'Date of Issue', type: 'text', ph: 'e.g. 09/11/2026', req: true, half: true }
  ]
};

/* ───────────────────────────────────────────────────────────────
   NAVIGATION
─────────────────────────────────────────────────────────────── */
function goTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + screenId);
  if (target) { target.classList.add('active'); }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ───────────────────────────────────────────────────────────────
   SELECT SCHOOL  →  go to certificate menu
─────────────────────────────────────────────────────────────── */
function selectSchool(school) {
  state.currentSchool = school;
  state.currentCert = null;
  state.formData = {};

  const info = SCHOOLS[school];
  document.getElementById('bc-school').textContent = info.name;
  document.getElementById('cert-menu-heading').textContent =
    info.name + ' — Select Certificate Type';

  buildCertMenu(school);
  goTo('cert-menu');
}

/* Build certificate-type cards into the grid */
function buildCertMenu(school) {
  const grid = document.getElementById('cert-cards-grid');
  grid.innerHTML = '';

  CERT_MENU[school].forEach(cert => {
    const card = document.createElement('div');
    card.className = 'cert-card ' + school + '-ccard';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.onclick = () => selectCert(cert.id);
    card.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') selectCert(cert.id); };
    card.innerHTML =
      '<div class="cert-card-icon">' + cert.icon + '</div>' +
      '<h3>' + cert.title + '</h3>' +
      '<p>' + cert.desc + '</p>' +
      '<span class="cert-card-cta">Select &rarr;</span>';
    grid.appendChild(card);
  });
}

/* ───────────────────────────────────────────────────────────────
   SELECT CERTIFICATE  →  go to form
─────────────────────────────────────────────────────────────── */
function selectCert(certId) {
  state.currentCert = certId;
  state.formData = {};

  const school = state.currentSchool;
  const cert = [...CERT_MENU.monte, ...CERT_MENU.indus].find(c => c.id === certId);
  const sInfo = SCHOOLS[school];

  /* breadcrumbs */
  document.getElementById('bc-school-f').textContent = sInfo.name;
  document.getElementById('bc-cert-f').textContent = cert.title;
  document.getElementById('form-cert-title').textContent = cert.title;
  document.getElementById('form-cert-sub').textContent = sInfo.name + '  ·  ' + sInfo.board;

  /* header stripe colour */
  const hdr = document.getElementById('form-card-hdr');
  hdr.className = 'form-card-hdr ' + (school === 'indus' ? 'indus-hdr' : '');

  /* generate button colour */
  const btn = document.getElementById('btn-generate');
  btn.className = 'btn-generate' + (school === 'indus' ? ' indus-btn' : '');

  buildForm(certId, school);
  goTo('form');
}

/* ───────────────────────────────────────────────────────────────
   BUILD FORM
─────────────────────────────────────────────────────────────── */
function buildForm(certId, school) {
  const container = document.getElementById('form-fields');
  container.innerHTML = '';
  container.className = 'form-fields' + (school === 'indus' ? ' indus-form' : '');

  CERT_FIELDS[certId].forEach(f => {
    /* Section heading */
    if (f._section) {
      const h = document.createElement('div');
      h.className = 'form-section-hdr';
      h.textContent = f._section;
      container.appendChild(h);
      return;
    }

    /* Field group */
    const grp = document.createElement('div');
    grp.className = 'fg' + (f.full ? ' full' : '');

    const lbl = document.createElement('label');
    lbl.htmlFor = 'fld-' + f.id;
    lbl.textContent = f.label + (f.req ? ' *' : '');

    let inp;

    if (f.type === 'select') {
      inp = document.createElement('select');
      const def = document.createElement('option');
      def.value = ''; def.textContent = '-- Select --';
      inp.appendChild(def);
      f.options.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt;
        o.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
        inp.appendChild(o);
      });
    } else if (f.type === 'textarea') {
      inp = document.createElement('textarea');
      inp.rows = 3;
      inp.placeholder = f.ph || '';
    } else {
      inp = document.createElement('input');
      inp.type = f.type || 'text';
      inp.placeholder = f.ph || '';
    }

    inp.id = 'fld-' + f.id;
    inp.name = f.id;

    /* restore saved value */
    if (state.formData[f.id] !== undefined) {
      inp.value = state.formData[f.id];
    }

    /* persist on change */
    const persist = () => { state.formData[f.id] = inp.value; };
    inp.addEventListener('input', persist);
    inp.addEventListener('change', persist);

    grp.appendChild(lbl);
    grp.appendChild(inp);
    container.appendChild(grp);
  });
}

/* ───────────────────────────────────────────────────────────────
   CLEAR FORM
─────────────────────────────────────────────────────────────── */
function clearForm() {
  if (!confirm('Clear all form fields?')) return;
  state.formData = {};
  buildForm(state.currentCert, state.currentSchool);
}

/* ───────────────────────────────────────────────────────────────
   GENERATE CERTIFICATE  →  populate template, go to preview
─────────────────────────────────────────────────────────────── */
function generateCertificate() {
  /* 1. Collect current field values */
  const fields = CERT_FIELDS[state.currentCert];
  fields.forEach(f => {
    if (f._section) return;
    const el = document.getElementById('fld-' + f.id);
    if (el) state.formData[f.id] = el.value.trim();
  });

  /* 2. Validate required fields */
  const missing = fields
    .filter(f => !f._section && f.req && !state.formData[f.id])
    .map(f => f.label);

  if (missing.length) {
    alert('Please fill in the required fields (marked *):\n\n' +
      missing.slice(0, 6).join('\n') +
      (missing.length > 6 ? '\n…and ' + (missing.length - 6) + ' more.' : ''));
    return;
  }

  /* 2b. Certificates with their own page: open it and send the values in the address */
  if (CERT_PAGES[state.currentCert]) {
    window.location.href = CERT_PAGES[state.currentCert] +
      '#d=' + encodeURIComponent(JSON.stringify(state.formData));
    return;
  }

  /* 3. Clone the matching template */
  const tmpl = document.getElementById('tmpl-' + state.currentCert);
  if (!tmpl) { alert('Template not found: ' + state.currentCert); return; }

  const clone = tmpl.cloneNode(true);
  clone.id = 'active-cert';
  clone.style.display = 'block';

  /* 4. Populate all [data-field] elements */
  clone.querySelectorAll('[data-field]').forEach(el => {
    const key = el.getAttribute('data-field');
    const val = state.formData[key] || '';
    el.textContent = val;

    /* For underlined spans: add non-breaking spaces when empty to keep the underline visible */
    if (el.classList.contains('cert-uval') && !val) {
      el.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
    }

    /* For red-bold TC meta values: keep placeholder dashes when empty */
    if (el.classList.contains('tc-mv') && !val) {
      el.textContent = '______';
    }
  });

  /* 5. Inject into preview stage */
  const stage = document.getElementById('preview-stage');
  stage.innerHTML = '';
  stage.appendChild(clone);

  goTo('preview');
}

/* ───────────────────────────────────────────────────────────────
   KEYBOARD ACCESSIBILITY for school cards on home screen
─────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.school-card').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') card.click();
    });
  });

  /* Coming back from a certificate page ("Edit Details"): reopen its form with the values kept.
     Address looks like  index.html#edit=monte-tc&d={...}  */
  const back = location.hash.match(/[#&]edit=([^&]*)/);
  if (back && CERT_FIELDS[decodeURIComponent(back[1])]) {
    const certId = decodeURIComponent(back[1]);
    let saved = {};
    const d = location.hash.match(/[#&]d=([^&]*)/);
    if (d) { try { saved = JSON.parse(decodeURIComponent(d[1])); } catch (e) { saved = {}; } }
    selectSchool(certId.split('-')[0]);
    selectCert(certId);
    state.formData = saved;
    buildForm(certId, state.currentSchool);
    history.replaceState(null, '', location.pathname);
    return;
  }

  /* Start on home screen */
  goTo('home');
});
