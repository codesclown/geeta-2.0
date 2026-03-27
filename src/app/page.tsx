/**
 * app/page.tsx
 * ─────────────────────────────────────────────────────────────
 * यह app का root page (/) है।
 * यह Server Component है — सिर्फ एक wrapper है।
 * असली UI HomeClient में है जो Client Component है।
 *
 * height: 100dvh — mobile browser के address bar को
 * account करता है (dvh = dynamic viewport height)
 */

import HomeClient from "@/components/HomeClient";

export default function Home() {
  return (
    <main
      className="bg-amber-950 flex flex-col overflow-hidden relative"
      style={{ height: "100dvh" }} // पूरी screen height, mobile-safe
    >
      <HomeClient />
    </main>
  );
}
