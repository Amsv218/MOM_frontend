/* ============================================
   MOM Module - Background Service Worker
   ============================================ */

'use strict';

// Config — replace with real backend URL
const API_BASE = 'https://your-backend.example.com/api';

// ── Listen for messages from popup / content ──
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'processMeeting') {
    handleProcessMeeting(message.payload, sendResponse);
    return true; // keep channel open for async response
  }
});

// ── Process meeting data after recording stops ─
async function handleProcessMeeting({ audioId }) {
  try {
    // 1. Get transcript
    const transcriptRes = await fetch(`${API_BASE}/transcript/${audioId}`);
    const transcriptData = await transcriptRes.json();

    // 2. Get MOM
    const momRes = await fetch(`${API_BASE}/mom/${audioId}`);
    const momData = await momRes.json();

    // 3. Get summary
    const summaryRes = await fetch(`${API_BASE}/summary/${audioId}`);
    const summaryData = await summaryRes.json();

    // 4. Persist to chrome.storage
    await chrome.storage.local.set({
      meetingData: {
        title: transcriptData.title || 'Untitled Meeting',
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        duration: transcriptData.duration,
        attendees: transcriptData.speakers?.length || 0,
        transcript: transcriptData.lines,
        mom: momData,
        summary: summaryData,
      }
    });

    // 5. Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'src/images/icon-128.png',
      title: 'MOM Module',
      message: 'Your meeting has been transcribed and summarised!',
    });

  } catch (err) {
    console.error('MOM processing error:', err);
  }
}
