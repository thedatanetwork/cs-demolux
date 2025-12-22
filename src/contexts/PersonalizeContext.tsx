'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PersonalizeSDK, Experience, personalizeService } from '@/lib/personalize';
import { tealiumMockService, TealiumMomentsResponse } from '@/lib/tealium-mock';

interface PersonalizeContextType {
  sdk: PersonalizeSDK | null;
  experiences: Experience[];
  variantAliases: string[];
  isLoading: boolean;
  isConfigured: boolean;
  triggerEvent: (eventKey: string, data?: Record<string, any>) => Promise<void>;
  setUserAttributes: (attributes: Record<string, any>) => Promise<void>;
  tealiumData: TealiumMomentsResponse | null;
  refreshTealiumData: () => void;
}

const PersonalizeContext = createContext<PersonalizeContextType | undefined>(undefined);

interface PersonalizeProviderProps {
  children: ReactNode;
  userId?: string;
  liveAttributes?: Record<string, any>;
}

export function PersonalizeProvider({
  children,
  userId,
  liveAttributes
}: PersonalizeProviderProps) {
  const [sdk, setSdk] = useState<PersonalizeSDK | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [variantAliases, setVariantAliases] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured] = useState(personalizeService.isConfigured());
  const [tealiumData, setTealiumData] = useState<TealiumMomentsResponse | null>(null);

  // Define initialize outside useEffect so it can be reused
  const initialize = async () => {
      if (!isConfigured) {
        console.log('Personalize not configured, skipping initialization');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Get Tealium/CDP data (mock for demo, would be real API call in production)
        // This simulates calling Tealium Moments API to get audience segments
        const tealiumResponse = tealiumMockService.getMomentsData(true);
        setTealiumData(tealiumResponse);

        // Convert Tealium audiences to Personalize-compatible attributes
        // The cdp_segments field is a comma-delimited string of audience names
        const tealiumAttributes = tealiumMockService.getPersonalizeAttributes(tealiumResponse);

        console.log('🎯 Tealium audiences:', tealiumResponse.audiences);
        console.log('🎯 cdp_segments for Personalize:', tealiumAttributes.cdp_segments);

        // Extract query parameters from URL for targeting
        const urlParams = new URLSearchParams(window.location.search);
        const queryParams: Record<string, string> = {};
        urlParams.forEach((value, key) => {
          queryParams[key] = value;
        });

        // Merge: URL params + Tealium CDP data + any provided live attributes
        // Tealium data is merged so Personalize can evaluate cdp_segments rules
        const mergedAttributes = {
          ...queryParams,
          ...tealiumAttributes,
          ...liveAttributes
        };

        console.log('🔍 Initializing Personalize with attributes:', mergedAttributes);

        const personalizeSDK = await personalizeService.initializeClient(
          userId,
          mergedAttributes
        );

        if (personalizeSDK) {
          setSdk(personalizeSDK);
          
          // Get experiences and variant aliases
          const exp = personalizeSDK.getExperiences();
          const aliases = personalizeSDK.getVariantAliases();
          
          setExperiences(exp);
          setVariantAliases(aliases);
          
          // Store variant aliases in cookie for server-side access
          // This enables SSR to fetch personalized content without flicker
          if (aliases && aliases.length > 0) {
            document.cookie = `cs_personalize_variants=${encodeURIComponent(JSON.stringify(aliases))}; path=/; max-age=86400; SameSite=Lax`;
            console.log('🍪 Client: Stored variant aliases in cookie:', aliases);
          }
          
          console.log('Personalize initialized with experiences:', exp);
          console.log('Variant aliases:', aliases);
        }
      } catch (error) {
        console.error('Error initializing Personalize:', error);
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    initialize();
  }, [userId, liveAttributes, isConfigured]);

  const triggerEvent = async (eventKey: string, data?: Record<string, any>) => {
    if (!sdk) {
      console.warn('Personalize SDK not initialized, cannot trigger event:', eventKey);
      return;
    }

    try {
      await sdk.triggerEvent(eventKey, data);
      console.log('Event triggered:', eventKey, data);
    } catch (error) {
      console.error('Error triggering event:', eventKey, error);
    }
  };

  const setUserAttributes = async (attributes: Record<string, any>) => {
    if (!sdk) {
      console.warn('Personalize SDK not initialized, cannot set attributes');
      return;
    }

    try {
      await sdk.set(attributes);
      console.log('User attributes set:', attributes);
    } catch (error) {
      console.error('Error setting user attributes:', error);
    }
  };

  // Refresh Tealium data and re-initialize Personalize
  // This simulates a new Moments API call with fresh random audiences
  const refreshTealiumData = () => {
    console.log('🔄 Refreshing Tealium data and re-initializing Personalize...');
    tealiumMockService.clearCache();
    initialize();
  };

  const value: PersonalizeContextType = {
    sdk,
    experiences,
    variantAliases,
    isLoading,
    isConfigured,
    triggerEvent,
    setUserAttributes,
    tealiumData,
    refreshTealiumData,
  };

  return (
    <PersonalizeContext.Provider value={value}>
      {children}
    </PersonalizeContext.Provider>
  );
}

export function usePersonalize(): PersonalizeContextType {
  const context = useContext(PersonalizeContext);
  
  if (context === undefined) {
    throw new Error('usePersonalize must be used within a PersonalizeProvider');
  }
  
  return context;
}

// Hook for easy event tracking
export function usePersonalizeEvent() {
  const { triggerEvent, isConfigured } = usePersonalize();
  
  return {
    trackEvent: triggerEvent,
    isConfigured,
  };
}

// Hook for user attributes
export function usePersonalizeAttributes() {
  const { setUserAttributes, isConfigured } = usePersonalize();
  
  return {
    setAttributes: setUserAttributes,
    isConfigured,
  };
}

