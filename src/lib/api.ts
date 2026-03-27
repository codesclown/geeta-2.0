// API utility functions for vedicscriptures.github.io (free, no key needed)
import { Chapter, Slok } from "@/types";

const BASE = "https://vedicscriptures.github.io";

// localStorage cache helpers (client-side only)
const CHAPTERS_CACHE_KEY = "gita-chapters-v2";
const SLOK_CACHE_PREFIX = "gita-slok-v2-";
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

function readCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(key); return null; }
    return data as T;
  } catch { return null; }
}

function writeCache(key: string, data: unknown) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

// Fetch all 18 chapters
export async function fetchChapters(): Promise<Chapter[]> {
  const cached = readCache<Chapter[]>(CHAPTERS_CACHE_KEY);
  if (cached) return cached;

  const results = await Promise.all(
    Array.from({ length: 18 }, (_, i) =>
      fetch(`${BASE}/chapter/${i + 1}`, { cache: "force-cache" }).then(r => {
        if (!r.ok) throw new Error(`Chapter ${i + 1} fetch failed`);
        return r.json() as Promise<Chapter>;
      })
    )
  );
  writeCache(CHAPTERS_CACHE_KEY, results);
  return results;
}

// Fetch a single shlok
export async function fetchSlok(chapter: number, verse: number): Promise<Slok> {
  const key = `${SLOK_CACHE_PREFIX}${chapter}-${verse}`;
  const cached = readCache<Slok>(key);
  if (cached) return cached;

  const res = await fetch(`${BASE}/slok/${chapter}/${verse}`, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Failed to fetch slok ${chapter}.${verse}`);
  const data: Slok = await res.json();
  writeCache(key, data);
  return data;
}

// Fetch all sloks for a chapter (parallel)
export async function fetchChapterSloks(chapter: number, versesCount: number): Promise<Slok[]> {
  return Promise.all(
    Array.from({ length: versesCount }, (_, i) => fetchSlok(chapter, i + 1))
  );
}
