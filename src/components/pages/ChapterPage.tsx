/**
 * components/pages/ChapterPage.tsx
 * ─────────────────────────────────────────────────────────────
 * हर chapter के दो pages render करता है:
 *
 * 1. IntroPage (pageType="intro"):
 *    - Chapter number, Sanskrit name, transliteration
 *    - Meaning quote
 *    - Verse count badge
 *    - Summary का preview (4 lines clamp)
 *
 * 2. SummaryPage (pageType="summary"):
 *    - पूरा summary text (font size के हिसाब से lines clamp)
 *    - "श्लोक देखें ↓" hint
 *
 * दोनों pages React.forwardRef use करते हैं क्योंकि
 * react-pageflip को DOM ref चाहिए होता है।
 */
import React from "react";
import { Chapter } from "@/types";
import { Language, FontSize } from "@/components/BookViewer";

interface ChapterPageProps {
  chapter: Chapter;
  lang: Language;
  pageType: "intro" | "summary";
  fontSize?: FontSize;
}

const fontScaleMap: Record<FontSize, number> = { sm: 0.82, md: 1, lg: 1.18 };

// ── Intro page ──────────────────────────────────────────────────────────────
const IntroPage = React.forwardRef<HTMLDivElement, {
  chapter: Chapter; lang: Language; fontSize: FontSize;
}>(({ chapter, lang, fontSize }, ref) => {
  const isHindi = lang === "hi";
  const scale = fontScaleMap[fontSize];

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
        <p className="text-amber-700 text-[9px] font-serif tracking-[0.28em] uppercase text-center mb-2">
          {isHindi ? "अध्याय" : "Chapter"} {chapter.chapter_number}
        </p>
        <h2 className="devanagari text-amber-900 text-[22px] leading-tight text-center mb-1.5">
          {chapter.name}
        </h2>
        <p className="font-serif text-amber-800/80 text-sm italic text-center mb-0.5">
          {chapter.transliteration}
        </p>
        <p className="font-serif text-amber-700/70 text-xs text-center mb-3">
          {chapter.translation}
        </p>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-px bg-amber-600/35" />
          <span className="text-amber-700 text-[10px]">✦ ✦ ✦</span>
          <div className="flex-1 h-px bg-amber-600/35" />
        </div>
        <p className="font-serif text-amber-800 text-sm text-center italic leading-snug mb-3 px-2">
          &ldquo;{isHindi ? chapter.meaning.hi : chapter.meaning.en}&rdquo;
        </p>
        <div className="flex justify-center mb-4">
          <div className="px-5 py-1.5 rounded-full border border-amber-700/30"
            style={{ background: "rgba(120,60,10,0.07)" }}>
            <p className="text-amber-700 text-xs font-serif">
              {chapter.verses_count} {isHindi ? "श्लोक" : "Verses"}
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          <p className={`${isHindi ? "devanagari" : "font-serif"} text-amber-900/70 text-justify`}
            style={{ fontSize: 12 * scale, lineHeight: 1.7,
              display: "-webkit-box", WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {isHindi ? chapter.summary.hi : chapter.summary.en}
          </p>
        </div>
        <p className="text-amber-600/50 text-[9px] font-serif text-center mt-2 tracking-wider shrink-0">
          {isHindi ? "आगे पढ़ें →" : "Continue →"}
        </p>
      </div>
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
            style={{ fontSize: 12.5 * scale, lineHeight: 1.78,
              display: "-webkit-box", WebkitLineClamp: clampLines,
              WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {isHindi ? chapter.summary.hi : chapter.summary.en}
          </p>
        </div>
        {/* Verses hint */}
        <p className="text-amber-600/50 text-[9px] font-serif text-center mt-2 tracking-wider shrink-0">
          {isHindi ? "श्लोक देखें ↓" : "View Verses ↓"}
        </p>
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

// ── Main export ─────────────────────────────────────────────────────────────
const ChapterPage = React.forwardRef<HTMLDivElement, ChapterPageProps>(
  ({ chapter, lang, pageType, fontSize = "md" }, ref) => {
    if (pageType === "intro") return <IntroPage ref={ref} chapter={chapter} lang={lang} fontSize={fontSize} />;
    return <SummaryPage ref={ref} chapter={chapter} lang={lang} fontSize={fontSize} />;
  }
);
ChapterPage.displayName = "ChapterPage";
export default ChapterPage;
