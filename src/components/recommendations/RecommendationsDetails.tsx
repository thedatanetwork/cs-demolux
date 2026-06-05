'use client';

/**
 * Read-only "Recommendations Details" panel (bottom-left toggle).
 *
 * Surfaces how the homepage recommendation rail is being produced for this visitor — the live
 * source (Lytics collection vs catalog fill), the content-affinity driving the ranking, and the
 * ranked products with their match score. Diagnostics only; it doesn't change any experience.
 */
import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useRecommendations } from './useRecommendations';

const SOURCE_LABEL: Record<string, string> = {
  lytics: 'Lytics Content Recommendations',
  'lytics+catalog': 'Lytics recs + catalog fill',
  catalog: 'Catalog (browsing affinity)',
};

const AFFINITY_LABEL: Record<string, string> = {
  audience: 'audience attribute',
  browsing: 'your browsing',
  none: 'none yet (cold start)',
};

export default function RecommendationsDetails() {
  const [open, setOpen] = useState(false);
  const { ranked, meta } = useRecommendations({ collection: 'PRODUCTS', limit: 8 });

  const affinityEntries = Object.entries(meta.affinity).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxAff = affinityEntries[0]?.[1] || 1;

  return (
    <div className="fixed bottom-4 left-4 z-40 print:hidden">
      {open ? (
        <div className="w-80 max-h-[80vh] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Recommendations Details
            </span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 space-y-4 text-sm">
            {/* Source */}
            <div>
              <div className="text-[0.7rem] uppercase tracking-wide text-gray-400 mb-1">Source</div>
              <div className="font-medium text-gray-900">{SOURCE_LABEL[meta.source]}</div>
              <div className="text-xs text-gray-500 mt-1">
                {meta.liveCount} live from Lytics
                {meta.catalogCount > 0 && ` · ${meta.catalogCount} catalog fill`}
                {meta.collectionUsed && (
                  <>
                    {' · collection '}
                    <code className="text-gray-700">{meta.collectionUsed}</code>
                  </>
                )}
              </div>
            </div>

            {/* Affinity */}
            <div>
              <div className="text-[0.7rem] uppercase tracking-wide text-gray-400 mb-1">
                Content affinity ({AFFINITY_LABEL[meta.affinitySource]})
              </div>
              {affinityEntries.length ? (
                <div className="space-y-1.5">
                  {affinityEntries.map(([topic, score]) => (
                    <div key={topic}>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span className="capitalize">{topic.replace(/-/g, ' ')}</span>
                        <span>{score.toFixed(1)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-gold-400 to-gold-600"
                          style={{ width: `${Math.round((score / maxAff) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  No signal yet — browse a few products and the rail re-ranks to match.
                </p>
              )}
            </div>

            {/* Ranked recs */}
            <div>
              <div className="text-[0.7rem] uppercase tracking-wide text-gray-400 mb-1">
                Ranked recommendations
              </div>
              <ol className="space-y-2">
                {ranked.map((r, i) => (
                  <li key={r.url} className="flex items-start gap-2">
                    <span className="text-xs text-gray-400 w-4 shrink-0">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-900 truncate">{r.title}</span>
                        {r.source === 'lytics' ? (
                          <span className="shrink-0 text-[0.6rem] font-semibold text-gold-700 bg-gold-50 rounded px-1">
                            {r.match}%
                          </span>
                        ) : (
                          <span className="shrink-0 text-[0.6rem] text-gray-400 bg-gray-50 rounded px-1">fill</span>
                        )}
                      </div>
                      {r.topics.length > 0 && (
                        <div className="text-[0.65rem] text-gray-400 truncate">{r.topics.join(' · ')}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <p className="text-[0.65rem] leading-snug text-gray-400 border-t border-gray-100 pt-3">
              Drawn from the Lytics PRODUCTS collection and ranked by this visitor&apos;s content
              affinity — the same model the live Lytics engine uses.
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-gray-900 text-white text-sm font-medium px-4 py-2 shadow-lg hover:bg-gray-800"
        >
          <Sparkles className="h-4 w-4" />
          Recommendations Details
        </button>
      )}
    </div>
  );
}
