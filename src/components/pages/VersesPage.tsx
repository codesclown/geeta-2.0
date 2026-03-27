/**
 * components/pages/VersesPage.tsx
 * ─────────────────────────────────────────────────────────────
 * हर chapter का तीसरा page — श्लोक (verses) दिखाता है।
 *
 * कैसे काम करता है:
 * - Component mount होने पर उस chapter के सभी श्लोक fetch होते हैं
 * - एक बार में एक श्लोक दिखता है (idx state से control)
 * - Prev/Next buttons से navigate करो
 * - Dot indicators से directly किसी श्लोक पर jump करो
 *
 * Features:
 * - ❤️ Favorite button — localStorage में save होता है
 * - ⎘ Copy button — Sanskrit + translation clipboard में copy
 * - Transliteration toggle — Roman script दिखाओ/छुपाओ
 * - Error state + Retry button
 *
 * Mobile touch fix:
 * - ref callback से native DOM level पर touchstart/touchend
 *   stopPropagation होता है (capture: true)
 * - इससे react-pageflip को touch events नहीं मिलते
 * - disableFlipByClick={true} से click पर flip नहीं होता
 */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Chapter, Slok, PREFERRED_AUTHORS } from "@/types";
import { fetchChapterSloks } from "@/lib/api";
import { Language, FontSize } from "@/components/BookViewer";

interface VersesPageProps {
  chapter: Chapter;
  lang: Language;
  fontSize: FontSize;
  favorites: string[];
  onToggleFavorite: (key: string) => void;
}

const fontScaleMap: Record<FontSize, number> = { sm: 0.82, md: 1, lg: 1.18 };

function getTranslation(slok: Slok, lang: Language): string {
  if (lang === "hi") {
    for (const k of PREFERRED_AUTHORS) {
      const e = slok[k] as { ht?: string } | undefined;
      if (e?.ht) return e.ht;
    }
  }
  for (const k of PREFERRED_AUTHORS) {
    const e = slok[k] as { et?: string } | undefined;
    if (e?.et) return e.et;
  }
  return "";
}

const VersesPage = React.forwardRef<HTMLDivElement, VersesPageProps>(
  ({ chapter, lang, fontSize, favorites, onToggleFavorite }, ref) => {
    const isHindi = lang === "hi";
    const scale = fontScaleMap[fontSize];

    const [sloks, setSloks] = useState<Slok[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [idx, setIdx] = useState(0);
    const [showTranslit, setShowTranslit] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
      let cancelled = false;
      setLoading(true);
      setError(false);
      setIdx(0);
      fetchChapterSloks(chapter.chapter_number, chapter.verses_count)
        .then(data => { if (!cancelled) { setSloks(data); setLoading(false); } })
        .catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
      return () => { cancelled = true; };
    }, [chapter.chapter_number, chapter.verses_count]);

    const prev = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setIdx(i => Math.max(0, i - 1));
      setShowTranslit(false);
    }, []);

    const next = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setIdx(i => Math.min(sloks.length - 1, i + 1));
      setShowTranslit(false);
    }, [sloks.length]);

    const slok = sloks[idx];
    const translation = slok ? getTranslation(slok, lang) : "";
    const favKey = `${chapter.chapter_number}-${idx + 1}`;
    const isFav = favorites.includes(favKey);

    const handleShare = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      if (!slok) return;
      const text = `${slok.slok}\n\n${translation}\n\n— Bhagavad Gita ${chapter.chapter_number}.${idx + 1}`;
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }).catch(() => {});
    }, [slok, translation, chapter.chapter_number, idx]);

    return (
      <div ref={ref} className="book-page w-full h-full flex flex-col" style={{ overflow: "hidden" }}>
        {/* Header */}
        <div className="shrink-0 px-4 pt-2 pb-1.5 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(120,70,10,0.22)" }}>
          <span className="text-amber-800 text-[9px] font-serif tracking-[0.18em] uppercase">Bhagavad Gita</span>
          <span className="text-amber-800 text-[9px] font-serif tracking-[0.18em] uppercase">
            {isHindi ? "अध्याय" : "Ch."} {chapter.chapter_number}
          </span>
        </div>

        <div className="flex-1 flex flex-col px-4 py-2.5" style={{ minHeight: 0, gap: 8 }}>
          {/* Section label */}
          <div className="shrink-0 flex items-center gap-2"
            ref={el => {
              if (!el) return;
              const stop = (e: TouchEvent) => { e.stopPropagation(); };
              el.addEventListener("touchstart", stop, { capture: true, passive: false });
              el.addEventListener("touchend", stop, { capture: true, passive: false });
            }}
          >
            <div className="h-3 w-0.5 rounded-full bg-amber-700" />
            <p className="text-amber-700 text-[9px] uppercase tracking-[0.2em] font-serif">
              {isHindi ? "श्लोक" : "Verses"}
            </p>
            {sloks.length > 0 && (
              <span className="text-amber-500/60 text-[9px] font-serif">
                {idx + 1} / {sloks.length}
              </span>
            )}
            <div className="ml-auto flex items-center gap-1.5">
              {slok && (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); onToggleFavorite(favKey); }}
                    onTouchStart={e => e.stopPropagation()}
                    onTouchEnd={e => e.preventDefault()}
                    title={isFav ? "Remove favorite" : "Add to favorites"}
                    className="text-[13px] transition-transform active:scale-90"
                    style={{ opacity: isFav ? 1 : 0.35 }}>
                    ❤️
                  </button>
                  <button
                    onClick={handleShare}
                    onTouchStart={e => e.stopPropagation()}
                    onTouchEnd={e => e.preventDefault()}
                    title="Copy verse"
                    className="text-[11px] font-serif text-amber-600/50 hover:text-amber-500 transition-colors px-1 py-0.5 rounded border border-amber-700/20 hover:border-amber-600/40">
                    {copied ? "✓" : "⎘"}
                  </button>
                </>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="devanagari text-amber-500/60 text-2xl animate-pulse">ॐ</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <p className="text-amber-500/50 text-xs font-serif text-center">
                {isHindi ? "श्लोक लोड नहीं हो सके" : "Could not load verses"}
              </p>
              <button
                onClick={e => { e.stopPropagation(); setError(false); setLoading(true);
                  fetchChapterSloks(chapter.chapter_number, chapter.verses_count)
                    .then(data => { setSloks(data); setLoading(false); })
                    .catch(() => { setError(true); setLoading(false); });
                }}
                className="px-3 py-1 rounded-full text-[10px] font-serif text-amber-700 border border-amber-700/30 hover:bg-amber-800/10 transition-all">
                {isHindi ? "पुनः प्रयास" : "Retry"}
              </button>
            </div>
          ) : !slok ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-amber-500/50 text-xs font-serif">No verses available</p>
            </div>
          ) : (
            <>
              {/* Sanskrit shlok */}
              <div className="shrink-0 rounded-xl px-3 py-2.5"
                style={{ background: "rgba(120,60,10,0.10)", border: "1px solid rgba(251,191,36,0.12)" }}>
                <p className="devanagari text-amber-900 text-center leading-relaxed"
                  style={{ fontSize: 13 * scale }}>
                  {slok.slok}
                </p>
              </div>

              {/* Transliteration toggle */}
              <div className="shrink-0"
                ref={el => {
                  if (!el) return;
                  const stop = (e: TouchEvent) => { e.stopPropagation(); };
                  el.addEventListener("touchstart", stop, { capture: true, passive: false });
                  el.addEventListener("touchend", stop, { capture: true, passive: false });
                }}
              >
                <button
                  onClick={e => { e.stopPropagation(); setShowTranslit(v => !v); }}
                  onTouchStart={e => e.stopPropagation()}
                  onTouchEnd={e => e.preventDefault()}
                  className="text-amber-600/50 text-[9px] font-serif tracking-wider hover:text-amber-500 transition-colors">
                  {showTranslit ? "▲ " : "▼ "}{isHindi ? "लिप्यंतरण" : "Transliteration"}
                </button>
                {showTranslit && (
                  <p className="font-serif text-amber-700/70 italic mt-1"
                    style={{ fontSize: 10 * scale, lineHeight: 1.6 }}>
                    {slok.transliteration}
                  </p>
                )}
              </div>

              {/* Translation */}
              <div className="flex-1 book-scroll" style={{ minHeight: 0, overflowY: "auto", overscrollBehavior: "contain" }}>
                <p className={`${isHindi ? "devanagari" : "font-serif"} text-amber-950/90 text-justify leading-relaxed`}
                  style={{ fontSize: 11.5 * scale, lineHeight: 1.75 }}>
                  {translation || <span className="text-amber-500/40 italic">Translation not available</span>}
                </p>
              </div>

              {/* Navigation */}
              <div className="shrink-0 flex items-center justify-between pt-1.5"
                style={{ borderTop: "1px solid rgba(120,70,10,0.18)" }}
                ref={el => {
                  if (!el) return;
                  const stop = (e: TouchEvent) => { e.stopPropagation(); };
                  el.addEventListener("touchstart", stop, { capture: true, passive: false });
                  el.addEventListener("touchend", stop, { capture: true, passive: false });
                  el.addEventListener("touchmove", stop, { capture: true, passive: false });
                }}
              >
                <button onClick={prev} disabled={idx === 0}
                  onTouchStart={e => e.stopPropagation()}
                  onTouchEnd={e => e.preventDefault()}
                  className="px-3 py-1 rounded-full text-[10px] font-serif text-amber-700 border border-amber-700/30
                    hover:bg-amber-800/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all">
                  ‹ {isHindi ? "पूर्व" : "Prev"}
                </button>

                {/* Dot indicators */}
                <div className="flex gap-1 items-center overflow-hidden" style={{ maxWidth: 100 }}>
                  {sloks.slice(Math.max(0, idx - 4), Math.min(sloks.length, idx + 5)).map((_, i) => {
                    const realIdx = Math.max(0, idx - 4) + i;
                    return (
                      <button key={realIdx}
                        onClick={e => { e.stopPropagation(); setIdx(realIdx); setShowTranslit(false); }}
                        onTouchStart={e => e.stopPropagation()}
                        onTouchEnd={e => e.preventDefault()}
                        className={`rounded-full transition-all shrink-0 ${
                          realIdx === idx ? "bg-amber-600 w-1.5 h-1.5" : "bg-amber-700/30 w-1 h-1 hover:bg-amber-600/50"
                        }`} />
                    );
                  })}
                </div>

                <button onClick={next} disabled={idx === sloks.length - 1}
                  onTouchStart={e => e.stopPropagation()}
                  onTouchEnd={e => e.preventDefault()}
                  className="px-3 py-1 rounded-full text-[10px] font-serif text-amber-700 border border-amber-700/30
                    hover:bg-amber-800/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all">
                  {isHindi ? "अगला" : "Next"} ›
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-1.5 flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(120,70,10,0.22)" }}>
          <div className="h-px w-6 bg-amber-700/30" />
          <span className="text-amber-800 text-[9px] font-serif">{chapter.chapter_number}c</span>
          <div className="h-px w-6 bg-amber-700/30" />
        </div>
      </div>
    );
  }
);
VersesPage.displayName = "VersesPage";
export default VersesPage;
