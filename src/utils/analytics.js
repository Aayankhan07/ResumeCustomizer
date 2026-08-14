import { track } from '@vercel/analytics';

/**
 * Tracks a product analytics event.
 *
 * This was a console.log stub, so every call site across the transform flow
 * recorded nothing in production. The instrumentation already existed; only
 * the sink was missing.
 *
 * @param {string} eventName - e.g. 'analysis_started'
 * @param {Object} [properties] - Optional event properties. Vercel accepts
 *   only flat string/number/boolean values.
 */
export function trackEvent(eventName, properties = {}) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`%c[Analytics] ${eventName}`, 'color: #10B981; font-weight: bold;', properties);
    return;
  }

  try {
    // Drop nested values rather than letting the SDK reject the whole event.
    const flat = Object.fromEntries(
      Object.entries(properties).filter(
        ([, v]) => v === null || ['string', 'number', 'boolean'].includes(typeof v)
      )
    );
    track(eventName, flat);
  } catch (err) {
    // Analytics must never break a user flow.
    console.error('Analytics track failed:', err);
  }
}
