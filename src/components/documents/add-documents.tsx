"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FormAlert } from "@/components/ui/form-alert";
import { buttonClass } from "@/components/ui/button-styles";
import { uploadRecordDocuments, type UploadTarget } from "@/lib/documents/upload";
import { createClient } from "@/lib/supabase/client";
import { DocumentPicker } from "./document-picker";

type AddDocumentsProps = {
  target: UploadTarget;
  remainingSlots: number;
};

// Mevcut bir servis kaydına sonradan belge/fotoğraf ekleme.
export function AddDocuments({ target, remainingSlots }: AddDocumentsProps) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [failed, setFailed] = useState<string[]>([]);
  const [isRefreshing, startTransition] = useTransition();
  const busy = uploading || isRefreshing;

  async function handleUpload() {
    setUploading(true);
    setFailed([]);
    const result = await uploadRecordDocuments(createClient(), target, files);
    setUploading(false);
    setFiles([]);
    setFailed(result.failed);
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col gap-3">
      {failed.length > 0 && (
        <FormAlert tone="error">{`Yüklenemeyen dosyalar: ${failed.join(", ")}`}</FormAlert>
      )}
      <DocumentPicker
        files={files}
        onChange={setFiles}
        maxFiles={remainingSlots}
        disabled={busy}
      />
      {files.length > 0 && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={busy}
          className={`${buttonClass("primary")} w-full`}
        >
          {busy ? "Yükleniyor…" : `${files.length} dosyayı yükle`}
        </button>
      )}
    </div>
  );
}
