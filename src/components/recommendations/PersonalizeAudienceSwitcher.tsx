'use client';

/**
 * Demo audience switcher — drives REAL Contentstack Personalize.
 *
 * The demo environment has no organic traffic, so this control lets you assume an audience on
 * demand. It does NOT fake content: it calls sdk.set({ audience_affinity }) so the Personalize
 * SDK re-evaluates experiences, then writes the resulting variant aliases to the cookie the
 * server reads and refreshes — so the homepage's recommendations block (and any other
 * Personalize-varied content) re-renders for that audience.
 *
 * Requires an active Personalize experience keyed on the `audience_affinity` attribute. Until
 * that experience exists, switching is a no-op (no variants resolve).
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePersonalize } from '@/contexts/PersonalizeContext';
import { Users, X } from 'lucide-react';

const OPTIONS = [
  { key: 'wearable-tech', label: 'Wearable Tech fan' },
  { key: 'technofurniture', label: 'Technofurniture fan' },
];

const VARIANT_COOKIE = 'cs_personalize_variants';

export default function PersonalizeAudienceSwitcher() {
  const { sdk, isConfigured } = usePersonalize();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isConfigured) return null;

  const apply = async (affinity: string | null) => {
    if (!sdk) return;
    setBusy(true);
    try {
      // Real Personalize: set the attribute, then re-read the variant aliases the SDK computes.
      await sdk.set({ audience_affinity: affinity ?? '' });
      const aliases = sdk.getVariantAliases() || [];
      document.cookie = `${VARIANT_COOKIE}=${encodeURIComponent(
        JSON.stringify(aliases)
      )}; path=/; max-age=86400; SameSite=Lax`;
      setActive(affinity);
      // Re-render server components so they fetch variant content for the new audience.
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-40">
      {open ? (
        <div className="w-64 rounded-xl border border-gray-200 bg-white shadow-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Demo · Personalize audience
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close audience switcher"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {OPTIONS.map((opt) => (
              <button
                key={opt.key}
                disabled={busy}
                onClick={() => apply(opt.key)}
                className={`text-left text-sm rounded-lg border px-3 py-2 transition-colors disabled:opacity-50 ${
                  active === opt.key
                    ? 'border-gold-400 bg-gold-50 text-gold-900 font-medium'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <button
              disabled={busy}
              onClick={() => apply(null)}
              className="text-left text-xs text-gray-500 hover:text-gray-700 mt-1 disabled:opacity-50"
            >
              Reset audience
            </button>
          </div>
          <p className="mt-3 text-[0.7rem] leading-snug text-gray-400">
            Sets a Personalize attribute and re-evaluates experiences live.
          </p>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-gray-900 text-white text-sm font-medium px-4 py-2 shadow-lg hover:bg-gray-800"
        >
          <Users className="h-4 w-4" />
          Audience
        </button>
      )}
    </div>
  );
}
