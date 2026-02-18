'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { onEntryChange, isLivePreviewEnabled } from '@/lib/contentstack-client';

interface ContentstackLivePreviewProviderProps {
  children: React.ReactNode;
}

/**
 * Provider that subscribes to Live Preview content changes and triggers
 * a Next.js router refresh. SDK initialization happens at module load time
 * in contentstack-client.ts — NOT here. Importing that module (above)
 * ensures the SDK is initialized synchronously when this chunk loads.
 */
export function ContentstackLivePreviewProvider({ children }: ContentstackLivePreviewProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLivePreviewEnabled) return;
    const unsubscribe = onEntryChange(() => {
      router.refresh();
    });
    return unsubscribe;
  }, [router, pathname]);

  return <>{children}</>;
}

// Re-export helpers for convenience
export { getEditableProps, getEditableAttribute, isLivePreviewEnabled } from '@/lib/contentstack-client';
