import HomeList from '@/src/components/HomeList';
import { getAllTools } from '@/src/lib/tools';

export default function Page() {
  const tools = getAllTools();
  return (
    <div>
      <HomeList tools={tools} />
  
      <hr style={{ marginTop: 40 }} />
  
      <div style={{ marginTop: 12, fontSize: 14 }}>
        <a href="/about">About</a> ·{" "}
        <a href="/privacy">Privacy</a> ·{" "}
        <a href="/terms">Terms</a>
      </div>
    </div>
  );
}