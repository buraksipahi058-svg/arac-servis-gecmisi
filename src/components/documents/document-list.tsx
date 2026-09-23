import type { ReactNode } from "react";
import type { RecordDocument } from "@/lib/documents/queries";
import { formatFileSize } from "@/lib/format";

type DocumentListProps = {
  documents: RecordDocument[];
  // Her belge için (varsa) kaldırma butonunu üretir.
  renderRemove?: (document: RecordDocument) => ReactNode;
};

export function DocumentList({ documents, renderRemove }: DocumentListProps) {
  const photos = documents.filter((document) => document.type === "photo");
  const pdfs = documents.filter((document) => document.type === "document");

  return (
    <div className="flex flex-col gap-4">
      {photos.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo) => (
            <li key={photo.id} className="flex flex-col gap-2">
              {photo.url ? (
                <a href={photo.url} target="_blank" rel="noopener noreferrer" className="block">
                  {/* Kısa ömürlü signed URL: next/image optimizasyonu özel görselleri önbelleğe alacağı için kullanılmıyor. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.fileName}
                    loading="lazy"
                    className="aspect-square w-full rounded-lg border border-gray-200 object-cover"
                  />
                </a>
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-gray-300 text-xs text-gray-500">
                  Dosya bulunamadı
                </div>
              )}
              {renderRemove?.(photo)}
            </li>
          ))}
        </ul>
      )}

      {pdfs.length > 0 && (
        <ul className="flex flex-col gap-2">
          {pdfs.map((pdf) => (
            <li
              key={pdf.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2"
            >
              <div className="min-w-0">
                {pdf.url ? (
                  <a
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate font-medium underline"
                  >
                    {pdf.fileName}
                  </a>
                ) : (
                  <span className="block truncate text-gray-500">{pdf.fileName}</span>
                )}
                <span className="text-xs text-gray-500">{`PDF · ${formatFileSize(pdf.fileSize)}`}</span>
              </div>
              {renderRemove?.(pdf)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
