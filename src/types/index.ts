/**
 * types/index.ts
 * ─────────────────────────────────────────────────────────────
 * इस फ़ाइल में पूरे प्रोजेक्ट के TypeScript types define हैं।
 * API: vedicscriptures.github.io (free, no key needed)
 */

// ── एक अध्याय (Chapter) का structure ──────────────────────────
export interface Chapter {
  chapter_number: number;      // अध्याय संख्या (1–18)
  verses_count: number;        // उस अध्याय में कुल श्लोकों की संख्या
  name: string;                // संस्कृत नाम (देवनागरी में), जैसे "अर्जुनविषादयोग"
  translation: string;         // अंग्रेज़ी अनुवाद, जैसे "Arjuna Visada Yoga"
  transliteration: string;     // रोमन लिप्यंतरण, जैसे "Arjuna Visada Yoga"
  meaning: {
    en: string;                // नाम का अंग्रेज़ी अर्थ
    hi: string;                // नाम का हिंदी अर्थ
  };
  summary: {
    en: string;                // अध्याय का अंग्रेज़ी सारांश
    hi: string;                // अध्याय का हिंदी सारांश
  };
}

// ── किसी एक लेखक/टीकाकार का अनुवाद/टीका ─────────────────────
export interface SlokAuthorText {
  author: string;
  et?: string;   // English translation (अंग्रेज़ी अनुवाद)
  ht?: string;   // Hindi translation (हिंदी अनुवाद)
  ec?: string;   // English commentary (अंग्रेज़ी टीका)
  hc?: string;   // Hindi commentary (हिंदी टीका)
  sc?: string;   // Sanskrit commentary (संस्कृत टीका)
}

// ── एक श्लोक (Shlok) का पूरा structure ───────────────────────
// हर श्लोक में संस्कृत मूल पाठ + अनेक लेखकों के अनुवाद होते हैं
export interface Slok {
  _id: string;              // MongoDB document ID
  chapter: number;          // अध्याय संख्या
  verse: number;            // श्लोक संख्या
  slok: string;             // मूल संस्कृत पाठ (देवनागरी)
  transliteration: string;  // रोमन लिप्यंतरण

  // नीचे सभी keys अलग-अलग लेखकों/टीकाकारों के अनुवाद हैं
  tej?: SlokAuthorText;
  siva?: SlokAuthorText;
  purohit?: SlokAuthorText;
  chinmay?: SlokAuthorText;
  san?: SlokAuthorText;
  adi?: SlokAuthorText;
  gambir?: SlokAuthorText;
  madhav?: SlokAuthorText;
  anand?: SlokAuthorText;
  rams?: SlokAuthorText;
  raman?: SlokAuthorText;
  abhinav?: SlokAuthorText;
  sankar?: SlokAuthorText;
  jaya?: SlokAuthorText;
  vallabh?: SlokAuthorText;
  ms?: SlokAuthorText;
  srid?: SlokAuthorText;
  dhan?: SlokAuthorText;
  venkat?: SlokAuthorText;
  puru?: SlokAuthorText;
  neel?: SlokAuthorText;
  prabhu?: SlokAuthorText;
}

/**
 * अनुवाद दिखाने के लिए preferred लेखकों का क्रम।
 * पहले वाले लेखक को priority मिलती है।
 * अगर पहले का अनुवाद नहीं मिला तो अगला try होता है।
 */
export const PREFERRED_AUTHORS: (keyof Slok)[] = [
  "siva", "purohit", "gambir", "adi", "prabhu", "tej", "san",
];
