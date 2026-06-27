// src/utils/analytics.js

/**
 * Tracks an analytics event.
 * @param {string} eventName - The name of the event (e.g., 'analysis_started')
 * @param {Object} [properties] - Optional event properties
 */
export function trackEvent(eventName, properties = {}) {
  // Plug-and-play spot for PostHog, Google Analytics, etc.
  // Example: window.posthog?.capture(eventName, properties);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`%c[Analytics] ${eventName}`, 'color: #10B981; font-weight: bold;', properties);
  }
}
