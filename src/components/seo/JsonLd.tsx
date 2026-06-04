/**
 * Renders a JSON-LD structured-data script. Server component — the script is present
 * in the raw HTML so crawlers and AI answer engines (and the Lytics content engine)
 * can parse it without executing client JS.
 *
 * Accepts a single schema object or an array; null/undefined entries are skipped.
 */
import { Fragment } from 'react';

interface JsonLdProps {
  data: unknown | unknown[];
}

export function JsonLd({ data }: JsonLdProps) {
  const items = (Array.isArray(data) ? data : [data]).filter(Boolean);
  if (items.length === 0) return null;

  return (
    <Fragment>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </Fragment>
  );
}

export default JsonLd;
