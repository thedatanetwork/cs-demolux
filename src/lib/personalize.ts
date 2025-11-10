import Personalize from '@contentstack/personalize-edge-sdk';

// Personalize configuration
const personalizeConfig = {
  projectUid: process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID || '',
};

// Types for personalization
export interface Experience {
  shortUid: string;
  activeVariantShortUid: string | null;
}

export interface PersonalizeSDK {
  getExperiences: () => Experience[];
  getVariantAliases: () => string[];
  triggerEvent: (eventKey: string, data?: Record<string, any>) => Promise<void>;
  set: (attributes: Record<string, any>) => Promise<void>;
}

// Personalize Service class for server-side and edge usage
export class PersonalizeService {
  private projectUid: string;

  constructor(projectUid?: string) {
    this.projectUid = projectUid || personalizeConfig.projectUid;
  }

  /**
   * Initialize Personalize SDK for server-side/edge middleware
   * @param request - The incoming request object (for edge/middleware)
   * @param userId - Optional user ID for tracking
   * @param liveAttributes - Optional attributes for real-time personalization
   */
  async initializeServer(
    request?: Request,
    userId?: string,
    liveAttributes?: Record<string, any>
  ): Promise<PersonalizeSDK | null> {
    if (!this.projectUid) {
      console.warn('Personalize Project UID not configured');
      return null;
    }

    try {
      const options: any = {};
      
      if (userId) {
        options.userId = userId;
      }
      
      if (request) {
        options.request = request;
      }
      
      if (liveAttributes) {
        options.liveAttributes = liveAttributes;
      }

      const sdk = await Personalize.init(this.projectUid, options);
      console.log('Personalize SDK initialized (server-side)');
      return sdk;
    } catch (error) {
      console.error('Failed to initialize Personalize SDK:', error);
      return null;
    }
  }

  /**
   * Initialize Personalize SDK for client-side/browser
   * @param userId - Optional user ID for tracking
   * @param liveAttributes - Optional attributes for real-time personalization
   */
  async initializeClient(
    userId?: string,
    liveAttributes?: Record<string, any>
  ): Promise<PersonalizeSDK | null> {
    if (!this.projectUid) {
      console.warn('Personalize Project UID not configured');
      return null;
    }

    try {
      const options: any = {};
      
      if (userId) {
        options.userId = userId;
      }
      
      if (liveAttributes) {
        options.liveAttributes = liveAttributes;
      }

      const sdk = await Personalize.init(this.projectUid, options);
      console.log('Personalize SDK initialized (client-side)');
      return sdk;
    } catch (error) {
      console.error('Failed to initialize Personalize SDK:', error);
      return null;
    }
  }

  /**
   * Check if Personalize is configured
   */
  isConfigured(): boolean {
    return !!this.projectUid;
  }

  /**
   * Get the project UID
   */
  getProjectUid(): string {
    return this.projectUid;
  }
}

// Export singleton instance
export const personalizeService = new PersonalizeService();

/**
 * Helper function to initialize Personalize SDK
 * This is a convenience wrapper for common use cases
 */
export async function initPersonalize(options?: {
  userId?: string;
  liveAttributes?: Record<string, any>;
  request?: Request;
}): Promise<PersonalizeSDK | null> {
  const service = new PersonalizeService();
  
  if (typeof window === 'undefined') {
    // Server-side
    return service.initializeServer(
      options?.request,
      options?.userId,
      options?.liveAttributes
    );
  } else {
    // Client-side
    return service.initializeClient(
      options?.userId,
      options?.liveAttributes
    );
  }
}

