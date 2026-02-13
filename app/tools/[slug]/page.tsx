import { notFound } from 'next/navigation';
import ToolRenderer from '@/src/components/ToolRenderer';
import { getToolBySlug, getRelatedTools } from '@/src/lib/tools';
import type { Metadata } from "next";
import tools from "../../../src/data/tools.json";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tool = (tools as any[]).find(t => t.slug === params.slug);

  if (!tool) return { title: "Tool not found | QuickTools" };

  return {
    title: `${tool.title} | QuickTools`,
    description: tool.description || `Use ${tool.title} instantly in your browser.`,
  };
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = getToolBySlug(params.slug);
  if (!tool) return notFound();

  const related = getRelatedTools(tool);
  return (
    <div>
      <a href="/" style={{ color: '#0b5', textDecoration: 'none' }}>
        ← All tools
      </a>

      <h2 style={{ marginTop: 12, marginBottom: 4 }}>{tool.title}</h2>
      <div style={{ color: '#666', marginBottom: 12 }}>
        {tool.category} • {tool.subcategory}
      </div>

      <p style={{ marginTop: 0 }}>{tool.description}</p>

      <ToolRenderer tool={tool} />

      <h3 style={{ marginTop: 24 }}>How to use</h3>
      <ol>
        {tool.howTo.map((s: string, i: number) => (
          <li key={i}>{s}</li>
        ))}
      </ol>

      <h3 style={{ marginTop: 24 }}>FAQ</h3>
      <div>
        {tool.faq.map((f: any, i: number) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700 }}>{f.q}</div>
            <div style={{ color: '#444' }}>{f.a}</div>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 24 }}>Related</h3>
      <ul>
        {related.map((t) => (
          <li key={t.slug}>
            <a href={`/tools/${t.slug}`}>{t.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
