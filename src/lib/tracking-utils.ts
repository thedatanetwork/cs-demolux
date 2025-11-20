/**
 * Lytics Tracking Utilities
 * Provides consistent tracking context across all events
 */

// Generate a session ID that persists for the browser session
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  const SESSION_KEY = 'demolux_session_id';
  let sessionId = sessionStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
}

// Get Lytics anonymous user ID
function getLyticsUserId(callback: (userId: string) => void): void {
  if (typeof window !== 'undefined' && window.jstag) {
    window.jstag.getid((id: string) => {
      callback(id);
    });
  } else {
    callback('');
  }
}

// Detect if device is mobile
function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Get browser name
function getBrowserName(): string {
  if (typeof window === 'undefined') return 'unknown';

  const userAgent = navigator.userAgent;

  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';

  return 'unknown';
}

// Get page context
export function getPageContext() {
  if (typeof window === 'undefined') {
    return {
      page_url: '',
      page_title: '',
      page_referrer: '',
      page_path: '',
    };
  }

  return {
    page_url: window.location.href,
    page_title: document.title,
    page_referrer: document.referrer,
    page_path: window.location.pathname,
  };
}

// Get device context
export function getDeviceContext() {
  if (typeof window === 'undefined') {
    return {
      device_type: 'unknown',
      browser: 'unknown',
      viewport_width: 0,
      viewport_height: 0,
    };
  }

  return {
    device_type: isMobile() ? 'mobile' : 'desktop',
    browser: getBrowserName(),
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
  };
}

// Get session ID
export function getTrackingSessionId(): string {
  return getSessionId();
}

// Get base tracking context (included in all events)
export async function getBaseTrackingContext(): Promise<Record<string, any>> {
  return new Promise((resolve) => {
    const context = {
      session_id: getSessionId(),
      ...getPageContext(),
      ...getDeviceContext(),
      timestamp: new Date().toISOString(),
    };

    // Add Lytics user ID asynchronously
    getLyticsUserId((userId) => {
      resolve({
        ...context,
        lytics_user_id: userId,
      });
    });
  });
}

// Identify user by email (call when email is captured)
export function identifyUserByEmail(email: string): void {
  if (typeof window !== 'undefined' && window.jstag && email) {
    window.jstag.identify({
      email: email,
    });
    console.log('Lytics: User identified with email:', email);
  }
}

// Send event with full context
export async function sendLyticsEvent(
  eventType: string,
  eventData: Record<string, any> = {}
): Promise<void> {
  if (typeof window === 'undefined' || !window.jstag) {
    return;
  }

  const baseContext = await getBaseTrackingContext();

  window.jstag.send({
    stream: 'web_events',
    data: {
      event_type: eventType,
      ...baseContext,
      ...eventData,
    }
  });
}
