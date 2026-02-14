import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QuickTools",
  description: "Fast, simple tools: calculators, converters, utilities, and games.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="3o9T4IsFJvnI6glqQUDJjf_jrSfw0-ZH48cTHdlbBQ8" />
      </head>
      <body style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
          <header style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
            <h1 style={{ margin: 0, fontSize: 28 }}>QuickTools</h1>
          </header>
          {children}
          <footer style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid #eee", color: "#777" }}>
            <small>QuickTools • Built for scale</small>
          </footer>
        </div>
      </body>
    </html>
  );
}
