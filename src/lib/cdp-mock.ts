/**
 * Mock CDP (Customer Data Platform) Service
 *
 * Simulates a CDP's visitor API response for testing Contentstack Personalize
 * audience targeting. In production, this would be replaced with actual CDP
 * integration (e.g., Tealium Moments API, Blueshift, BlueConic, etc.).
 *
 * Flow:
 * 1. CDPMockService.getVisitorData() returns simulated CDP response
 * 2. getSegmentsAsDelimitedString() converts segments array to comma-separated string
 * 3. This string is passed to Personalize SDK as `cdp_segments` liveAttribute
 * 4. Personalize audience rules evaluate against cdp_segments (e.g., "contains fitness")
 */

// Pool of possible audience segments for random selection
const SEGMENT_POOL = [
  'fitness',
  'outdoors',
  'tech-enthusiasts',
  'luxury-shoppers',
  'budget-conscious',
  'early-adopters',
  'home-decor',
  'wellness',
  'gaming',
  'professional',
];

// Pool of possible badges/traits
const BADGE_POOL = [
  'Frequent visitor',
  'Power user',
  'New customer',
  'VIP member',
  'Engaged shopper',
];

/**
 * CDP visitor data response structure
 * Generic format that maps to common CDP APIs:
 * - Tealium Moments API
 * - Blueshift User API
 * - BlueConic Profile API
 */
export interface CDPResponse {
  segments: string[];
  badges: string[];
  metrics: Record<string, number>;
  properties: Record<string, string>;
  flags: Record<string, boolean>;
  dates: Record<string, number>;
}

const SESSION_STORAGE_KEY = 'cdp_mock_visitor_data';

/**
 * Mock CDP Service
 * Simulates a CDP visitor API for development/demo purposes
 * Uses sessionStorage to persist segments across page navigations (prevents flicker)
 */
class CDPMockService {
  private lastResponse: CDPResponse | null = null;

  /**
   * Try to load cached data from sessionStorage
   */
  private loadFromSessionStorage(): CDPResponse | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('CDP Mock: Failed to load from sessionStorage', e);
    }
    return null;
  }

  /**
   * Save data to sessionStorage for persistence across navigations
   */
  private saveToSessionStorage(data: CDPResponse): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('CDP Mock: Failed to save to sessionStorage', e);
    }
  }

  /**
   * Simulates a call to a CDP visitor/profile API
   * Randomly generates segment data for testing personalization
   * Persists to sessionStorage to prevent flicker on page navigations
   *
   * @param forceRefresh - If true, generates new random data even if cached
   * @returns Simulated CDP response
   */
  getVisitorData(forceRefresh: boolean = false): CDPResponse {
    // Check memory cache first
    if (this.lastResponse && !forceRefresh) {
      return this.lastResponse;
    }

    // Check sessionStorage for persistence across navigations
    if (!forceRefresh) {
      const stored = this.loadFromSessionStorage();
      if (stored) {
        this.lastResponse = stored;
        console.log('🎯 CDP Mock: Loaded segments from sessionStorage:', stored.segments);
        return stored;
      }
    }

    // Generate new random data
    const numSegments = Math.floor(Math.random() * 3) + 1;
    const shuffledSegments = [...SEGMENT_POOL].sort(() => Math.random() - 0.5);
    const selectedSegments = shuffledSegments.slice(0, numSegments);

    const numBadges = Math.floor(Math.random() * 3);
    const shuffledBadges = [...BADGE_POOL].sort(() => Math.random() - 0.5);
    const selectedBadges = shuffledBadges.slice(0, numBadges);

    const response: CDPResponse = {
      segments: selectedSegments,
      badges: selectedBadges,
      metrics: {
        'Total direct visits': Math.floor(Math.random() * 50) + 1,
        'Page views this session': Math.floor(Math.random() * 10) + 1,
      },
      properties: {
        'Visitor type': Math.random() > 0.5 ? 'returning' : 'new',
      },
      flags: {
        'Returning visitor': Math.random() > 0.5,
        'Has purchased': Math.random() > 0.7,
      },
      dates: {
        'First visit': Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
        'Last visit': Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    };

    this.lastResponse = response;
    this.saveToSessionStorage(response);

    // Also populate window for visibility (useful for debugging)
    if (typeof window !== 'undefined') {
      (window as any).cdp_data = {
        ...(window as any).cdp_data,
        segments: response.segments,
        badges: response.badges,
        cdp_segments: response.segments.join(','),
      };

      console.log('🎯 CDP Mock: Generated NEW segments:', response.segments);
      console.log('🎯 CDP Mock: cdp_segments:', response.segments.join(','));
    }

    return response;
  }

  /**
   * Converts segments array to comma-delimited string for Personalize
   * This is the format expected by Personalize's cdp_segments attribute
   *
   * @param response - CDP response (or uses last cached if not provided)
   * @returns Comma-separated string of segments
   */
  getSegmentsAsDelimitedString(response?: CDPResponse): string {
    const data = response || this.lastResponse || this.getVisitorData();
    return data.segments.join(',');
  }

  /**
   * Get attributes formatted for Personalize liveAttributes
   * Returns all relevant fields that Personalize might use for targeting
   */
  getPersonalizeAttributes(response?: CDPResponse): Record<string, string> {
    const data = response || this.lastResponse || this.getVisitorData();

    return {
      // Primary: segments as comma-delimited string for cdp_segments rule
      cdp_segments: data.segments.join(','),

      // Additional attributes that could be used for targeting
      cdp_badges: data.badges.join(','),
      visitor_type: data.properties['Visitor type'] || '',
      is_returning: String(data.flags['Returning visitor'] || false),
      has_purchased: String(data.flags['Has purchased'] || false),
    };
  }

  /**
   * Get the last generated response (useful for debugging)
   */
  getLastResponse(): CDPResponse | null {
    return this.lastResponse;
  }

  /**
   * Clear cached response (forces new random data on next call)
   * Also clears sessionStorage
   */
  clearCache(): void {
    this.lastResponse = null;
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } catch (e) {
        // Ignore
      }
    }
  }
}

// Export singleton instance
export const cdpMockService = new CDPMockService();

/**
 * Helper function for React components
 * Returns current CDP data and refresh function
 */
export function getCDPData() {
  const response = cdpMockService.getVisitorData();
  return {
    response,
    cdpSegments: cdpMockService.getSegmentsAsDelimitedString(response),
    personalizeAttributes: cdpMockService.getPersonalizeAttributes(response),
    refresh: () => cdpMockService.getVisitorData(true),
  };
}
