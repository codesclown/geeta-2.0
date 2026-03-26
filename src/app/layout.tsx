import type { Metadata } from "next";
import Script from "next/script";
import { Crimson_Text, Noto_Serif_Devanagari } from "next/font/google";
import "./globals.css";

// Serif font for English content — gives a classic book feel
const crimson = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-crimson",
});

// Devanagari font for Sanskrit/Hindi text
const devanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "600"],
  variable: "--font-devanagari",
});

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1a0800" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${crimson.variable} ${devanagari.variable} antialiased overflow-hidden`}>
        {children}
        <Script src="https://player.vimeo.com/api/player.js" strategy="lazyOnload" />
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js');
          }
        `}</Script>
      </body>
    </html>
  );
}
