"use client";

/**
 * BookControls — clean navigation bar below the flipbook.
 * Uses suppressHydrationWarning on interactive elements to prevent
 * SSR/client mismatch on disabled state and dynamic classNames.
 */

import { useState, useEffect } from "react";
import { Chapter } from "@/types";

interface BookControlsProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onGoToPage: (page: number) => void;
  onReadAloud: () => void;
  isReading: boolean;
  chapters: Chapter[];
  isMobile: boolean;
}

export default function BookControls({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onGoToPage,
  onReadAloud,
  isReading,
  chapters,
}: BookControlsProps) {
  // Avoid hydration mismatch — only render interactive state after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isFirst = mounted && currentPage === 0;
  const isLast = mounted && currentPage >= totalPages - 1;

  const pageLabel = !mounted
    ? "Bhagavad Gita"
    : currentPage === 0
    ? "Cover"
    : currentPage === totalPages - 1
    ? "Back Cover"
    : `Chapter ${Math.ceil(currentPage / 3)} of 18`;

  const progress = mounted ? (currentPage / (totalPages - 1)) * 100 : 0;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* ── Navigation row ── */}
      <div className="flex items-center gap-3">
        {/* Prev */}
        <button
          onClick={onPrev}
          disabled={isFirst}
          aria-label="Previous page"
          suppressHydrationWarning
          className="w-10 h-10 rounded-full bg-amber-800 text-amber-100 hidden md:flex items-center justify-center
                     hover:bg-amber-700 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed
                     transition-all shadow-md text-xl font-serif"
        >
          ‹
        </button>

        {/* Progress bar + label */}
        <div className="flex-1 flex flex-col gap-1.5">
          <p className="text-amber-300 text-xs font-serif text-center" suppressHydrationWarning>
            {pageLabel}
          </p>
          <div className="h-1 rounded-full bg-amber-900/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
              suppressHydrationWarning
            />
          </div>
        </div>

        {/* Next */}
        <button
          onClick={onNext}
          disabled={isLast}
          aria-label="Next page"
          suppressHydrationWarning
          className="w-10 h-10 rounded-full bg-amber-800 text-amber-100 hidden md:flex items-center justify-center
                     hover:bg-amber-700 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed
                     transition-all shadow-md text-xl font-serif"
        >
          ›
        </button>
      </div>

      {/* ── Chapter select + TTS ── */}
      <div className="flex items-center gap-2">
        <select
          onChange={(e) => onGoToPage(Number(e.target.value))}
          value={mounted ? currentPage : 0}
          aria-label="Jump to chapter"
          suppressHydrationWarning
          className="flex-1 bg-amber-900 text-amber-200 border border-amber-700/60 rounded-lg
                     px-3 py-2 text-xs font-serif focus:outline-none focus:ring-1 focus:ring-amber-600
                     cursor-pointer"
        >
          <option value={0}>📖 Cover</option>
          {chapters.map((ch, i) => (
            <option key={ch.chapter_number} value={i * 3 + 1}>
              {ch.chapter_number}. {ch.translation}
            </option>
          ))}
          <option value={chapters.length * 3 + 1}>📕 Back Cover</option>
        </select>

        {/* TTS */}
        <button
          onClick={onReadAloud}
          aria-label={isReading ? "Stop reading" : "Read aloud"}
          suppressHydrationWarning
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-serif
                      border transition-all shadow-sm active:scale-95
                      ${isReading
                        ? "bg-red-900 border-red-700/60 text-red-200 hover:bg-red-800"
                        : "bg-amber-800 border-amber-700/60 text-amber-200 hover:bg-amber-700"
                      }`}
        >
          {isReading ? (
            <><span className="animate-pulse">⏹</span> Stop</>
          ) : (
            <><span>🔊</span> Listen</>
          )}
        </button>
      </div>
    </div>
  );
}
