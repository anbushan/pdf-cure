export interface Locale {
  code: string;
  nativeName: string;
  englishName: string;
}

export const LOCALES: Locale[] = [
  { code: "en", nativeName: "English", englishName: "English" },
  { code: "es", nativeName: "Español", englishName: "Spanish" },
  { code: "fr", nativeName: "Français", englishName: "French" },
  { code: "de", nativeName: "Deutsch", englishName: "German" },
  { code: "it", nativeName: "Italiano", englishName: "Italian" },
  { code: "pt", nativeName: "Português", englishName: "Portuguese" },
  { code: "ja", nativeName: "日本語", englishName: "Japanese" },
  { code: "ru", nativeName: "Pусский", englishName: "Russian" },
  { code: "ko", nativeName: "한국어", englishName: "Korean" },
  { code: "zh-CN", nativeName: "中文 (简体)", englishName: "Chinese (Simplified)" },
  { code: "zh-TW", nativeName: "中文 (繁體)", englishName: "Chinese (Traditional)" },
  { code: "ar", nativeName: "العربية", englishName: "Arabic" },
  { code: "bg", nativeName: "Български", englishName: "Bulgarian" },
  { code: "ca", nativeName: "Català", englishName: "Catalan" },
  { code: "nl", nativeName: "Nederlands", englishName: "Dutch" },
  { code: "el", nativeName: "Ελληνικά", englishName: "Greek" },
  { code: "hi", nativeName: "हिन्दी", englishName: "Hindi" },
  { code: "id", nativeName: "Bahasa Indonesia", englishName: "Indonesian" },
  { code: "ms", nativeName: "Bahasa Melayu", englishName: "Malay" },
  { code: "pl", nativeName: "Polski", englishName: "Polish" },
  { code: "sv", nativeName: "Svenska", englishName: "Swedish" },
  { code: "th", nativeName: "ภาษาไทย", englishName: "Thai" },
  { code: "tr", nativeName: "Türkçe", englishName: "Turkish" },
  { code: "uk", nativeName: "Українська", englishName: "Ukrainian" },
  { code: "vi", nativeName: "Tiếng Việt", englishName: "Vietnamese" },
  { code: "sw", nativeName: "Kiswahili", englishName: "Swahili" },
];

export const DEFAULT_LOCALE = "en";

// Languages that read right-to-left — used to flip <html dir="rtl">.
export const RTL_LOCALES = new Set(["ar"]);
