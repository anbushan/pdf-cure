"use client";

import { useLanguage } from "@/components/LanguageProvider";

const HEADINGS: Record<string, { title: string; intro: string }> = {
  en: { title: "The PDFCure blog", intro: "Practical guides on PDFs, and honest notes on what a browser can and can't do." },
  es: { title: "El blog de PDFCure", intro: "Guías prácticas sobre PDF, y notas honestas sobre lo que un navegador puede y no puede hacer." },
  fr: { title: "Le blog PDFCure", intro: "Des guides pratiques sur les PDF, et des notes honnêtes sur ce qu'un navigateur peut ou ne peut pas faire." },
  de: { title: "Der PDFCure-Blog", intro: "Praktische Anleitungen zu PDFs sowie ehrliche Hinweise darauf, was ein Browser kann und was nicht." },
  it: { title: "Il blog di PDFCure", intro: "Guide pratiche sui PDF e note oneste su cosa un browser può e non può fare." },
  pt: { title: "O blog do PDFCure", intro: "Guias práticos sobre PDFs e notas honestas sobre o que um navegador pode e não pode fazer." },
  ja: { title: "PDFCureブログ", intro: "PDFに関する実践的なガイドと、ブラウザにできること・できないことについての正直な解説。" },
  ru: { title: "Блог PDFCure", intro: "Практические руководства по PDF и честные заметки о том, что браузер может и не может делать." },
  ko: { title: "PDFCure 블로그", intro: "PDF에 관한 실용적인 가이드와, 브라우저가 할 수 있는 것과 할 수 없는 것에 대한 솔직한 이야기." },
  "zh-CN": { title: "PDFCure 博客", intro: "关于 PDF 的实用指南，以及关于浏览器能做什么、不能做什么的坦诚说明。" },
  "zh-TW": { title: "PDFCure 部落格", intro: "關於 PDF 的實用指南，以及關於瀏覽器能做什麼、不能做什麼的坦誠說明。" },
  ar: { title: "مدونة PDFCure", intro: "أدلة عملية حول ملفات PDF، وملاحظات صادقة حول ما يمكن للمتصفح فعله وما لا يمكنه فعله." },
  bg: { title: "Блогът на PDFCure", intro: "Практически ръководства за PDF и честни бележки за това какво браузърът може и какво не може да прави." },
  ca: { title: "El blog de PDFCure", intro: "Guies pràctiques sobre PDF, i notes honestes sobre què pot i no pot fer un navegador." },
  nl: { title: "De PDFCure-blog", intro: "Praktische gidsen over PDF's, en eerlijke notities over wat een browser wel en niet kan." },
  el: { title: "Το blog του PDFCure", intro: "Πρακτικοί οδηγοί για PDF, και ειλικρινείς σημειώσεις για το τι μπορεί και τι δεν μπορεί να κάνει ένα πρόγραμμα περιήγησης." },
  hi: { title: "PDFCure ब्लॉग", intro: "PDF पर व्यावहारिक गाइड, और ब्राउज़र क्या कर सकता है और क्या नहीं, इस पर ईमानदार जानकारी।" },
  id: { title: "Blog PDFCure", intro: "Panduan praktis tentang PDF, dan catatan jujur tentang apa yang bisa dan tidak bisa dilakukan browser." },
  ms: { title: "Blog PDFCure", intro: "Panduan praktikal tentang PDF, dan nota jujur tentang apa yang pelayar boleh dan tidak boleh lakukan." },
  pl: { title: "Blog PDFCure", intro: "Praktyczne poradniki o PDF-ach oraz szczere uwagi o tym, co przeglądarka potrafi, a czego nie." },
  sv: { title: "PDFCure-bloggen", intro: "Praktiska guider om PDF-filer, och ärliga anteckningar om vad en webbläsare kan och inte kan göra." },
  th: { title: "บล็อกของ PDFCure", intro: "คู่มือปฏิบัติเกี่ยวกับ PDF และบันทึกที่ตรงไปตรงมาเกี่ยวกับสิ่งที่เบราว์เซอร์ทำได้และทำไม่ได้" },
  tr: { title: "PDFCure blogu", intro: "PDF'ler hakkında pratik rehberler ve bir tarayıcının yapabildikleri ile yapamadıkları hakkında dürüst notlar." },
  uk: { title: "Блог PDFCure", intro: "Практичні поради щодо PDF та чесні нотатки про те, що браузер може, а що не може робити." },
  vi: { title: "Blog của PDFCure", intro: "Hướng dẫn thực tế về PDF, và những ghi chú trung thực về những gì trình duyệt có thể và không thể làm." },
  sw: { title: "Blogu ya PDFCure", intro: "Miongozo ya vitendo kuhusu PDF, na maelezo ya kweli kuhusu kile kivinjari kinachoweza na kisichoweza kufanya." },
};

export default function BlogHeading() {
  const { locale } = useLanguage();
  const h = HEADINGS[locale] ?? HEADINGS.en;
  return (
    <>
      <h1 className="font-display text-4xl font-bold tracking-tight text-ink">{h.title}</h1>
      <p className="mt-3 text-base text-ink-faint">{h.intro}</p>
    </>
  );
}
