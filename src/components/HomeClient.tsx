/**
 * components/HomeClient.tsx
 * ─────────────────────────────────────────────────────────────
 * यह पूरे app का main client component है।
 * इसमें दो tabs हैं:
 *   1. 📖 पुस्तक — BookViewer (interactive flipbook)
 *   2. 🎬 वीडियो — VideoPlayer + playlist
 *
 * यह component:
 * - API से सभी 18 अध्याय fetch करता है
 * - Loading/error states handle करता है
 * - Header और tabs की height measure करता है
 *   ताकि book/video area बाकी space ले सके
 * - Background में floating particles animate होते हैं
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { Chapter } from "@/types";
import { fetchChapters } from "@/lib/api";
import BookViewer from "./BookViewer";
import VideoPlayer from "./VideoPlayer";

// ── Video playlist data ────────────────────────────────────────
// isYoutube: true = YouTube embed, false = Vimeo embed
const VIDEOS = [
  { id: "1177207018",   title: "Bhagavad Gita — Pravachan",  subtitle: "श्रीमद्भगवद्गीता प्रवचन", isYoutube: false },
  { id: "q2xa-oJzBoI",  title: "Bhagavad Gita — Adhyay 1",   subtitle: "अर्जुन विषाद योग",         isYoutube: true  },
  { id: "W937gFzsD-c",  title: "Bhagavad Gita — Adhyay 2",   subtitle: "सांख्य योग",               isYoutube: true  },
  { id: "8OVh5HzCWYE",  title: "Bhagavad Gita — Adhyay 3",   subtitle: "कर्म योग",                 isYoutube: true  },
  { id: "VOf1KJxQZ-A",  title: "Bhagavad Gita — Adhyay 4",   subtitle: "ज्ञान कर्म संन्यास योग",   isYoutube: true  },
  { id: "MmOAsC7A39o",  title: "Bhagavad Gita — Adhyay 5",   subtitle: "कर्म संन्यास योग",         isYoutube: true  },
  { id: "5FrlaO8mKDc",  title: "Bhagavad Gita — Adhyay 6",   subtitle: "आत्मसंयम योग",             isYoutube: true  },
  { id: "vCmpH-qQx_w",  title: "Bhagavad Gita — Adhyay 7",   subtitle: "ज्ञान विज्ञान योग",        isYoutube: true  },
];

// ── Background floating particles की positions/timings ────────
// CSS animation "floatUp" इन्हें ऊपर उड़ाती है
const PARTICLES = [
  { left: "8%",  top: "70%", size: 3, dur: "7s",  delay: "0s",   dx: "15px"  },
  { left: "18%", top: "80%", size: 2, dur: "9s",  delay: "1.5s", dx: "-10px" },
  { left: "30%", top: "75%", size: 4, dur: "6s",  delay: "3s",   dx: "20px"  },
  { left: "50%", top: "85%", size: 2, dur: "8s",  delay: "0.5s", dx: "-18px" },
  { left: "65%", top: "72%", size: 3, dur: "10s", delay: "2s",   dx: "12px"  },
  { left: "78%", top: "78%", size: 2, dur: "7s",  delay: "4s",   dx: "-8px"  },
  { left: "88%", top: "68%", size: 4, dur: "9s",  delay: "1s",   dx: "16px"  },
  { left: "42%", top: "90%", size: 2, dur: "6s",  delay: "2.5s", dx: "-14px" },
];

export default function HomeClient() {
  // ── State ──────────────────────────────────────────────────
  const [chapters, setChapters]   = useState<Chapter[]>([]);
  const [loading, setLoading]     = useState(true);       // API loading चल रही है
  const [loadError, setLoadError] = useState(false);      // API fail हुई
  const [tab, setTab]             = useState<"book" | "video">("book"); // active tab
  const [activeVideo, setActiveVideo] = useState(VIDEOS[0]); // currently playing video
  const [isMobile, setIsMobile]   = useState(false);      // screen width < 768px?
  const [headerH, setHeaderH]     = useState(0);          // header+tabs की combined height

  // ── Refs — DOM elements measure करने के लिए ───────────────
  const headerRef = useRef<HTMLDivElement>(null);
  const tabsRef   = useRef<HTMLDivElement>(null);

  // ── Mobile detection ───────────────────────────────────────
  // resize पर re-check होता है
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── API से सभी अध्याय fetch करना ──────────────────────────
  // error पर loadError true होता है → retry button दिखता है
  useEffect(() => {
    fetchChapters()
      .then(data => { setChapters(data); setLoading(false); })
      .catch(() => { setLoadError(true); setLoading(false); });
  }, []);

  // ── Header + Tabs की height measure करना ──────────────────
  // Book/Video area को बाकी बची height मिले इसलिए
  // ResizeObserver से dynamic measurement होती है
  useEffect(() => {
    const measure = () => {
      const h = (headerRef.current?.getBoundingClientRect().height ?? 0)
              + (tabsRef.current?.getBoundingClientRect().height ?? 0);
      setHeaderH(h);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (headerRef.current) ro.observe(headerRef.current);
    if (tabsRef.current)   ro.observe(tabsRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      {/* ── Loading spinner ── */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <p className="devanagari text-amber-400 text-xl animate-pulse">ॐ</p>
        </div>
      )}

      {/* ── Error state + Retry button ── */}
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 gap-3">
          <p className="devanagari text-amber-400 text-lg">ॐ</p>
          <p className="font-serif text-amber-300/80 text-sm">Could not load chapters. Check your connection.</p>
          <button
            onClick={() => {
              setLoadError(false); setLoading(true);
              fetchChapters()
                .then(d => { setChapters(d); setLoading(false); })
                .catch(() => { setLoadError(true); setLoading(false); });
            }}
            className="px-4 py-1.5 rounded-full text-xs font-serif border border-amber-700/50 text-amber-400 hover:bg-amber-800/30 transition-all">
            Retry
          </button>
        </div>
      )}

      {/* ── Background floating particles (CSS animated) ── */}
      {PARTICLES.map((p, i) => (
        <div key={i} className="ambient-particle"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size,
            "--dur": p.dur, "--delay": p.delay, "--dx": p.dx,
          } as React.CSSProperties}
        />
      ))}

      {/* ── App title / Header ── */}
      <div ref={headerRef} className="shrink-0 text-center pt-6 pb-1 px-4 select-none">
        <div className="flex items-center justify-center gap-2">
          <span className="om-pulse devanagari text-amber-400 text-lg">ॐ</span>
          <h1 className="devanagari text-amber-200 text-xl md:text-3xl tracking-wide">
            श्रीमद्भगवद्गीता
          </h1>
          <span className="om-pulse devanagari text-amber-400 text-lg">ॐ</span>
        </div>
        <p className="text-amber-600 text-[9px] font-serif tracking-[0.2em] uppercase">
          The Song of God · 18 Adhyayas
        </p>
      </div>

      {/* ── Tab switcher: पुस्तक / वीडियो ── */}
      <div ref={tabsRef} className="shrink-0 flex justify-center pb-1">
        <div className="flex bg-amber-900/60 border border-amber-700/40 rounded-full p-0.5">
          {([
            { id: "book",  label: "📖 पुस्तक" },
            { id: "video", label: "🎬 वीडियो" },
          ] as const).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-1 rounded-full text-xs font-serif transition-all ${
                tab === t.id ? "bg-amber-700 text-amber-100 shadow" : "text-amber-500 hover:text-amber-300"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content area ── */}
      {/* height = 100dvh - header height, ताकि scroll न हो */}
      <div
        className="w-full overflow-hidden"
        style={{ height: headerH > 0 ? `calc(100dvh - ${headerH}px)` : undefined, flex: headerH > 0 ? "none" : "1 1 0" }}
      >
        {/* पुस्तक tab — loading/error में render नहीं होता */}
        <div className={`w-full h-full ${tab === "book" ? "block" : "hidden"}`}>
          {!loading && !loadError && <BookViewer chapters={chapters} />}
        </div>

        {/* वीडियो tab */}
        {tab === "video" && (
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", width: "100%", height: "100%", overflow: "hidden" }}>

            {/* ── Video player area ── */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: isMobile ? "12px 12px 8px" : "16px", gap: 8, overflow: "hidden" }}>
              <div style={{ width: "100%" }}>
                <VideoPlayer videoId={activeVideo.id} isYoutube={activeVideo.isYoutube} />
              </div>
              <p className="font-serif text-amber-300/80 text-xs tracking-wide text-center">{activeVideo.title}</p>
            </div>

            {/* ── Playlist ── */}
            {isMobile ? (
              // Mobile: नीचे horizontal scroll में playlist
              <div style={{ flexShrink: 0, overflowX: "auto", overflowY: "hidden", display: "flex", flexDirection: "row", gap: 8, padding: "8px 12px 12px", borderTop: "1px solid rgba(251,191,36,0.12)", background: "rgba(30,10,2,0.6)" }}>
                {VIDEOS.map((v) => (
                  <button key={v.id} onClick={() => setActiveVideo(v)} style={{ flexShrink: 0, width: 110 }}
                    className={`flex flex-col rounded-lg overflow-hidden transition-all border ${activeVideo.id === v.id ? "bg-amber-700/40 border-amber-500/50 text-amber-100" : "bg-amber-900/20 border-amber-700/20 text-amber-500"}`}>
                    <div style={{ width: "100%", height: 62, overflow: "hidden" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={v.isYoutube ? `https://img.youtube.com/vi/${v.id}/mqdefault.jpg` : `https://vumbnail.com/${v.id}.jpg`} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ padding: "4px 6px" }}>
                      <span className="text-[9px] font-serif leading-tight line-clamp-2 block">{v.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              // Desktop: दाईं तरफ vertical sidebar में playlist
              <div style={{ width: 210, flexShrink: 0, height: "100%", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", gap: 6, padding: "12px 8px", borderLeft: "1px solid rgba(251,191,36,0.12)", background: "rgba(30,10,2,0.6)" }}>
                <p className="text-amber-600/50 text-[9px] tracking-widest uppercase font-serif text-center mb-1">Playlist</p>
                {VIDEOS.map((v) => (
                  <button key={v.id} onClick={() => setActiveVideo(v)} style={{ width: "100%", flexShrink: 0 }}
                    className={`flex items-center gap-2 text-left rounded-lg px-2 py-1.5 transition-all border ${activeVideo.id === v.id ? "bg-amber-700/40 border-amber-500/50 text-amber-100" : "bg-amber-900/20 border-amber-700/20 text-amber-500 hover:bg-amber-800/30 hover:text-amber-300"}`}>
                    <div style={{ width: 64, height: 36, flexShrink: 0, borderRadius: 4, overflow: "hidden" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={v.isYoutube ? `https://img.youtube.com/vi/${v.id}/mqdefault.jpg` : `https://vumbnail.com/${v.id}.jpg`} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                      <span className="text-[10px] font-serif leading-tight line-clamp-2">{v.title}</span>
                      <span className="devanagari text-[9px] opacity-50 mt-0.5 truncate">{v.subtitle}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
