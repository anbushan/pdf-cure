import { saveAs } from "file-saver";

export function downloadBytes(
  bytes: Uint8Array | ArrayBuffer,
  filename: string,
  mime: string
) {
  const blob = new Blob([bytes as BlobPart], { type: mime });
  saveAs(blob, filename);
}

export function downloadPdf(bytes: Uint8Array | ArrayBuffer, filename: string) {
  downloadBytes(bytes, filename.endsWith(".pdf") ? filename : `${filename}.pdf`, "application/pdf");
}

export function stripExt(filename: string) {
  return filename.replace(/\.[^/.]+$/, "");
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Couldn't read the file."));
    reader.readAsDataURL(file);
  });
}
