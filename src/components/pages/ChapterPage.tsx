import React, { useState, useEffect, useCallback } from "react";
import { Chapter, Slok, PREFERRED_AUTHORS } from "@/types";
import { Language, FontSize } from "@/components/BookViewer";
import { fetchSlok, fetchChapterSloks } from "@/lib/api";

interface ChapterPageProps {
  chapter: Chapter;
  lang: Language;
  pageType: "intro" | "summary" | "verses";
  fontSize?: FontSize;
}

const fontScaleMap: Record<FontSize, number> = { sm: 0.82, md: 1, lg: 1.18 };

// Pick best translation text for a slok given language
function getTranslation(slok: Slok, lang: Language): string {
  if (lang === "hi") {
    for (const key of PREFERRED_AUTHORS) {
      const entry = slok[key] as { ht?: string; et?: string } | undefined;
      if (entry?.ht) return entry.ht;
    }
    // fallback to English
    for (const key of PREFERRED_AUTHORS) {
      const entry = slok[key] as { et?: string } | undefined;
      if (entry?.et) return entry.et;
    }
  } else {
    for (const key of PREFERRED_AUTHORS) {
      const entry = slok[key] as { et?: string } | undefined;
      if (entry?.et) return entry.et;
    }
  }
  return "";
}

// ── Intro page (chapter overview) ──────────────────────────────────────────
const IntroPage = React.forwardRef<HTMLDivElement, {
  chapter: Chapter; lang: Language; fontSize: FontSize;
}>(({ chapter, lang, fontSize }, ref) => {
  const isHindi = lang === "hi";
  const scale = fontScaleMap[fontSize];

  return (
    <div ref={ref} className="book-page w-full h-full flex flex-col" style={{ overflow: "hidden" }}>
      {/* Running header */}
      <div className="shrink-0 px-4 pt-2 pb-1.5 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(120,70,10,0.22)" }}>
        <span className="text-amber-800 text-[9px] font-serif tracking-[0.18em] uppercase">Bhagavad Gita</span>
        <span className="text-amber-800 text-[9px] font-serif tracking-[0.18em] uppercase">
          {isHindi ? "अध्याय" : "Ch."} {chapter.chapter_number}
        </span>
      </div>

      <div className="flex-1 flex flex-col px-5 py-3" style={{ minHeight: 0 }}>
        <p className="text-amber-700 text-[9px] font-serif tracking-[0.28em] uppercase text-center mb-2">
          {isHindi ? "अध्याय" : "Chapter"} {chapter.chapter_number}
        </p>

        {/* Sanskrit name */}
        <h2 className="devanagari text-amber-900 text-[22px] leading-tight text-center mb-1.5">
          {chapter.name}
        </h2>

        {/* Transliteration */}
        <p className="font-serif text-amber-800/80 text-sm italic text-center mb-0.5">
          {chapter.transliteration}
        </p>

        {/* English name */}
        <p className="font-serif text-amber-700/70 text-xs text-center mb-3">
          {chapter.translation}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-px bg-amber-600/35" />
          <span className="text-amber-700 text-[10px]">✦ ✦ ✦</span>
          <div className="flex-1 h-px bg-amber-600/35" />
        </div>

        {/* Meaning */}
        <p className="font-serif text-amber-800 text-sm text-center italic leading-snug mb-3 px-2">
          &ldquo;{isHindi ? chapter.meaning.hi : chapter.meaning.en}&rdquo;
        </p>

        {/* Verse count */}
        <div className="flex justify-center mb-4">
          <div className="px-5 py-1.5 rounded-full border border-amber-700/30"
            style={{ background: "rgba(120,60,10,0.07)" }}>
            <p className="text-amber-700 text-xs font-serif">
              {chapter.verses_count} {isHindi ? "श्लोक" : "Verses"}
            </p>
          </div>
        </div>

        {/* Summary preview */}
        <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          <p className={`${isHindi ? "devanagari" : "font-serif"} text-amber-900/70 text-justify`}
            style={{
              fontSize: 12 * scale,
              lineHeight: 1.7,
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
            {isHindi ? chapter.summary.hi : chapter.summary.en}
          </p>
        </div>

        <p className="text-amber-600/50 text-[9px] font-serif text-center mt-2 tracking-wider shrink-0">
          {isHindi ? "आगे पढ़ें →" : "Continue →"}
        </p>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-5 py-1.5 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(120,70,10,0.22)" }}>
        <div className="h-px w-6 bg-amber-700/30" />
        <span className="text-amber-800 text-[9px] font-serif">{chapter.chapter_number}a</span>
        <div className="h-px w-6 bg-amber-700/30" />
      </div>
    </div>
  );
});
IntroPage.displayName = "IntroPage";

// ── Summary page ────────────────────────────────────────────────────────────
const SummaryPage = React.forwardRef<HTMLDivElement, {
  chapter: Chapter; lang: Language; fontSize: FontSize;
}>(({ chapter, lang, fontSize }, ref) => {
  const isHindi = lang === "hi";
  const scale = fontScaleMap[fontSize];
  const clampLines = fontSize === "lg" ? 17 : fontSize === "sm" ? 26 : 22;

  return (
    <div ref={ref} className="book-page w-full h-full flex flex-col" style={{ overflow: "hidden" }}>
      <div className="shrink-0 px-4 pt-2 pb-1.5 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(120,70,10,0.22)" }}>
        <span className="text-amber-800 text-[9px] font-serif tracking-[0.18em] uppercase">Bhagavad Gita</span>
        <span className="text-amber-800 text-[9px] font-serif tracking-[0.18em] uppercase">
          {isHindi ? "अध्याय" : "Ch."} {chapter.chapter_number}
        </span>
      </div>

      <div className="flex-1 flex flex-col px-5 py-3" style={{ minHeight: 0 }}>
        <div className="flex items-center gap-2 mb-2.5 shrink-0">
          <div className="h-3 w-0.5 rounded-full bg-amber-700" />
          <p className="text-amber-700 text-[9px] uppercase tracking-[0.2em] font-serif">
            {isHindi ? "सारांश" : "Summary"}
          </p>
        </div>

        <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          <p className={`${isHindi ? "devanagari" : "font-serif"} text-amber-950 text-justify`}
            style={{
              fontSize: 12.5 * scale,
              lineHeight: 1.78,
              display: "-webkit-box",
              WebkitLineClamp: clampLines,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
            {isHindi ? chapter.summary.hi : chapter.summary.en}
          </p>
        </div>
      </div>

      <div className="shrink-0 px-5 py-1.5 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(120,70,10,0.22)" }}>
        <div className="h-px w-6 bg-amber-700/30" />
        <span className="text-amber-800 text-[9px] font-serif">{chapter.chapter_number}b</span>
        <div className="h-px w-6 bg-amber-700/30" />
      </div>
    </div>
  );
});
SummaryPage.displayName = "SummaryPage";

// ── Verses page (interactive shlok viewer) ──────────────────────────────────
const VersesPage = React.forwardRef<HTMLDivElement, {
  chapter: Chapter; lang: Language; fontSize: FontSize;
}>(({ chapter, lang, fontSize }, ref) => {
  const isHindi = lang === "hi";
  const scale = fontScaleMap[fontSize];
  const [sloks, setSloks] = useState<Slok[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showTranslit, setShowTranslit] = useState(false);

  useEffect(() => {
    setLoading(true);
    setCurrentIdx(0);
    fetchChapterSloks(chapter.chapter_number, chapter.verses_count)
      .then(data => { setSloks(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [chapter.chapter_number, chapter.verses_count]);

  const slok = sloks[currentIdx];
  const translation = slok ? getTranslation(slok, lang) : "";

  const prev = useCallback(() => setCurrentIdx(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setCurrentIdx(i => Math.min(sloks.length - 1, i + 1)), [sloks.length]);

  return (
    <div ref={ref} className="book-page w-full h-full flex flex-col" style={{ overflow: "hidden" }}>
      {/* Running header */}
      <div className="shrink-0 px-4 pt-2 pb-1.5 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(120,70,10,0.22)" }}>
        <span className="text-amber-800 text-[9px] font-serif tracking-[0.18em] uppercase">Bhagavad Gita</span>
        <span className="text-amber-800 text-[9px] font-serif tracking-[0.18em] uppercase">
          {isHindi ? "अध्याय" : "Ch."} {chapter.chapter_number}
        </span>
      </div>

      <div className="flex-1 flex flex-col px-4 py-2" style={{ minHeight: 0, gap: 6 }}>
        {/* Verse nav header */}
        <div className="shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-0.5 rounded-full bg-amber-700" />
            <p className="text-amber-700 text-[9px] uppercase tracking-[0.2em] font-serif">
              {isHindi ? "श्लोक" : "Verses"}
            </p>
          </div>
          {sloks.length > 0 && (
            <span className="text-amber-600/60 text-[9px] font-serif">
              {currentIdx + 1} / {sloks.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="devanagari text-amber-600/60 text-lg animate-pulse">ॐ</p>
          </div>
        ) : !slok ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-amber-700/50 text-xs font-serif">No verses loaded</p>
          </div>
        ) : (
          <>
            {/* Sanskrit shlok */}
            <div className="shrink-0 rounded-lg px-3 py-2"
              style={{ background: "rgba(120,60,10,0.06)", border: "1px solid rgba(120,70,10,0.15)" }}>
              <p className="devanagari text-amber-900 text-center leading-relaxed"
                style={{ fontSize: 13 * scale }}>
                {slok.slok}
              </p>
            </div>

            {/* Transliteration toggle */}
            <div className="shrink-0">
              <button
                onClick={() => setShowTranslit(v => !v)}
                className="text-amber-600/60 text-[9px] font-serif tracking-wider hover:text-amber-700 transition-colors"
              >
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
            <div className="flex-1 overflow-hidden book-scroll" style={{ minHeight: 0, overflowY: "auto" }}>
              <p className={`${isHindi ? "devanagari" : "font-serif"} text-amber-950 text-justify`}
                style={{ fontSize: 11.5 * scale, lineHeight: 1.75 }}>
                {translation || <span className="text-amber-600/50 italic">Translation not available</span>}
              </p>
            </div>

            {/* Verse navigation */}
            <div className="shrink-0 flex items-center justify-between pt-1"
              style={{ borderTop: "1px solid rgba(120,70,10,0.15)" }}>
              <button onClick={prev} disabled={currentIdx === 0}
                className="px-3 py-1 rounded-full text-xs font-serif text-amber-700 border border-amber-700/30
                  hover:bg-amber-700/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                ‹ {isHindi ? "पूर्व" : "Prev"}
              </button>

              {/* Dot indicators (max 10 visible) */}
              <div className="flex gap-1 items-center overflow-hidden" style={{ maxWidth: 120 }}>
                {sloks.slice(
                  Math.max(0, currentIdx - 4),
                  Math.min(sloks.length, currentIdx + 6)
                ).map((_, i) => {
                  const realIdx = Math.max(0, currentIdx - 4) + i;
                  return (
                    <button key={realIdx} onClick={() => setCurrentIdx(realIdx)}
                      className={`rounded-full transition-all shrink-0 ${
                        realIdx === currentIdx
                          ? "bg-amber-700 w-2 h-2"
                          : "bg-amber-700/30 w-1.5 h-1.5 hover:bg-amber-700/60"
                      }`}
                    />
                  );
                })}
              </div>

              <button onClick={next} disabled={currentIdx === sloks.length - 1}
                className="px-3 py-1 rounded-full text-xs font-serif text-amber-700 border border-amber-700/30
                  hover:bg-amber-700/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
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
});
VersesPage.displayName = "VersesPage";

// ── Main export — routes to correct sub-component ──────────────────────────
const ChapterPage = React.forwardRef<HTMLDivElement, ChapterPageProps>(
  ({ chapter, lang, pageType, fontSize = "md" }, ref) => {
    if (pageType === "intro") return <IntroPage ref={ref} chapter={chapter} lang={lang} fontSize={fontSize} />;
    if (pageType === "summary") return <SummaryPage ref={ref} chapter={chapter} lang={lang} fontSize={fontSize} />;
    return <VersesPage ref={ref} chapter={chapter} lang={lang} fontSize={fontSize} />;
  }
);
ChapterPage.displayName = "ChapterPage";
export default ChapterPage;
