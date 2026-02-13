import tools from '@/src/data/tools.json';

export type Tool = (typeof tools)[number];

export function getAllTools(): Tool[] {
  return tools as Tool[];
}

export function getToolBySlug(slug: string): Tool | undefined {
  return (tools as Tool[]).find((t) => t.slug === slug);
}

export function getRelatedTools(tool: Tool): Tool[] {
  const all = getAllTools();
  const set = new Set(tool.relatedSlugs || []);
  return all.filter((t) => set.has(t.slug)).slice(0, 8);
}
