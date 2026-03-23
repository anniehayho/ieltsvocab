// Session timeout utility - logs out user after 15 minutes of inactivity

const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const WARNING_DURATION = 1 * 60 * 1000; // Show warning 1 minute before timeout

let timeoutTimer = null;
let warningTimer = null;
let onWarningCallback = null;
let onTimeoutCallback = null;

// Events that indicate user activity
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click'
];

// Reset the inactivity timer
const resetTimer = () => {
  // Clear existing timers
  if (timeoutTimer) {
    clearTimeout(timeoutTimer);
  }
  if (warningTimer) {
    clearTimeout(warningTimer);
  }

  // Set warning timer (14 minutes - 1 minute before timeout)
  warningTimer = setTimeout(() => {
    if (onWarningCallback) {
      onWarningCallback();
    }
  }, TIMEOUT_DURATION - WARNING_DURATION);

  // Set timeout timer (15 minutes)
  timeoutTimer = setTimeout(() => {
    if (onTimeoutCallback) {
      onTimeoutCallback();
    }
  }, TIMEOUT_DURATION);
};

// Initialize session timeout monitoring
export const initSessionTimeout = (onWarning, onTimeout) => {
  onWarningCallback = onWarning;
  onTimeoutCallback = onTimeout;

  // Set initial timer
  resetTimer();

  // Add event listeners for user activity
  ACTIVITY_EVENTS.forEach((event) => {
    window.addEventListener(event, resetTimer, true);
  });
};

// Clean up session timeout monitoring
export const cleanupSessionTimeout = () => {
  // Clear timers
  if (timeoutTimer) {
    clearTimeout(timeoutTimer);
  }
  if (warningTimer) {
    clearTimeout(warningTimer);
  }

  // Remove event listeners
  ACTIVITY_EVENTS.forEach((event) => {
    window.removeEventListener(event, resetTimer, true);
  });

  // Clear callbacks
  onWarningCallback = null;
  onTimeoutCallback = null;
};

// Manually reset the timer (useful when user dismisses warning)
export const resetSessionTimer = () => {
  resetTimer();
};

// Get remaining time in seconds
export const getRemainingTime = () => {
  // This is approximate - you'd need to track actual start time for precise calculation
  return Math.floor(TIMEOUT_DURATION / 1000);
};
