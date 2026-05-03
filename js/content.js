/* ============================================
   MOM Module - Content Script (Google Meet)
   ============================================ */

'use strict';

let mediaRecorder = null;
let audioChunks = [];
let stream = null;

// ── Listen for popup messages ─────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startRecording') {
    startRecording();
    sendResponse({ ok: true });
  }
  if (message.action === 'stopRecording') {
    stopRecording();
    sendResponse({ ok: true });
  }
});

// ── Start audio capture ───────────────────────
async function startRecording() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    audioChunks = [];

    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });

    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      await uploadAudio(blob);
    };

    mediaRecorder.start(5000); // collect chunks every 5s
    console.log('[MOM] Recording started');
  } catch (err) {
    console.error('[MOM] Could not start recording:', err);
  }
}

// ── Stop audio capture ────────────────────────
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    stream?.getTracks().forEach(t => t.stop());
    console.log('[MOM] Recording stopped');
  }
}

// ── Upload audio to backend ───────────────────
async function uploadAudio(blob) {
  try {
    const formData = new FormData();
    formData.append('audio', blob, `meeting-${Date.now()}.webm`);

    const res = await fetch('https://your-backend.example.com/api/upload-audio', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    const { audioId } = data;

    // Tell background worker to fetch transcript + MOM
    chrome.runtime.sendMessage({ action: 'processMeeting', payload: { audioId } });
  } catch (err) {
    console.error('[MOM] Upload failed:', err);
  }
}
