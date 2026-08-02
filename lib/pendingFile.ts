/**
 * Hands a File from the homepage's quick-access dropzone to whichever
 * tool page the user picks next, without touching a server or storage —
 * just a module-level variable. This only survives a client-side route
 * transition (next/link / router.push), not a full page reload, which is
 * exactly the case here since picking a tool from the modal navigates
 * within the same Next.js app.
 */
let pendingFile: File | null = null;

export function setPendingFile(file: File) {
  pendingFile = file;
}

/** Reads and clears the pending file — one-shot, so a later direct visit to a tool page starts empty as normal. */
export function takePendingFile(): File | null {
  const file = pendingFile;
  pendingFile = null;
  return file;
}
