/**
 * app/layout.tsx
 * ─────────────────────────────────────────────────────────────
 * यह पूरे app का root layout है।
 * हर page इसी के अंदर render होता है।
 *
 * यहाँ होता है:
 * - Google Fonts load (Crimson Text + Noto Serif Devanagari)
 * - PWA metadata (manifest, apple icons, theme color)
 * - Vimeo player script lazy load
 * - Service Worker register (offline support के लिए)
 */

import type { Metadata } from "next";
import Script from "next/script";
import { Crimson_Text, Noto_Serif_Devanagari } from "next/font/google";
import "./globals.css";

// ── अंग्रेज़ी content के लिए serif font ───────────────────────
// CSS variable --font-crimson से access होता है
const crimson = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-crimson",
});

// ── हिंदी/संस्कृत content के लिए Devanagari font ─────────────
// CSS variable --font-devanagari से access होता है
const devanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "600"],
  variable: "--font-devanagari",
});

// ── SEO और PWA metadata ────────────────────────────────────────
export const metadata: Metadata = {
  title: "Bhagavad Gita — The Song of God",
  description:
    "Read the Bhagavad Gita as an interactive flipbook with all 18 chapters, summaries, and text-to-speech.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bhagavad Gita",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi"> {/* primary language Hindi है */}
      <head>
        {/* PWA theme color — dark brown */}
        <meta name="theme-color" content="#1a0800" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* iOS home screen icon */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${crimson.variable} ${devanagari.variable} antialiased overflow-hidden`}>
        {children}

        {/* Vimeo player SDK — lazily load होता है, पहले page load block नहीं करता */}
        <Script src="https://player.vimeo.com/api/player.js" strategy="lazyOnload" />

        {/* Service Worker register — PWA offline support के लिए */}
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js');
          }
        `}</Script>
      </body>
    </html>
  );
}
