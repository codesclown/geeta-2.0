// Type definitions for vedicscriptures.github.io Bhagavad Gita API

export interface Chapter {
  chapter_number: number;
  verses_count: number;
  name: string;               // Sanskrit name (Devanagari)
  translation: string;        // English translation of name
  transliteration: string;    // Transliteration of name
  meaning: {
    en: string;
    hi: string;
  };
  summary: {
    en: string;
    hi: string;
  };
}

// Commentary/translation by a specific author
export interface SlokAuthorText {
  author: string;
  et?: string;  // English translation
  ht?: string;  // Hindi translation
  ec?: string;  // English commentary
  hc?: string;  // Hindi commentary
  sc?: string;  // Sanskrit commentary
}

export interface Slok {
  _id: string;
  chapter: number;
  verse: number;
  slok: string;           // Sanskrit text (Devanagari)
  transliteration: string;
  // Author-keyed translations/commentaries
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

// Preferred translation order for display
export const PREFERRED_AUTHORS: (keyof Slok)[] = [
  "siva", "purohit", "gambir", "adi", "prabhu", "tej", "san",
];
