"use client";

import { useLanguage } from "@/components/LanguageProvider";

const HEADINGS: Record<string, { title: string; intro: string }> = {
  en: { title: "Contact us", intro: "Questions, bug reports, or anything else — send it here and we'll get back to you by email." },
  es: { title: "Contáctanos", intro: "Preguntas, informes de errores o cualquier otra cosa: envíalo aquí y te responderemos por correo electrónico." },
  fr: { title: "Contactez-nous", intro: "Questions, rapports de bugs ou autre chose — envoyez-le ici et nous vous répondrons par e-mail." },
  de: { title: "Kontaktieren Sie uns", intro: "Fragen, Fehlerberichte oder alles andere — senden Sie es hier ein, wir melden uns per E-Mail bei Ihnen." },
  it: { title: "Contattaci", intro: "Domande, segnalazioni di bug o altro: inviaceli qui e ti risponderemo via email." },
  pt: { title: "Fale conosco", intro: "Perguntas, relatos de bugs ou qualquer outra coisa — envie aqui e responderemos por e-mail." },
  ja: { title: "お問い合わせ", intro: "ご質問、不具合報告、その他何でも — こちらからお送りください。メールでご返信します。" },
  ru: { title: "Свяжитесь с нами", intro: "Вопросы, сообщения об ошибках или что-то ещё — отправьте здесь, и мы ответим вам по электронной почте." },
  ko: { title: "문의하기", intro: "질문, 버그 신고, 그 외 무엇이든 — 여기로 보내주시면 이메일로 답변드리겠습니다." },
  "zh-CN": { title: "联系我们", intro: "问题、错误报告或其他任何事情——在这里发送给我们，我们会通过邮件回复您。" },
  "zh-TW": { title: "聯絡我們", intro: "問題、錯誤回報或其他任何事情——在這裡發送給我們，我們會透過郵件回覆您。" },
  ar: { title: "تواصل معنا", intro: "أسئلة أو تقارير أخطاء أو أي شيء آخر — أرسله هنا وسنرد عليك عبر البريد الإلكتروني." },
  bg: { title: "Свържете се с нас", intro: "Въпроси, доклади за грешки или каквото и да е друго — изпратете го тук и ще ви отговорим по имейл." },
  ca: { title: "Contacta amb nosaltres", intro: "Preguntes, informes d'errors o qualsevol altra cosa: envia-ho aquí i et respondrem per correu electrònic." },
  nl: { title: "Neem contact op", intro: "Vragen, bugmeldingen of iets anders — stuur het hier en we reageren per e-mail." },
  el: { title: "Επικοινωνήστε μαζί μας", intro: "Ερωτήσεις, αναφορές σφαλμάτων ή οτιδήποτε άλλο — στείλτε το εδώ και θα σας απαντήσουμε μέσω email." },
  hi: { title: "हमसे संपर्क करें", intro: "प्रश्न, बग रिपोर्ट, या कुछ भी — यहां भेजें और हम आपको ईमेल द्वारा उत्तर देंगे।" },
  id: { title: "Hubungi kami", intro: "Pertanyaan, laporan bug, atau hal lainnya — kirim di sini dan kami akan membalas via email." },
  ms: { title: "Hubungi kami", intro: "Soalan, laporan pepijat, atau apa-apa sahaja — hantar di sini dan kami akan membalas melalui e-mel." },
  pl: { title: "Skontaktuj się z nami", intro: "Pytania, zgłoszenia błędów lub cokolwiek innego — wyślij tutaj, a odpowiemy e-mailem." },
  sv: { title: "Kontakta oss", intro: "Frågor, buggrapporter eller något annat — skicka det hit så återkommer vi via e-post." },
  th: { title: "ติดต่อเรา", intro: "คำถาม รายงานข้อบกพร่อง หรือเรื่องอื่นใด — ส่งมาที่นี่แล้วเราจะติดต่อกลับทางอีเมล" },
  tr: { title: "Bize ulaşın", intro: "Sorular, hata bildirimleri veya başka bir şey — buraya gönderin, e-posta ile size geri döneceğiz." },
  uk: { title: "Зв'яжіться з нами", intro: "Питання, звіти про помилки чи щось інше — надішліть тут, і ми відповімо вам електронною поштою." },
  vi: { title: "Liên hệ với chúng tôi", intro: "Câu hỏi, báo cáo lỗi, hoặc bất cứ điều gì khác — gửi tại đây và chúng tôi sẽ phản hồi qua email." },
  sw: { title: "Wasiliana nasi", intro: "Maswali, ripoti za hitilafu, au kitu kingine chochote — tuma hapa nasi tutakujibu kupitia barua pepe." },
};

export default function ContactHeading() {
  const { locale } = useLanguage();
  const h = HEADINGS[locale] ?? HEADINGS.en;
  return (
    <>
      <h1 className="font-display text-4xl font-bold tracking-tight text-ink">{h.title}</h1>
      <p className="mt-3 text-base text-ink-faint">{h.intro}</p>
    </>
  );
}
