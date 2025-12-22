/**
 * Mock Tealium Moments API Service
 *
 * Simulates Tealium's Moments API response for testing Contentstack Personalize
 * audience targeting. In production, this would be replaced with actual Tealium
 * integration that calls the Moments API.
 *
 * Flow:
 * 1. TealiumMockService.getMomentsData() returns simulated API response
 * 2. getAudiencesAsDelimitedString() converts audiences array to comma-separated string
 * 3. This string is passed to Personalize SDK as `cdp_segments` liveAttribute
 * 4. Personalize audience rules evaluate against cdp_segments (e.g., "contains fitness")
 */

// Pool of possible audience segments for random selection
const AUDIENCE_POOL = [
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

// Pool of possible badges
const BADGE_POOL = [
  'Frequent visitor',
  'Power user',
  'New customer',
  'VIP member',
  'Engaged shopper',
];

/**
 * Tealium Moments API response structure
 * https://docs.tealium.com/platforms/moments-api/
 */
export interface TealiumMomentsResponse {
  audiences: string[];
  badges: string[];
  metrics: Record<string, number>;
  properties: Record<string, string>;
  flags: Record<string, boolean>;
  dates: Record<string, number>;
}

/**
 * Mock Tealium Service
 * Simulates the Tealium Moments API for development/demo purposes
 */
class TealiumMockService {
  private lastResponse: TealiumMomentsResponse | null = null;

  /**
   * Simulates a call to Tealium Moments API
   * Randomly generates audience data for testing personalization
   *
   * @param forceRefresh - If true, generates new random data even if cached
   * @returns Simulated Moments API response
   */
  getMomentsData(forceRefresh: boolean = true): TealiumMomentsResponse {
    if (this.lastResponse && !forceRefresh) {
      return this.lastResponse;
    }

    // Randomly select 1-3 audiences from the pool
    const numAudiences = Math.floor(Math.random() * 3) + 1;
    const shuffledAudiences = [...AUDIENCE_POOL].sort(() => Math.random() - 0.5);
    const selectedAudiences = shuffledAudiences.slice(0, numAudiences);

    // Randomly select 0-2 badges
    const numBadges = Math.floor(Math.random() * 3);
    const shuffledBadges = [...BADGE_POOL].sort(() => Math.random() - 0.5);
    const selectedBadges = shuffledBadges.slice(0, numBadges);

    const response: TealiumMomentsResponse = {
      audiences: selectedAudiences,
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

    // Also populate window.utag_data for visibility (standard Tealium data layer)
    if (typeof window !== 'undefined') {
      (window as any).utag_data = {
        ...(window as any).utag_data,
        tealium_audiences: response.audiences,
        tealium_badges: response.badges,
        cdp_segments: response.audiences.join(','),
      };

      console.log('🎯 Tealium Mock: Generated audiences:', response.audiences);
      console.log('🎯 Tealium Mock: cdp_segments:', response.audiences.join(','));
    }

    return response;
  }

  /**
   * Converts audiences array to comma-delimited string for Personalize
   * This is the format expected by Personalize's cdp_segments attribute
   *
   * @param response - Tealium Moments response (or uses last cached if not provided)
   * @returns Comma-separated string of audiences
   */
  getAudiencesAsDelimitedString(response?: TealiumMomentsResponse): string {
    const data = response || this.lastResponse || this.getMomentsData();
    return data.audiences.join(',');
  }

  /**
   * Get the full Tealium data layer object for Personalize liveAttributes
   * Returns all relevant fields that Personalize might use for targeting
   */
  getPersonalizeAttributes(response?: TealiumMomentsResponse): Record<string, string> {
    const data = response || this.lastResponse || this.getMomentsData();

    return {
      // Primary: audiences as comma-delimited string for cdp_segments rule
      cdp_segments: data.audiences.join(','),

      // Additional attributes that could be used for targeting
      tealium_badges: data.badges.join(','),
      visitor_type: data.properties['Visitor type'] || '',
      is_returning: String(data.flags['Returning visitor'] || false),
      has_purchased: String(data.flags['Has purchased'] || false),
    };
  }

  /**
   * Get the last generated response (useful for debugging)
   */
  getLastResponse(): TealiumMomentsResponse | null {
    return this.lastResponse;
  }

  /**
   * Clear cached response (forces new random data on next call)
   */
  clearCache(): void {
    this.lastResponse = null;
  }
}

// Export singleton instance
export const tealiumMockService = new TealiumMockService();

/**
 * Helper hook data for React components
 * Returns current Tealium data and refresh function
 */
export function getTealiumData() {
  const response = tealiumMockService.getMomentsData();
  return {
    response,
    cdpSegments: tealiumMockService.getAudiencesAsDelimitedString(response),
    personalizeAttributes: tealiumMockService.getPersonalizeAttributes(response),
    refresh: () => tealiumMockService.getMomentsData(true),
  };
}
