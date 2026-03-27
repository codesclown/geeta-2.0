/**
 * components/VideoPlayer.tsx
 * ─────────────────────────────────────────────────────────────
 * YouTube और Vimeo दोनों videos play कर सकता है।
 *
 * कैसे काम करता है:
 * - isYoutube=true  → YouTube embed URL बनता है
 * - isYoutube=false → Vimeo embed URL बनता है
 * - 16:9 aspect ratio maintain होता है (paddingTop: 56.25%)
 * - key={videoId} से video change होने पर iframe re-mount होता है
 */

"use client";

interface VideoPlayerProps {
  videoId: string;       // YouTube video ID या Vimeo video ID
  isYoutube?: boolean;   // true = YouTube, false = Vimeo (default: true)
}

export default function VideoPlayer({ videoId, isYoutube = true }: VideoPlayerProps) {
  // ── Embed URL बनाना ────────────────────────────────────────
  const src = isYoutube
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    // rel=0: related videos same channel से दिखाए
    : `https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1`;

  return (
    // 16:9 aspect ratio wrapper — paddingTop trick से responsive होता है
    <div style={{
      position: "relative",
      paddingTop: "56.25%", // 9/16 = 0.5625 = 56.25%
      width: "100%",
      margin: "0 auto",
      borderRadius: "1rem",
      overflow: "hidden",
      boxShadow: "0 0 80px rgba(251,191,36,0.12), 0 30px 80px rgba(0,0,0,0.7)",
      border: "1px solid rgba(251,191,36,0.15)",
    }}>
      {/* iframe absolute position से पूरा wrapper cover करता है */}
      <iframe
        key={videoId} // video बदलने पर iframe re-mount होगा
        src={src}
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
        title="Bhagavad Gita Video"
      />
    </div>
  );
}
