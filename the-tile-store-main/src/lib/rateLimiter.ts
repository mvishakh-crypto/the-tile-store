// ============================================================
// Rate Limiter — Client-side request throttling
// Prevents spam on forms and API calls
// Uses localStorage for cross-tab persistence
// ============================================================

interface RateLimitEntry {
  timestamps: number[];
  blockedUntil?: number;
}

const STORAGE_PREFIX = 'atelier-ratelimit-';

function getEntry(key: string): RateLimitEntry {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : { timestamps: [] };
  } catch {
    return { timestamps: [] };
  }
}

function saveEntry(key: string, entry: RateLimitEntry): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // localStorage full — fail silently
  }
}

// ============================================================
// CORE
// ============================================================

export interface RateLimiter {
  /** Check if the action is allowed. Returns true if allowed, false if rate-limited. */
  check(): boolean;
  /** Record a request (call after check() returns true). */
  record(): void;
  /** Check + record atomically. Returns true if allowed. */
  attempt(): boolean;
  /** Get remaining cooldown in milliseconds (0 if not blocked). */
  getCooldownMs(): number;
  /** Get remaining allowed requests in current window. */
  getRemainingRequests(): number;
  /** Reset the limiter (e.g. after successful form clear). */
  reset(): void;
}

/**
 * Create a named rate limiter.
 * @param key       Unique identifier (e.g. 'booking-form', 'search-image')
 * @param maxRequests  Max requests allowed in the window
 * @param windowMs  Time window in milliseconds
 * @param blockMs   How long to block after limit hit (default: windowMs)
 */
export function createRateLimiter(
  key: string,
  maxRequests: number,
  windowMs: number,
  blockMs?: number
): RateLimiter {
  const effectiveBlockMs = blockMs ?? windowMs;

  const cleanup = (entry: RateLimitEntry): RateLimitEntry => {
    const now = Date.now();
    return {
      ...entry,
      timestamps: entry.timestamps.filter(ts => now - ts < windowMs),
      blockedUntil: entry.blockedUntil && entry.blockedUntil > now ? entry.blockedUntil : undefined,
    };
  };

  return {
    check(): boolean {
      const now = Date.now();
      const entry = cleanup(getEntry(key));

      if (entry.blockedUntil && entry.blockedUntil > now) {
        return false;
      }

      return entry.timestamps.length < maxRequests;
    },

    record(): void {
      const now = Date.now();
      const entry = cleanup(getEntry(key));
      entry.timestamps.push(now);

      if (entry.timestamps.length >= maxRequests) {
        entry.blockedUntil = now + effectiveBlockMs;
      }

      saveEntry(key, entry);
    },

    attempt(): boolean {
      if (!this.check()) return false;
      this.record();
      return true;
    },

    getCooldownMs(): number {
      const now = Date.now();
      const entry = getEntry(key);
      if (entry.blockedUntil && entry.blockedUntil > now) {
        return entry.blockedUntil - now;
      }
      return 0;
    },

    getRemainingRequests(): number {
      const entry = cleanup(getEntry(key));
      return Math.max(0, maxRequests - entry.timestamps.length);
    },

    reset(): void {
      try {
        localStorage.removeItem(STORAGE_PREFIX + key);
      } catch {
        // ignore
      }
    },
  };
}

// ============================================================
// PRE-BUILT LIMITERS
// Ready to use — import directly
// ============================================================

/** Booking form: unlimited submissions (no rate limiting) */
export const bookingLimiter: RateLimiter = {
  check() { return true; },
  record() {},
  attempt() { return true; },
  getCooldownMs() { return 0; },
  getRemainingRequests() { return 999999; },
  reset() {},
};

/** Inquiry submission: max 5 per hour */
export const inquiryLimiter = createRateLimiter('inquiry-submit', 5, 60 * 60 * 1000);

/** AI Image search: max 10 per 5 minutes */
export const imageSearchLimiter = createRateLimiter('ai-image-search', 10, 5 * 60 * 1000);

/** Contact / callback: max 3 per 30 minutes */
export const contactLimiter = createRateLimiter('contact-form', 3, 30 * 60 * 1000);

/** Partner application: max 2 per 24 hours */
export const partnerLimiter = createRateLimiter('partner-apply', 2, 24 * 60 * 60 * 1000, 60 * 60 * 1000);
