/* ============================================
   MOM Module - Utilities
   ============================================ */

'use strict';

/**
 * Format seconds → HH:MM:SS or MM:SS
 */
export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = n => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/**
 * Escape HTML entities
 */
export function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Debounce a function
 */
export function debounce(fn, wait = 200) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

/**
 * Get from Chrome storage with a fallback
 */
export async function storageGet(keys, fallback = null) {
  try {
    return await chrome.storage.local.get(keys);
  } catch {
    return fallback;
  }
}

/**
 * Set in Chrome storage
 */
export async function storageSet(data) {
  try {
    await chrome.storage.local.set(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Show a temporary toast message (requires #toast element)
 */
export function showToast(msg, duration = 2800) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), duration);
}
