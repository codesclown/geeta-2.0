/**
 * components/BookControls.tsx
 * ─────────────────────────────────────────────────────────────
 * Book के नीचे दिखने वाला control bar।
 *
 * इसमें होता है:
 * 1. ‹ › navigation buttons (desktop only)
 * 2. Progress bar + current page label
 * 3. Chapter jump dropdown (select से directly किसी chapter पर जाएं)
 * 4. 🔊 Listen button (Text-to-Speech)
 *
 * Hydration mismatch से बचने के लिए:
 * - mounted state use होती है
 * - SSR में सब disabled/default दिखता है
 * - client mount के बाद actual values दिखती हैं
 */

"use client";

import { useSyncExternalStore } from "react";
import { Chapter } from "@/types";

interface BookControlsProps {
  currentPage: number;              // अभी कौन सा page दिख रहा है (0-indexed)
  totalPages: number;               // कुल pages (18*3 + 2 = 56)
  onPrev: () => void;               // पिछला page
  onNext: () => void;               // अगला page
  onGoToPage: (page: number) => void; // किसी specific page पर jump
  onReadAloud: () => void;          // TTS start/stop
  isReading: boolean;               // TTS चल रही है?
  chapters: Chapter[];              // dropdown के लिए chapter list
}

export default function BookControls({
  currentPage, totalPages, onPrev, onNext, onGoToPage,
  onReadAloud, isReading, chapters,
}: BookControlsProps) {
  // useSyncExternalStore: SSR में false, client mount के बाद true
  // यह hydration-safe mounted pattern है — useEffect+setState से बेहतर
  const mounted = useSyncExternalStore(
    () => () => {},           // subscribe: कोई external store नहीं
    () => true,               // getSnapshot (client): mounted = true
    () => false               // getServerSnapshot (SSR): mounted = false
  );

  const isFirst = mounted && currentPage === 0;              // पहले page पर हैं?
  const isLast  = mounted && currentPage >= totalPages - 1;  // आखिरी page पर हैं?

  // ── Current page का label ──────────────────────────────────
  // हर chapter के 3 pages हैं: intro, summary, verses
  // Math.ceil(currentPage / 3) से chapter number निकलता है
  const pageLabel = !mounted ? "Bhagavad Gita"
    : currentPage === 0            ? "Cover"
    : currentPage === totalPages-1 ? "Back Cover"
    : `Chapter ${Math.ceil(currentPage / 3)} of 18`;

  // ── Progress bar percentage ────────────────────────────────
  const progress = mounted ? (currentPage / (totalPages - 1)) * 100 : 0;

  return (
    <div className="w-full flex flex-col gap-3">

      {/* ── Row 1: ‹ progress bar › ── */}
      <div className="flex items-center gap-3">
        {/* Previous button — desktop only (md:flex) */}
        <button onClick={onPrev} disabled={isFirst} aria-label="Previous page" suppressHydrationWarning
          className="w-10 h-10 rounded-full bg-amber-800 text-amber-100 hidden md:flex items-center justify-center
            hover:bg-amber-700 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed transition-all shadow-md text-xl font-serif">
          ‹
        </button>

        {/* Page label + progress bar */}
        <div className="flex-1 flex flex-col gap-1.5">
          <p className="text-amber-300 text-xs font-serif text-center" suppressHydrationWarning>
            {pageLabel}
          </p>
          <div className="h-1 rounded-full bg-amber-900/60 overflow-hidden">
            {/* width transition से smooth progress animation */}
            <div className="h-full rounded-full bg-amber-500 transition-all duration-300"
              style={{ width: `${progress}%` }} suppressHydrationWarning />
          </div>
        </div>

        {/* Next button — desktop only */}
        <button onClick={onNext} disabled={isLast} aria-label="Next page" suppressHydrationWarning
          className="w-10 h-10 rounded-full bg-amber-800 text-amber-100 hidden md:flex items-center justify-center
            hover:bg-amber-700 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed transition-all shadow-md text-xl font-serif">
          ›
        </button>
      </div>

      {/* ── Row 2: Chapter dropdown + TTS button ── */}
      <div className="flex items-center gap-2">

        {/* Chapter jump dropdown */}
        {/* value = उस chapter के intro page का index (i*3+1) */}
        <select onChange={(e) => onGoToPage(Number(e.target.value))}
          value={mounted ? currentPage : 0} aria-label="Jump to chapter" suppressHydrationWarning
          className="flex-1 bg-amber-900 text-amber-200 border border-amber-700/60 rounded-lg
            px-3 py-2 text-xs font-serif focus:outline-none focus:ring-1 focus:ring-amber-600 cursor-pointer">
          <option value={0}>📖 Cover</option>
          {chapters.map((ch, i) => (
            <option key={ch.chapter_number} value={i * 3 + 1}>
              {ch.chapter_number}. {ch.translation}
            </option>
          ))}
          <option value={chapters.length * 3 + 1}>📕 Back Cover</option>
        </select>

        {/* Text-to-Speech button */}
        {/* isReading=true पर red "Stop" दिखता है */}
        <button onClick={onReadAloud} aria-label={isReading ? "Stop reading" : "Read aloud"} suppressHydrationWarning
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-serif
            border transition-all shadow-sm active:scale-95
            ${isReading
              ? "bg-red-900 border-red-700/60 text-red-200 hover:bg-red-800"
              : "bg-amber-800 border-amber-700/60 text-amber-200 hover:bg-amber-700"}`}>
          {isReading
            ? <><span className="animate-pulse">⏹</span> Stop</>
            : <><span>🔊</span> Listen</>}
        </button>
      </div>
    </div>
  );
}
