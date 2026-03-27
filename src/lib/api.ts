/**
 * lib/api.ts
 * ─────────────────────────────────────────────────────────────
 * Bhagavad Gita API के साथ communicate करने के सभी functions।
 * API: https://vedicscriptures.github.io (free, no key needed)
 *
 * Performance के लिए localStorage caching use होती है:
 * - अध्याय data 7 दिन तक cache रहता है
 * - हर श्लोक भी 7 दिन तक cache रहता है
 * - इससे बार-बार network request नहीं जाती
 */

import { Chapter, Slok } from "@/types";

// ── API base URL ───────────────────────────────────────────────
const BASE = "https://vedicscriptures.github.io";

// ── localStorage cache keys ────────────────────────────────────
const CHAPTERS_CACHE_KEY = "gita-chapters-v2";   // सभी अध्यायों का cache key
const SLOK_CACHE_PREFIX  = "gita-slok-v2-";      // हर श्लोक का prefix (जैसे "gita-slok-v2-1-1")
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;       // 7 दिन milliseconds में

// ── Cache से data पढ़ना ────────────────────────────────────────
// अगर cache expired हो या न हो तो null return करता है
function readCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null; // SSR में localStorage नहीं होता
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    // TTL check: अगर 7 दिन से ज़्यादा पुराना है तो delete करो
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(key); return null; }
    return data as T;
  } catch { return null; } // JSON parse error पर null
}

// ── Cache में data लिखना ───────────────────────────────────────
// data के साथ timestamp भी save होता है (TTL के लिए)
function writeCache(key: string, data: unknown) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch {}
  // localStorage full होने पर silently fail होता है
}

// ── सभी 18 अध्याय fetch करना ──────────────────────────────────
// पहले cache check होता है, नहीं मिला तो parallel API calls
export async function fetchChapters(): Promise<Chapter[]> {
  const cached = readCache<Chapter[]>(CHAPTERS_CACHE_KEY);
  if (cached) return cached; // cache hit — network नहीं जाएगा

  // सभी 18 अध्याय एक साथ parallel fetch (Promise.all)
  const results = await Promise.all(
    Array.from({ length: 18 }, (_, i) =>
      fetch(`${BASE}/chapter/${i + 1}`, { cache: "force-cache" }).then(r => {
        if (!r.ok) throw new Error(`Chapter ${i + 1} fetch failed`);
        return r.json() as Promise<Chapter>;
      })
    )
  );
  writeCache(CHAPTERS_CACHE_KEY, results); // cache में save
  return results;
}

// ── एक श्लोक fetch करना ───────────────────────────────────────
// cache miss पर API call, फिर cache में save
export async function fetchSlok(chapter: number, verse: number): Promise<Slok> {
  const key = `${SLOK_CACHE_PREFIX}${chapter}-${verse}`; // जैसे "gita-slok-v2-2-47"
  const cached = readCache<Slok>(key);
  if (cached) return cached;

  const res = await fetch(`${BASE}/slok/${chapter}/${verse}`, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Failed to fetch slok ${chapter}.${verse}`);
  const data: Slok = await res.json();
  writeCache(key, data);
  return data;
}

// ── किसी अध्याय के सभी श्लोक fetch करना ──────────────────────
// versesCount श्लोक parallel fetch होते हैं (तेज़ loading के लिए)
export async function fetchChapterSloks(chapter: number, versesCount: number): Promise<Slok[]> {
  return Promise.all(
    Array.from({ length: versesCount }, (_, i) => fetchSlok(chapter, i + 1))
  );
}
