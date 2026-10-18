import { fetchCasinoData } from './matchApi/index.js';

// Every consumer of a casino table (bet validation, the 1s WebSocket poller and the
// REST endpoint) reads through this cache. Concurrent callers for the same table share
// one in-flight provider request, so provider load depends on the number of live
// tables, never on the number of users or bets.
const cache = new Map(); // eventName -> { at, value }
const inflight = new Map(); // eventName -> Promise

// A failed refresh may fall back to data at most this old (ms)
const MAX_STALE_ON_ERROR_MS = 1500;

export const getCasinoTable = (eventName, maxAgeMs = 500) => {
  const cached = cache.get(eventName);
  if (cached && Date.now() - cached.at <= maxAgeMs) {
    return Promise.resolve(cached.value);
  }

  let pending = inflight.get(eventName);
  if (!pending) {
    pending = fetchCasinoData(eventName)
      .then((value) => {
        if (value?.success) cache.set(eventName, { at: Date.now(), value });
        return value;
      })
      .catch((err) => {
        if (cached && Date.now() - cached.at <= MAX_STALE_ON_ERROR_MS) {
          return cached.value;
        }
        throw err;
      })
      .finally(() => inflight.delete(eventName));
    inflight.set(eventName, pending);
  }
  return pending;
};

export const peekCasinoTable = (eventName) => cache.get(eventName) || null;
