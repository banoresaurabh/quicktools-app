import HomeList from '@/src/components/HomeList';
import { getAllTools } from '@/src/lib/tools';

export default function Page() {
  const tools = getAllTools();
  return <HomeList tools={tools} />;
}
