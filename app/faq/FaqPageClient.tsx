"use client";

import Faq from "@/components/Faq";
import { useLanguage } from "@/components/LanguageProvider";
import { getSiteFaqs } from "@/lib/i18n/faqTranslations";

const HEADINGS: Record<string, { title: string; intro: string }> = {
  en: { title: "Frequently asked questions", intro: "Everything about how PDFCure works, what stays private, and what doesn't. Have a question specific to one tool? Each tool's page has its own FAQ section too." },
  es: { title: "Preguntas frecuentes", intro: "Todo sobre cómo funciona PDFCure, qué se mantiene privado y qué no. ¿Tienes una pregunta sobre una herramienta específica? Cada página de herramienta también tiene su propia sección de preguntas frecuentes." },
  fr: { title: "Foire aux questions", intro: "Tout sur le fonctionnement de PDFCure, ce qui reste privé et ce qui ne l'est pas. Une question spécifique à un outil ? Chaque page d'outil a aussi sa propre FAQ." },
  de: { title: "Häufig gestellte Fragen", intro: "Alles darüber, wie PDFCure funktioniert, was privat bleibt und was nicht. Eine Frage zu einem bestimmten Tool? Jede Tool-Seite hat auch ihren eigenen FAQ-Bereich." },
  it: { title: "Domande frequenti", intro: "Tutto su come funziona PDFCure, cosa resta privato e cosa no. Hai una domanda specifica su uno strumento? Anche ogni pagina degli strumenti ha la propria sezione FAQ." },
  pt: { title: "Perguntas frequentes", intro: "Tudo sobre como o PDFCure funciona, o que permanece privado e o que não permanece. Tem uma pergunta específica sobre uma ferramenta? Cada página de ferramenta também tem sua própria seção de perguntas frequentes." },
  ja: { title: "よくある質問", intro: "PDFCureの仕組みや、何がプライベートに保たれ何がそうでないかについて。特定のツールに関する質問がありますか？各ツールのページにも独自のFAQセクションがあります。" },
  ru: { title: "Часто задаваемые вопросы", intro: "Всё о том, как работает PDFCure, что остаётся приватным, а что нет. Есть вопрос по конкретному инструменту? На странице каждого инструмента тоже есть свой раздел FAQ." },
  ko: { title: "자주 묻는 질문", intro: "PDFCure의 작동 방식과 무엇이 비공개로 유지되고 무엇이 그렇지 않은지에 대한 모든 것. 특정 도구에 대한 질문이 있으신가요? 각 도구 페이지에도 자체 FAQ 섹션이 있습니다." },
  "zh-CN": { title: "常见问题", intro: "关于 PDFCure 如何运作、哪些内容会保密、哪些不会的一切。对某个具体工具有疑问？每个工具页面也都有自己的常见问题解答部分。" },
  "zh-TW": { title: "常見問題", intro: "關於 PDFCure 如何運作、哪些內容會保密、哪些不會的一切。對某個具體工具有疑問？每個工具頁面也都有自己的常見問題解答部分。" },
  ar: { title: "الأسئلة الشائعة", intro: "كل ما يتعلق بكيفية عمل PDFCure، وما الذي يبقى خاصًا وما لا يبقى. هل لديك سؤال خاص بأداة معينة؟ كل صفحة أداة لديها أيضًا قسم أسئلة شائعة خاص بها." },
  bg: { title: "Често задавани въпроси", intro: "Всичко за това как работи PDFCure, какво остава поверително и какво не. Имате въпрос за конкретен инструмент? Всяка страница на инструмент също има свой раздел с въпроси и отговори." },
  ca: { title: "Preguntes freqüents", intro: "Tot sobre com funciona PDFCure, què es manté privat i què no. Tens una pregunta específica sobre una eina? Cada pàgina d'eina també té la seva pròpia secció de preguntes freqüents." },
  nl: { title: "Veelgestelde vragen", intro: "Alles over hoe PDFCure werkt, wat privé blijft en wat niet. Heb je een vraag over een specifieke tool? Elke toolpagina heeft ook zijn eigen FAQ-sectie." },
  el: { title: "Συχνές ερωτήσεις", intro: "Όλα όσα αφορούν τον τρόπο λειτουργίας του PDFCure, τι παραμένει ιδιωτικό και τι όχι. Έχετε μια ερώτηση σχετική με ένα συγκεκριμένο εργαλείο; Κάθε σελίδα εργαλείου έχει επίσης τη δική της ενότητα συχνών ερωτήσεων." },
  hi: { title: "अक्सर पूछे जाने वाले प्रश्न", intro: "PDFCure कैसे काम करता है, क्या निजी रहता है और क्या नहीं, इस बारे में सब कुछ। किसी खास टूल के बारे में सवाल है? हर टूल के पेज पर अपना खुद का FAQ सेक्शन भी है।" },
  id: { title: "Pertanyaan umum", intro: "Semua tentang cara kerja PDFCure, apa yang tetap privat, dan apa yang tidak. Punya pertanyaan khusus tentang satu alat? Setiap halaman alat juga memiliki bagian FAQ sendiri." },
  ms: { title: "Soalan lazim", intro: "Semua tentang cara PDFCure berfungsi, apa yang kekal peribadi, dan apa yang tidak. Ada soalan khusus tentang satu alat? Setiap halaman alat juga mempunyai bahagian Soalan Lazim sendiri." },
  pl: { title: "Najczęściej zadawane pytania", intro: "Wszystko o tym, jak działa PDFCure, co pozostaje prywatne, a co nie. Masz pytanie dotyczące konkretnego narzędzia? Każda strona narzędzia ma również własną sekcję FAQ." },
  sv: { title: "Vanliga frågor", intro: "Allt om hur PDFCure fungerar, vad som förblir privat och vad som inte gör det. Har du en fråga om ett specifikt verktyg? Varje verktygssida har också sitt eget FAQ-avsnitt." },
  th: { title: "คำถามที่พบบ่อย", intro: "ทุกอย่างเกี่ยวกับวิธีการทำงานของ PDFCure สิ่งที่เป็นส่วนตัวและสิ่งที่ไม่ใช่ มีคำถามเฉพาะเกี่ยวกับเครื่องมือใดเครื่องมือหนึ่งหรือไม่? แต่ละหน้าเครื่องมือก็มีส่วนคำถามที่พบบ่อยของตัวเองเช่นกัน" },
  tr: { title: "Sıkça sorulan sorular", intro: "PDFCure'un nasıl çalıştığı, nelerin gizli kaldığı ve nelerin kalmadığı hakkında her şey. Belirli bir araçla ilgili bir sorunuz mu var? Her araç sayfasının kendi SSS bölümü de vardır." },
  uk: { title: "Часті запитання", intro: "Все про те, як працює PDFCure, що залишається приватним, а що ні. Є питання щодо конкретного інструмента? На сторінці кожного інструмента також є свій розділ FAQ." },
  vi: { title: "Câu hỏi thường gặp", intro: "Mọi thứ về cách PDFCure hoạt động, điều gì được giữ riêng tư và điều gì không. Có câu hỏi cụ thể về một công cụ? Mỗi trang công cụ cũng có phần Câu hỏi thường gặp riêng." },
  sw: { title: "Maswali yanayoulizwa mara kwa mara", intro: "Kila kitu kuhusu jinsi PDFCure inavyofanya kazi, kinachobaki faragha na kisichobaki. Una swali mahususi kuhusu zana moja? Kila ukurasa wa zana pia una sehemu yake ya maswali yanayoulizwa mara kwa mara." },
};

export default function FaqPageClient() {
  const { locale } = useLanguage();
  const heading = HEADINGS[locale] ?? HEADINGS.en;
  const faqs = getSiteFaqs(locale);

  return (
    <>
      <div className="mx-auto max-w-3xl px-6 pt-4">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">{heading.title}</h1>
        <p className="mt-3 text-base text-ink-faint">{heading.intro}</p>
      </div>
      <Faq items={faqs} title="" />
    </>
  );
}
