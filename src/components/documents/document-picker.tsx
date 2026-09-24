"use client";

import { useState, type ChangeEvent } from "react";
import { ACCEPT_ATTRIBUTE } from "@/lib/documents/constants";
import { validateSelectedFile } from "@/lib/documents/prepare-file";
import { formatFileSize } from "@/lib/format";

type DocumentPickerProps = {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles: number;
  disabled?: boolean;
  label?: string;
};

// Belge/fotoğraf seçimi. Dosya input'unun "name"i yoktur: dosyalar form ile sunucuya
// gönderilmez, tarayıcıdan doğrudan Storage'a yüklenir.
export function DocumentPicker({
  files,
  onChange,
  maxFiles,
  disabled = false,
  label = "Belge / fotoğraf",
}: DocumentPickerProps) {
  const [rejections, setRejections] = useState<string[]>([]);
  const remaining = maxFiles - files.length;

  function handleSelect(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    // Aynı dosya tekrar seçilebilsin.
    event.target.value = "";

    const messages: string[] = [];
    const accepted: File[] = [];
    for (const file of selected) {
      const error = validateSelectedFile(file);
      if (error) {
        messages.push(error);
      } else if (accepted.length >= remaining) {
        messages.push(`${file.name}: bir kayda en fazla ${maxFiles} belge eklenebilir.`);
      } else {
        accepted.push(file);
      }
    }

    setRejections(messages);
    if (accepted.length > 0) onChange([...files, ...accepted]);
  }

  function removeAt(index: number) {
    onChange(files.filter((_, fileIndex) => fileIndex !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink-800">{label}</span>

      <label
        className={`flex h-12 items-center justify-center rounded-lg border border-dashed border-ink-300 bg-white px-4 text-base font-medium text-ink-800 ${
          disabled || remaining <= 0
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:bg-sand-50 focus-within:ring-2 focus-within:ring-gold-400"
        }`}
      >
        + Dosya seç
        <input
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          multiple
          disabled={disabled || remaining <= 0}
          onChange={handleSelect}
          className="sr-only"
        />
      </label>
      <p className="text-xs text-ink-500">
        {`JPG, PNG, WEBP veya PDF · ${Math.max(remaining, 0)} dosya daha eklenebilir. Fotoğraflar yüklenmeden önce küçültülür.`}
      </p>

      {rejections.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm text-red-700" role="alert">
          {rejections.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <ul className="flex flex-col divide-y divide-sand-200 rounded-lg border border-sand-200 bg-white">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${file.lastModified}`}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate">{file.name}</span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="text-ink-500">{formatFileSize(file.size)}</span>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  disabled={disabled}
                  className="font-medium text-red-700 disabled:opacity-60"
                >
                  Kaldır
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
