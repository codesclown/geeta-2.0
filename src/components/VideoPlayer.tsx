"use client";

interface VideoPlayerProps {
  videoId: string;
  isYoutube?: boolean;
}

export default function VideoPlayer({ videoId, isYoutube = true }: VideoPlayerProps) {
  const src = isYoutube
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    : `https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1`;

  return (
    <div
      style={{
        position: "relative",
        paddingTop: "56.25%",
        width: "100%",
        margin: "0 auto",
        borderRadius: "1rem",
        overflow: "hidden",
        boxShadow: "0 0 80px rgba(251,191,36,0.12), 0 30px 80px rgba(0,0,0,0.7)",
        border: "1px solid rgba(251,191,36,0.15)",
      }}
    >
      <iframe
        key={videoId}
        src={src}
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        title="Bhagavad Gita Video"
      />
    </div>
  );
}
