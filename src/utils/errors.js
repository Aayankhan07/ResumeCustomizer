export const ERROR_MESSAGES = {
  RATE_LIMITED: {
    title: "Hourly limit reached",
    description: () => `You've used all your transformations for this hour. Please wait for the cooldown reset.`,
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
    description: () => "The job description is too short. Paste a fuller description (at least 200 characters) so the AI has enough context.",
    action: "Add more job description details"
  },
  INVALID_JOB_TITLE: {
    title: "Job title invalid",
    description: () => "Enter a job title between 3 and 150 characters, or switch to pasting a full job description.",
    action: "Check the job title"
  },
  INVALID_REQUEST: {
    title: "Request could not be processed",
    description: () => "Some of the information submitted was not valid. Check your resume and job description, then try again.",
    action: "Review your input"
  },
  MISSING_RESUME_TEXT: {
    title: "No resume provided",
    description: () => "Upload a resume file or paste your resume text to continue.",
    action: "Add your resume"
  },
  INPUT_TOO_SHORT: {
    title: "Not enough content to analyze",
    description: () => "Your resume needs at least 200 characters so the AI has enough to work with.",
    action: "Add more detail to your resume"
  },
  INVALID_JSON_FROM_AI: {
    title: "AI returned an unreadable response",
    description: () => "The AI response could not be read. This is usually transient.",
    action: "Try again"
  },
  RESCORE_UNAVAILABLE: {
    title: "Cannot rescore this analysis",
    description: () => "This analysis was created before we started saving the original job description, so it cannot be rescored. Run a new analysis to use custom weightings.",
    action: "Run a new analysis"
  },
  NETWORK_ERROR: {
    title: "Connection problem",
    description: () => "We couldn't reach the server. Check your connection and try again.",
    action: "Retry"
  },
  INTERNAL_SERVER_ERROR: {
    title: "Something went wrong",
    description: () => "An unexpected error occurred on our side. It has been logged and we're looking into it.",
    action: "Try again"
  },
  AUTH_FAILED: {
    title: "Authentication expired",
    description: () => "Your session has expired or you are not authorized to perform this action. Please sign in again.",
    action: "Log back in"
  },
  RATE_LIMIT_UNAVAILABLE: {
    title: "Usage limits temporarily unavailable",
    description: () => "We couldn't verify your remaining usage, so the request was stopped as a precaution. This is usually brief.",
    action: "Try again in a minute"
  },
  DATABASE_SAVE_FAILED: {
    title: "Result not saved to history",
    description: () => "Your resume was generated successfully but couldn't be saved to your history. Download it before leaving this page.",
    action: "Download your resume now"
  },
  DEFAULT_ERROR: {
    title: "Analysis failed",
    description: (details) => details || "The AI response was unexpected. Please try again.",
    action: "Try again"
  }
};
