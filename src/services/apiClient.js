/**
 * Mission LiFE Shared Secure API Client
 * - Targets VITE_API_BASE_URL (defaults to Render production endpoint)
 * - Safely URI-encodes all query parameters and identifiers
 * - Attaches Firebase ID token for authenticated requests
 * - Handles request timeouts and Render cold starts ("Waking the server, up to 60s")
 */

import { auth } from '../firebase';

const DEFAULT_API_BASE_URL = 'https://mission-life.onrender.com';

export function getApiBaseUrl() {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }
  return DEFAULT_API_BASE_URL;
}

/**
 * Resolves the hardware meter ID for a user.
 * Defaults to 'appliance_ac_01' for standard simulation / Wokwi bridge.
 */
export function resolveUserMeterId(user) {
  if (!user) return 'appliance_ac_01';
  return user.linkedMeterId || user.meterId || user.deviceId || 'appliance_ac_01';
}

/**
 * Encodes query parameters safely with RFC 3986 encoding
 */
export function buildQueryString(params = {}) {
  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

/**
 * Resolves a full URL safely
 */
export function buildUrl(endpoint, params = {}) {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const query = buildQueryString(params);
  return `${base}${cleanEndpoint}${query}`;
}

/**
 * Retrieves the current user's Firebase ID token if available
 */
async function getAuthToken() {
  try {
    if (auth && auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
  } catch (e) {
    // Non-fatal: proceed without token
  }
  return null;
}

// Server waking state listeners for UI status updates
const wakingListeners = new Set();
let isServerWaking = false;

export function subscribeServerWakingState(listener) {
  wakingListeners.add(listener);
  listener(isServerWaking);
  return () => wakingListeners.delete(listener);
}

function setServerWaking(waking) {
  if (isServerWaking !== waking) {
    isServerWaking = waking;
    wakingListeners.forEach(fn => {
      try { fn(isServerWaking); } catch (e) {}
    });
  }
}

/**
 * Core fetch wrapper with timeout, token injection, and cold-start detection
 */
export async function apiFetch(endpoint, options = {}) {
  const {
    params = {},
    timeoutMs = 8000,
    headers = {},
    ...fetchOptions
  } = options;

  const url = buildUrl(endpoint, params);
  const controller = new AbortController();
  const token = await getAuthToken();

  const reqHeaders = {
    'Accept': 'application/json',
    ...headers
  };
  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Detect slow response (Render cold start >= 3s)
  const coldStartTimer = setTimeout(() => {
    setServerWaking(true);
  }, 3000);

  const timeoutTimer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: reqHeaders,
      signal: controller.signal
    });
    return response;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Request to ${endpoint} timed out after ${timeoutMs}ms (Render cold start)`);
    }
    throw err;
  } finally {
    clearTimeout(coldStartTimer);
    clearTimeout(timeoutTimer);
    setServerWaking(false);
  }
}

export const apiClient = {
  get: (endpoint, params = {}, options = {}) => 
    apiFetch(endpoint, { method: 'GET', params, ...options }),

  post: (endpoint, body = {}, options = {}) => 
    apiFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      body: typeof body === 'string' ? body : JSON.stringify(body),
      ...options
    }),

  buildUrl,
  getBaseUrl: getApiBaseUrl,
  resolveUserMeterId,
  subscribeServerWakingState
};

export default apiClient;

