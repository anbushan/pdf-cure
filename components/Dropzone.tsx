"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, HardDrive, Loader2 } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import { useToast } from "./ToastProvider";
import { useDriveConfigured, pickFromDrive } from "@/lib/googleDrive";

interface DropzoneProps {
  accept: string;
  multiple?: boolean;
  label: string;
  hint?: string;
  onFiles: (files: File[]) => void;
  /** MIME types to restrict the Google Drive picker to. Defaults to `accept`. */
  driveMimeTypes?: string;
}

export default function Dropzone({ accept, multiple, label, hint, onFiles, driveMimeTypes }: DropzoneProps) {
  const [active, setActive] = useState(false);
  const [drivePicking, setDrivePicking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  const toast = useToast();
  const driveEnabled = useDriveConfigured();

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      onFiles(Array.from(fileList));
    },
    [onFiles]
  );

  async function handleDriveImport() {
    setDrivePicking(true);
    try {
      const result = await pickFromDrive(driveMimeTypes ?? accept);
      if (result) onFiles([result.file]);
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't import from Google Drive.");
    } finally {
      setDrivePicking(false);
    }
  }

  return (
    <div
      className={`feed-slot rounded-lg px-6 py-14 text-center ${active ? "is-active" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setActive(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper">
        <UploadCloud size={20} />
      </div>
      <p className="mt-4 font-display text-base font-semibold text-ink">{label}</p>
      {hint && <p className="mt-1 text-sm text-ink-faint">{hint}</p>}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark transition-colors"
        >
          {multiple ? t("selectFiles") : t("selectFile")}
        </button>
        {driveEnabled && (
          <button
            type="button"
            onClick={handleDriveImport}
            disabled={drivePicking}
            className="inline-flex items-center gap-1.5 rounded-md border border-paper-line px-4 py-2.5 text-sm font-medium text-ink-faint hover:text-ink hover:border-ink-faint/40 transition-colors disabled:opacity-50"
          >
            {drivePicking ? <Loader2 size={15} className="animate-spin" /> : <HardDrive size={15} />}
            Google Drive
          </button>
        )}
      </div>
      <p className="mt-3 text-xs text-ink-faint">{t("dropFilesHere")}</p>
    </div>
  );
}
