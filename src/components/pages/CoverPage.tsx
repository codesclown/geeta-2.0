import React from "react";

/**
 * CoverPage — front cover with original amber/saffron palette,
 * proper book-cover feel: thick border frame, Om, Sanskrit title, ornaments.
 */
const CoverPage = React.forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      ref={ref}
      className="w-full h-full flex flex-col items-center justify-between relative overflow-hidden select-none"
      style={{
        background: "linear-gradient(160deg, #7c2d12 0%, #92400e 45%, #78350f 100%)",
      }}
    >
      {/* ── Outer frame ── */}
      <div className="absolute inset-3 pointer-events-none"
        style={{ border: "1.5px solid rgba(251,191,36,0.35)" }} />
      {/* ── Inner frame ── */}
      <div className="absolute inset-5 pointer-events-none"
        style={{ border: "1px solid rgba(251,191,36,0.15)" }} />

      {/* ── Corner flourishes ── */}
      {(["top-2.5 left-2.5", "top-2.5 right-2.5", "bottom-2.5 left-2.5", "bottom-2.5 right-2.5"] as const).map(
        (pos, i) => (
          <div key={i} className={`absolute ${pos} text-amber-500/50 text-xl pointer-events-none`}>
            {i < 2 ? "❧" : "❧"}
          </div>
        )
      )}

      {/* ── Top section ── */}
      <div className="flex flex-col items-center pt-8 px-6 text-center z-10">
        {/* Publisher-style top label */}
        <p className="text-amber-400/60 text-[10px] tracking-[0.35em] uppercase font-serif mb-3">
          Sacred Scripture
        </p>

        {/* Om */}
        <div className="om-pulse devanagari text-5xl text-amber-300 mb-2 mt-3"
          style={{ textShadow: "0 0 30px rgba(251,191,36,0.4)" }}>
          ॐ
        </div>

        {/* Sanskrit title */}
        <h1 className="devanagari text-amber-100 text-2xl leading-snug mb-1 tracking-wide">
          श्रीमद्भगवद्गीता
        </h1>

        {/* Ornamental rule */}
        <div className="flex items-center gap-2 my-2 w-full justify-center">
          <div className="h-px flex-1 bg-amber-600/40" />
          <span className="text-amber-500 text-sm">✦</span>
          <div className="h-px flex-1 bg-amber-600/40" />
        </div>

        {/* English title */}
        <h2 className="font-serif text-amber-300 text-base tracking-wider mb-1">
          Shrimad Bhagavad Gita
        </h2>
        <p className="font-serif text-amber-400/70 text-xs italic">
          The Song of God
        </p>
      </div>

      {/* ── Middle decorative band ── */}
      <div className="w-full px-10 z-10">
        <div className="border-t border-amber-600/30 py-2 text-center">
          <p className="font-serif text-amber-400/60 text-xs leading-relaxed">
            As spoken by Lord Krishna to Arjuna
            <br />on the battlefield of Kurukshetra
          </p>
        </div>
      </div>

      {/* ── Bottom section ── */}
      <div className="flex flex-col items-center pb-6 px-8 text-center z-10">
        {/* Chapter/verse count */}
        <div className="flex gap-6 mb-3">
          {[["18", "Adhyayas"], ["700", "Shlokas"]].map(([num, label]) => (
            <div key={label} className="text-center">
              <p className="text-amber-200 font-serif text-xl font-semibold">{num}</p>
              <p className="text-amber-500/70 text-[10px] tracking-widest uppercase font-serif">{label}</p>
            </div>
          ))}
        </div>

        {/* Bottom shloka */}
        <p className="devanagari text-amber-600/50 text-sm">
          ॥ श्रीकृष्णार्पणमस्तु ॥
        </p>
      </div>

      {/* ── Vignette edges ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.3) 100%)"
        }} />
    </div>
  );
});

CoverPage.displayName = "CoverPage";
export default CoverPage;
