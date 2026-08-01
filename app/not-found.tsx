"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileQuestion, ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { TOOLS } from "@/lib/toolsConfig";
import { useLanguage } from "@/components/LanguageProvider";
import { getToolLabel } from "@/lib/i18n/toolTranslations";

const POPULAR = ["merge", "split", "compress", "summarize"];

const HEADINGS: Record<string, { error: string; title: string; body: string; home: string; tools: string; popular: string }> = {
  en: { error: "Error 404", title: "This page got lost in the shuffle.", body: "doesn't exist — it may have moved, or the link might be off.", home: "Go to homepage", tools: "See all tools", popular: "Popular tools" },
  es: { error: "Error 404", title: "Esta página se ha perdido en el camino.", body: "no existe — puede que se haya movido o el enlace esté mal.", home: "Ir al inicio", tools: "Ver todas las herramientas", popular: "Herramientas populares" },
  fr: { error: "Erreur 404", title: "Cette page s'est perdue en chemin.", body: "n'existe pas — elle a peut-être été déplacée, ou le lien est incorrect.", home: "Aller à l'accueil", tools: "Voir tous les outils", popular: "Outils populaires" },
  de: { error: "Fehler 404", title: "Diese Seite ist auf der Strecke geblieben.", body: "existiert nicht — sie wurde möglicherweise verschoben, oder der Link ist falsch.", home: "Zur Startseite", tools: "Alle Tools ansehen", popular: "Beliebte Tools" },
  it: { error: "Errore 404", title: "Questa pagina si è persa per strada.", body: "non esiste — potrebbe essere stata spostata, o il link è sbagliato.", home: "Vai alla home", tools: "Vedi tutti gli strumenti", popular: "Strumenti popolari" },
  pt: { error: "Erro 404", title: "Esta página se perdeu no caminho.", body: "não existe — pode ter sido movida, ou o link está errado.", home: "Ir para a página inicial", tools: "Ver todas as ferramentas", popular: "Ferramentas populares" },
  ja: { error: "エラー 404", title: "このページは見つかりませんでした。", body: "は存在しません。移動したか、リンクが間違っている可能性があります。", home: "ホームへ", tools: "すべてのツールを見る", popular: "人気のツール" },
  ru: { error: "Ошибка 404", title: "Эта страница потерялась по пути.", body: "не существует — возможно, она была перемещена, или ссылка неверна.", home: "На главную", tools: "Посмотреть все инструменты", popular: "Популярные инструменты" },
  ko: { error: "오류 404", title: "이 페이지를 찾을 수 없습니다.", body: "존재하지 않습니다 — 이동되었거나 링크가 잘못되었을 수 있습니다.", home: "홈으로 가기", tools: "모든 도구 보기", popular: "인기 도구" },
  "zh-CN": { error: "错误 404", title: "此页面已找不到了。", body: "不存在——可能已被移动，或链接有误。", home: "返回首页", tools: "查看所有工具", popular: "热门工具" },
  "zh-TW": { error: "錯誤 404", title: "此頁面已找不到了。", body: "不存在——可能已被移動，或連結有誤。", home: "返回首頁", tools: "查看所有工具", popular: "熱門工具" },
  ar: { error: "خطأ 404", title: "ضاعت هذه الصفحة في الطريق.", body: "غير موجودة — ربما تم نقلها، أو أن الرابط غير صحيح.", home: "الذهاب إلى الصفحة الرئيسية", tools: "عرض كل الأدوات", popular: "الأدوات الشائعة" },
  bg: { error: "Грешка 404", title: "Тази страница се изгуби по пътя.", body: "не съществува — може да е преместена или връзката да е грешна.", home: "Към началната страница", tools: "Виж всички инструменти", popular: "Популярни инструменти" },
  ca: { error: "Error 404", title: "Aquesta pàgina s'ha perdut pel camí.", body: "no existeix — potser s'ha mogut, o l'enllaç és incorrecte.", home: "Anar a l'inici", tools: "Veure totes les eines", popular: "Eines populars" },
  nl: { error: "Fout 404", title: "Deze pagina is onderweg kwijtgeraakt.", body: "bestaat niet — mogelijk verplaatst, of de link klopt niet.", home: "Naar de homepage", tools: "Alle tools bekijken", popular: "Populaire tools" },
  el: { error: "Σφάλμα 404", title: "Αυτή η σελίδα χάθηκε στο δρόμο.", body: "δεν υπάρχει — ίσως μετακινήθηκε, ή ο σύνδεσμος είναι λάθος.", home: "Μετάβαση στην αρχική", tools: "Δείτε όλα τα εργαλεία", popular: "Δημοφιλή εργαλεία" },
  hi: { error: "त्रुटि 404", title: "यह पेज रास्ते में खो गया।", body: "मौजूद नहीं है — हो सकता है यह स्थानांतरित हो गया हो, या लिंक गलत हो।", home: "होमपेज पर जाएं", tools: "सभी टूल्स देखें", popular: "लोकप्रिय टूल्स" },
  id: { error: "Kesalahan 404", title: "Halaman ini hilang di tengah jalan.", body: "tidak ada — mungkin telah dipindahkan, atau tautannya salah.", home: "Ke beranda", tools: "Lihat semua alat", popular: "Alat populer" },
  ms: { error: "Ralat 404", title: "Halaman ini hilang di tengah jalan.", body: "tidak wujud — mungkin telah dipindahkan, atau pautan tidak betul.", home: "Ke laman utama", tools: "Lihat semua alat", popular: "Alat popular" },
  pl: { error: "Błąd 404", title: "Ta strona zgubiła się po drodze.", body: "nie istnieje — mogła zostać przeniesiona lub link jest błędny.", home: "Przejdź do strony głównej", tools: "Zobacz wszystkie narzędzia", popular: "Popularne narzędzia" },
  sv: { error: "Fel 404", title: "Den här sidan gick vilse på vägen.", body: "finns inte — den kan ha flyttats, eller så är länken fel.", home: "Gå till startsidan", tools: "Se alla verktyg", popular: "Populära verktyg" },
  th: { error: "ข้อผิดพลาด 404", title: "หน้านี้หายไประหว่างทาง", body: "ไม่มีอยู่ — อาจถูกย้ายแล้ว หรือลิงก์อาจไม่ถูกต้อง", home: "ไปที่หน้าแรก", tools: "ดูเครื่องมือทั้งหมด", popular: "เครื่องมือยอดนิยม" },
  tr: { error: "Hata 404", title: "Bu sayfa yolda kayboldu.", body: "mevcut değil — taşınmış olabilir veya bağlantı hatalı olabilir.", home: "Ana sayfaya git", tools: "Tüm araçları gör", popular: "Popüler araçlar" },
  uk: { error: "Помилка 404", title: "Ця сторінка загубилася по дорозі.", body: "не існує — можливо, її перемістили, або посилання неправильне.", home: "На головну", tools: "Переглянути всі інструменти", popular: "Популярні інструменти" },
  vi: { error: "Lỗi 404", title: "Trang này đã bị thất lạc.", body: "không tồn tại — có thể đã được di chuyển, hoặc liên kết bị sai.", home: "Về trang chủ", tools: "Xem tất cả công cụ", popular: "Công cụ phổ biến" },
  sw: { error: "Hitilafu 404", title: "Ukurasa huu umepotea njiani.", body: "haipo — huenda ulihamishwa, au kiungo si sahihi.", home: "Nenda mwanzo", tools: "Ona zana zote", popular: "Zana maarufu" },
};

export default function NotFound() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const h = HEADINGS[locale] ?? HEADINGS.en;

  useEffect(() => {
    trackEvent("404_not_found", { page: pathname });
  }, [pathname]);

  const popularTools = POPULAR.map((slug) => TOOLS.find((t) => t.slug === slug)).filter(Boolean);

  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <div className="paper-stack mx-auto flex h-16 w-16 items-center justify-center p-0">
        <FileQuestion size={26} className="text-ink-faint" />
      </div>
      <p className="mt-6 font-mono text-xs uppercase tracking-widest text-ink-faint">{h.error}</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">{h.title}</h1>
      <p className="mt-3 text-sm text-ink-faint">
        The page at <code className="rounded bg-paper-dim px-1.5 py-0.5 font-mono text-xs">{pathname}</code> {h.body}
      </p>

      <div className="mt-8 flex items-center justify-center gap-3">
        <Link href="/" className="rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark transition-colors">
          {h.home}
        </Link>
        <Link href="/features" className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink transition-colors">
          {h.tools}
        </Link>
      </div>

      <div className="mt-14 text-left">
        <p className="eyebrow text-ink-faint mb-3 text-center">{h.popular}</p>
        <div className="grid grid-cols-2 gap-3">
          {popularTools.map(
            (tool) =>
              tool && (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="flex items-center justify-between rounded-md border border-paper-line bg-white px-4 py-3 hover:border-ink-faint/40 transition-colors group"
                >
                  <span className="text-sm font-medium text-ink">{getToolLabel(tool.slug, locale, tool.name, tool.description).name}</span>
                  <ArrowRight size={14} className="text-ink-faint group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )
          )}
        </div>
      </div>
    </div>
  );
}
