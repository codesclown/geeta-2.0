"use client";

import { useState, useEffect, useCallback } from "react";
import { Chapter, Slok, PREFERRED_AUTHORS } from "@/types";
import { fetchChapterSloks } from "@/lib/api";
import { Language, FontSize } from "@/components/BookViewer";

interface VersesDrawerProps {
  chapter: Chapter | null;
  lang: Language;
  fontSize: FontSize;
  onClose: () => void;
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

// Inner component — only mounts when chapter is set, so state resets naturally
function DrawerContent({ chapter, lang, fontSize, onClose }: {
  chapter: Chapter; lang: Language; fontSize: FontSize; onClose: () => void;
}) {
  const isHindi = lang === "hi";
  const scale = fontScaleMap[fontSize];

  const [sloks, setSloks] = useState<Slok[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [showTranslit, setShowTranslit] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchChapterSloks(chapter.chapter_number, chapter.verses_count)
      .then(data => { if (!cancelled) { setSloks(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [chapter.chapter_number, chapter.verses_count]);

  const prev = useCallback(() => setIdx(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIdx(i => Math.min(sloks.length - 1, i + 1)), [sloks.length]);
  const toggleTranslit = useCallback(() => setShowTranslit(v => !v), []);
  const goTo = useCallback((i: number) => setIdx(i), []);

  const slok = sloks[idx];
  const translation = slok ? getTranslation(slok, lang) : "";

  return (
    <div className="flex flex-col h-full">
      {/* Drawer header */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid rgba(251,191,36,0.15)" }}>
        <div>
          <p className="text-amber-500/60 text-[9px] tracking-widest uppercase font-serif">
            {isHindi ? "अध्याय" : "Chapter"} {chapter.chapter_number}
          </p>
          <p className="devanagari text-amber-200 text-base leading-tight">{chapter.name}</p>
        </div>
        <div className="flex items-center gap-3">
          {sloks.length > 0 && (
            <span className="text-amber-500/60 text-xs font-serif">{idx + 1} / {sloks.length}</span>
          )}
          <button onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-amber-500 hover:text-amber-200 hover:bg-amber-800/60 transition-all"
            aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M1 1l10 10M11 1L1 11"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-5 py-3 overflow-hidden" style={{ minHeight: 0, gap: 10 }}>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="devanagari text-amber-500/60 text-2xl animate-pulse">ॐ</p>
          </div>
        ) : !slok ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-amber-500/50 text-sm font-serif">No verses available</p>
          </div>
        ) : (
          <>
            {/* Sanskrit shlok */}
            <div className="shrink-0 rounded-xl px-4 py-3"
              style={{ background: "rgba(120,60,10,0.12)", border: "1px solid rgba(251,191,36,0.12)" }}>
              <p className="devanagari text-amber-100 text-center leading-relaxed"
                style={{ fontSize: 15 * scale }}>
                {slok.slok}
              </p>
            </div>

            {/* Transliteration toggle */}
            <div className="shrink-0">
              <button onClick={toggleTranslit}
                className="text-amber-500/50 text-[10px] font-serif tracking-wider hover:text-amber-400 transition-colors">
                {showTranslit ? "▲ " : "▼ "}{isHindi ? "लिप्यंतरण" : "Transliteration"}
              </button>
              {showTranslit && (
                <p className="font-serif text-amber-400/70 italic mt-1.5"
                  style={{ fontSize: 11 * scale, lineHeight: 1.6 }}>
                  {slok.transliteration}
                </p>
              )}
            </div>

            {/* Translation */}
            <div className="flex-1 book-scroll" style={{ minHeight: 0, overflowY: "auto" }}>
              <p className={`${isHindi ? "devanagari" : "font-serif"} text-amber-100/90 leading-relaxed`}
                style={{ fontSize: 13 * scale, lineHeight: 1.8 }}>
                {translation || <span className="text-amber-500/40 italic">Translation not available</span>}
              </p>
            </div>

            {/* Verse navigation */}
            <div className="shrink-0 flex items-center justify-between pt-2"
              style={{ borderTop: "1px solid rgba(251,191,36,0.1)" }}>
              <button onClick={prev} disabled={idx === 0}
                className="px-4 py-1.5 rounded-full text-xs font-serif text-amber-400 border border-amber-700/40
                  hover:bg-amber-800/40 disabled:opacity-25 disabled:cursor-not-allowed transition-all">
                ‹ {isHindi ? "पूर्व" : "Prev"}
              </button>

              {/* Dot indicators */}
              <div className="flex gap-1.5 items-center overflow-hidden" style={{ maxWidth: 140 }}>
                {sloks.slice(Math.max(0, idx - 5), Math.min(sloks.length, idx + 6)).map((_, i) => {
                  const realIdx = Math.max(0, idx - 5) + i;
                  return (
                    <button key={realIdx} onClick={() => goTo(realIdx)}
                      className={`rounded-full transition-all shrink-0 ${
                        realIdx === idx ? "bg-amber-500 w-2 h-2" : "bg-amber-700/40 w-1.5 h-1.5 hover:bg-amber-600/60"
                      }`} />
                  );
                })}
              </div>

              <button onClick={next} disabled={idx === sloks.length - 1}
                className="px-4 py-1.5 rounded-full text-xs font-serif text-amber-400 border border-amber-700/40
                  hover:bg-amber-800/40 disabled:opacity-25 disabled:cursor-not-allowed transition-all">
                {isHindi ? "अगला" : "Next"} ›
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VersesDrawer({ chapter, lang, fontSize, onClose }: VersesDrawerProps) {
  const isOpen = chapter !== null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[1px]"
          onClick={onClose} />
      )}

      {/* Drawer panel — slides up from bottom */}
      <div
        className="absolute left-0 right-0 bottom-0 z-30 transition-transform duration-300 ease-out"
        style={{
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
          height: "65%",
          background: "linear-gradient(to top, #1a0800, #2d1005)",
          borderTop: "1.5px solid rgba(251,191,36,0.2)",
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full bg-amber-700/50 mx-auto mt-3 mb-0" />

        {isOpen && chapter && (
          <DrawerContent
            key={chapter.chapter_number}
            chapter={chapter}
            lang={lang}
            fontSize={fontSize}
            onClose={onClose}
          />
        )}
      </div>
    </>
  );
}
