"use client";

import { useLanguage } from "@/components/LanguageProvider";

const HEADINGS: Record<string, { title: string; intro: string }> = {
  en: { title: "Every feature, in one place", intro: "PDFCure is a set of PDF tools that run in your browser, plus a few AI-assisted tools for when editing isn't enough. Here's exactly what's available and how each part works." },
  es: { title: "Todas las funciones, en un solo lugar", intro: "PDFCure es un conjunto de herramientas PDF que funcionan en tu navegador, además de algunas herramientas con IA para cuando editar no es suficiente. Esto es exactamente lo que hay disponible y cómo funciona cada parte." },
  fr: { title: "Toutes les fonctionnalités, au même endroit", intro: "PDFCure est un ensemble d'outils PDF qui fonctionnent dans votre navigateur, ainsi que quelques outils assistés par IA pour quand l'édition ne suffit pas. Voici exactement ce qui est disponible et comment chaque partie fonctionne." },
  de: { title: "Alle Funktionen an einem Ort", intro: "PDFCure ist eine Sammlung von PDF-Tools, die in Ihrem Browser laufen, plus einige KI-gestützte Tools für den Fall, dass Bearbeiten nicht ausreicht. Hier erfahren Sie genau, was verfügbar ist und wie jeder Teil funktioniert." },
  it: { title: "Tutte le funzionalità, in un unico posto", intro: "PDFCure è un insieme di strumenti PDF che funzionano nel tuo browser, più alcuni strumenti assistiti da IA per quando la modifica non basta. Ecco esattamente cosa è disponibile e come funziona ogni parte." },
  pt: { title: "Todos os recursos, em um só lugar", intro: "O PDFCure é um conjunto de ferramentas PDF que funcionam no seu navegador, além de algumas ferramentas assistidas por IA para quando editar não é suficiente. Aqui está exatamente o que está disponível e como cada parte funciona." },
  ja: { title: "すべての機能を一箇所に", intro: "PDFCureはブラウザ内で動作するPDFツール一式に加え、編集だけでは足りないときのためのAI支援ツールも備えています。利用できる内容と各機能の仕組みを詳しく説明します。" },
  ru: { title: "Все функции в одном месте", intro: "PDFCure — это набор PDF-инструментов, работающих в вашем браузере, а также несколько инструментов с ИИ на случай, если редактирования недостаточно. Вот точно, что доступно и как работает каждая часть." },
  ko: { title: "모든 기능을 한곳에서", intro: "PDFCure는 브라우저에서 실행되는 PDF 도구 모음이며, 편집만으로 부족할 때를 위한 AI 지원 도구도 포함되어 있습니다. 무엇을 사용할 수 있는지, 각 부분이 어떻게 작동하는지 정확히 설명합니다." },
  "zh-CN": { title: "所有功能，一目了然", intro: "PDFCure 是一套在浏览器中运行的 PDF 工具，外加几款在单纯编辑不够用时可用的 AI 辅助工具。以下是确切可用的功能，以及各部分的工作原理。" },
  "zh-TW": { title: "所有功能，一目了然", intro: "PDFCure 是一套在瀏覽器中執行的 PDF 工具，外加幾款在單純編輯不夠用時可用的 AI 輔助工具。以下是確切可用的功能，以及各部分的運作原理。" },
  ar: { title: "كل ميزة في مكان واحد", intro: "PDFCure هو مجموعة من أدوات PDF التي تعمل في متصفحك، بالإضافة إلى بعض الأدوات المدعومة بالذكاء الاصطناعي لعندما لا يكون التحرير كافيًا. إليك بالضبط ما هو متاح وكيف يعمل كل جزء." },
  bg: { title: "Всяка функция, на едно място", intro: "PDFCure е набор от PDF инструменти, които работят във вашия браузър, плюс няколко инструмента с ИИ за случаите, когато редактирането не е достатъчно. Ето точно какво е налично и как работи всяка част." },
  ca: { title: "Totes les funcions, en un sol lloc", intro: "PDFCure és un conjunt d'eines PDF que funcionen al teu navegador, més algunes eines assistides per IA per quan editar no és suficient. Aquí tens exactament què hi ha disponible i com funciona cada part." },
  nl: { title: "Alle functies, op één plek", intro: "PDFCure is een set PDF-tools die in je browser werken, plus een paar AI-ondersteunde tools voor wanneer bewerken niet genoeg is. Hier lees je precies wat er beschikbaar is en hoe elk onderdeel werkt." },
  el: { title: "Όλες οι δυνατότητες, σε ένα μέρος", intro: "Το PDFCure είναι ένα σύνολο εργαλείων PDF που λειτουργούν στο πρόγραμμα περιήγησής σας, καθώς και μερικά εργαλεία με υποστήριξη AI για όταν η επεξεργασία δεν αρκεί. Δείτε ακριβώς τι είναι διαθέσιμο και πώς λειτουργεί κάθε μέρος." },
  hi: { title: "हर सुविधा, एक ही जगह", intro: "PDFCure आपके ब्राउज़र में चलने वाले PDF टूल्स का एक सेट है, साथ ही कुछ AI-सहायता प्राप्त टूल्स भी हैं जब संपादन काफी न हो। यहां बिल्कुल बताया गया है कि क्या उपलब्ध है और हर हिस्सा कैसे काम करता है।" },
  id: { title: "Semua fitur, dalam satu tempat", intro: "PDFCure adalah sekumpulan alat PDF yang berjalan di browser Anda, ditambah beberapa alat berbantuan AI untuk saat mengedit saja tidak cukup. Berikut ini secara pasti apa yang tersedia dan cara kerja setiap bagiannya." },
  ms: { title: "Semua ciri, di satu tempat", intro: "PDFCure ialah satu set alat PDF yang berjalan dalam pelayar anda, ditambah beberapa alat berbantukan AI untuk masa suntingan sahaja tidak mencukupi. Berikut adalah dengan tepat apa yang tersedia dan cara setiap bahagian berfungsi." },
  pl: { title: "Wszystkie funkcje w jednym miejscu", intro: "PDFCure to zestaw narzędzi PDF działających w Twojej przeglądarce, a także kilka narzędzi wspomaganych AI na wypadek, gdy samo edytowanie nie wystarczy. Oto dokładnie, co jest dostępne i jak działa każda część." },
  sv: { title: "Alla funktioner, på ett ställe", intro: "PDFCure är en uppsättning PDF-verktyg som körs i din webbläsare, plus några AI-assisterade verktyg för när redigering inte räcker. Här är exakt vad som finns tillgängligt och hur varje del fungerar." },
  th: { title: "ทุกฟีเจอร์ในที่เดียว", intro: "PDFCure คือชุดเครื่องมือ PDF ที่ทำงานในเบราว์เซอร์ของคุณ พร้อมด้วยเครื่องมือ AI บางส่วนสำหรับเมื่อการแก้ไขไม่เพียงพอ นี่คือสิ่งที่มีให้ใช้งานและวิธีการทำงานของแต่ละส่วนอย่างชัดเจน" },
  tr: { title: "Tüm özellikler, tek bir yerde", intro: "PDFCure, tarayıcınızda çalışan bir dizi PDF aracı ile düzenleme yeterli olmadığında kullanılacak birkaç AI destekli araçtan oluşur. İşte tam olarak nelerin mevcut olduğu ve her bölümün nasıl çalıştığı." },
  uk: { title: "Усі функції в одному місці", intro: "PDFCure — це набір PDF-інструментів, які працюють у вашому браузері, а також кілька інструментів на основі ШІ для випадків, коли редагування недостатньо. Ось точно, що доступно і як працює кожна частина." },
  vi: { title: "Mọi tính năng, tại một nơi", intro: "PDFCure là một bộ công cụ PDF chạy trong trình duyệt của bạn, cùng với một vài công cụ hỗ trợ AI cho khi chỉnh sửa thôi chưa đủ. Đây chính xác là những gì có sẵn và cách mỗi phần hoạt động." },
  sw: { title: "Kila kipengele, mahali pamoja", intro: "PDFCure ni mkusanyiko wa zana za PDF zinazofanya kazi kwenye kivinjari chako, pamoja na zana chache za AI kwa wakati kuhariri hakutoshi. Hii hapa ni kile kinachopatikana hasa na jinsi kila sehemu inavyofanya kazi." },
};

export default function FeaturesHeading() {
  const { locale } = useLanguage();
  const h = HEADINGS[locale] ?? HEADINGS.en;
  return (
    <>
      <h1 className="font-display text-4xl font-bold tracking-tight text-ink">{h.title}</h1>
      <p className="mt-3 text-base text-ink-faint leading-relaxed">{h.intro}</p>
    </>
  );
}
