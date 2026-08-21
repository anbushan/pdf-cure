"use client";

import type { PDFDocument as PDFDocumentType } from "pdf-lib";
import { renderPdfPages } from "./pdfRender";
import { getPdfjs } from "./pdfjs";

type PdfLibModule = typeof import("pdf-lib");

let pdfLibPromise: Promise<PdfLibModule> | null = null;

/** Lazily loads pdf-lib on first use so it isn't part of every page's initial JS bundle. */
function getPdfLib(): Promise<PdfLibModule> {
  if (!pdfLibPromise) pdfLibPromise = import("pdf-lib");
  return pdfLibPromise;
}

async function loadDoc(file: File | ArrayBuffer): Promise<PDFDocumentType> {
  const { PDFDocument } = await getPdfLib();
  const bytes = file instanceof File ? await file.arrayBuffer() : file;
  return PDFDocument.load(bytes, { ignoreEncryption: true });
}

/* ---------------------------- Metadata ---------------------------- */

export interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  /** Comma-separated, matching how the field is edited in the UI. */
  keywords: string;
}

export async function readPdfMetadata(file: File): Promise<PdfMetadata> {
  const doc = await loadDoc(file);
  return {
    title: doc.getTitle() ?? "",
    author: doc.getAuthor() ?? "",
    subject: doc.getSubject() ?? "",
    keywords: doc.getKeywords() ?? "",
  };
}

export async function writePdfMetadata(file: File, meta: PdfMetadata): Promise<Uint8Array> {
  const doc = await loadDoc(file);
  doc.setTitle(meta.title);
  doc.setAuthor(meta.author);
  doc.setSubject(meta.subject);
  doc.setKeywords(
    meta.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)
  );
  return doc.save();
}

/* ---------------------------- Merge ---------------------------- */

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const { PDFDocument } = await getPdfLib();
  const out = await PDFDocument.create();
  for (const file of files) {
    const src = await loadDoc(file);
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  return out.save();
}

/* ------------------------ Range parsing ------------------------- */

/** Parses "1-3,5,7-9" into zero-indexed page arrays, clamped to totalPages. */
export function parseRanges(input: string, totalPages: number): number[][] {
  const groups: number[][] = [];
  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
  for (const part of parts) {
    const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      let a = parseInt(m[1], 10);
      let b = parseInt(m[2], 10);
      if (a > b) [a, b] = [b, a];
      a = Math.max(1, a);
      b = Math.min(totalPages, b);
      const g: number[] = [];
      for (let i = a; i <= b; i++) g.push(i - 1);
      if (g.length) groups.push(g);
    } else if (/^\d+$/.test(part)) {
      const n = parseInt(part, 10);
      if (n >= 1 && n <= totalPages) groups.push([n - 1]);
    }
  }
  return groups;
}

/** Parses a page-selection string like "1,3-5" into a flat, deduped, sorted zero-indexed array. */
export function parsePageList(input: string, totalPages: number): number[] {
  const groups = parseRanges(input, totalPages);
  const set = new Set<number>();
  groups.forEach((g) => g.forEach((i) => set.add(i)));
  return Array.from(set).sort((a, b) => a - b);
}

/* ---------------------------- Split ---------------------------- */

/** Chunks a document's zero-indexed pages into consecutive groups of `size` (the last group may be smaller). */
export function splitEveryNPages(totalPages: number, size: number): number[][] {
  const groups: number[][] = [];
  const step = Math.max(1, Math.floor(size));
  for (let start = 0; start < totalPages; start += step) {
    const group: number[] = [];
    for (let i = start; i < Math.min(start + step, totalPages); i++) group.push(i);
    groups.push(group);
  }
  return groups;
}

export async function splitByRanges(
  file: File,
  ranges: number[][]
): Promise<Uint8Array[]> {
  const { PDFDocument } = await getPdfLib();
  const src = await loadDoc(file);
  const outputs: Uint8Array[] = [];
  for (const group of ranges) {
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, group);
    pages.forEach((p) => out.addPage(p));
    outputs.push(await out.save());
  }
  return outputs;
}

/* ------------------------ Remove / Extract ------------------------ */

export async function removePages(file: File, zeroIndexed: number[]): Promise<Uint8Array> {
  const { PDFDocument } = await getPdfLib();
  const src = await loadDoc(file);
  const remove = new Set(zeroIndexed);
  const keep = src.getPageIndices().filter((i) => !remove.has(i));
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, keep);
  pages.forEach((p) => out.addPage(p));
  return out.save();
}

export async function extractPages(file: File, zeroIndexed: number[]): Promise<Uint8Array> {
  const { PDFDocument } = await getPdfLib();
  const src = await loadDoc(file);
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, zeroIndexed);
  pages.forEach((p) => out.addPage(p));
  return out.save();
}

/* ---------------------------- Organize ---------------------------- */

export interface OrganizePage {
  originalIndex: number;
  rotation: 0 | 90 | 180 | 270;
}

export async function buildOrganizedPdf(
  file: File,
  order: OrganizePage[]
): Promise<Uint8Array> {
  const { PDFDocument, degrees } = await getPdfLib();
  const src = await loadDoc(file);
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, order.map((o) => o.originalIndex));
  pages.forEach((p, i) => {
    const rot = order[i].rotation;
    if (rot) p.setRotation(degrees(p.getRotation().angle + rot));
    out.addPage(p);
  });
  return out.save();
}

/* ---------------------------- Rotate ---------------------------- */

export async function rotatePdf(
  file: File,
  degreesBy: number,
  pageIndices?: number[]
): Promise<Uint8Array> {
  const { degrees } = await getPdfLib();
  const doc = await loadDoc(file);
  const pages = doc.getPages();
  const targets = pageIndices ?? pages.map((_, i) => i);
  targets.forEach((i) => {
    const page = pages[i];
    page.setRotation(degrees(page.getRotation().angle + degreesBy));
  });
  return doc.save();
}

/* ---------------------------- Crop ---------------------------- */

/** Crops each page by a percentage margin (0-40) on each side. */
export async function cropPdf(file: File, marginPercent: number): Promise<Uint8Array> {
  const doc = await loadDoc(file);
  const pages = doc.getPages();
  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const dx = (width * marginPercent) / 100;
    const dy = (height * marginPercent) / 100;
    page.setCropBox(dx, dy, width - dx * 2, height - dy * 2);
  });
  return doc.save();
}

/* ---------------------------- Watermark ---------------------------- */

export interface WatermarkOptions {
  text: string;
  opacity: number; // 0-1
  fontSize: number;
  rotation: number; // degrees
  color: [number, number, number]; // 0-1 rgb
}

export async function addWatermark(file: File, opts: WatermarkOptions): Promise<Uint8Array> {
  const { degrees, rgb, StandardFonts } = await getPdfLib();
  const doc = await loadDoc(file);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  doc.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(opts.text, opts.fontSize);
    page.drawText(opts.text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: opts.fontSize,
      font,
      color: rgb(...opts.color),
      opacity: opts.opacity,
      rotate: degrees(opts.rotation),
    });
  });
  return doc.save();
}

/* ---------------------------- Page numbers ---------------------------- */

export type PageNumberPosition = "bottom-center" | "bottom-right" | "bottom-left" | "top-center" | "top-right" | "top-left";

export async function addPageNumbers(
  file: File,
  position: PageNumberPosition,
  startAt = 1,
  fontSize = 11
): Promise<Uint8Array> {
  const { rgb, StandardFonts } = await getPdfLib();
  const doc = await loadDoc(file);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  pages.forEach((page, i) => {
    const { width } = page.getSize();
    const label = String(i + startAt);
    const textWidth = font.widthOfTextAtSize(label, fontSize);
    const margin = 28;
    let x = width / 2 - textWidth / 2;
    if (position.endsWith("right")) x = width - margin - textWidth;
    if (position.endsWith("left")) x = margin;
    const y = position.startsWith("top") ? page.getSize().height - margin : margin - fontSize * 0.3;
    page.drawText(label, { x, y, size: fontSize, font, color: rgb(0.1, 0.12, 0.16) });
  });
  return doc.save();
}

/* ---------------------------- Compress ---------------------------- */

export interface CompressResult {
  bytes: Uint8Array;
  originalSize: number;
  newSize: number;
}

/**
 * Rasterizes every page at a reduced scale and re-encodes it as a JPEG,
 * then rebuilds the PDF from those images. This trades vector/text
 * crispness for a much smaller file — the same trick most in-browser
 * PDF compressors use since real content-stream recompression isn't
 * practical without a native PDF engine.
 */
export async function compressPdf(
  file: File,
  level: "low" | "medium" | "high"
): Promise<CompressResult> {
  const { PDFDocument } = await getPdfLib();
  const settings = {
    low: { scale: 1.5, quality: 0.85 },
    medium: { scale: 1.1, quality: 0.7 },
    high: { scale: 0.8, quality: 0.5 },
  }[level];

  const originalSize = file.size;
  const rendered = await renderPdfPages(file, settings.scale, undefined, settings.quality);

  const out = await PDFDocument.create();
  for (const page of rendered) {
    const jpgBytes = dataUrlToBytes(page.dataUrl);
    const img = await out.embedJpg(jpgBytes);
    const pdfPage = out.addPage([page.width, page.height]);
    pdfPage.drawImage(img, { x: 0, y: 0, width: page.width, height: page.height });
  }
  const bytes = await out.save();
  return { bytes, originalSize, newSize: bytes.byteLength };
}

export interface CompressToSizeResult extends CompressResult {
  /** false if even the most aggressive step still couldn't fit under the target. */
  achieved: boolean;
}

const COMPRESS_TO_SIZE_STEPS = [
  { scale: 1.5, quality: 0.85 },
  { scale: 1.3, quality: 0.75 },
  { scale: 1.1, quality: 0.65 },
  { scale: 0.95, quality: 0.55 },
  { scale: 0.8, quality: 0.45 },
  { scale: 0.65, quality: 0.35 },
  { scale: 0.5, quality: 0.28 },
];

/**
 * Same re-render-and-re-encode technique as compressPdf, but instead of one
 * of three fixed presets, it steps through progressively more aggressive
 * scale/quality settings — same list every time, not a real search — until
 * the result fits under the requested size or the list runs out.
 */
export async function compressToTargetSize(file: File, targetBytes: number): Promise<CompressToSizeResult> {
  const { PDFDocument } = await getPdfLib();
  const originalSize = file.size;
  let last: Uint8Array | null = null;

  for (const step of COMPRESS_TO_SIZE_STEPS) {
    const rendered = await renderPdfPages(file, step.scale, undefined, step.quality);
    const out = await PDFDocument.create();
    for (const page of rendered) {
      const jpgBytes = dataUrlToBytes(page.dataUrl);
      const img = await out.embedJpg(jpgBytes);
      const pdfPage = out.addPage([page.width, page.height]);
      pdfPage.drawImage(img, { x: 0, y: 0, width: page.width, height: page.height });
    }
    last = await out.save();
    if (last.byteLength <= targetBytes) {
      return { bytes: last, originalSize, newSize: last.byteLength, achieved: true };
    }
  }

  return { bytes: last!, originalSize, newSize: last!.byteLength, achieved: false };
}

/* ---------------------------- Images to PDF ---------------------------- */

export interface ImagePageOptions {
  fitMode: "fit" | "fill";
  pageSize: "auto" | "a4" | "letter";
}

const PAGE_SIZES: Record<string, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  legal: [612, 1008],
  a3: [841.89, 1190.55],
};

export async function buildPdfFromImages(
  files: File[],
  opts: ImagePageOptions
): Promise<Uint8Array> {
  const { PDFDocument } = await getPdfLib();
  const out = await PDFDocument.create();
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const isPng = file.type === "image/png";
    const img = isPng ? await out.embedPng(bytes) : await out.embedJpg(bytes);

    let pageW: number, pageH: number;
    if (opts.pageSize === "auto") {
      pageW = img.width;
      pageH = img.height;
    } else {
      [pageW, pageH] = PAGE_SIZES[opts.pageSize];
    }
    const page = out.addPage([pageW, pageH]);

    if (opts.pageSize === "auto") {
      page.drawImage(img, { x: 0, y: 0, width: pageW, height: pageH });
    } else {
      const scale = Math.min(pageW / img.width, pageH / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      page.drawImage(img, { x: (pageW - w) / 2, y: (pageH - h) / 2, width: w, height: h });
    }
  }
  return out.save();
}

/* ---------------------------- HEIC to PDF ---------------------------- */

type Heic2AnyModule = typeof import("heic2any");

let heic2anyPromise: Promise<Heic2AnyModule> | null = null;

/** Lazily loads heic2any (bundles its own libheif wasm decoder) on first use. */
function getHeic2any(): Promise<Heic2AnyModule> {
  if (!heic2anyPromise) heic2anyPromise = import("heic2any");
  return heic2anyPromise;
}

/**
 * Converts a single iPhone HEIC/HEIF photo to a JPEG File, entirely
 * client-side, so it can be previewed and then fed into
 * buildPdfFromImages like any other image. Live Photos and burst shots
 * can decode to multiple frames — only the first is used.
 */
export async function heicToJpegFile(file: File): Promise<File> {
  const heic2any = (await getHeic2any()).default;
  const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
  const jpegBlob = Array.isArray(result) ? result[0] : result;
  const name = file.name.replace(/\.(heic|heif)$/i, "") || file.name;
  return new File([jpegBlob], `${name}.jpg`, { type: "image/jpeg" });
}

/* ---------------------------- Resize page size ---------------------------- */

export type PageSizeTarget = "a4" | "letter" | "legal" | "a3";

/**
 * Rescales every page to a standard target size, uniformly (never
 * stretched) so nothing looks distorted, and centered within the new
 * page box with whatever margin that leaves.
 */
export async function resizePdf(file: File, target: PageSizeTarget): Promise<Uint8Array> {
  const doc = await loadDoc(file);
  const [targetW, targetH] = PAGE_SIZES[target];

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const scale = Math.min(targetW / width, targetH / height);
    page.scale(scale, scale);
    const scaledW = width * scale;
    const scaledH = height * scale;
    page.setSize(targetW, targetH);
    page.translateContent((targetW - scaledW) / 2, (targetH - scaledH) / 2);
  }

  return doc.save();
}

/* ---------------------------- Signing ---------------------------- */

export interface SignaturePlacement {
  pageIndex: number;
  xPercent: number; // 0-100 from left
  yPercent: number; // 0-100 from top
  widthPercent: number; // 0-100 of page width
}

export async function placeSignature(
  file: File,
  signaturePngDataUrl: string,
  placement: SignaturePlacement
): Promise<Uint8Array> {
  const doc = await loadDoc(file);
  const pngBytes = dataUrlToBytes(signaturePngDataUrl);
  const img = await doc.embedPng(pngBytes);
  const page = doc.getPages()[placement.pageIndex];
  const { width: pw, height: ph } = page.getSize();
  const w = (placement.widthPercent / 100) * pw;
  const h = w * (img.height / img.width);
  const x = (placement.xPercent / 100) * pw;
  const y = ph - (placement.yPercent / 100) * ph - h;
  page.drawImage(img, { x, y, width: w, height: h });
  return doc.save();
}

/* ---------------------------- Add text ---------------------------- */

export interface TextPlacement {
  pageIndex: number;
  xPercent: number; // 0-100 from left
  yPercent: number; // 0-100 from top, to the top of the first line
  fontSize: number; // pt
  color: [number, number, number]; // 0-1 rgb
  bold?: boolean;
}

/** Types free-form text (including multiple lines) directly onto a page — for filling in a blank on a scanned form, a note, a caption, etc. */
export async function placeTextOnPdf(file: File, text: string, placement: TextPlacement): Promise<Uint8Array> {
  const { rgb, StandardFonts } = await getPdfLib();
  const doc = await loadDoc(file);
  const font = await doc.embedFont(placement.bold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica);
  const page = doc.getPages()[placement.pageIndex];
  const { width: pw, height: ph } = page.getSize();
  const x = (placement.xPercent / 100) * pw;
  const topY = ph - (placement.yPercent / 100) * ph;
  const lineHeight = placement.fontSize * 1.25;

  text.split("\n").forEach((line, i) => {
    page.drawText(line, {
      x,
      y: topY - placement.fontSize - i * lineHeight,
      size: placement.fontSize,
      font,
      color: rgb(...placement.color),
    });
  });

  return doc.save();
}

/* ---------------------------- Image overlay ---------------------------- */

export interface ImagePlacement extends SignaturePlacement {
  /** Degrees clockwise, as shown on screen (0/90/180/270). Rotates around the image's own center. */
  rotationDeg?: number;
}

/**
 * pdf-lib's `rotate` pivots an image around its bottom-left corner, in a
 * counter-clockwise, y-up space. This works out where to put that corner
 * so the image instead rotates around its own center, clockwise, matching
 * a CSS `transform: rotate()` preview — shared by placeImageOnPdf (single
 * placement) and addImageWatermark (same placement, once per page).
 */
function rotatedImageOrigin(cx: number, cy: number, w: number, h: number, rotationDeg: number) {
  const theta = (-rotationDeg * Math.PI) / 180;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return {
    x: cx - ((w / 2) * cos - (h / 2) * sin),
    y: cy - ((w / 2) * sin + (h / 2) * cos),
  };
}

export async function placeImageOnPdf(
  file: File,
  imageDataUrl: string,
  placement: ImagePlacement
): Promise<Uint8Array> {
  const { degrees } = await getPdfLib();
  const doc = await loadDoc(file);
  const bytes = dataUrlToBytes(imageDataUrl);
  const isPng = imageDataUrl.startsWith("data:image/png");
  const img = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
  const page = doc.getPages()[placement.pageIndex];
  const { width: pw, height: ph } = page.getSize();
  const w = (placement.widthPercent / 100) * pw;
  const h = w * (img.height / img.width);
  const boxX = (placement.xPercent / 100) * pw;
  const boxY = ph - (placement.yPercent / 100) * ph - h;
  const rotation = placement.rotationDeg ?? 0;
  const { x, y } = rotatedImageOrigin(boxX + w / 2, boxY + h / 2, w, h, rotation);

  page.drawImage(img, { x, y, width: w, height: h, rotate: degrees(-rotation) });
  return doc.save();
}

/* ---------------------------- Image watermark ---------------------------- */

export interface ImageWatermarkOptions {
  opacity: number; // 0-1
  widthPercent: number; // 0-100 of page width
  rotationDeg: number; // degrees clockwise, as shown on screen
}

/** Same idea as addWatermark, but stamps an uploaded image — centered once per page — instead of text. */
export async function addImageWatermark(
  file: File,
  imageDataUrl: string,
  opts: ImageWatermarkOptions
): Promise<Uint8Array> {
  const { degrees } = await getPdfLib();
  const doc = await loadDoc(file);
  const bytes = dataUrlToBytes(imageDataUrl);
  const isPng = imageDataUrl.startsWith("data:image/png");
  const img = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);

  doc.getPages().forEach((page) => {
    const { width: pw, height: ph } = page.getSize();
    const w = (opts.widthPercent / 100) * pw;
    const h = w * (img.height / img.width);
    const { x, y } = rotatedImageOrigin(pw / 2, ph / 2, w, h, opts.rotationDeg);
    page.drawImage(img, { x, y, width: w, height: h, opacity: opts.opacity, rotate: degrees(-opts.rotationDeg) });
  });

  return doc.save();
}

/* ---------------------------- Fill form ---------------------------- */

export type FormFieldKind = "text" | "checkbox" | "dropdown" | "optionList" | "radio";

export interface FormFieldWidget {
  fieldName: string;
  kind: FormFieldKind;
  pageIndex: number;
  /** PDF page space: bottom-left origin, y-up, in points. */
  rect: { x: number; y: number; width: number; height: number };
  multiline?: boolean;
  options?: string[];
  /** Radio only — which option this specific widget (there's one per option) represents. */
  radioValue?: string;
}

export interface FormInfo {
  pageSizes: { width: number; height: number }[];
  widgets: FormFieldWidget[];
  values: Record<string, string | boolean>;
}

/** Reads every fillable field's current value, type, and on-page position, for building an overlay editor. */
export async function readPdfFormFields(file: File): Promise<FormInfo> {
  const { PDFTextField, PDFCheckBox, PDFDropdown, PDFOptionList, PDFRadioGroup } = await getPdfLib();
  const doc = await loadDoc(file);
  const form = doc.getForm();
  const pages = doc.getPages();
  const pageSizes = pages.map((p) => p.getSize());
  const pageRefTags = pages.map((p) => p.ref.tag);

  const widgets: FormFieldWidget[] = [];
  const values: Record<string, string | boolean> = {};

  for (const field of form.getFields()) {
    const name = field.getName();
    let kind: FormFieldKind;
    let options: string[] | undefined;

    if (field instanceof PDFTextField) {
      kind = "text";
      values[name] = field.getText() ?? "";
    } else if (field instanceof PDFCheckBox) {
      kind = "checkbox";
      values[name] = field.isChecked();
    } else if (field instanceof PDFDropdown) {
      kind = "dropdown";
      options = field.getOptions();
      values[name] = field.getSelected()[0] ?? "";
    } else if (field instanceof PDFOptionList) {
      kind = "optionList";
      options = field.getOptions();
      values[name] = field.getSelected()[0] ?? "";
    } else if (field instanceof PDFRadioGroup) {
      kind = "radio";
      options = field.getOptions();
      values[name] = field.getSelected() ?? "";
    } else {
      continue; // buttons, signatures, and anything else that isn't fillable text/choice data
    }

    for (const widget of field.acroField.getWidgets()) {
      // Widgets record which page they're on via /P — fall back to page 0
      // for the rare malformed PDF that omits it.
      const pageRef = widget.P();
      const pageIndex = pageRef ? Math.max(0, pageRefTags.indexOf(pageRef.tag)) : 0;
      const entry: FormFieldWidget = { fieldName: name, kind, pageIndex, rect: widget.getRectangle() };
      if (kind === "text") entry.multiline = field instanceof PDFTextField && field.isMultiline();
      if (options) entry.options = options;
      if (kind === "radio") entry.radioValue = widget.getOnValue()?.decodeText();
      widgets.push(entry);
    }
  }

  return { pageSizes, widgets, values };
}

/** Writes the given values back into the form's fields (looked up by fully-qualified name) and saves. */
export async function fillPdfForm(
  file: File,
  values: Record<string, string | boolean>,
  opts: { flatten?: boolean } = {}
): Promise<Uint8Array> {
  const { PDFTextField, PDFCheckBox, PDFDropdown, PDFOptionList, PDFRadioGroup } = await getPdfLib();
  const doc = await loadDoc(file);
  const form = doc.getForm();

  for (const [name, value] of Object.entries(values)) {
    try {
      const field = form.getField(name);
      if (field instanceof PDFTextField) {
        field.setText(typeof value === "string" && value.length > 0 ? value : undefined);
      } else if (field instanceof PDFCheckBox) {
        if (value) field.check();
        else field.uncheck();
      } else if ((field instanceof PDFDropdown || field instanceof PDFOptionList || field instanceof PDFRadioGroup) && value) {
        field.select(String(value));
      }
    } catch {
      // Best-effort — skip a field that fails to set rather than aborting the whole fill.
    }
  }

  // Flattening bakes the values into the page content and removes the
  // fields, so the result can no longer be edited — useful for a final,
  // submission-ready copy (e.g. a signed loan form).
  if (opts.flatten) form.flatten();

  return doc.save();
}

/**
 * Bakes a PDF's fillable form fields into permanent page content and
 * removes the underlying fields, so the values can no longer be edited —
 * for a PDF that was already filled out (elsewhere, or by someone else)
 * and just needs to become a static, submission-ready copy.
 */
export async function flattenPdf(file: File): Promise<Uint8Array> {
  const doc = await loadDoc(file);
  const form = doc.getForm();
  if (form.getFields().length === 0) throw new Error("This PDF doesn't have any fillable form fields to flatten.");
  form.flatten();
  return doc.save();
}

/* ---------------------------- Extract images ---------------------------- */

export interface ExtractedImage {
  pageIndex: number;
  bytes: Uint8Array; // PNG
}

type Matrix = [number, number, number, number, number, number];
const IDENTITY_MATRIX: Matrix = [1, 0, 0, 1, 0, 0];

// Standard PDF matrix concatenation: applies `m1` first, then `m2`.
function matMul(m1: Matrix, m2: Matrix): Matrix {
  return [
    m1[0] * m2[0] + m1[1] * m2[2],
    m1[0] * m2[1] + m1[1] * m2[3],
    m1[2] * m2[0] + m1[3] * m2[2],
    m1[2] * m2[1] + m1[3] * m2[3],
    m1[4] * m2[0] + m1[5] * m2[2] + m2[4],
    m1[4] * m2[1] + m1[5] * m2[3] + m2[5],
  ];
}

function matApply(m: Matrix, x: number, y: number): [number, number] {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

/**
 * Pulls each embedded photo/logo back out of a PDF at real resolution,
 * rather than rasterizing whole pages like PDF to JPG does. pdf.js's
 * operator list records the raw content-stream ops (q/Q/cm/Do) but not an
 * image's actual placement, so we replay the save/restore/transform matrix
 * stack ourselves to find where each `Do` (paintImageXObject) call landed
 * on the page, then crop that rectangle out of a full-page render — which
 * sidesteps having to decode every possible PDF image color space by hand.
 * Tiled image patterns (paintImageXObjectRepeat) are skipped; those are
 * almost always background fills, not "a picture" someone wants to save.
 */
export async function extractImagesFromPdf(file: File, scale = 2): Promise<ExtractedImage[]> {
  const pdfjsLib = await getPdfjs();
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const OPS = pdfjsLib.OPS;
  const results: ExtractedImage[] = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const opList = await page.getOperatorList();

    let ctm: Matrix = IDENTITY_MATRIX;
    const stack: Matrix[] = [];
    const boxes: { x0: number; y0: number; x1: number; y1: number }[] = [];

    for (let i = 0; i < opList.fnArray.length; i++) {
      const fn = opList.fnArray[i];
      if (fn === OPS.save) {
        stack.push(ctm);
      } else if (fn === OPS.restore) {
        ctm = stack.pop() ?? IDENTITY_MATRIX;
      } else if (fn === OPS.transform) {
        ctm = matMul(opList.argsArray[i] as Matrix, ctm);
      } else if (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject) {
        // Both a named image XObject and an inline (BI/ID/EI) image paint into the unit square, transformed by the CTM.
        const corners = [matApply(ctm, 0, 0), matApply(ctm, 1, 0), matApply(ctm, 1, 1), matApply(ctm, 0, 1)];
        const xs = corners.map((c) => c[0]);
        const ys = corners.map((c) => c[1]);
        boxes.push({ x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) });
      }
    }

    if (boxes.length === 0) continue;

    const viewport = page.getViewport({ scale });
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = Math.max(1, Math.ceil(viewport.width));
    pageCanvas.height = Math.max(1, Math.ceil(viewport.height));
    const pageCtx = pageCanvas.getContext("2d")!;
    await page.render({ canvasContext: pageCtx, viewport }).promise;

    for (const box of boxes) {
      const [vx0, vy0] = viewport.convertToViewportPoint(box.x0, box.y0);
      const [vx1, vy1] = viewport.convertToViewportPoint(box.x1, box.y1);
      const sx = Math.max(0, Math.floor(Math.min(vx0, vx1)));
      const sy = Math.max(0, Math.floor(Math.min(vy0, vy1)));
      const sw = Math.min(pageCanvas.width - sx, Math.ceil(Math.abs(vx1 - vx0)));
      const sh = Math.min(pageCanvas.height - sy, Math.ceil(Math.abs(vy1 - vy0)));
      if (sw < 4 || sh < 4) continue; // skip slivers — decorative rules, not real images

      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = sw;
      cropCanvas.height = sh;
      cropCanvas.getContext("2d")!.drawImage(pageCanvas, sx, sy, sw, sh, 0, 0, sw, sh);

      const blob: Blob = await new Promise((resolve, reject) =>
        cropCanvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't encode an extracted image."))), "image/png")
      );
      results.push({ pageIndex: p - 1, bytes: new Uint8Array(await blob.arrayBuffer()) });
    }
  }

  return results;
}

/* ---------------------------- Highlight & annotate ---------------------------- */

export interface HighlightBox {
  pageIndex: number;
  xPercent: number;
  yPercent: number;
  wPercent: number;
  hPercent: number;
  color: [number, number, number]; // 0-1 rgb
}

export interface CommentMark {
  pageIndex: number;
  xPercent: number;
  yPercent: number;
  text: string;
  color: [number, number, number];
}

/**
 * Draws translucent highlight boxes and numbered sticky-note markers
 * directly onto the page as vector shapes — unlike Redact, nothing is
 * rasterized, so the underlying text stays intact, selectable, and
 * searchable underneath a highlight.
 */
export async function annotatePdf(file: File, highlights: HighlightBox[], comments: CommentMark[]): Promise<Uint8Array> {
  const { rgb, StandardFonts } = await getPdfLib();
  const doc = await loadDoc(file);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();

  for (const h of highlights) {
    const page = pages[h.pageIndex];
    if (!page) continue;
    const { width: pw, height: ph } = page.getSize();
    const width = (h.wPercent / 100) * pw;
    const height = (h.hPercent / 100) * ph;
    const x = (h.xPercent / 100) * pw;
    const y = ph - (h.yPercent / 100) * ph - height;
    page.drawRectangle({ x, y, width, height, color: rgb(...h.color), opacity: 0.35 });
  }

  const maxCharsPerLine = 40;
  comments.forEach((c, i) => {
    const page = pages[c.pageIndex];
    if (!page) return;
    const { width: pw, height: ph } = page.getSize();
    const cx = (c.xPercent / 100) * pw;
    const cy = ph - (c.yPercent / 100) * ph;
    const radius = 8;

    page.drawCircle({ x: cx, y: cy, size: radius, color: rgb(...c.color), opacity: 0.95 });
    const num = String(i + 1);
    page.drawText(num, { x: cx - boldFont.widthOfTextAtSize(num, 9) / 2, y: cy - 3.5, size: 9, font: boldFont, color: rgb(1, 1, 1) });

    const text = c.text.trim();
    if (!text) return;
    const lines: string[] = [];
    for (let rest = text; rest.length > 0; rest = rest.slice(maxCharsPerLine)) lines.push(rest.slice(0, maxCharsPerLine));

    const lineHeight = 10;
    const boxWidth = 160;
    const boxHeight = lines.length * lineHeight + 8;
    const boxX = Math.min(cx + radius + 4, Math.max(0, pw - boxWidth - 4));
    const boxY = Math.min(Math.max(cy - boxHeight / 2, 0), Math.max(0, ph - boxHeight));

    page.drawRectangle({
      x: boxX,
      y: boxY,
      width: boxWidth,
      height: boxHeight,
      color: rgb(1, 0.98, 0.85),
      borderColor: rgb(...c.color),
      borderWidth: 1,
    });
    lines.forEach((line, li) => {
      page.drawText(line, { x: boxX + 4, y: boxY + boxHeight - (li + 1) * lineHeight, size: 8, font, color: rgb(0.1, 0.1, 0.1) });
    });
  });

  return doc.save();
}

/* ---------------------------- Redaction ---------------------------- */

export interface RedactionBox {
  pageIndex: number;
  xPercent: number;
  yPercent: number;
  wPercent: number;
  hPercent: number;
}

/**
 * Flattens the affected pages to images with black boxes burned in,
 * so the underlying text/vectors are actually destroyed rather than
 * just visually covered.
 */
export async function redactPdf(file: File, boxes: RedactionBox[]): Promise<Uint8Array> {
  const { PDFDocument } = await getPdfLib();
  const rendered = await renderPdfPages(file, 2, undefined, 0.9);
  const src = await loadDoc(file);
  const out = await PDFDocument.create();

  for (const r of rendered) {
    const boxesForPage = boxes.filter((b) => b.pageIndex === r.index);
    if (boxesForPage.length === 0) {
      // untouched page: copy as-is to preserve quality
      const [copied] = await out.copyPages(src, [r.index]);
      out.addPage(copied);
      continue;
    }
    const canvas = document.createElement("canvas");
    canvas.width = r.width;
    canvas.height = r.height;
    const ctx = canvas.getContext("2d")!;
    const image = await loadImage(r.dataUrl);
    ctx.drawImage(image, 0, 0);
    ctx.fillStyle = "black";
    boxesForPage.forEach((b) => {
      ctx.fillRect(
        (b.xPercent / 100) * canvas.width,
        (b.yPercent / 100) * canvas.height,
        (b.wPercent / 100) * canvas.width,
        (b.hPercent / 100) * canvas.height
      );
    });
    const jpgBytes = dataUrlToBytes(canvas.toDataURL("image/jpeg", 0.9));
    const img = await out.embedJpg(jpgBytes);
    const page = out.addPage([r.width, r.height]);
    page.drawImage(img, { x: 0, y: 0, width: r.width, height: r.height });
  }
  return out.save();
}

/* ---------------------------- HTML to PDF ---------------------------- */

export async function htmlToPdf(html: string): Promise<Uint8Array> {
  const { default: jsPDF } = await import("jspdf");
  const { default: html2canvas } = await import("html2canvas");

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-99999px";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.background = "#ffffff";
  container.style.padding = "24px";
  container.style.fontFamily = "Arial, sans-serif";
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: "#ffffff" });
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL("image/jpeg", 0.92);

    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return new Uint8Array(pdf.output("arraybuffer"));
  } finally {
    document.body.removeChild(container);
  }
}

/* ---------------------------- Word to PDF ---------------------------- */

export async function wordToPdf(file: File): Promise<Uint8Array> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
  return htmlToPdf(`<div style="font-family: Georgia, serif; line-height:1.5;">${html}</div>`);
}

/* ---------------------------- Excel to PDF ---------------------------- */

export async function excelToPdf(file: File): Promise<Uint8Array> {
  const XLSX = await import("xlsx");
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  let html = "";
  workbook.SheetNames.forEach((name) => {
    const sheet = workbook.Sheets[name];
    const tableHtml = XLSX.utils.sheet_to_html(sheet, { id: undefined });
    html += `<h3 style="font-family:sans-serif;margin-top:20px;">${name}</h3>${tableHtml}`;
  });

  const styled = `
    <style>
      table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 12px; }
      td, th { border: 1px solid #ccc; padding: 4px 8px; }
    </style>
    ${html}
  `;
  return htmlToPdf(styled);
}

/* ---------------------------- PDF to Word ---------------------------- */

/**
 * Extracts text (no layout/formatting) and rebuilds it as a .docx.
 * This is inherently lossy — true fidelity conversion needs a
 * server-side layout-aware engine — but it gets editable text out fast.
 */
export async function pdfToWord(file: File): Promise<Uint8Array> {
  const { Document, Packer, Paragraph, TextRun } = await import("docx");
  const pdfjsLib = await getPdfjs();
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;

  const children: InstanceType<typeof Paragraph>[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    let currentLine = "";
    for (const item of textContent.items as any[]) {
      if (typeof item.str !== "string") continue;
      currentLine += item.str;
      if (item.hasEOL) {
        children.push(new Paragraph({ children: [new TextRun(currentLine)] }));
        currentLine = "";
      } else {
        currentLine += " ";
      }
    }
    if (currentLine.trim()) {
      children.push(new Paragraph({ children: [new TextRun(currentLine)] }));
    }
    children.push(new Paragraph({ children: [new TextRun("")] }));
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  return new Uint8Array(await blob.arrayBuffer());
}

/* ---------------------------- Translated text to PDF ---------------------------- */

/**
 * Renders translated text into a new PDF via the HTML→PDF pipeline
 * (html2canvas + jsPDF) rather than drawing text directly with pdf-lib.
 * This matters: pdf-lib's built-in fonts only cover Latin script, so
 * Japanese/Arabic/Hindi/Thai/etc. text would render as blank boxes.
 * Routing through the browser's own font rendering means whatever
 * fonts are installed on the user's system handle the glyphs correctly
 * for any language. The tradeoff — same as PDF-to-Word — is that this
 * re-flows the text into a clean new layout rather than preserving the
 * original document's exact positioning, images, or icons.
 */
export async function translatedTextToPdf(translated: string, targetLanguageLabel: string): Promise<Uint8Array> {
  const blocks = translated
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const html = blocks
    .map((block) => {
      if (block.startsWith("## ")) {
        return `<h2 style="font-size:19px;font-weight:700;margin:22px 0 8px;">${escapeHtml(block.slice(3))}</h2>`;
      }
      return `<p style="margin:0 0 14px;">${escapeHtml(block).replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");

  const wrapped = `
    <div style="font-family: sans-serif; font-size: 14px; line-height: 1.7; color: #1a1a1a;">
      <p style="font-size:11px;color:#888;margin-bottom:18px;">Translated to ${escapeHtml(targetLanguageLabel)}</p>
      ${html}
    </div>
  `;
  return htmlToPdf(wrapped);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ---------------------------- Protect / Unlock ---------------------------- */

/**
 * Encrypts a PDF with a password (AES-256, via Web Crypto — no native
 * dependencies). Unlike everything else in this file, this doesn't go
 * through pdf-lib's own APIs, since pdf-lib itself doesn't implement
 * encryption — @pdfsmaller/pdf-encrypt is a small, purpose-built library
 * that does, with pdf-lib only as its peer dependency.
 */
export async function protectPdf(file: File, password: string): Promise<Uint8Array> {
  const { encryptPDF } = await import("@pdfsmaller/pdf-encrypt");
  const bytes = new Uint8Array(await file.arrayBuffer());
  return encryptPDF(bytes, password);
}

/**
 * Removes password protection from a PDF. Throws if the password is
 * wrong — callers should catch that and show a clear "incorrect
 * password" message rather than a generic failure.
 */
export async function unlockPdf(file: File, password: string): Promise<Uint8Array> {
  const { decryptPDF } = await import("@pdfsmaller/pdf-decrypt");
  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    return await decryptPDF(bytes, password);
  } catch (e: any) {
    const msg = String(e?.message ?? "");
    if (/password/i.test(msg) || /decrypt/i.test(msg)) {
      throw new Error("That password doesn't match this file. Double-check it and try again.");
    }
    throw e;
  }
}

export async function isPdfEncrypted(file: File): Promise<boolean> {
  const { isEncrypted } = await import("@pdfsmaller/pdf-decrypt");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const info = await isEncrypted(bytes);
  return Boolean(info?.encrypted);
}

/* ---------------------------- PDF to PowerPoint ---------------------------- */

/**
 * One slide per PDF page, each page rendered full-bleed as an image.
 * This is the same approach most PDF-to-PPT tools use — text stays
 * exactly as laid out in the original (since it's a picture of the
 * page), but isn't editable as text once it's a slide. Trying to
 * reconstruct genuinely editable text boxes/shapes from a PDF's layout
 * is a much harder, much less reliable problem; this trades editability
 * for something that reliably looks right.
 */
export async function pdfToPowerPoint(file: File): Promise<Blob> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const rendered = await renderPdfPages(file, 2, undefined, 0.85);

  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "PDF_PAGE", width: 10, height: 7.5 });
  pptx.layout = "PDF_PAGE";

  for (const page of rendered) {
    const slide = pptx.addSlide();
    const pageAspect = page.width / page.height;
    const slideAspect = 10 / 7.5;
    let w = 10,
      h = 7.5;
    if (pageAspect > slideAspect) {
      h = 10 / pageAspect;
    } else {
      w = 7.5 * pageAspect;
    }
    slide.addImage({ data: page.dataUrl, x: (10 - w) / 2, y: (7.5 - h) / 2, w, h });
  }

  return pptx.write({ outputType: "blob" }) as Promise<Blob>;
}

/* ---------------------------- PowerPoint to PDF ---------------------------- */

/**
 * A .pptx file is just a zip of XML — this extracts the text runs from
 * each slide's XML (no external pptx-parsing library exists for the
 * browser the way mammoth/xlsx cover Word/Excel) and lays that text out
 * as one PDF page per slide via the existing HTML→PDF pipeline. This is
 * a text-content extraction, not a visual reproduction: shapes,
 * precise positioning, backgrounds, and design don't carry over —
 * closer in spirit to PDF-to-Word than to a real slide renderer.
 */
export async function powerPointToPdf(file: File): Promise<Uint8Array> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(file);

  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)\.xml/)![1], 10);
      const nb = parseInt(b.match(/slide(\d+)\.xml/)![1], 10);
      return na - nb;
    });

  if (slideFiles.length === 0) {
    throw new Error("Couldn't find any slides in this file — make sure it's a .pptx file.");
  }

  const parser = new DOMParser();
  let html = "";

  for (let i = 0; i < slideFiles.length; i++) {
    const xmlText = await zip.files[slideFiles[i]].async("text");
    const doc = parser.parseFromString(xmlText, "application/xml");
    const textNodes = Array.from(doc.getElementsByTagName("a:t"));
    const lines: string[] = [];
    let current = "";
    for (const node of textNodes) {
      current += node.textContent ?? "";
      // paragraphs in OOXML are <a:p> elements; a simple heuristic is to
      // break on every text run boundary that's followed by a new paragraph
      lines.push(current);
      current = "";
    }
    const slideText = lines.filter((l) => l.trim()).join(" ");

    html += `<div style="page-break-after: always; padding: 40px 0;">`;
    html += `<p style="font-size:11px;color:#888;margin-bottom:10px;">Slide ${i + 1}</p>`;
    html += slideText
      ? `<p style="font-size:15px;line-height:1.7;">${escapeHtml(slideText)}</p>`
      : `<p style="font-size:13px;color:#999;font-style:italic;">(No extractable text on this slide — it may be images or shapes only.)</p>`;
    html += `</div>`;
  }

  return htmlToPdf(`<div style="font-family: sans-serif;">${html}</div>`);
}

/* ---------------------------- PDF to Excel ---------------------------- */

/**
 * Extracts text with its on-page position (via pdf.js) and reconstructs
 * rows/columns from that geometry: items on roughly the same line become
 * a row, and gaps between items wider than the surrounding text become
 * column breaks. This is position-based heuristic table detection, not
 * real structure recognition — true table detection needs a layout
 * model — but it recovers simple tables well. Each PDF page becomes its
 * own sheet.
 */
export async function pdfToExcel(file: File): Promise<Uint8Array> {
  const XLSX = await import("xlsx");
  const pdfjsLib = await getPdfjs();
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;

  const workbook = XLSX.utils.book_new();
  let sheetCount = 0;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = (textContent.items as any[])
      .filter((it) => typeof it.str === "string" && it.str.trim() !== "")
      .map((it) => ({
        text: it.str as string,
        x: it.transform[4] as number,
        y: it.transform[5] as number,
        width: (it.width as number) || it.str.length * 4,
        height: (it.height as number) || Math.abs(it.transform[3] as number) || 10,
      }));
    if (items.length === 0) continue;

    // Group into lines: PDF y grows upward, so sort top-to-bottom then left-to-right.
    items.sort((a, b) => b.y - a.y || a.x - b.x);
    const lineTolerance = 4;
    const lines: (typeof items)[] = [];
    for (const it of items) {
      const last = lines[lines.length - 1];
      if (last && Math.abs(last[0].y - it.y) <= lineTolerance) {
        last.push(it);
      } else {
        lines.push([it]);
      }
    }

    const rows: string[][] = lines.map((line) => {
      line.sort((a, b) => a.x - b.x);
      // A column break is a gap much wider than a normal word space. Word
      // spaces scale with font size, not with how far apart this page's
      // columns happen to be, so the threshold is based on the line's own
      // font size (its item height) rather than on the gaps being measured.
      const medianHeight = [...line.map((it) => it.height)].sort((a, b) => a - b)[Math.floor(line.length / 2)];
      const columnGap = Math.max(10, medianHeight * 1.5);

      const cells: string[] = [];
      let current = line[0].text;
      let prevEnd = line[0].x + line[0].width;
      for (let k = 1; k < line.length; k++) {
        const it = line[k];
        const gap = it.x - prevEnd;
        if (gap > columnGap) {
          cells.push(current.trim());
          current = it.text;
        } else {
          current += (gap > 1 ? " " : "") + it.text;
        }
        prevEnd = it.x + it.width;
      }
      cells.push(current.trim());
      return cells;
    });

    const sheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, `Page ${i}`.slice(0, 31));
    sheetCount++;
  }

  if (sheetCount === 0) {
    throw new Error("Couldn't find any selectable text in this PDF — scanned pages need OCR first.");
  }

  return new Uint8Array(XLSX.write(workbook, { type: "array", bookType: "xlsx" }));
}

/* ---------------------------- Bank statement to Excel ---------------------------- */

const STATEMENT_DATE_RE = /\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{1,2}\s+[A-Za-z]{3,9},?\s+\d{2,4}|[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{2,4})\b/;
const STATEMENT_AMOUNT_RE = /-?[\d,]+\.\d{2}/g;

interface StatementRow {
  date: string;
  description: string;
  debit: string;
  credit: string;
  balance: string;
}

/**
 * Reconstructs each printed line of text (grouped by on-page position, the
 * same line-grouping step pdfToExcel uses) across the whole document, then
 * applies bank-statement-specific heuristics on top: a line starting with a
 * date begins a new transaction; a wrapped continuation line with no date
 * folds into the previous transaction's description; and whether an amount
 * is a debit or a credit is inferred from whether the running balance went
 * up or down since the previous row, since statements rarely label that
 * unambiguously once reduced to plain extracted text. This is a best-effort
 * heuristic tuned for the common passbook-style layout (date, description,
 * one or two amount columns, running balance) — unusual layouts may need
 * manual correction after export.
 */
export async function bankStatementToExcel(file: File): Promise<Uint8Array> {
  const XLSX = await import("xlsx");
  const pdfjsLib = await getPdfjs();
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;

  const lines: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = (textContent.items as any[])
      .filter((it) => typeof it.str === "string" && it.str.trim() !== "")
      .map((it) => ({ text: it.str as string, x: it.transform[4] as number, y: it.transform[5] as number }));
    if (items.length === 0) continue;

    items.sort((a, b) => b.y - a.y || a.x - b.x);
    const lineTolerance = 4;
    const grouped: (typeof items)[] = [];
    for (const it of items) {
      const last = grouped[grouped.length - 1];
      if (last && Math.abs(last[0].y - it.y) <= lineTolerance) last.push(it);
      else grouped.push([it]);
    }
    for (const line of grouped) {
      line.sort((a, b) => a.x - b.x);
      lines.push(
        line
          .map((it) => it.text)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim()
      );
    }
  }

  const rows: StatementRow[] = [];
  let previousBalance: number | null = null;

  for (const line of lines) {
    const dateMatch = line.match(STATEMENT_DATE_RE);
    const isTransactionStart = !!dateMatch && dateMatch.index! < 15;

    if (!isTransactionStart) {
      // A wrapped description continues onto the next printed line with no
      // date of its own — fold it into the transaction already in progress.
      if (rows.length > 0 && line.length > 0 && !/^page \d+/i.test(line)) {
        rows[rows.length - 1].description = `${rows[rows.length - 1].description} ${line}`.trim();
      }
      continue;
    }

    const amounts = [...line.matchAll(STATEMENT_AMOUNT_RE)].map((m) => ({
      text: m[0],
      value: parseFloat(m[0].replace(/,/g, "")),
      index: m.index ?? 0,
    }));
    const date = dateMatch![0];
    const firstAmountIndex = amounts.length > 0 ? amounts[0].index : line.length;
    const description = line.slice(dateMatch!.index! + date.length, firstAmountIndex).trim();

    let debit = "";
    let credit = "";
    let balance = "";

    if (amounts.length >= 2) {
      // The last number on the line is almost always the running balance;
      // the one before it is this transaction's amount.
      const balanceAmt = amounts[amounts.length - 1];
      const txnAmt = amounts[amounts.length - 2];
      balance = balanceAmt.text;
      if (previousBalance !== null && balanceAmt.value - previousBalance < 0) {
        debit = txnAmt.text;
      } else {
        credit = txnAmt.text;
      }
      previousBalance = balanceAmt.value;
    } else if (amounts.length === 1) {
      balance = amounts[0].text;
      previousBalance = amounts[0].value;
    }

    rows.push({ date, description, debit, credit, balance });
  }

  if (rows.length === 0) {
    throw new Error("Couldn't find any transaction rows that start with a date — make sure this is a text-based statement (a scanned one needs OCR PDF first).");
  }

  const sheetRows: (string | number)[][] = [
    ["Date", "Description", "Debit", "Credit", "Balance"],
    ...rows.map((r) => [r.date, r.description, r.debit, r.credit, r.balance]),
  ];
  const sheet = XLSX.utils.aoa_to_sheet(sheetRows);
  sheet["!cols"] = [{ wch: 12 }, { wch: 45 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Transactions");
  return new Uint8Array(XLSX.write(workbook, { type: "array", bookType: "xlsx" }));
}

/* ---------------------------- Repair PDF ---------------------------- */

export interface RepairResult {
  bytes: Uint8Array;
  pagesRecovered: number;
  totalPages: number;
  /** true if structural recovery failed and pages were rebuilt from rendered images instead. */
  usedImageFallback: boolean;
}

/**
 * Rebuilds a PDF from scratch rather than patching it in place — the same
 * trick most "repair" tools use, since a from-scratch rewrite of the
 * object table and xref fixes the broken xref/incremental-update
 * corruption that causes most "can't open this PDF" errors. If pdf-lib's
 * parser can't make sense of the file at all (more severe corruption),
 * this falls back to pdf.js — a much more fault-tolerant parser — to
 * rasterize whatever pages it can still read and rebuilds the file from
 * those images, trading selectable text for at least getting the content
 * back.
 */
export async function repairPdf(file: File): Promise<RepairResult> {
  const { PDFDocument } = await getPdfLib();
  const bytes = new Uint8Array(await file.arrayBuffer());

  try {
    const src = await PDFDocument.load(bytes, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
      updateMetadata: false,
    });
    const totalPages = src.getPageCount();
    const out = await PDFDocument.create();
    let recovered = 0;
    for (let i = 0; i < totalPages; i++) {
      try {
        const [page] = await out.copyPages(src, [i]);
        out.addPage(page);
        recovered++;
      } catch {
        // skip pages whose objects are unrecoverable and continue with the rest
      }
    }
    if (recovered > 0) {
      return { bytes: await out.save(), pagesRecovered: recovered, totalPages, usedImageFallback: false };
    }
  } catch {
    // structural parse failed entirely — fall through to the image-based rebuild
  }

  const rendered = await renderPdfPages(bytes.buffer as ArrayBuffer, 2, undefined, 0.9).catch(() => []);
  if (rendered.length === 0) {
    throw new Error("This PDF is too badly damaged to recover — its structure couldn't be read by either recovery method.");
  }
  const out = await PDFDocument.create();
  for (const page of rendered) {
    const jpgBytes = dataUrlToBytes(page.dataUrl);
    const img = await out.embedJpg(jpgBytes);
    const pdfPage = out.addPage([page.width, page.height]);
    pdfPage.drawImage(img, { x: 0, y: 0, width: page.width, height: page.height });
  }
  return {
    bytes: await out.save(),
    pagesRecovered: rendered.length,
    totalPages: rendered.length,
    usedImageFallback: true,
  };
}

/* ---------------------------- OCR PDF ---------------------------- */

export interface OcrProgress {
  page: number;
  totalPages: number;
  progress: number; // 0-1 within the current page
}

export interface OcrResult {
  bytes: Uint8Array;
  pageCount: number;
}

/**
 * Renders each page to an image, runs OCR on it, then rebuilds the PDF
 * with that image visible and the recognized words placed as invisible
 * (zero-opacity) text at their detected positions — a "sandwich" PDF,
 * the same technique dedicated OCR tools use to make a scan
 * searchable/selectable without changing how it looks. Recognition runs
 * entirely in the browser via a WebAssembly OCR engine — the file itself
 * never leaves the device, though the OCR engine and language data are
 * fetched once from a CDN the first time (same as this app's PDF
 * renderer fetching its own worker script). Since the placed text is
 * invisible, its font size is solved from the recognized word's pixel
 * width rather than its height, so text selection lines up with the
 * image even though the glyphs never render.
 */
export async function ocrPdf(
  file: File,
  language: string,
  onProgress?: (p: OcrProgress) => void
): Promise<OcrResult> {
  const { createWorker } = await import("tesseract.js");
  const { PDFDocument, StandardFonts } = await getPdfLib();
  const rendered = await renderPdfPages(file, 2, undefined, 0.92);
  if (rendered.length === 0) {
    throw new Error("Couldn't read any pages from this PDF.");
  }

  let currentPage = 0;
  const worker = await createWorker(language, undefined, {
    logger: (m) => {
      if (m.status === "recognizing text") {
        onProgress?.({ page: currentPage, totalPages: rendered.length, progress: m.progress });
      }
    },
  });

  const out = await PDFDocument.create();
  const font = await out.embedFont(StandardFonts.Helvetica);

  try {
    for (const page of rendered) {
      currentPage = page.index + 1;
      onProgress?.({ page: currentPage, totalPages: rendered.length, progress: 0 });
      const { data } = await worker.recognize(page.dataUrl, {}, { blocks: true });

      const jpgBytes = dataUrlToBytes(page.dataUrl);
      const img = await out.embedJpg(jpgBytes);
      const pdfPage = out.addPage([page.width, page.height]);
      pdfPage.drawImage(img, { x: 0, y: 0, width: page.width, height: page.height });

      const words = (data.blocks ?? []).flatMap((b) =>
        b.paragraphs.flatMap((p) => p.lines.flatMap((l) => l.words))
      );
      for (const word of words) {
        const text = word.text.trim();
        if (!text) continue;
        const { x0, y0, x1, y1 } = word.bbox;
        const boxWidth = x1 - x0;
        const boxHeight = y1 - y0;
        if (boxWidth <= 0 || boxHeight <= 0) continue;

        const unitWidth = font.widthOfTextAtSize(text, 1);
        const fontSize = unitWidth > 0 ? Math.min(Math.max(boxWidth / unitWidth, 3), 400) : boxHeight * 0.85;
        pdfPage.drawText(text, {
          x: x0,
          y: page.height - y1,
          size: fontSize,
          font,
          opacity: 0,
        });
      }
    }
  } finally {
    await worker.terminate();
  }

  return { bytes: await out.save(), pageCount: rendered.length };
}

/* ---------------------------- PDF to Markdown ---------------------------- */

interface MdCell {
  text: string;
  x0: number;
  x1: number;
}
interface MdLine {
  cells: MdCell[];
  text: string;
  y: number;
  fontSize: number;
}

/**
 * Extracts text with position and font size (via pdf.js) and reconstructs
 * structure heuristically: the most common font size on a page is treated
 * as body text, distinctly larger sizes become H1/H2/H3; runs of
 * multi-column lines become tables (same column-gap heuristic as
 * pdfToExcel); lines starting with a bullet or number become list items;
 * everything else is flowed into paragraphs, with a widened vertical gap
 * between lines treated as a paragraph break. Link annotations are
 * matched back to the text inside their bounding box and emitted as
 * markdown links. This is layout inference, not real structure
 * recognition — it does well on simple documents, less well on dense
 * multi-column layouts.
 */
export async function pdfToMarkdown(file: File): Promise<string> {
  const pdfjsLib = await getPdfjs();
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;

  const listItemRe = /^([••\-*◦‣]|\d+[.)]|[a-hA-H][.)])\s+(.+)/;
  const pageBlocks: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const rawItems = (textContent.items as any[])
      .filter((it) => typeof it.str === "string" && it.str.trim() !== "")
      .map((it) => ({
        text: it.str as string,
        x: it.transform[4] as number,
        y: it.transform[5] as number,
        width: (it.width as number) || it.str.length * 4,
        height: Math.round((it.height as number) || Math.abs(it.transform[3] as number) || 10),
      }));
    if (rawItems.length === 0) continue;

    const annotations = await page.getAnnotations({ intent: "display" }).catch(() => [] as any[]);
    const links = (annotations as any[])
      .filter((a) => a?.subtype === "Link" && typeof a.url === "string" && a.url)
      .map((a) => ({ url: a.url as string, rect: a.rect as [number, number, number, number] }));
    const linkAt = (x: number, y: number): string | null => {
      for (const l of links) {
        if (x >= l.rect[0] - 1 && x <= l.rect[2] + 1 && y >= l.rect[1] - 1 && y <= l.rect[3] + 1) return l.url;
      }
      return null;
    };

    // Group into lines, top-to-bottom then left-to-right (PDF y grows upward).
    rawItems.sort((a, b) => b.y - a.y || a.x - b.x);
    const rawLines: (typeof rawItems)[] = [];
    for (const it of rawItems) {
      const last = rawLines[rawLines.length - 1];
      if (last && Math.abs(last[0].y - it.y) <= 3) last.push(it);
      else rawLines.push([it]);
    }

    // Body font size = the mode across lines; sizes clearly larger become heading candidates.
    const sizeCounts = new Map<number, number>();
    for (const line of rawLines) {
      const size = Math.max(...line.map((it) => it.height));
      sizeCounts.set(size, (sizeCounts.get(size) ?? 0) + 1);
    }
    let bodySize = 12;
    let bodyCount = 0;
    for (const [size, count] of sizeCounts) {
      if (count > bodyCount) {
        bodyCount = count;
        bodySize = size;
      }
    }
    const headingSizes = Array.from(sizeCounts.keys())
      .filter((s) => s > bodySize * 1.12)
      .sort((a, b) => b - a);
    const headingLevel = (size: number) => {
      const idx = headingSizes.indexOf(size);
      return idx === -1 ? null : Math.min(idx + 1, 3);
    };

    const lines: MdLine[] = rawLines.map((line) => {
      line.sort((a, b) => a.x - b.x);
      const fontSize = Math.max(...line.map((it) => it.height));
      const columnGap = Math.max(10, fontSize * 1.5);

      // Link-wrap each raw item individually, before cells get merged —
      // once merged into a wider cell, the cell's own midpoint usually
      // falls outside a link's (narrower) rect, so linking has to happen
      // per-item first.
      const y = line[0].y;
      const withLink = (it: (typeof line)[number]) => {
        const url = linkAt(it.x + it.width / 2, y);
        return url ? `[${it.text}](${url})` : it.text;
      };

      const cellsRaw: MdCell[] = [];
      let current = withLink(line[0]);
      let x0 = line[0].x;
      let prevEnd = line[0].x + line[0].width;
      for (let k = 1; k < line.length; k++) {
        const it = line[k];
        const gap = it.x - prevEnd;
        if (gap > columnGap) {
          cellsRaw.push({ text: current.trim(), x0, x1: prevEnd });
          current = withLink(it);
          x0 = it.x;
        } else {
          current += (gap > 1 ? " " : "") + withLink(it);
        }
        prevEnd = it.x + it.width;
      }
      cellsRaw.push({ text: current.trim(), x0, x1: prevEnd });

      const cells = cellsRaw.filter((c) => c.text);
      return { cells, text: cells.map((c) => c.text).join(" "), y, fontSize };
    });

    const md: string[] = [];
    let paraLines: string[] = [];
    let paraPrevY: number | null = null;
    let tableBuffer: MdLine[] = [];
    let listBuffer: string[] = [];

    const flushPara = () => {
      if (paraLines.length) md.push(paraLines.join(" "));
      paraLines = [];
      paraPrevY = null;
    };
    const flushList = () => {
      if (listBuffer.length) md.push(listBuffer.join("\n"));
      listBuffer = [];
    };
    const flushTable = () => {
      if (tableBuffer.length >= 2) {
        const colCount = Math.max(...tableBuffer.map((l) => l.cells.length));
        const pad = (l: MdLine) => {
          const c = l.cells.map((x) => x.text);
          while (c.length < colCount) c.push("");
          return c;
        };
        const tableLines = [
          `| ${pad(tableBuffer[0]).join(" | ")} |`,
          `| ${Array(colCount).fill("---").join(" | ")} |`,
          ...tableBuffer.slice(1).map((row) => `| ${pad(row).join(" | ")} |`),
        ];
        md.push(tableLines.join("\n"));
      } else if (tableBuffer.length === 1) {
        paraLines.push(tableBuffer[0].text);
      }
      tableBuffer = [];
    };

    for (const line of lines) {
      if (!line.text.trim()) continue;
      const level = headingLevel(line.fontSize);
      if (level) {
        flushTable();
        flushList();
        flushPara();
        md.push(`${"#".repeat(level)} ${line.cells.map((c) => c.text).join(" ")}`);
        continue;
      }

      if (line.cells.length >= 2) {
        flushList();
        flushPara();
        tableBuffer.push(line);
        continue;
      }

      flushTable();
      const listMatch = line.text.match(listItemRe);
      if (listMatch) {
        flushPara();
        const isNumbered = /^\d+[.)]$/.test(listMatch[1]);
        listBuffer.push(`${isNumbered ? listMatch[1].replace(/\)$/, ".") : "-"} ${listMatch[2]}`);
        continue;
      }

      flushList();
      if (paraPrevY !== null && paraPrevY - line.y > line.fontSize * 1.8) flushPara();
      paraLines.push(line.text);
      paraPrevY = line.y;
    }
    flushTable();
    flushList();
    flushPara();

    if (md.length) pageBlocks.push(md.join("\n\n"));
  }

  return pageBlocks.join("\n\n---\n\n") + "\n";
}

/* ---------------------------- PDF to Text ---------------------------- */

/**
 * Pulls the plain, copyable text out of every page, with line breaks
 * reconstructed from each glyph run's position (pdf.js hands back a flat
 * list of text runs with no notion of "line" of its own). No markdown
 * structure is inferred — that's what pdfToMarkdown is for — this is a
 * straight, readable text dump for pasting elsewhere or saving as .txt.
 */
/**
 * Returns each page's plain, line-reconstructed text separately (rather
 * than one joined document) — used directly by pdfToText below, and by
 * Read PDF Aloud, which reads and highlights a page at a time.
 */
export async function extractPagesText(file: File): Promise<string[]> {
  const pdfjsLib = await getPdfjs();
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = (textContent.items as any[])
      .filter((it) => typeof it.str === "string")
      .map((it) => ({ text: it.str as string, x: it.transform[4] as number, y: it.transform[5] as number }));

    // Group into lines, top-to-bottom then left-to-right (PDF y grows upward),
    // the same bucketing pdfToMarkdown uses.
    items.sort((a, b) => b.y - a.y || a.x - b.x);
    const lines: string[] = [];
    let current: string[] = [];
    let lastY: number | null = null;
    for (const it of items) {
      if (lastY !== null && Math.abs(lastY - it.y) > 3) {
        lines.push(current.join(" ").replace(/\s+/g, " ").trim());
        current = [];
      }
      if (it.text) current.push(it.text);
      lastY = it.y;
    }
    if (current.length) lines.push(current.join(" ").replace(/\s+/g, " ").trim());

    pages.push(lines.filter(Boolean).join("\n"));
  }

  return pages;
}

export async function pdfToText(file: File): Promise<string> {
  const pages = await extractPagesText(file);
  return pages.join("\n\n").trim() + "\n";
}

/* ---------------------------- PDF to PDF/A ---------------------------- */

/**
 * Best-effort PDF/A-1b tagging: rebuilds the document from scratch (the
 * same trick repairPdf uses, which also fixes common structural issues),
 * strips encryption, and writes XMP metadata declaring PDF/A-1B
 * conformance plus standard document metadata.
 *
 * This does NOT perform full ISO 19005 validation — in particular it
 * doesn't verify every font used is embedded, and it doesn't embed a
 * color-profile OutputIntent (both of which a strict validator like
 * veraPDF checks for, and neither of which is realistically achievable
 * from inside a browser without a native PDF engine). For legally
 * mandated archival submissions, verify the output with a dedicated
 * validator rather than relying on this alone.
 */
export async function pdfToPdfA(file: File): Promise<Uint8Array> {
  const { PDFName } = await getPdfLib();
  const doc = await loadDoc(file);

  const now = new Date();
  doc.setProducer("PDFCure");
  doc.setCreationDate(now);
  doc.setModificationDate(now);
  if (!doc.getTitle()?.trim()) doc.setTitle(file.name.replace(/\.[^/.]+$/, ""));

  const xmp = buildPdfAXmp({ title: doc.getTitle() ?? file.name, producer: "PDFCure", createDate: now });
  const metadataBytes = new TextEncoder().encode(xmp);
  const metadataStream = doc.context.stream(metadataBytes, { Type: "Metadata", Subtype: "XML" });
  const metadataRef = doc.context.register(metadataStream);
  doc.catalog.set(PDFName.of("Metadata"), metadataRef);

  return doc.save();
}

function buildPdfAXmp({ title, producer, createDate }: { title: string; producer: string; createDate: Date }): string {
  const iso = createDate.toISOString();
  return `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
      xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/"
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:xmp="http://ns.adobe.com/xap/1.0/"
      xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
      <pdfaid:part>1</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
      <dc:format>application/pdf</dc:format>
      <dc:title><rdf:Alt><rdf:li xml:lang="x-default">${escapeHtml(title)}</rdf:li></rdf:Alt></dc:title>
      <xmp:CreateDate>${iso}</xmp:CreateDate>
      <xmp:ModifyDate>${iso}</xmp:ModifyDate>
      <pdf:Producer>${escapeHtml(producer)}</pdf:Producer>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}

/* ---------------------------- Accessibility check ---------------------------- */

export interface AccessibilityCheck {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail" | "info";
  detail: string;
}

export interface AccessibilityReport {
  pageCount: number;
  checks: AccessibilityCheck[];
}

/**
 * A best-effort automated scan for the concrete, checkable facts that
 * decide whether a screen reader can make sense of a document at all —
 * not a full PDF/UA or WCAG conformance audit. A real audit means
 * validating an entire tag tree against reading order and semantic
 * rules (headings nested correctly, tables with proper header
 * associations, and so on), which needs a human reviewer or a dedicated
 * remediation tool (PDFix, CommonLook) to do properly. What's checkable
 * client-side: whether the document is tagged at all, declares a
 * language, has real extractable text rather than being a bare scan,
 * has a meaningful title, and roughly how many images would need alt
 * text — each a real, cited barrier, just not the complete picture.
 */
export async function checkAccessibility(file: File): Promise<AccessibilityReport> {
  const { PDFName, PDFDict, PDFBool, PDFString, PDFHexString } = await getPdfLib();
  const encrypted = await isPdfEncrypted(file).catch(() => false);
  const doc = await loadDoc(file);
  const catalog = doc.catalog;
  const checks: AccessibilityCheck[] = [];

  if (encrypted) {
    checks.push({
      id: "encrypted",
      label: "Password protection",
      status: "warn",
      detail:
        "This PDF is password-protected. Depending on its permission settings, that can also block assistive technology from reading its content — and it means the checks below may be incomplete, since this scan can't fully inspect an encrypted file's internal structure.",
    });
  }

  // Title — present, and not just a bare filename.
  const title = doc.getTitle()?.trim();
  const bareFilename = title && /\.(pdf|docx?|xlsx?|pptx?)$/i.test(title);
  if (!title) {
    checks.push({
      id: "title",
      label: "Document title",
      status: "fail",
      detail: "No title is set — screen readers announce the filename instead, which is rarely meaningful on its own. Set one with Edit PDF Metadata.",
    });
  } else if (bareFilename || title === file.name) {
    checks.push({
      id: "title",
      label: "Document title",
      status: "warn",
      detail: `The title is just the filename ("${title}") rather than a description of the content.`,
    });
  } else {
    checks.push({ id: "title", label: "Document title", status: "pass", detail: `Set to "${title}".` });
  }

  // Language — needed for a screen reader to pick the right pronunciation/voice.
  const langObj = catalog.lookupMaybe(PDFName.of("Lang"), PDFString, PDFHexString);
  const lang = langObj?.decodeText().trim();
  if (lang) {
    checks.push({ id: "lang", label: "Document language", status: "pass", detail: `Declared as "${lang}".` });
  } else {
    checks.push({
      id: "lang",
      label: "Document language",
      status: "fail",
      detail: "No document language is declared — a screen reader may default to the wrong pronunciation rules or voice.",
    });
  }

  // Tag structure — the single biggest accessibility barrier a PDF can have.
  const markInfo = catalog.lookupMaybe(PDFName.of("MarkInfo"), PDFDict);
  const marked = markInfo?.lookupMaybe(PDFName.of("Marked"), PDFBool)?.asBoolean() ?? false;
  const structTreeRoot = catalog.lookupMaybe(PDFName.of("StructTreeRoot"), PDFDict);
  const tagged = marked && !!structTreeRoot;
  if (tagged) {
    checks.push({
      id: "tagged",
      label: "Tagged for screen readers",
      status: "pass",
      detail: "This PDF has a tag structure — the foundation a screen reader needs to read it in a sensible order.",
    });
  } else {
    checks.push({
      id: "tagged",
      label: "Tagged for screen readers",
      status: "fail",
      detail:
        "This PDF isn't tagged. Without tags, a screen reader has no reliable way to know reading order, headings, or table structure. Properly adding tags needs a dedicated remediation tool — this scan can only detect that they're missing, not add them.",
    });
  }

  // Real text vs. a bare scan.
  const pdfjsLib = await getPdfjs();
  const jsDoc = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pageCount = jsDoc.numPages;
  let textLength = 0;
  let imageCount = 0;
  const OPS = pdfjsLib.OPS;
  for (let i = 1; i <= pageCount; i++) {
    const page = await jsDoc.getPage(i);
    const content = await page.getTextContent();
    for (const item of content.items as any[]) {
      if (typeof item.str === "string") textLength += item.str.trim().length;
    }
    const opList = await page.getOperatorList();
    for (const fn of opList.fnArray) {
      if (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject) imageCount++;
    }
  }

  if (textLength < 10) {
    checks.push({
      id: "text",
      label: "Extractable text",
      status: "fail",
      detail: "Little or no selectable text was found — this looks like a scanned image with no text layer at all, which a screen reader can't read as text. Run OCR PDF first.",
    });
  } else {
    checks.push({ id: "text", label: "Extractable text", status: "pass", detail: "This document has real, selectable text for a screen reader to read." });
  }

  // Images and alt text — can only be verified precisely by walking the
  // tag tree's Figure elements, which is beyond what's practical to
  // validate client-side, so this stays informational rather than a
  // pass/fail.
  if (imageCount === 0) {
    checks.push({ id: "images", label: "Image alt text", status: "pass", detail: "No images were found that would need alt text." });
  } else if (!tagged) {
    checks.push({
      id: "images",
      label: "Image alt text",
      status: "warn",
      detail: `${imageCount} image${imageCount === 1 ? "" : "s"} found, and this PDF isn't tagged — none of them can carry accessible alt text as a result, so screen reader users get no description of them.`,
    });
  } else {
    checks.push({
      id: "images",
      label: "Image alt text",
      status: "info",
      detail: `${imageCount} image${imageCount === 1 ? "" : "s"} found. This document is tagged, but confirming each image actually has a meaningful alt-text description needs manual review — this scan can't verify that automatically.`,
    });
  }

  return { pageCount, checks };
}

/* ---------------------------- shared utils ---------------------------- */

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
