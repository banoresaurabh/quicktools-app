'use client';

import { useMemo, useState } from 'react';
import type { Tool } from '@/src/lib/tools';

export default function HomeList({ tools }: { tools: Tool[] }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('All');

  const categories = useMemo(() => {
    const s = new Set<string>(tools.map((t) => t.category));
    return ['All', ...Array.from(s).sort()];
  }, [tools]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return tools.filter((t) => {
      const okCat = cat === 'All' || t.category === cat;
      const okQ =
        !qq ||
        t.title.toLowerCase().includes(qq) ||
        t.slug.toLowerCase().includes(qq) ||
        (t.keywords || []).some((k: string) => k.toLowerCase().includes(qq));
      return okCat && okQ;
    });
  }, [tools, q, cat]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tools…"
          style={{
            padding: 10,
            border: '1px solid #ddd',
            borderRadius: 10,
            minWidth: 260,
          }}
        />
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          style={{ padding: 10, border: '1px solid #ddd', borderRadius: 10 }}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span style={{ color: '#666' }}>{filtered.length} tools</span>
      </div>

      <div
        style={{
          marginTop: 16,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 12,
        }}
      >
        {filtered.map((t) => (
          <a
            key={t.slug}
            href={`/tools/${t.slug}`}
            style={{
              border: '1px solid #eee',
              borderRadius: 14,
              padding: 14,
              textDecoration: 'none',
              color: 'inherit',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontWeight: 800 }}>{t.title}</div>
            <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
              {t.category} • {t.subcategory}
            </div>
            <div style={{ color: '#444', marginTop: 8, fontSize: 14 }}>
              {t.description}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
