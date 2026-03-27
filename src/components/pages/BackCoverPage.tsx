/**
 * components/pages/BackCoverPage.tsx
 * ─────────────────────────────────────────────────────────────
 * Book का back cover page।
 * Front cover से मिलता-जुलता design, पर अलग content।
 *
 * Content:
 * - ॐ symbol
 * - Bhagavad Gita 18.78 का श्लोक (समापन श्लोक)
 * - उसका अंग्रेज़ी अनुवाद
 * - Total chapters count
 * - ॥ इति श्रीमद्भगवद्गीता ॥
 */

import React from "react";

interface BackCoverPageProps {
  totalChapters: number; // कुल अध्यायों की संख्या (18)
}

const BackCoverPage = React.forwardRef<HTMLDivElement, BackCoverPageProps>(
  ({ totalChapters }, ref) => {
    return (
      <div
        ref={ref}
        className="w-full h-full flex flex-col items-center justify-between relative overflow-hidden select-none"
        style={{ background: "linear-gradient(160deg, #78350f 0%, #92400e 50%, #7c2d12 100%)" }}
      >
        {/* ── Double border frame ── */}
        <div className="absolute inset-3 pointer-events-none"
          style={{ border: "1.5px solid rgba(251,191,36,0.35)" }} />
        <div className="absolute inset-5 pointer-events-none"
          style={{ border: "1px solid rgba(251,191,36,0.15)" }} />

        {/* ── Corner flourishes ── */}
        {["top-2.5 left-2.5", "top-2.5 right-2.5", "bottom-2.5 left-2.5", "bottom-2.5 right-2.5"].map(
          (pos, i) => (
            <div key={i} className={`absolute ${pos} text-amber-500/50 text-xl pointer-events-none`}>❧</div>
          )
        )}

        {/* ── Vignette overlay ── */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.3) 100%)" }} />

        {/* ── Main content ── */}
        <div className="px-10 pt-10 text-center z-10 flex-1 flex flex-col items-center justify-center">
          {/* ॐ with glow */}
          <div className="om-pulse devanagari text-4xl text-amber-300/80 mb-6"
            style={{ textShadow: "0 0 20px rgba(251,191,36,0.3)" }}>
            ॐ
          </div>

          {/* Bhagavad Gita 18.78 — समापन श्लोक */}
          <p className="devanagari text-amber-200/90 text-base leading-loose">
            यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः।
          </p>
          <p className="devanagari text-amber-200/90 text-base leading-loose mb-5">
            तत्र श्रीर्विजयो भूतिर्ध्रुवा नीतिर्मतिर्मम॥
          </p>

          {/* Ornamental divider */}
          <div className="flex items-center gap-2 justify-center mb-5">
            <div className="h-px w-8 bg-amber-600/40" />
            <span className="text-amber-500/60 text-xs">✦</span>
            <div className="h-px w-8 bg-amber-600/40" />
          </div>

          {/* अंग्रेज़ी अनुवाद */}
          <p className="font-serif text-amber-300/70 text-xs italic leading-relaxed max-w-[220px] mx-auto">
            "Wherever there is Krishna and Arjuna, there will surely be
            prosperity, victory, and righteousness."
          </p>
          <p className="text-amber-600/50 text-[10px] font-serif mt-2 tracking-wider">
            — Bhagavad Gita 18.78
          </p>
        </div>

        {/* ── नीचे: chapter count + समापन ── */}
        <div className="shrink-0 pb-6 text-center z-10">
          <p className="text-amber-500/40 text-[10px] font-serif tracking-widest uppercase mb-1">
            {totalChapters} Chapters
          </p>
          <p className="devanagari text-amber-600/40 text-sm">॥ इति श्रीमद्भगवद्गीता ॥</p>
        </div>
      </div>
    );
  }
);

BackCoverPage.displayName = "BackCoverPage";
export default BackCoverPage;
