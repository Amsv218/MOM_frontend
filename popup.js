/* ============================================
   MOM Module - Popup Logic
   ============================================ */

'use strict';

let isRecording = false;
let startTime = 0;
let timerInterval = null;
let wordCount = 0;
let speakerCount = 0;

const $  = id => document.getElementById(id);
const $$ = sel => document.querySelector(sel);

// ── DOM refs ──────────────────────────────────
const startBtn        = $('startBtn');
const stopBtn         = $('stopBtn');
const statusDot       = $('statusDot');
const statusLabel     = $('statusLabel');
const timerEl         = $('timer');
const speakersEl      = $('speakersCount');
const wordsEl         = $('wordsCount');
const durationEl      = $('durationDisplay');
const processingBanner = $('processingBanner');
const meetBadge       = $('meetBadge');
const meetDot         = $$('.meet-dot');

// ── Initialise ───────────────────────────────
(async function init() {
  await restoreState();
  checkMeetTab();
})();

// ── Restore persisted state ───────────────────
async function restoreState() {
  try {
    const data = await chrome.storage?.local?.get(['isRecording', 'startTime', 'speakerCount', 'wordCount']);
    if (data?.isRecording) {
      isRecording = true;
      startTime = data.startTime || Date.now();
      speakerCount = data.speakerCount || 0;
      wordCount = data.wordCount || 0;
      applyRecordingUI();
      startTimer();
    }
  } catch {
    // Running outside extension context (preview mode)
  }
}

// ── Check if active tab is Google Meet ────────
async function checkMeetTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url?.includes('meet.google.com')) {
      meetBadge.classList.add('active');
      meetDot.classList.add('active');
      meetBadge.querySelector('span').textContent = 'Google Meet Active';
    }
  } catch {
    // Preview mode
  }
}

// ── Start Recording ───────────────────────────
startBtn.addEventListener('click', async () => {
  isRecording = true;
  startTime = Date.now();
  wordCount = 0;
  speakerCount = 0;

  applyRecordingUI();
  startTimer();

  try {
    await chrome.storage.local.set({ isRecording: true, startTime });
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'startRecording' });
  } catch {
    // Preview mode
  }
});

// ── Stop Recording ────────────────────────────
stopBtn.addEventListener('click', async () => {
  isRecording = false;
  clearInterval(timerInterval);

  applyStoppedUI();

  try {
    await chrome.storage.local.set({ isRecording: false });
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'stopRecording' });
  } catch {
    // Preview mode
  }

  // Simulate backend processing delay
  processingBanner.style.display = 'flex';
  setTimeout(() => {
    processingBanner.style.display = 'none';
  }, 4000);
});

// ── UI State helpers ──────────────────────────
function applyRecordingUI() {
  startBtn.disabled = true;
  stopBtn.disabled = false;

  statusDot.className = 'status-dot recording';
  statusLabel.textContent = 'Recording…';
  statusLabel.className = 'status-label recording';
  timerEl.classList.add('recording');

  speakersEl.textContent = speakerCount;
  wordsEl.textContent = wordCount;
}

function applyStoppedUI() {
  startBtn.disabled = false;
  stopBtn.disabled = true;

  statusDot.className = 'status-dot processing';
  statusLabel.textContent = 'Processing…';
  statusLabel.className = 'status-label';
  timerEl.classList.remove('recording');
}

// ── Timer ─────────────────────────────────────
function startTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    updateTimerDisplay();
    // Simulate incrementing word & speaker count in preview
    if (Math.random() > 0.7) {
      wordCount += Math.floor(Math.random() * 4) + 1;
      wordsEl.textContent = wordCount;
    }
    if (speakerCount < 4 && Math.random() > 0.97) {
      speakerCount += 1;
      speakersEl.textContent = speakerCount;
    }
  }, 1000);
}

function updateTimerDisplay() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const formatted = `${pad(h)}:${pad(m)}:${pad(s)}`;
  timerEl.textContent = formatted;
  durationEl.textContent = h > 0 ? `${pad(h)}:${pad(m)}` : `${pad(m)}:${pad(s)}`;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

// ── Settings button ───────────────────────────
$('settingsBtn').addEventListener('click', () => {
  chrome.runtime?.openOptionsPage?.();
});
