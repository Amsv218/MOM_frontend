/* ============================================
   MOM Module - Dashboard Logic
   ============================================ */

'use strict';

// ── Sample data (replace with real API calls) ─
const MEETING_DATA = {
  title: 'Q2 Product Roadmap Review',
  date: 'May 3, 2025',
  duration: '48 min',
  attendees: 5,
  transcript: [
    { ts: '00:00', speaker: 'Priya S.', speakerIdx: 0, text: 'Good morning everyone, let\'s get started with the Q2 roadmap review. We have a lot to cover today.' },
    { ts: '00:15', speaker: 'Arjun M.', speakerIdx: 1, text: 'Morning! Before we begin, can we quickly confirm who\'s joining remotely today?' },
    { ts: '00:28', speaker: 'Priya S.', speakerIdx: 0, text: 'Sure — Kavitha and Ravi are joining from Bangalore. Rahul is in the room with us.' },
    { ts: '01:02', speaker: 'Rahul K.', speakerIdx: 2, text: 'Thanks Priya. Let\'s start with the mobile team\'s progress. We completed the new onboarding flow last week and it\'s looking great.' },
    { ts: '01:45', speaker: 'Kavitha N.', speakerIdx: 3, text: 'We saw a 23% improvement in day-1 retention after the onboarding changes went live in staging. Really promising.' },
    { ts: '02:10', speaker: 'Arjun M.', speakerIdx: 1, text: 'That\'s excellent. What about the performance issues we were seeing on Android devices below 4GB RAM?' },
    { ts: '02:38', speaker: 'Rahul K.', speakerIdx: 2, text: 'Still working on that. We\'ve profiled the render pipeline and found a few heavy list components. We\'ll have a fix by end of next sprint.' },
    { ts: '03:12', speaker: 'Priya S.', speakerIdx: 0, text: 'Okay, let\'s park that and move to the export feature. Where are we on PDF and DOCX generation?' },
    { ts: '03:30', speaker: 'Kavitha N.', speakerIdx: 3, text: 'PDF is done and tested. DOCX has a minor table formatting issue that we\'re resolving. Should be ready by Friday.' },
    { ts: '04:01', speaker: 'Ravi T.', speakerIdx: 4, text: 'I\'ve reviewed the DOCX output and the table issue is specifically around merged cells. It\'s a known edge case in the library we\'re using.' },
    { ts: '04:28', speaker: 'Priya S.', speakerIdx: 0, text: 'Can we ship PDF first and gate DOCX until it\'s fully tested? I don\'t want to block the release.' },
    { ts: '04:45', speaker: 'Arjun M.', speakerIdx: 1, text: 'Agreed, let\'s do a phased rollout. We can announce DOCX support in the next update.' },
    { ts: '05:02', speaker: 'Rahul K.', speakerIdx: 2, text: 'That works. I\'ll update the changelog and make sure the UI reflects the phased availability clearly.' },
    { ts: '05:30', speaker: 'Kavitha N.', speakerIdx: 3, text: 'One more thing — we need to revisit the dashboard analytics before launch. The chart library is causing bundle size issues.' },
    { ts: '05:58', speaker: 'Ravi T.', speakerIdx: 4, text: 'I can look into switching to a lighter charting solution. Recharts or Nivo might be good alternatives.' },
    { ts: '06:20', speaker: 'Priya S.', speakerIdx: 0, text: 'Perfect. Ravi, can you have a comparison ready by Wednesday so we can decide quickly?' },
    { ts: '06:35', speaker: 'Ravi T.', speakerIdx: 4, text: 'Absolutely, I\'ll put together a performance and bundle-size comparison for three options.' },
    { ts: '07:00', speaker: 'Arjun M.', speakerIdx: 1, text: 'Great. Let\'s wrap up — I think we have a clear path forward. Good work everyone.' },
    { ts: '07:15', speaker: 'Priya S.', speakerIdx: 0, text: 'Agreed. I\'ll send out the meeting notes after this. Thanks all!' },
  ],
  mom: {
    keyPoints: [
      'Onboarding flow revamp shows a 23% day-1 retention improvement in staging.',
      'Android performance issue on sub-4GB RAM devices is being profiled; fix expected end of next sprint.',
      'PDF export is complete and tested; DOCX export has a table formatting issue with merged cells.',
      'Phased rollout agreed: PDF ships first, DOCX follows once fully tested.',
      'Dashboard chart library is causing bundle size issues; alternatives to be evaluated.',
    ],
    decisions: [
      'Ship PDF export in upcoming release and gate DOCX until the merged-cell issue is resolved.',
      'Pursue phased rollout strategy and update changelog and UI to reflect DOCX pending status.',
      'Evaluate Recharts and Nivo as lighter charting alternatives to reduce bundle size.',
    ],
    actions: [
      { text: 'Profile and fix render pipeline performance on Android devices below 4GB RAM.', assignee: 'Rahul K.', due: 'End of sprint' },
      { text: 'Resolve DOCX merged-cell table formatting issue.', assignee: 'Kavitha N.', due: 'Friday' },
      { text: 'Update changelog and UI to reflect phased DOCX rollout.', assignee: 'Rahul K.', due: 'This week' },
      { text: 'Prepare performance & bundle-size comparison for 3 charting libraries.', assignee: 'Ravi T.', due: 'Wednesday' },
      { text: 'Send meeting notes to all attendees.', assignee: 'Priya S.', due: 'Today' },
    ],
  },
  summary: {
    paragraph: 'The Q2 Product Roadmap Review focused on three key areas: the mobile onboarding revamp, export features, and the dashboard analytics infrastructure. The team shared strong early results from the onboarding changes and agreed on a pragmatic phased export rollout strategy while addressing an open bug. Bundle size concerns in the charting layer will be resolved through a comparative evaluation before the end of the week.',
    bullets: [
      'Onboarding changes show strong early signal — 23% uplift in day-1 retention.',
      'PDF export ships immediately; DOCX follows after merged-cell bug is fixed.',
      'Android perf fix for low-RAM devices targeted for end of current sprint.',
      'Charting library will be swapped to reduce bundle size — decision by Wednesday.',
      'All 5 action items assigned with clear owners and deadlines.',
    ],
  },
};

// ── DOM helpers ───────────────────────────────
const $ = id => document.getElementById(id);

// ── Populate meeting metadata ─────────────────
$('meetingTitle').textContent   = MEETING_DATA.title;
$('meetingDate').textContent    = MEETING_DATA.date;
$('meetingDuration').textContent = MEETING_DATA.duration;
$('attendeesCount').textContent = `${MEETING_DATA.attendees} attendees`;
document.title = `MOM — ${MEETING_DATA.title}`;

// ── Build speaker list & filters ──────────────
const speakers = [...new Set(MEETING_DATA.transcript.map(l => l.speaker))];
const COLORS = ['speaker-0','speaker-1','speaker-2','speaker-3','speaker-4'];
const PALETTE = ['#6ee7b7','#60a5fa','#f472b6','#fbbf24','#a78bfa'];

let activeFilters = new Set();

const filtersEl = $('speakerFilters');
speakers.forEach((name, i) => {
  const chip = document.createElement('button');
  chip.className = 'speaker-chip';
  chip.textContent = name;
  chip.dataset.speaker = name;
  chip.addEventListener('click', () => toggleFilter(name, chip, i));
  filtersEl.appendChild(chip);
});

function toggleFilter(name, chip, colorIdx) {
  if (activeFilters.has(name)) {
    activeFilters.delete(name);
    chip.classList.remove('active');
    chip.style.background = '';
    chip.style.color = '';
  } else {
    activeFilters.add(name);
    chip.classList.add('active');
    chip.style.background = PALETTE[colorIdx % PALETTE.length];
    chip.style.color = '#0b0c0f';
  }
  filterTranscript();
}

// ── Build transcript ──────────────────────────
const transcriptEl = $('transcriptContent');

function buildTranscript() {
  transcriptEl.innerHTML = '';
  MEETING_DATA.transcript.forEach((line, idx) => {
    const row = document.createElement('div');
    row.className = 'transcript-line';
    row.dataset.speaker = line.speaker;
    row.dataset.idx = idx;
    row.style.animationDelay = `${idx * 25}ms`;

    row.innerHTML = `
      <span class="ts-timestamp">${line.ts}</span>
      <div class="ts-body">
        <span class="ts-speaker ${COLORS[line.speakerIdx]}">${line.speaker}</span>
        <span class="ts-text">${escHtml(line.text)}</span>
      </div>
    `;
    transcriptEl.appendChild(row);
  });
}

buildTranscript();

// ── Transcript search ─────────────────────────
const searchInput = $('searchInput');
const clearSearch = $('clearSearch');
let searchTerm = '';

searchInput.addEventListener('input', () => {
  searchTerm = searchInput.value.trim().toLowerCase();
  clearSearch.style.display = searchTerm ? 'flex' : 'none';
  filterTranscript();
});

clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  searchTerm = '';
  clearSearch.style.display = 'none';
  filterTranscript();
});

function filterTranscript() {
  const lines = transcriptEl.querySelectorAll('.transcript-line');
  lines.forEach(row => {
    const speaker = row.dataset.speaker;
    const textEl = row.querySelector('.ts-text');
    const originalText = MEETING_DATA.transcript[row.dataset.idx].text;

    const passFilter = activeFilters.size === 0 || activeFilters.has(speaker);
    const passSearch = !searchTerm || originalText.toLowerCase().includes(searchTerm);

    if (passFilter && passSearch) {
      row.classList.remove('hidden');
      // Highlight search term
      if (searchTerm) {
        const rx = new RegExp(`(${escRx(searchTerm)})`, 'gi');
        textEl.innerHTML = escHtml(originalText).replace(rx, '<mark>$1</mark>');
      } else {
        textEl.innerHTML = escHtml(originalText);
      }
    } else {
      row.classList.add('hidden');
    }
  });
}

// ── Build MOM ─────────────────────────────────
function buildMOM() {
  const el = $('momContent');
  el.innerHTML = '';

  // Key Discussion Points
  el.appendChild(makeMOMSection(
    'Key Discussion Points',
    MEETING_DATA.mom.keyPoints.map(t => ({ text: t })),
    'green',
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`
  ));

  // Decisions
  el.appendChild(makeMOMSection(
    'Decisions Made',
    MEETING_DATA.mom.decisions.map(t => ({ text: t })),
    'blue',
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`
  ));

  // Action Items
  const actionsSection = makeMOMSection(
    'Action Items',
    MEETING_DATA.mom.actions,
    'yellow',
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    true
  );
  el.appendChild(actionsSection);
}

function makeMOMSection(title, items, color, iconSVG, isAction = false) {
  const sec = document.createElement('div');
  sec.className = 'mom-section';

  sec.innerHTML = `
    <div class="mom-section-header">
      <div class="mom-section-icon ${color}">${iconSVG}</div>
      <span class="mom-section-title">${title}</span>
      <span class="mom-section-count">${items.length}</span>
    </div>
    <div class="mom-list"></div>
  `;

  const list = sec.querySelector('.mom-list');
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'mom-item';

    let metaHTML = '';
    if (isAction && item.assignee) {
      metaHTML = `
        <div class="action-item-meta">
          <span class="assignee-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            ${item.assignee}
          </span>
          ${item.due ? `<span class="due-badge">${item.due}</span>` : ''}
        </div>`;
    }

    row.innerHTML = `
      <div class="mom-item-bullet ${color}"></div>
      <div class="mom-item-body">
        <div class="mom-item-text">${escHtml(item.text)}</div>
        ${metaHTML}
      </div>
    `;
    list.appendChild(row);
  });

  return sec;
}

buildMOM();

// ── Build Summary ─────────────────────────────
function buildSummary() {
  const el = $('summaryContent');
  el.innerHTML = '';

  const card1 = document.createElement('div');
  card1.className = 'summary-card';
  card1.innerHTML = `
    <div class="summary-card-title">Overview</div>
    <p class="summary-paragraph">${escHtml(MEETING_DATA.summary.paragraph)}</p>
  `;
  el.appendChild(card1);

  const card2 = document.createElement('div');
  card2.className = 'summary-card';
  const bulletsHTML = MEETING_DATA.summary.bullets.map(b =>
    `<div class="summary-bullet">
      <div class="bullet-dot"></div>
      <span class="bullet-text">${escHtml(b)}</span>
    </div>`
  ).join('');
  card2.innerHTML = `
    <div class="summary-card-title">Key Highlights</div>
    <div class="summary-bullets">${bulletsHTML}</div>
  `;
  el.appendChild(card2);
}

buildSummary();

// ── Tab switching ─────────────────────────────
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    $(tab).classList.add('active');
  });
});

// ── Export dropdown ───────────────────────────
const downloadBtn = $('downloadBtn');
const dropdownMenu = $('dropdownMenu');

downloadBtn.addEventListener('click', e => {
  e.stopPropagation();
  dropdownMenu.classList.toggle('open');
});

document.addEventListener('click', () => dropdownMenu.classList.remove('open'));

$('downloadPdf').addEventListener('click', () => {
  showToast('Downloading PDF…');
  dropdownMenu.classList.remove('open');
  // → POST /api/export/pdf
});

$('downloadDocx').addEventListener('click', () => {
  showToast('Downloading DOCX…');
  dropdownMenu.classList.remove('open');
  // → POST /api/export/docx
});

// ── Copy ──────────────────────────────────────
$('copyBtn').addEventListener('click', () => {
  const text = [
    `Meeting: ${MEETING_DATA.title}`,
    `Date: ${MEETING_DATA.date} | Duration: ${MEETING_DATA.duration}`,
    '',
    '=== KEY POINTS ===',
    ...MEETING_DATA.mom.keyPoints.map((p, i) => `${i+1}. ${p}`),
    '',
    '=== DECISIONS ===',
    ...MEETING_DATA.mom.decisions.map((d, i) => `${i+1}. ${d}`),
    '',
    '=== ACTION ITEMS ===',
    ...MEETING_DATA.mom.actions.map((a, i) => `${i+1}. ${a.text} [${a.assignee}${a.due ? ' | ' + a.due : ''}]`),
    '',
    '=== SUMMARY ===',
    MEETING_DATA.summary.paragraph,
  ].join('\n');

  navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!'));
});

// ── Share ─────────────────────────────────────
$('shareBtn').addEventListener('click', () => {
  if (navigator.share) {
    navigator.share({ title: MEETING_DATA.title, text: 'Check out these meeting minutes.' });
  } else {
    showToast('Share link copied!');
    navigator.clipboard.writeText(window.location.href);
  }
});

// ── Toast ─────────────────────────────────────
function showToast(msg) {
  const toast = $('toast');
  toast.textContent = msg;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2800);
}

// ── Utilities ─────────────────────────────────
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escRx(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Load from Chrome storage (real usage) ─────
async function loadFromStorage() {
  try {
    const data = await chrome.storage?.local?.get(['meetingData']);
    if (data?.meetingData) {
      // Override MEETING_DATA with real data and rebuild views
      Object.assign(MEETING_DATA, data.meetingData);
      buildTranscript();
      buildMOM();
      buildSummary();
    }
  } catch {
    // Preview mode — sample data is shown
  }
}

loadFromStorage();
