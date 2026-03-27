"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Chapter } from "@/types";
import CoverPage from "./pages/CoverPage";
import ChapterPage from "./pages/ChapterPage";
import VersesPage from "./pages/VersesPage";
import BackCoverPage from "./pages/BackCoverPage";
import BookControls from "./BookControls";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });

export type Language = "hi" | "en";
export type FontSize = "sm" | "md" | "lg";

const DESKTOP_BREAKPOINT = 768;
const BOOKMARK_KEY = "gita-bookmark";
const NIGHT_MODE_KEY = "gita-night";
const FAVORITES_KEY = "gita-favorites";

const flipAudio = typeof window !== "undefined" ? new Audio("/audio/pageflip.mp3") : null;
function playFlipSound() {
  if (!flipAudio) return;
  flipAudio.currentTime = 0;
  flipAudio.play().catch(() => {});
}

interface Particle {
  id: number; x: number; y: number;
  vx: number; vy: number;
  size: number; opacity: number; life: number;
}

interface BookViewerProps { chapters: Chapter[]; }

export default function BookViewer({ chapters }: BookViewerProps) {
  const bookRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const mobileFlipRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const particleIdRef = useRef(0);

  const [currentPage, setCurrentPage] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [lang, setLang] = useState<Language>("hi");
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const [bookmark, setBookmark] = useState<number | null>(null);
  const [bookmarkFlash, setBookmarkFlash] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dims, setDims] = useState<{ w: number; h: number; isDesktop: boolean } | null>(null);
  const [nightMode, setNightMode] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]); // "ch-verse" keys
  const totalPages = chapters.length * 3 + 2;

  const getCurrentChapter = useCallback((page: number): Chapter | null => {
    if (page < 1 || page > chapters.length * 3) return null;
    return chapters[Math.floor((page - 1) / 3)] ?? null;
  }, [chapters]);

  // Stop audio on tab hide
  useEffect(() => {
    const fn = () => { if (document.hidden && flipAudio) { flipAudio.pause(); flipAudio.currentTime = 0; } };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, []);

  // Stop TTS on tab hide
  useEffect(() => {
    const fn = () => { if (document.hidden) { window.speechSynthesis?.cancel(); setIsReading(false); } };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, []);

  // Load bookmark
  useEffect(() => {
    const saved = localStorage.getItem(BOOKMARK_KEY);
    if (saved) setBookmark(Number(saved));
    const night = localStorage.getItem(NIGHT_MODE_KEY);
    if (night === "1") setNightMode(true);
    const favs = localStorage.getItem(FAVORITES_KEY);
    if (favs) { try { setFavorites(JSON.parse(favs)); } catch {} }
  }, []);

  const toggleNightMode = useCallback(() => {
    setNightMode(v => {
      localStorage.setItem(NIGHT_MODE_KEY, v ? "0" : "1");
      return !v;
    });
  }, []);

  const toggleFavorite = useCallback((key: string) => {
    setFavorites(prev => {
      const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Fullscreen listener
  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => measure(), 320);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Measure layout
  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const isDesktop = rect.width >= DESKTOP_BREAKPOINT;
    const maxW = document.fullscreenElement ? 700 : 560;
    if (isDesktop) {
      const ctrlH = controlsRef.current?.getBoundingClientRect().height ?? 72;
      const availW = rect.width - 110 - 32;
      const availH = rect.height - ctrlH - 24;
      const pageW = Math.max(1, Math.min(Math.floor(availW / 2), Math.floor(availH / 1.45), maxW));
      setDims({ w: pageW, h: Math.max(1, Math.floor(pageW * 1.45)), isDesktop: true });
    } else {
      const ctrlH = controlsRef.current?.getBoundingClientRect().height ?? 110;
      const availW = rect.width - 24;
      const availH = rect.height - ctrlH - 20;
      const w = Math.max(1, Math.min(availW, Math.floor(availH / 1.45)));
      setDims({ w: Math.floor(w), h: Math.max(1, Math.floor(w * 1.45)), isDesktop: false });
    }
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const debounced = () => { clearTimeout(timer); timer = setTimeout(measure, 150); };
    measure();
    requestAnimationFrame(measure);
    const ro = new ResizeObserver(debounced);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", debounced);
    return () => { clearTimeout(timer); ro.disconnect(); window.removeEventListener("resize", debounced); };
  }, [measure]);

  // Canvas particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter(p => p.life < 1);
      for (const p of particlesRef.current) {
        p.life += 0.022; p.x += p.vx; p.y += p.vy; p.vy -= 0.04;
        p.opacity = Math.sin(Math.PI * p.life) * 0.85;
        ctx.save(); ctx.globalAlpha = p.opacity;
        ctx.fillStyle = `hsl(${42 + Math.random() * 15}, 90%, 65%)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1 - p.life * 0.5), 0, Math.PI * 2);
        ctx.fill(); ctx.restore();
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, []);

  const spawnParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    for (let i = 0; i < 22; i++) {
      const angle = Math.random() * Math.PI * 2, speed = 0.6 + Math.random() * 2.2;
      particlesRef.current.push({
        id: particleIdRef.current++,
        x: cx + (Math.random() - 0.5) * 60, y: cy + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1,
        size: 1.5 + Math.random() * 2.5, opacity: 0, life: 0,
      });
    }
  }, []);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") bookRef.current?.pageFlip()?.flipNext();
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") bookRef.current?.pageFlip()?.flipPrev();
      else if (e.key === "f" || e.key === "F") toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data);
    playFlipSound();
    spawnParticles();
    window.speechSynthesis?.cancel();
    setIsReading(false);
    requestAnimationFrame(() => {
      document.querySelectorAll(".book-scroll").forEach(el => { (el as HTMLElement).scrollTop = 0; });
    });
  }, [spawnParticles]);

  const goToPrev = useCallback(() => {
    bookRef.current?.pageFlip()?.flip(Math.max(0, currentPage - 1));
  }, [currentPage]);

  const goToNext = useCallback(() => {
    bookRef.current?.pageFlip()?.flip(Math.min(totalPages - 1, currentPage + 1));
  }, [currentPage, totalPages]);

  const goToPage = useCallback((page: number) => {
    bookRef.current?.pageFlip()?.flip(page);
  }, []);

  const saveBookmark = useCallback(() => {
    localStorage.setItem(BOOKMARK_KEY, String(currentPage));
    setBookmark(currentPage);
    setBookmarkFlash(true);
    setTimeout(() => setBookmarkFlash(false), 1500);
  }, [currentPage]);

  const goToBookmark = useCallback(() => {
    if (bookmark === null) return;
    setTimeout(() => bookRef.current?.pageFlip()?.flip(bookmark), 50);
  }, [bookmark]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  }, []);

  const handleReadAloud = useCallback(() => {
    if (!window.speechSynthesis) return;
    if (isReading) { window.speechSynthesis.cancel(); setIsReading(false); return; }
    const chapter = getCurrentChapter(currentPage);
    if (!chapter) return;
    const text = lang === "hi"
      ? `अध्याय ${chapter.chapter_number}. ${chapter.name}. ${chapter.summary.hi}`
      : `Chapter ${chapter.chapter_number}. ${chapter.translation}. ${chapter.summary.en}`;
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.9; utt.lang = lang === "hi" ? "hi-IN" : "en-US";
    utt.onend = () => setIsReading(false);
    window.speechSynthesis.speak(utt);
    setIsReading(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReading, currentPage, chapters, lang]);

  const bookTotalW = dims ? (dims.isDesktop ? dims.w * 2 : dims.w) : 0;
  const fontSizeMap: Record<FontSize, string> = { sm: "0.82", md: "1", lg: "1.18" };

  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-hidden${nightMode ? " night-mode" : ""}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-40" />

      {/* ── Mobile layout ── */}
      <div className="md:hidden w-full h-full flex flex-col px-3 pt-2 pb-2" style={{ gap: 8 }}>
        <MobileSettingsSheet
          lang={lang} setLang={setLang}
          fontSize={fontSize} setFontSize={setFontSize}
          saveBookmark={saveBookmark} goToBookmark={goToBookmark}
          bookmark={bookmark} bookmarkFlash={bookmarkFlash}
          toggleFullscreen={toggleFullscreen} isFullscreen={isFullscreen}
          nightMode={nightMode} toggleNightMode={toggleNightMode}
        />
        {bookmarkFlash && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-700 text-amber-100
            text-xs font-serif px-4 py-1.5 rounded-full shadow-lg pointer-events-none animate-pulse">
            Bookmark saved ✓
          </div>
        )}
        <div ref={mobileFlipRef} className="flex-1 min-h-0 overflow-hidden" style={{ fontSize: `${fontSizeMap[fontSize]}em` }}>
          <HTMLFlipBook
            key="mobile-flipbook" ref={bookRef}
            width={300} height={435} size="stretch"
            minWidth={200} maxWidth={600} minHeight={290} maxHeight={870}
            usePortrait={true} drawShadow={true} flippingTime={600}
            startPage={0} showCover={true} mobileScrollSupport={true}
            onFlip={handlePageFlip} style={{ width: "100%", height: "100%" }} className=""
            startZIndex={0} autoSize={true} clickEventForward={false} useMouseEvents={true}
            swipeDistance={30} showPageCorners={true} disableFlipByClick={false} maxShadowOpacity={0.5}
          >
            <CoverPage />
            {chapters.flatMap((chapter) => [
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <ChapterPage key={`${chapter.chapter_number}-i`} chapter={chapter} lang={lang} pageType="intro" fontSize={fontSize} ref={null as any} />,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <ChapterPage key={`${chapter.chapter_number}-s`} chapter={chapter} lang={lang} pageType="summary" fontSize={fontSize} ref={null as any} />,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <VersesPage key={`${chapter.chapter_number}-v`} chapter={chapter} lang={lang} fontSize={fontSize} favorites={favorites} onToggleFavorite={toggleFavorite} ref={null as any} />,
            ])}
            <BackCoverPage totalChapters={chapters.length} />
          </HTMLFlipBook>
        </div>
        <div ref={controlsRef} className="shrink-0 w-full">
          <BookControls
            currentPage={currentPage} totalPages={totalPages}
            onPrev={goToPrev} onNext={goToNext} onGoToPage={goToPage}
            onReadAloud={handleReadAloud} isReading={isReading}
            chapters={chapters}
          />
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div className="hidden md:flex w-full h-full">
        {/* Sidebar */}
        <div className="shrink-0 flex flex-col items-center justify-center gap-4 py-6 px-3"
          style={{ width: 110, borderRight: "1px solid rgba(251,191,36,0.1)" }}>
          <div className="flex flex-col gap-1 w-full">
            <p className="text-amber-600/50 text-[9px] tracking-widest uppercase font-serif text-center mb-1">Lang</p>
            {(["hi", "en"] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`w-full py-1.5 rounded-full text-xs font-serif transition-all ${lang === l ? "bg-amber-700 text-amber-100 shadow" : "text-amber-500 hover:text-amber-300 border border-amber-700/30"}`}>
                {l === "hi" ? "हिंदी" : "English"}
              </button>
            ))}
          </div>
          <div className="w-8 h-px bg-amber-700/30" />
          <div className="flex flex-col gap-1 w-full">
            <p className="text-amber-600/50 text-[9px] tracking-widest uppercase font-serif text-center mb-1">Size</p>
            {(["sm", "md", "lg"] as FontSize[]).map(s => (
              <button key={s} onClick={() => setFontSize(s)}
                className={`w-full py-1.5 rounded-full text-xs font-serif transition-all ${fontSize === s ? "bg-amber-700 text-amber-100 shadow" : "text-amber-500 hover:text-amber-300 border border-amber-700/30"}`}>
                {s === "sm" ? "A·S" : s === "md" ? "A·M" : "A·L"}
              </button>
            ))}
          </div>
          <div className="w-8 h-px bg-amber-700/30" />
          <div className="flex flex-col gap-1 w-full">
            <p className="text-amber-600/50 text-[9px] tracking-widest uppercase font-serif text-center mb-1">Mark</p>
            <button onClick={saveBookmark}
              className={`w-full py-1.5 rounded-full text-sm transition-all flex items-center justify-center ${bookmarkFlash ? "bg-amber-500 text-amber-950 scale-105" : "text-amber-500 hover:text-amber-300 border border-amber-700/30"}`}
              title="Save bookmark">🔖</button>
            <button onClick={goToBookmark} disabled={bookmark === null}
              className="w-full py-1.5 rounded-full text-sm transition-all flex items-center justify-center text-amber-500 hover:text-amber-300 border border-amber-700/30 disabled:opacity-30"
              title="Go to bookmark">📌</button>
          </div>
          <div className="w-8 h-px bg-amber-700/30" />
          {/* Night mode */}
          <button onClick={toggleNightMode}
            className={`w-full py-1.5 rounded-full text-sm transition-all flex items-center justify-center border ${nightMode ? "bg-amber-950 text-amber-400 border-amber-700/50" : "text-amber-500 hover:text-amber-300 border border-amber-700/30"}`}
            title={nightMode ? "Day mode" : "Night mode"}>
            {nightMode ? "☀️" : "🌙"}
          </button>
          <div className="w-8 h-px bg-amber-700/30" />
          <button onClick={toggleFullscreen}
            className="w-full py-1.5 rounded-full flex items-center justify-center text-amber-500 hover:text-amber-300 border border-amber-700/30 transition-all"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
            {isFullscreen ? (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 1v4H1M9 1v4h4M5 13v-4H1M9 13v-4h4"/></svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9"/></svg>
            )}
          </button>
        </div>

        {/* Book + controls */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-2 overflow-hidden">
          {bookmarkFlash && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-700 text-amber-100
              text-xs font-serif px-4 py-1.5 rounded-full shadow-lg pointer-events-none animate-pulse">
              Bookmark saved ✓
            </div>
          )}
          {dims && (
            <div className="shrink-0 relative mx-auto" style={{ width: bookTotalW, height: dims.h }}>
              {/* ── Page stacks ── */}
              {(() => {
                const readRatio   = Math.max(0, Math.min(1, currentPage / (totalPages - 1)));
                const leftStrips  = currentPage === 0 ? 0 : Math.round(2 + readRatio * 12);
                const rightStrips = currentPage >= totalPages - 1 ? 0 : Math.round(2 + (1 - readRatio) * 12);
                const stripW = 1.8;

                const makeStack = (count: number, side: "left" | "right") => {
                  const isLeft = side === "left";
                  const coverW = 6;
                  const coverBg = nightMode ? "#1a0800" : "#3d1a06";
                  return (
                    <div className="absolute pointer-events-none" style={{
                      [isLeft ? "right" : "left"]: "100%",
                      top: 0, bottom: 0,
                      width: count * stripW + coverW,
                      background: coverBg,
                      boxShadow: isLeft
                        ? "-3px 0 10px rgba(0,0,0,0.5)"
                        : "3px 0 10px rgba(0,0,0,0.5)",
                      display: "flex",
                      flexDirection: isLeft ? "row" : "row-reverse",
                      alignItems: "stretch",
                    }}>
                      <div style={{ width: coverW, flexShrink: 0 }} />
                      {[...Array(count)].map((_, i) => {
                        const t = i / Math.max(count - 1, 1);
                        const curve = Math.sin(t * Math.PI);
                        const lightness = nightMode ? (18 + curve * 8) : (80 + curve * 10);
                        const saturation = nightMode ? (20 + curve * 6) : (18 + curve * 8);
                        return (
                          <div key={i} style={{
                            width: stripW,
                            flexShrink: 0,
                            background: `hsl(32, ${saturation}%, ${lightness}%)`,
                            borderLeft:  isLeft  && i > 0 ? `0.5px solid rgba(${nightMode ? "80,40,5" : "120,70,10"},0.2)` : "none",
                            borderRight: !isLeft && i > 0 ? `0.5px solid rgba(${nightMode ? "80,40,5" : "120,70,10"},0.2)` : "none",
                          }} />
                        );
                      })}
                    </div>
                  );
                };

                return (
                  <>
                    {leftStrips  > 0 && makeStack(leftStrips,  "left")}
                    {rightStrips > 0 && makeStack(rightStrips, "right")}
                  </>
                );
              })()}
              <div ref={toolbarRef} style={{ width: bookTotalW, height: dims.h, fontSize: `${fontSizeMap[fontSize]}em` }}>
              <HTMLFlipBook
                key={`${dims.w}-${dims.h}`} ref={bookRef}
                width={dims.w} height={dims.h} size="fixed"
                minWidth={dims.w} maxWidth={dims.w} minHeight={dims.h} maxHeight={dims.h}
                drawShadow={true} flippingTime={600} usePortrait={false} startPage={currentPage}
                showCover={true} mobileScrollSupport={true} onFlip={handlePageFlip}
                style={{}} className="" startZIndex={0} autoSize={false}
                clickEventForward={true} useMouseEvents={true}
                swipeDistance={20} showPageCorners={true} disableFlipByClick={false} maxShadowOpacity={0.5}
              >
                <CoverPage />
                {chapters.flatMap((chapter) => [
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  <ChapterPage key={`${chapter.chapter_number}-i`} chapter={chapter} lang={lang} pageType="intro" fontSize={fontSize} ref={null as any} />,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  <ChapterPage key={`${chapter.chapter_number}-s`} chapter={chapter} lang={lang} pageType="summary" fontSize={fontSize} ref={null as any} />,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  <VersesPage key={`${chapter.chapter_number}-v`} chapter={chapter} lang={lang} fontSize={fontSize} favorites={favorites} onToggleFavorite={toggleFavorite} ref={null as any} />,
                ])}
                <BackCoverPage totalChapters={chapters.length} />
              </HTMLFlipBook>
              </div>
            </div>
          )}
          <div ref={controlsRef} className="shrink-0 w-full max-w-2xl">
            <BookControls
              currentPage={currentPage} totalPages={totalPages}
              onPrev={goToPrev} onNext={goToNext} onGoToPage={goToPage}
              onReadAloud={handleReadAloud} isReading={isReading}
              chapters={chapters}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mobile Settings Sheet ────────────────────────────────────────────────────
interface MobileSettingsSheetProps {
  lang: Language; setLang: (l: Language) => void;
  fontSize: FontSize; setFontSize: (f: FontSize) => void;
  saveBookmark: () => void; goToBookmark: () => void;
  bookmark: number | null; bookmarkFlash: boolean;
  toggleFullscreen: () => void; isFullscreen: boolean;
  nightMode: boolean; toggleNightMode: () => void;
}

function MobileSettingsSheet({ lang, setLang, fontSize, setFontSize, saveBookmark, goToBookmark, bookmark, bookmarkFlash, toggleFullscreen, isFullscreen, nightMode, toggleNightMode }: MobileSettingsSheetProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Settings"
        className="md:hidden fixed top-4 left-4 z-40 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
        style={{ background: "rgba(120,53,15,0.92)", border: "1.5px solid rgba(251,191,36,0.4)", backdropFilter: "blur(8px)" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(251,191,36,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
      {open && <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />}
      <div className="md:hidden fixed left-0 right-0 z-50 transition-transform duration-300"
        style={{ bottom: 0, transform: open ? "translateY(0)" : "translateY(100%)", background: "linear-gradient(to top, #3b1a08, #4a2010)", borderTop: "1.5px solid rgba(251,191,36,0.25)", borderRadius: "20px 20px 0 0", padding: "20px 24px 36px" }}>
        <div className="w-10 h-1 rounded-full bg-amber-700/60 mx-auto mb-5" />
        <p className="text-amber-500/60 text-[10px] tracking-widest uppercase font-serif mb-2">भाषा / Language</p>
        <div className="flex gap-2 mb-5">
          {(["hi", "en"] as const).map(l => (
            <button key={l} onClick={() => setLang(l)}
              className={`flex-1 py-2 rounded-full text-sm font-serif transition-all ${lang === l ? "bg-amber-700 text-amber-100 shadow" : "bg-amber-900/60 text-amber-500 border border-amber-700/40"}`}>
              {l === "hi" ? "हिंदी" : "English"}
            </button>
          ))}
        </div>
        <p className="text-amber-500/60 text-[10px] tracking-widest uppercase font-serif mb-2">Font Size</p>
        <div className="flex gap-2 mb-5">
          {(["sm", "md", "lg"] as FontSize[]).map(s => (
            <button key={s} onClick={() => setFontSize(s)}
              className={`flex-1 py-2 rounded-full text-sm font-serif transition-all ${fontSize === s ? "bg-amber-700 text-amber-100 shadow" : "bg-amber-900/60 text-amber-500 border border-amber-700/40"}`}>
              {s === "sm" ? "A" : s === "md" ? "A" : "A"}<span className="ml-1 text-[10px] opacity-60">{s.toUpperCase()}</span>
            </button>
          ))}
        </div>
        <p className="text-amber-500/60 text-[10px] tracking-widest uppercase font-serif mb-2">Actions</p>
        <div className="flex gap-2">
          <button onClick={() => { saveBookmark(); setOpen(false); }}
            className={`flex-1 py-2.5 rounded-full text-sm font-serif flex items-center justify-center gap-1.5 transition-all ${bookmarkFlash ? "bg-amber-500 text-amber-950" : "bg-amber-900/60 text-amber-400 border border-amber-700/40"}`}>
            🔖 <span>Save</span>
          </button>
          <button onClick={() => { goToBookmark(); setOpen(false); }} disabled={bookmark === null}
            className="flex-1 py-2.5 rounded-full text-sm font-serif flex items-center justify-center gap-1.5 bg-amber-900/60 text-amber-400 border border-amber-700/40 disabled:opacity-30">
            📌 <span>Go to</span>
          </button>
          <button onClick={() => { toggleFullscreen(); setOpen(false); }}
            className="flex-1 py-2.5 rounded-full text-sm font-serif flex items-center justify-center gap-1.5 bg-amber-900/60 text-amber-400 border border-amber-700/40">
            {isFullscreen ? "⊡" : "⛶"} <span>{isFullscreen ? "Exit" : "Full"}</span>
          </button>
          <button onClick={() => { toggleNightMode(); }}
            className={`flex-1 py-2.5 rounded-full text-sm font-serif flex items-center justify-center gap-1.5 border border-amber-700/40 transition-all ${nightMode ? "bg-amber-950 text-amber-400" : "bg-amber-900/60 text-amber-400"}`}>
            {nightMode ? "☀️" : "🌙"} <span>{nightMode ? "Day" : "Night"}</span>
          </button>
        </div>
      </div>
    </>
  );
}
