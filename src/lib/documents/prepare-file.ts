import {
  ALLOWED_MIME_TYPES,
  IMAGE_MAX_DIMENSION,
  MAX_IMAGE_INPUT_BYTES,
  MAX_STORED_FILE_BYTES,
  PDF_MIME_TYPE,
} from "./constants";

export type PreparedFile = {
  blob: Blob;
  fileName: string;
  contentType: string;
  extension: string;
};

// Seçilen dosya kabul edilebilir mi? Değilse kullanıcıya gösterilecek mesajı döndürür.
export function validateSelectedFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return `${file.name}: yalnızca JPG, PNG, WEBP veya PDF yüklenebilir.`;
  }
  if (file.type === PDF_MIME_TYPE && file.size > MAX_STORED_FILE_BYTES) {
    return `${file.name}: PDF en fazla 10 MB olabilir.`;
  }
  if (file.type !== PDF_MIME_TYPE && file.size > MAX_IMAGE_INPUT_BYTES) {
    return `${file.name}: fotoğraf en fazla 25 MB olabilir.`;
  }
  return null;
}

// PDF olduğu gibi yüklenir. Görseller her zaman yeniden kodlanır: uzun kenar en fazla
// 1600 px'e indirilir, WebP (desteklenmiyorsa JPEG) olarak sıkıştırılır.
// Yeniden kodlama EXIF bilgilerini (ör. GPS konumu) de temizler.
export async function prepareFile(file: File): Promise<PreparedFile> {
  if (file.type === PDF_MIME_TYPE) {
    return { blob: file, fileName: file.name, contentType: PDF_MIME_TYPE, extension: "pdf" };
  }

  const blob = await compressImage(file);
  const extension = blob.type === "image/webp" ? "webp" : "jpg";
  return {
    blob,
    fileName: replaceExtension(file.name, extension),
    contentType: blob.type,
    extension,
  };
}

async function compressImage(file: File): Promise<Blob> {
  const objectUrl = URL.createObjectURL(file);
  try {
    // <img> tarayıcıların EXIF yönlendirmesini uygular (dik çekilmiş fotoğraflar döner).
    const image = new Image();
    image.src = objectUrl;
    await image.decode();

    const scale = Math.min(
      1,
      IMAGE_MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Görsel işlenemedi.");
    // Saydam PNG'ler JPEG'e dönüşürken siyah zemin almasın.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    let blob = await canvasToBlob(canvas, "image/webp", 0.8);
    // Bazı tarayıcılar WebP üretemez ve PNG'ye düşer; o durumda JPEG kullanılır.
    if (!blob || blob.type !== "image/webp") {
      blob = await canvasToBlob(canvas, "image/jpeg", 0.82);
    }
    if (!blob) throw new Error("Görsel sıkıştırılamadı.");
    if (blob.size > MAX_STORED_FILE_BYTES) throw new Error("Görsel çok büyük.");
    return blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

function replaceExtension(fileName: string, extension: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  return `${baseName}.${extension}`;
}
