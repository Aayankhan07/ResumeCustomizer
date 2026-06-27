export const ERROR_MESSAGES = {
  RATE_LIMITED: {
    title: "Hourly limit reached",
    description: (retryAfter) => `You've used all your transformations for this hour. Please wait for the cooldown reset.`,
    action: "Wait for reset or try again later"
  },
  CONTENT_TOO_LONG: {
    title: "Resume content too long",
    description: (max, actual) => `Your resume is ${actual} characters long. The maximum allowed length is ${max} characters. Try removing older positions or narrowing down your content.`,
    action: "Trim your resume and retry"
  },
  AI_TIMEOUT: {
    title: "AI took too long to respond",
    description: () => "The AI model failed to return a response within the timeout limit. This usually happens during peak demand times.",
    action: "Retry in 30 seconds"
  },
  PARSE_FAILED: {
    title: "AI returned unexpected structure",
    description: () => "The AI response failed validation checks and couldn't be parsed properly. This is rare and usually transient.",
    action: "Try again — it usually works on the next attempt"
  },
  INVALID_JD: {
    title: "Job description invalid",
    description: () => "The job description provided is too short. Please paste a comprehensive job description (at least 50 characters) to ensure the AI has enough context.",
    action: "Add more job description details"
  },
  AUTH_FAILED: {
    title: "Authentication expired",
    description: () => "Your session has expired or you are not authorized to perform this action. Please sign in again.",
    action: "Log back in"
  },
  DEFAULT_ERROR: {
    title: "Analysis failed",
    description: (details) => details || "The AI response was unexpected. Please try again.",
    action: "Try again"
  }
};
