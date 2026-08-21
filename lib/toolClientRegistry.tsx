import type { ComponentType } from "react";

import Client_summarize from "@/app/tools/summarize/Client";
import Client_ask from "@/app/tools/ask/Client";
import Client_translate from "@/app/tools/translate/Client";
import Client_ai_html_to_pdf from "@/app/tools/ai-html-to-pdf/Client";
import Client_ai_pdf_to_html from "@/app/tools/ai-pdf-to-html/Client";
import Client_detect_plagiarism from "@/app/tools/detect-plagiarism/Client";
import Client_remove_background from "@/app/tools/remove-background/Client";
import Client_merge from "@/app/tools/merge/Client";
import Client_split from "@/app/tools/split/Client";
import Client_remove_pages from "@/app/tools/remove-pages/Client";
import Client_extract_pages from "@/app/tools/extract-pages/Client";
import Client_organize from "@/app/tools/organize/Client";
import Client_compare from "@/app/tools/compare/Client";
import Client_extract_images from "@/app/tools/extract-images/Client";
import Client_batch from "@/app/tools/batch/Client";
import Client_n_up from "@/app/tools/n-up/Client";
import Client_bates_numbering from "@/app/tools/bates-numbering/Client";
import Client_compress from "@/app/tools/compress/Client";
import Client_compress_to_size from "@/app/tools/compress-to-size/Client";
import Client_repair from "@/app/tools/repair/Client";
import Client_accessibility_checker from "@/app/tools/accessibility-checker/Client";
import Client_ocr from "@/app/tools/ocr/Client";
import Client_jpg_to_pdf from "@/app/tools/jpg-to-pdf/Client";
import Client_heic_to_pdf from "@/app/tools/heic-to-pdf/Client";
import Client_pdf_to_jpg from "@/app/tools/pdf-to-jpg/Client";
import Client_scan_to_pdf from "@/app/tools/scan-to-pdf/Client";
import Client_pdf_to_pdfa from "@/app/tools/pdf-to-pdfa/Client";
import Client_pdf_to_markdown from "@/app/tools/pdf-to-markdown/Client";
import Client_pdf_to_text from "@/app/tools/pdf-to-text/Client";
import Client_word_to_pdf from "@/app/tools/word-to-pdf/Client";
import Client_pdf_to_word from "@/app/tools/pdf-to-word/Client";
import Client_excel_to_pdf from "@/app/tools/excel-to-pdf/Client";
import Client_pdf_to_excel from "@/app/tools/pdf-to-excel/Client";
import Client_powerpoint_to_pdf from "@/app/tools/powerpoint-to-pdf/Client";
import Client_pdf_to_powerpoint from "@/app/tools/pdf-to-powerpoint/Client";
import Client_html_to_pdf from "@/app/tools/html-to-pdf/Client";
import Client_bank_statement_to_excel from "@/app/tools/bank-statement-to-excel/Client";
import Client_watermark from "@/app/tools/watermark/Client";
import Client_page_numbers from "@/app/tools/page-numbers/Client";
import Client_rotate from "@/app/tools/rotate/Client";
import Client_crop from "@/app/tools/crop/Client";
import Client_add_image from "@/app/tools/add-image/Client";
import Client_image_watermark from "@/app/tools/image-watermark/Client";
import Client_add_qrcode from "@/app/tools/add-qrcode/Client";
import Client_add_text from "@/app/tools/add-text/Client";
import Client_fill_form from "@/app/tools/fill-form/Client";
import Client_create_form from "@/app/tools/create-form/Client";
import Client_edit_text from "@/app/tools/edit-text/Client";
import Client_highlight_pdf from "@/app/tools/highlight-pdf/Client";
import Client_id_photo from "@/app/tools/id-photo/Client";
import Client_edit_metadata from "@/app/tools/edit-metadata/Client";
import Client_flatten_pdf from "@/app/tools/flatten-pdf/Client";
import Client_resize_pdf from "@/app/tools/resize-pdf/Client";
import Client_read_aloud from "@/app/tools/read-aloud/Client";
import Client_sign from "@/app/tools/sign/Client";
import Client_redact from "@/app/tools/redact/Client";
import Client_protect from "@/app/tools/protect/Client";
import Client_unlock from "@/app/tools/unlock/Client";

/**
 * Every tool's Client.tsx, keyed by slug. This is what lets the single
 * /[locale]/tools/[slug] route reuse the exact same client component the
 * English /tools/[slug] page uses, instead of hand-duplicating ~50 page
 * files under a locale-prefixed tree. Static imports rather than
 * next/dynamic() deliberately — dynamic() inside a keyed object confuses
 * the RSC client-reference-manifest bundler in this Next.js version
 * ("Could not find the module ... in the React Client Manifest").
 */
export const TOOL_CLIENTS: Record<string, ComponentType> = {
  "summarize": Client_summarize,
  "ask": Client_ask,
  "translate": Client_translate,
  "ai-html-to-pdf": Client_ai_html_to_pdf,
  "ai-pdf-to-html": Client_ai_pdf_to_html,
  "detect-plagiarism": Client_detect_plagiarism,
  "remove-background": Client_remove_background,
  "merge": Client_merge,
  "split": Client_split,
  "remove-pages": Client_remove_pages,
  "extract-pages": Client_extract_pages,
  "organize": Client_organize,
  "compare": Client_compare,
  "extract-images": Client_extract_images,
  "batch": Client_batch,
  "n-up": Client_n_up,
  "bates-numbering": Client_bates_numbering,
  "compress": Client_compress,
  "compress-to-size": Client_compress_to_size,
  "repair": Client_repair,
  "accessibility-checker": Client_accessibility_checker,
  "ocr": Client_ocr,
  "jpg-to-pdf": Client_jpg_to_pdf,
  "heic-to-pdf": Client_heic_to_pdf,
  "pdf-to-jpg": Client_pdf_to_jpg,
  "scan-to-pdf": Client_scan_to_pdf,
  "pdf-to-pdfa": Client_pdf_to_pdfa,
  "pdf-to-markdown": Client_pdf_to_markdown,
  "pdf-to-text": Client_pdf_to_text,
  "word-to-pdf": Client_word_to_pdf,
  "pdf-to-word": Client_pdf_to_word,
  "excel-to-pdf": Client_excel_to_pdf,
  "pdf-to-excel": Client_pdf_to_excel,
  "powerpoint-to-pdf": Client_powerpoint_to_pdf,
  "pdf-to-powerpoint": Client_pdf_to_powerpoint,
  "html-to-pdf": Client_html_to_pdf,
  "bank-statement-to-excel": Client_bank_statement_to_excel,
  "watermark": Client_watermark,
  "page-numbers": Client_page_numbers,
  "rotate": Client_rotate,
  "crop": Client_crop,
  "add-image": Client_add_image,
  "image-watermark": Client_image_watermark,
  "add-qrcode": Client_add_qrcode,
  "add-text": Client_add_text,
  "fill-form": Client_fill_form,
  "create-form": Client_create_form,
  "edit-text": Client_edit_text,
  "highlight-pdf": Client_highlight_pdf,
  "id-photo": Client_id_photo,
  "edit-metadata": Client_edit_metadata,
  "flatten-pdf": Client_flatten_pdf,
  "resize-pdf": Client_resize_pdf,
  "read-aloud": Client_read_aloud,
  "sign": Client_sign,
  "redact": Client_redact,
  "protect": Client_protect,
  "unlock": Client_unlock,
};

