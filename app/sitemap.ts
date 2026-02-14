import { getAllTools } from '@/src/lib/tools';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://quicktools-app-doas.vercel.app'; // replace later with your domain
  const tools = getAllTools();

  return [
    { url: `${base}/`, lastModified: new Date() },
    ...tools.map((t) => ({
      url: `${base}/tools/${t.slug}`,
      lastModified: new Date(),
    })),
  ];
}
